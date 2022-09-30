import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(taskRoute, sessionOptions);

async function taskRoute(req, res) {
  if (req.method === 'GET') {
    const user = req.session.user;
    if (!user || !user.isLoggedIn || user.permissions.banned) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { taskId } = req.query
    if (!ObjectId.isValid(taskId)) {
      res.status(422).json({ message: "Invalid task ID" });
      return;
    }
    
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(taskId), hidden: false, owner: ObjectId(user.id) };
    const options = {
      projection: { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1, priority: 1, collections: 1 },
    };
  
    try {
      const getTask = await db.collection("tasks").findOne(query, options);
      if (!getTask) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.json(getTask);
    } catch (error) {
      res.status(200).json([]);
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
