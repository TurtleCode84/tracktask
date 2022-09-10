import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { collection } = req.query
  if(ObjectId.isValid(collection)) {
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(collection), hidden: false };
    const exists = await db.collection("collections").countDocuments(query);
    if (exists > 0) {
      const projection = { name: 1, description: 1, sharing: 1, owner: 1, tasks: 1 };
      const collectionInfo = await db.collection("collections").find(query).project(projection).toArray(); // yes, I know it's a bit inefficient, but nothing else was working
      res.json(collectionInfo);
    } else {
      res.status(404).json({ error : "collection not found" });
    }
  } else {
    res.status(500).json({ error : "invalid collection id" });
  }
}
