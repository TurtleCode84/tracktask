import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(adminTaskRoute, sessionOptions);

async function adminTaskRoute(req, res) {
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
  if (req.method === 'GET') {
    const client = await clientPromise;
    const db = client.db("data");
    const query = {
      _id: ObjectId(id),
      $or: [
        { owner: ObjectId(user.id) },
        { 'sharing.shared': true },
      ],
    };
    try {
      var getTasks;
      if (collection !== "true") {
        getTasks = await db.collection("tasks").findOne(query);
      } else {
        getTasks = await db.collection("collections").findOne(query);
        getTasks.tasks = await db.collection("tasks").find({ _id: {$in: getTasks.tasks} }).toArray();
      }
      if (!getTasks && collection !== "true") {
        res.status(404).json({ message: "No tasks found" });
        return;
      } else if (!getTasks) {
        res.status(404).json({ message: "No collection found" });
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
    const client = await clientPromise;
    const db = client.db("data");
    var deletedItem;
    if (collection !== "true") {
      deletedItem = await db.collection("tasks").deleteOne({ _id: ObjectId(id) });
    } else {
      deletedItem = await db.collection("collections").deleteOne({ _id: ObjectId(id) });
    }
    res.json(deletedItem);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
