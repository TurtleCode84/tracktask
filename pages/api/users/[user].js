import clientPromise from "../../../util/mongodb";

export default async function handler(req, res) {
  const { user } = req.query
  const client = await clientPromise;
  const db = client.db("data");
  const userObject = await db.collection("users").find({ username : user });
  if (userObject.count() !== 0) {
    const userInfo = userObject.toArray();
    res.json({ user : userInfo });
  } else {
    res.status(404).json({ error : "user not found" });
  }
}
