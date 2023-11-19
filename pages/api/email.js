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
  const user = req.session.user;
  if ((!user || !user.isLoggedIn || user.permissions.banned) && req.method !== 'PUT') {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  if (req.method === 'PUT') { // Sends a password reset email (there may or may not be a logged in user)
    const body = await req.body;
    res.status(503).json({ message: "Under construction" });
    return;
  } else if (req.method === 'POST') { // Sends a verification email
    const { gReCaptchaToken } = await req.body;
    const captchaResponse = await fetchJson("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${gReCaptchaToken}`,
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!captchaResponse || !captchaResponse.success || captchaResponse.action !== "verifyEmailFormSubmit" || captchaResponse.score <= 0.5) {
        res.status(403).json({ message: "reCAPTCHA verification failed, please try again." });
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
    await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { otp: uuid } });
    const sentMail = await sendEmail(user.email, email.subject, email.html);
    res.json(sentMail);
  } else if (req.method === 'PATCH') { // Attempts to verify the current user
    const { key, gReCaptchaToken } = await req.body;
    const captchaResponse = await fetchJson("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${gReCaptchaToken}`,
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!captchaResponse || !captchaResponse.success || captchaResponse.action !== "verifyEmailFormSubmit" || captchaResponse.score <= 0.5) {
        res.status(403).json({ message: "reCAPTCHA verification failed, please try again." });
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
    const userInfo = await db.collection("users").findOne({ _id: new ObjectId(user.id) }, { projection: { otp: 1 } });
    if (userInfo.otp && key === userInfo.otp && (Date.now() - parseUuid(userInfo.otp)) < 3600000) {
      const verifiedUser = await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { otp: "", 'permissions.verified': true, 'history.lastEdit.timestamp': Math.floor(Date.now()/1000), 'history.lastEdit.by': new ObjectId(user.id) } });
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