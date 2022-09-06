import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { task } = req.query
  const client = await clientPromise;
  const db = client.db("data");
  const exists = await db.collection("tasks").find({ _id : task, hidden : false }).count();
  if (exists !== 0) {
    const projection = { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1 };
    const userInfo = await db.collection("tasks").find({ _id : task }).project(projection).toArray(); // yes, I know it's a bit inefficient, but nothing else was working
    res.json(userInfo);
  } else {
    res.status(404).json({ error : "user not found" });
  }
}
