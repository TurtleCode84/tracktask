import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminUserRoute, sessionOptions);

async function adminUserRoute(req, res) {
  if (req.method === 'GET') {
    const user = req.session.user;
    if (!user || !user.isLoggedIn || !user.permissions.admin ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { uid } = req.query
    if (!ObjectId.isValid(uid)) {
      res.status(422).json({ message: "Invalid user ID" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(uid) };
  
    try {
      const getUser = await db.collection("users").findOne(query);
      if (getUser) {
        res.json(getUser);
      } else {
        res.status(404).json(null);
      }
    } catch (error) {
      res.status(200).json([]);
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
