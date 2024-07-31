import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminUsersRoute, sessionOptions);

async function adminUsersRoute(req, res) {
  const client = await clientPromise;
  const db = client.db("data");

  const sessionUser = req.session.user;
  const user = await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) });
  if (!sessionUser || !sessionUser.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (req.method === 'GET') {
    const { sort, count } = req.query;
    if (!sort || !count) {
      res.status(422).json({ message: "You must specify the query parameters \'sort\' and \'count\'" });
      return;
    }
    if (sort === "joined") {
      try {
        const getUsers = await db.collection("users").find().project({ _id: 1, username: 1, 'history.joined': 1, 'history.lastLogin': 1, permissions: 1 }).limit(parseInt(count)).sort({ 'history.joined': -1 }).toArray();
        if (getUsers) {
          res.json(getUsers);
        } else {
          res.status(404).json({ message: "No users found" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else if (sort === "login") {
      try {
        const getUsers = await db.collection("users").find({ 'permissions.banned': false }).project({ _id: 1, username: 1, 'history.joined': 1, 'history.lastLogin': 1, permissions: 1 }).limit(parseInt(count)).sort({ 'history.lastLogin': -1 }).toArray();
        if (getUsers) {
          res.json(getUsers);
        } else {
          res.status(404).json({ message: "No users found" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(422).json({ message: "Invalid sort query" });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
