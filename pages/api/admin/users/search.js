import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminUserSearchRoute, sessionOptions);

async function adminUserSearchRoute(req, res) {
  if (req.method === 'POST') {
    const { usernameuid, query } = await req.body;
    const user = req.session.user;
    
    if (!user || !user.isLoggedIn || !user.permissions.admin ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const client = await clientPromise;
    const db = client.db("data");
    var dbQuery;
    if (query === "username") {
      dbQuery = { username: usernameuid };
    } else if (query === "uid") { // simple validation
      if (!ObjectId.isValid(usernameuid)) {
        res.status(422).json({ message: "Invalid user ID" });
        return;
      }
      const searchUser = { _id: usernameuid };
      res.json(searchUser);
    } else {
      res.status(422).json({ message: "Invalid search query" });
      return;
    }
    const options = { projection: { _id : 1 } };
  
    try {
      const searchUser = await db.collection("users").findOne(dbQuery, options);
      if (searchUser) {
        res.json(searchUser);
      } else {
        res.status(422).json({ message: "User does not exist" });
      }
    } catch (error) {
      res.status(200).json([]);
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
