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
  if (req.method === 'GET') { // Get all unhidden tasks for the logged in user
    const query = { owner: ObjectId(user.id), hidden: false };
    const options = {
      sort: { priority: -1, dueDate: 1 },
      projection: { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1, priority: 1, collections: 1 },
    };

    try {
      const tasks = await db.collection("tasks").find(query, options).toArray();
      res.json(tasks);
    } catch (error) {
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') { // Create a new task
    const { name, description, dueDate, markCompleted, markPriority } = await req.body;
    if (!name || !description) {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    if (name.trim().length > 50 || description.trim().length > 500) {
      res.status(422).json({ message: "Invalid data. Length of title and description must not exceed 50 and 500 characters respectively." });
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
