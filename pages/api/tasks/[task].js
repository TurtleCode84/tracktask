import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { task } = req.query
  if(ObjectId.isValid(task)) {
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(task), hidden: false };
    const exists = await db.collection("tasks").countDocuments(query);
    if (exists > 0) {
      const projection = { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1 };
      const userInfo = await db.collection("tasks").find(query).project(projection).toArray(); // yes, I know it's a bit inefficient, but nothing else was working
      res.json(userInfo);
    } else {
      res.status(404).json({ error : "task not found" });
    }
  } else {
    res.status(500).json({ error : "invalid task id" });
  }
}
