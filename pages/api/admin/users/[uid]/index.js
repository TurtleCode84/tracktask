import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import { hash } from "bcryptjs";
import {v4 as uuidv4} from "uuid";

export default withIronSessionApiRoute(adminUserRoute, sessionOptions);

async function adminUserRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || !user.permissions.admin ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { uid } = req.query;
  if (!ObjectId.isValid(uid)) {
    res.status(422).json({ message: "Invalid user ID" });
    return;
  }
  if (req.method === 'GET') {
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
    if (process.env.SUPERADMIN === uid && user.id !== uid) {
      res.status(403).json({ message: "You do not have permission to modify this user." });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    var updateUser = {};
    if (body.username) {
      const taken = await db.collection('users').countDocuments({ username: body.username.trim().toLowerCase() });
      if (taken > 0) {
        res.status(422).json({ message: "Username is already taken!" });
        return;
      } else {
        updateUser.username = body.username.trim().toLowerCase()
      }
    }
    if (body.email !== undefined) {updateUser.email = body.email.trim().toLowerCase()}
    if (body.password) {updateUser.password = await hash(body.password, 10)}
    if (body.resetShareKey) {updateUser.shareKey = uuidv4()}
    if (body.profilePicture !== undefined) {updateUser.profilePicture = body.profilePicture}
    const query = { _id: ObjectId(uid) }
    const updateDoc = {
      $set: updateUser,
    };
    const updated = await db.collection('users').updateOne(query, updateDoc);
    if (body.notes !== undefined) {
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
    if (body.admin !== undefined) { // true or false
      if (process.env.SUPERADMIN !== user.id) {
        res.status(403).json({ message: "You do not have permission to edit this user\'s admin status." });
        return;
      }
      const adminUpdateDoc = {
        $set: {'permissions.admin': body.admin},
      };
      const updatedAdmin = await db.collection('users').updateOne(query, adminUpdateDoc); // See above
    }
    if (body.warn && body.warning && !body.clearWarnings) {
      const warnUpdateDoc = {
        $set: {'permissions.warned': true},
        $push: {
          'history.warnings': {
            $each: [ body.warning ],
            $position: 0,
          },
        },
      };
      const updatedWarn = await db.collection('users').updateOne(query, warnUpdateDoc); // See above
    } else if (body.clearWarnings) {
      if (process.env.SUPERADMIN !== user.id) {
        res.status(403).json({ message: "You do not have permission to pardon users." });
        return;
      }
      const warnUpdateDoc = {
        $set: {
          'permissions.warned': false,
          'history.warnings': [],
        },
      };
      const updatedWarn = await db.collection('users').updateOne(query, warnUpdateDoc); // See above
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
  } else if (req.method === 'DELETE') {
    if (user.id === uid) {
      res.status(401).json({ message: "You can\'t delete your own account from the admin panel." });
      return;
    } else if (process.env.SUPERADMIN !== user.id) {
      res.status(403).json({ message: "You do not have permission to delete users." });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const deletedUser = await db.collection("users").deleteOne({ _id: ObjectId(uid) });
    const deletedTasks = await db.collection("tasks").deleteOne({ owner: ObjectId(uid) }); // See above
    const deletedCollections = await db.collection("collections").deleteOne({ owner: ObjectId(uid) }); // See above
    res.json(deletedUser);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
