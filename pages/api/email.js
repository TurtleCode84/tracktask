import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import parseUuid from "lib/parseUuid";
import { v1 as uuidv1 } from "uuid";

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
    res.status(503).json({ message: "Under construction" });
    return;
  } else if (req.method === 'PATCH') { // Attempts to verify the current user
    const body = await req.body;
    res.status(503).json({ message: "Under construction" });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}