import clientPromise from "../../../util/mongodb.js";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("data");
  switch (req.method) {
    case "POST":
      res.json({ message: "hello, world!" });
      break;
    case "GET":
      const allUsers = await db.collection("users").find({}).toArray();
      res.json({ status: 200, data: allUsers });
      break;
  }
}
