import clientPromise from "../../../util/mongodb";

export default async function handler(req, res) {
  const { user } = req.query;
  const client = await clientPromise;
  const db = client.db("data");
  const userInfo = await db.collection("users").find({username : ${user}}).toArray();
  res.json({ user: userInfo });
}
