import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import parseUuid from "lib/parseUuid";
import { v1 as uuidv1 } from "uuid";
import sendEmail from "lib/sendEmail";
import passwordReset from "templates/passwordReset";
import verifyEmail from "templates/verifyEmail";

export default withIronSessionApiRoute(emailRoute, sessionOptions);

async function emailRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  if (req.method === 'POST') { // Sends an email (verification, password reset)
    const { type } = await req.body;
    if (!user.email) {
      res.status(422).json({ message: "You have not linked an email address to your account!" });
      return;
    }
    var email;
    const uuid = uuidv1();
    if (type === "password") {
      email = passwordReset(user.username, uuid);
    } else if (type === "verify") {
      if (user.verified) {
        res.status(403).json({ message: "Your email address is already verified!" });
        return;
      } else {
        email = verifyEmail(user.username, uuid);
      }
    } else {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { otp: uuid } });
    const sentMail = await sendEmail(user.email, email.subject, email.html);
    res.json(sentMail);
  } else if (req.method === 'PATCH') { // Attempts to verify the current user
    const { key } = await req.body;
    if (user.verified) {
      res.status(422).json({ message: "Your email address is already verified!" });
      return;
    }
    const userInfo = await db.collection("users").findOne({ _id: new ObjectId(user.id) }, { projection: { otp: 1 } });
    if (key === userInfo.otp && (Date.now() - parseUuid(userInfo.otp)) < 3600000) {
      const verifiedUser = await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { otp: "", 'permissions.verified': true } });
      res.json(verifiedUser);
    } else {
      res.status(403).json({ message: "Invalid verification key" });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}