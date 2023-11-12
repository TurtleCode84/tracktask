import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import parseUuid from "lib/parseUuid";
import { v1 as uuidv1 } from "uuid";
import sendEmail from "lib/sendEmail";
import passwordReset from "templates/passwordReset";

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
    const uuid = uuidv1();
    var email;
    if (type === "verify") {
      res.status(503).json({ message: "Under construction" });
      return;
    } else if (type === "password") {
      email = passwordReset(user.username, uuid);
    } else {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    const sentMail = await sendEmail(user.email, email.subject, email.html);
    res.json(sentMail);
  } else if (req.method === 'PATCH') { // Attempts to verify the current user
    const body = await req.body;
    res.status(503).json({ message: "Under construction" });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}