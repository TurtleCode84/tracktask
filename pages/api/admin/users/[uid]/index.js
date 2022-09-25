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
    const { uid } = req.query;
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
    const { uid } = req.query;
    if (process.env.SUPERADMIN === uid.toString() && user.id !== uid.toString()) {
      res.status(403).json({ message: "You do not have permission to modify this user." });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    var updateUser = {};
    if (body.username) {updateUser.username = body.username.toLowerCase()};
    if (body.email) {updateUser.email = body.email.toLowerCase()};
    if (body.password) {updateUser.password = await hash(body.password, 10)};
    if (body.shareKey) {updateUser.shareKey = body.shareKey};
    if (body.removeProfilePicture) {updateUser.profilePicture = ""} else if (body.profilePicture) {updateUser.profilePicture = body.profilePicture};
    const query = { _id: ObjectId(uid) }
    const updateDoc = {
      $set: updateUser,
    };
    const updated = await db.collection('users').updateOne(query, updateDoc);
    if (body.notes) {
      const notesUpdateDoc = {
        $set: {'history.notes': body.notes},
      };
      const updatedNotes = await db.collection('users').updateOne(query, notesUpdateDoc); // Does not catch errors, could be a problem if updated succeeds but updatedNotes does not?
    }
    if (body.verify !== undefined) { // true or false
      const verifyUpdateDoc = {
        $set: {'permissions.verified': body.verify},
      };
      const updatedVerify = await db.collection('users').updateOne(query, verifyUpdateDoc); // See above
    }
    if (body.ban !== undefined && body.ban) { // true or false
      const banUpdateDoc = {
        $set: {'permissions.banned': body.ban, 'history.banReason': body.banReason},
      };
      const updatedBan = await db.collection('users').updateOne(query, banUpdateDoc); // See above
    } else if (body.ban !== undefined && !body.ban) {
      const banUpdateDoc = {
        $set: {'permissions.banned': body.ban},
      };
      const updatedBan = await db.collection('users').updateOne(query, banUpdateDoc); // See above
    } else if (body.ban === undefined && body.banReason) {
      const banReasonUpdateDoc = {
        $set: {'history.banReason': body.banReason},
      };
      const updatedBanReason = await db.collection('users').updateOne(query, banReasonUpdateDoc); // See above
    }
    res.json(updated);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
