import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import moment from "moment";

export default withIronSessionApiRoute(tasksRoute, sessionOptions);

async function tasksRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  if (req.method === 'GET') { // Get all unhidden tasks or collections for the logged in user
    const { collections } = req.query;
    //const query = { owner: ObjectId(user.id), hidden: false };
    const query = {
      hidden: false,
      $or: [
        { owner: ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: ObjectId(user.id)}} },
      ],
    };
    const taskoptions = {
      sort: { priority: -1, dueDate: 1 },
      projection: { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1, priority: 1 },
    };
    var data;
    try {
      if (collections !== "true") {
        data = await db.collection("tasks").find(query, taskoptions).toArray();
      } else {
        const collectionoptions = {
          sort: { created: -1 },
          projection: { name: 1, description: 1, created: 1, owner: 1, sharing: 1, tasks: 1 },
        }
        data = await db.collection("collections").find(query, collectionoptions).toArray();
        for (var i; i<data.length; i++) {
          data[i].tasks = await db.collection("tasks").find({ _id: {$in: data[i].tasks} }, taskoptions).toArray();
        }
      }
      if (!data && collections !== "true") {
        res.status(404).json({ message: "No tasks found" });
        return;
      } else if (!data) {
        res.status(404).json({ message: "No collections found" });
        return;
      }
      res.json(data);
    } catch (error) {
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') { // Create a new task
    const { name, description, dueDate, markCompleted, markPriority } = await req.body;
    if (!name || !description) {
      res.status(422).json({ message: "Invalid data" });
      return;
    } else if (name.trim().length > 50 || description.trim().length > 500) {
      res.status(422).json({ message: "Length of title and description must not exceed 50 and 500 characters respectively." });
      return;
    }
    // Otherwise...
    try {
      const newTask = {
        name: name.trim(),
        description: description.trim(),
        hidden: false,
        owner: ObjectId(user.id),
        created: Math.floor(Date.now()/1000),
        completion: {
          completed: 0,
          completedBy: "",
        },
        priority: markPriority,
      }
      if (dueDate) {
        newTask.dueDate = moment(dueDate).unix();
      } else {
        newTask.dueDate = 0;
      }
      const createdTask = await db.collection('tasks').insertOne(newTask);
      res.json(createdTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
