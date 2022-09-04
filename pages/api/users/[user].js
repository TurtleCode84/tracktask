import clientPromise from "../../../util/mongodb";

export default async function handler(req, res) {
  const { user } = req.query
  const client = await clientPromise;
  const db = client.db("data");
  const userInfo = await db.collection("users").findOne({ username : user }).toArray();
  if (userInfo !== null) {
    res.json({ user : userInfo });
  } else {
    res.status(404).json({ error : "user not found" });
  }
}
