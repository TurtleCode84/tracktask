import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminUserSearchRoute, sessionOptions);

async function adminUserSearchRoute(req, res) {
  if (req.method === 'POST') {
    const { keyword, query } = await req.body;
    const user = req.session.user;
    
    if (!user || !user.isLoggedIn || !user.permissions.admin ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const client = await clientPromise;
    const db = client.db("data");
    var dbQuery;
    if (query === "username") {
      dbQuery = { username: keyword.trim().toLowerCase() };
    } else if (query === "uid") { // No DB query needed
      if (!ObjectId.isValid(keyword)) {
        res.status(422).json({ message: "Invalid user ID" });
        return;
      }
      const searchUser = { _id: keyword.trim().toLowerCase() };
      res.json(searchUser);
    } else if (query === "email") {
      dbQuery = { email: keyword.trim().toLowerCase() };
    } else if (query === "ip") {
      dbQuery = {
        $or: [
          { 'history.joinedIp': keyword.trim().toLowerCase() },
          { 'history.loginIpList': keyword.trim().toLowerCase() },
        ],
      };
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
        res.status(404).json({ message: "User does not exist" });
      }
    } catch (error) {
      res.status(200).json([]);
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
