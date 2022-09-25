import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
//import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminUsersRoute, sessionOptions);

async function adminUsersRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || !user.permissions.admin ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (req.method === 'GET') {
    const { sort, count } = req.query;
    if (!sort || !count) {
      res.status(422).json({ message: "You must specify the query parameters \'sort\' and \'count\'" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    if (sort === "joined") {
      try {
        const getUsers = await db.collection("users").find().projection({ _id: 1, username: 1, 'history.joined': 1 }).limit(parseInt(count)).sort({ 'history.joined': -1 }).toArray();
        if (getUsers) {
          res.json(getUsers);
        } else {
          res.status(404).json({ message: "No users found" });
        }
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(422).json({ message: "Invalid sort query" });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
