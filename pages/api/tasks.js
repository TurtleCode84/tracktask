import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(tasksRoute, sessionOptions);

async function tasksRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned ) {
    res.status(404).end();
    return;
  }
  
  const client = await clientPromise;
  const db = client.db("data");
  const query = { owner: ObjectId(user.id), hidden: false };
  const options = {
    sort: { dueDate: 1 },
    projection: { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1 },
  };

  try {
    const tasks = await db.collection("tasks").find(query, options).toArray();
    res.json(tasks);
  } catch (error) {
    res.status(200).json([]);
  }
}
