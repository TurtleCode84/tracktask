import clientPromise from "../../../util/mongodb";

export default async function handler(req, res) {
  const { user } = req.query
  const client = await clientPromise;
  const db = client.db("data");
  const exists = await db.collection("users").find({ username : user }).count();
  if (exists !== 0) {
    const userInfo = await db.collection("users").find({ username : user }).toArray(); // yes, I know it's very inefficient, but nothing else was working
    res.json({ user : userInfo });
  } else {
    res.status(404).json({ error : "user not found" });
  }
}
