import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import { hash } from 'bcryptjs';

export default withIronSessionApiRoute(adminUserRoute, sessionOptions);

async function adminUserRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || !user.permissions.admin ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (req.method === 'GET') {
    const { uid } = req.query
    if (!ObjectId.isValid(uid)) {
      res.status(422).json({ message: "Invalid user ID" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(uid) };
  
    try {
      const getUser = await db.collection("users").findOne(query);
      if (getUser) {
        res.json(getUser);
      } else {
        res.status(404).json({ message: "User does not exist" });
      }
    } catch (error) {
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') {
    const body = await req.body;
    var updateUser = {};
    if (body.username) {updateUser.username = body.username};
    if (body.email) {updateUser.email = body.email};
    if (body.password) {updateUser.password = await hash(body.password, 10)};
    if (body.shareKey) {updateUser.shareKey = body.shareKey};
    if (body.profilePicture) {updateUser.profilePicture = body.profilePicture};
    if (body.notes) {updateUser.history.notes = body.notes};
    const query = { _id: body.id }
    const updateDoc = {
      $set: updateUser,
    };
    const updated = await db.collection('users').updateOne(query, updateDoc);
    res.status(200).json([]);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
