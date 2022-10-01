import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminTaskRoute, sessionOptions);

async function adminTaskRoute(req, res) {
  if (req.method === 'GET') {
    const user = req.session.user;
    if (!user || !user.isLoggedIn || !user.permissions.admin ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { id, collection } = req.query
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid object ID" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const query = {
      _id: ObjectId(id),
      $or: [
        { owner: ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: ObjectId(user.id)}} },
      ],
    };
    try {
      var getTasks;
      if (!collection) {
        getTasks = await db.collection("tasks").findOne(query);
      } else if (collection === "true") {
        getTasks = await db.collection("collections").findOne(query);
        getTasks.tasks = await db.collection("tasks").find({ _id: {$in: getTasks.tasks} }).toArray();
      }
      if (!getTasks) {
        res.status(404).json({ message: "No tasks found" });
        return;
      }
      res.json(getTasks);
    } catch (error) {
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') {
    res.status(418).json({ message: "Under construction" });
    return;
  } else if (req.method === 'DELETE') {
    res.status(418).json({ message: "Under construction" });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
