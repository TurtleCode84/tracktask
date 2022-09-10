import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { user } = req.query
  if(ObjectId.isValid(user)) {
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(user) };
    const exists = await db.collection("users").countDocuments(query);
    if (exists > 0) {
      const projection = { username: 1, "history.joined": 1, permissions: 1, bio: 1, profilePicture: 1 };
      const userInfo = await db.collection("users").find(query).project(projection).toArray(); // yes, I know it's a bit inefficient, but nothing else was working
      res.json(userInfo);
    } else {
      res.status(404).json({ error : "user not found" });
    }
  } else {
    res.status(500).json({ error : "invalid user id" });
  }
}
