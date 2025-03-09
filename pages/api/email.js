import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import fetchJson from "lib/fetchJson";
import parseUuid from "lib/parseUuid";
import { v1 as uuidv1 } from "uuid";
import sendEmail from "lib/sendEmail";
import passwordReset from "templates/passwordReset";
import verifyEmail from "templates/verifyEmail";

export default withIronSessionApiRoute(emailRoute, sessionOptions);

async function emailRoute(req, res) {
  const client = await clientPromise;
  const db = client.db("data");

  const sessionUser = req.session.user;
  const user = sessionUser ? await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) }) : undefined;
  if (req.method !== 'PUT' && (!sessionUser || !sessionUser.isLoggedIn || user.permissions.banned)) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (req.method === 'PUT') { // Sends a password reset email (there may or may not be a logged in user)
    const { email, cf_turnstile } = await req.body;
    const ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"].split(',')[0];
    const turnstileResponse = await fetchJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        reponse: cf_turnstile,
        remoteip: ip,
      })
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!turnstileResponse || !turnstileResponse.success || turnstileResponse.action !== "passwordResetFormSubmit") {
        res.status(403).json({ message: "Turnstile verification failed, please try again." });
        return;
      }
    }
    if (!email) {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    // warning: this whole system relies on emails being unique
    const matchUser = await db.collection("users").findOne({ email: email.trim().toLowerCase(), 'permissions.verified': true, 'permissions.banned': false }, { projection: { username: 1, email: 1 } });
    if (matchUser) {
      const uuid = uuidv1();
      const email = passwordReset(matchUser.username, uuid);
      await db.collection("users").updateOne({ _id: matchUser._id }, { $set: { otp: uuid } });
      await sendEmail(matchUser.email, email.subject, email.html);
    }
    res.json({ message: "Password reset request sent!" }); // fail silently if necessary
  } else if (req.method === 'POST') { // Sends a verification email
    const { cf_turnstile } = await req.body;
    const ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"].split(',')[0];
    const turnstileResponse = await fetchJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        reponse: cf_turnstile,
        remoteip: ip,
      })
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!turnstileResponse || !turnstileResponse.success || turnstileResponse.action !== "verifyEmailFormSubmit") {
        res.status(403).json({ message: "Turnstile verification failed, please try again." });
        return;
      }
    }
    if (!user.email) {
      res.status(422).json({ message: "You have not linked an email address to your account!" });
      return;
    } else if (user.permissions.verified) {
      res.status(403).json({ message: "Your email address is already verified!" });
      return;
    }
    const uuid = uuidv1();
    const email = verifyEmail(user.username, uuid);
    await db.collection("users").updateOne({ _id: user._id }, { $set: { verificationKey: uuid } });
    const sentMail = await sendEmail(user.email, email.subject, email.html);
    res.json(sentMail);
  } else if (req.method === 'PATCH') { // Attempts to verify the current user
    const { key, cf_turnstile } = await req.body;
    const ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"].split(',')[0];
    const turnstileResponse = await fetchJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        reponse: cf_turnstile,
        remoteip: ip,
      })
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!turnstileResponse || !turnstileResponse.success || turnstileResponse.action !== "verifyEmailFormSubmit") {
        res.status(403).json({ message: "Turnstile verification failed, please try again." });
        return;
      }
    }
    if (!user.email) {
      res.status(422).json({ message: "You have not linked an email address to your account!" });
      return;
    } else if (user.permissions.verified) {
      res.status(422).json({ message: "Your email address is already verified!" });
      return;
    }
    const userInfo = await db.collection("users").findOne({ _id: user._id }, { projection: { verificationKey: 1, email: 1 } });
    if (userInfo.verificationKey && key === userInfo.verificationKey && (Date.now() - parseUuid(userInfo.verificationKey)) < 3600000) {
      const verifiedUser = await db.collection("users").updateOne({ _id: user._id }, { $set: { verificationKey: "", 'permissions.verified': true, 'history.lastEdit.timestamp': Math.floor(Date.now()/1000), 'history.lastEdit.by': user._id } });
      // If anyone else has the newly verified email, we need to get rid of it
      await db.collection("users").updateMany({ _id: { $ne: user._id }, email: userInfo.email }, { $set: { email: "", verificationKey: "", otp: "", 'permissions.verified': false } });
      res.json(verifiedUser);
    } else {
      res.status(403).json({ message: "Invalid verification key, please generate a new one." });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}