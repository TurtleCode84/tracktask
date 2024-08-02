import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminUserSearchRoute, sessionOptions);

async function adminUserSearchRoute(req, res) {
  if (req.method === 'POST') {
    const { keyword, query } = await req.body;

    const client = await clientPromise;
    const db = client.db("data");

    const sessionUser = req.session.user;
    const user = sessionUser ? await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) }) : undefined;
    if (!sessionUser || !sessionUser.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const dbQuery = {};
    if (query === "username" && keyword) {
      dbQuery.username = new RegExp(keyword.trim().toLowerCase(), "i");
    } else if (query === "uid") { // No DB query needed
      if (!ObjectId.isValid(keyword)) {
        res.status(422).json({ message: "Invalid user ID" });
        return;
      }
      const searchUser = { _id: keyword.trim().toLowerCase() };
      res.json([ searchUser ]);
    } else if (query === "email") {
      dbQuery.email = new RegExp(keyword.trim().toLowerCase(), "i");
    } else if (query === "ip" && keyword) {
      dbQuery.$or = [
        { 'history.joinedIp': new RegExp(keyword.trim().toLowerCase(), "i") },
        { 'history.loginIpList': new RegExp(keyword.trim().toLowerCase(), "i") },
      ];
    } else {
      res.status(422).json({ message: "Invalid search query or keyword" });
      return;
    }
    const options = { projection: { _id : 1 } };
  
    try {
      const searchUser = await db.collection("users").find(dbQuery, options).toArray();
      if (searchUser.length > 0) {
        res.json(searchUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
