import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import moment from "moment";

export default withIronSessionApiRoute(toolsRoute, sessionOptions);

async function toolsRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  const { tool, param } = req.query;
  if (req.method === 'GET') {
    if (tool) {
      const newObjectId = new ObjectId();
      if (tool === "userInfo") {
        if (!newObjectId.isValid(param)) {
          res.status(422).json({ message: "Invalid user ID" });
          return;
        }
        const query = { _id: new ObjectId(param) };
        const getUser = await db.collection("users").findOne(query, { projection: { username: 1, profilePicture: 1, 'permissions.verified': 1 } });
        if (getUser) {
          res.json(getUser);
        } else {
          res.status(404).json({ message: "User does not exist" });
          return;
        }
      } else if (tool === "userStats" && user.permissions.admin) {
        if (!newObjectId.isValid(param)) {
          res.status(422).json({ message: "Invalid user ID!" });
          return;
        }
        const query = {
          hidden: false,
          $or: [
            { owner: new ObjectId(param) },
            { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(param)}} },
          ],
        };
        const getStats = {};
        getStats._id = new ObjectId(param); // Not strictly necessary
        getStats.tasks = await db.collection("tasks").countDocuments(query);
        getStats.collections = await db.collection("collections").countDocuments(query);
        res.json(getStats);
      } else {
        res.status(418).json({ message: "Under construction" });
        return;
      }
    } else {
      res.status(422).json({ message: "You must specify a tool to use!" });
      return;
    }
  } else if (req.method === 'POST') {
    res.status(418).json({ message: "Under construction" });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
