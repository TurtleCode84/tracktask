import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import { hash } from "bcryptjs";

export default withIronSessionApiRoute(adminUserRoute, sessionOptions);

async function adminUserRoute(req, res) {
  const client = await clientPromise;
  const db = client.db("data");

  const sessionUser = req.session.user;
  const user = await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) });
  if (!sessionUser || !sessionUser.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { uid } = req.query;
  if (!ObjectId.isValid(uid)) {
    res.status(422).json({ message: "Invalid user ID" });
    return;
  }
  if (req.method === 'GET') {
    const query = { _id: new ObjectId(uid) };
  
    try {
      const getUser = await db.collection("users").findOne(query);
      if (getUser) {
        const countTasks = await db.collection("tasks").countDocuments({ owner: new ObjectId(getUser._id) });
        const countCollections = await db.collection("collections").countDocuments({ owner: new ObjectId(getUser._id) });
        const countShared = await db.collection("collections").countDocuments({ owner: new ObjectId(getUser._id), 'sharing.shared': true });
        res.json({
          ...getUser,
          stats: {
            tasks: countTasks,
            collections: countCollections,
            shared: countShared,
          },
        });
      } else {
        res.status(404).json({ message: "User does not exist" });
      }
    } catch (error) {
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') {
    const body = await req.body;
    if (process.env.SUPERADMIN === uid && user._id !== uid) {
      res.status(403).json({ message: "You do not have permission to modify this user." });
      return;
    }
    var updateUser = {};
    if (body.username) {
      const taken = await db.collection("users").countDocuments({ username: body.username.trim().toLowerCase() });
      if (taken > 0) {
        res.status(422).json({ message: "Username is already taken!" });
        return;
      } else {
        updateUser.username = body.username.trim().toLowerCase();
      }
    }
    if (body.password) {updateUser.password = await hash(body.password, 10);}
    if (body.profilePicture !== undefined) {updateUser.profilePicture = body.profilePicture;}
    const query = { _id: new ObjectId(uid) };
    const updateDoc = {
      $set: updateUser,
    };
    const updated = await db.collection("users").updateOne(query, updateDoc);
    if (body.email !== undefined) {
      const taken = await db.collection("users").countDocuments({ email: body.email.trim().toLowerCase(), 'permissions.verified': true });
      if (taken > 0) {
        res.status(403).json({ message: "Email is already linked to an account!" });
        return;
      } else {
        const emailUpdateDoc = { $set: {email: body.email.trim().toLowerCase(), 'permissions.verified': false, verificationKey: "", otp: ""} };
        await db.collection("users").updateOne(query, emailUpdateDoc); // Does not catch errors, could be a problem if updated succeeds but this does not?
      }
    }
    if (body.notes !== undefined) {
      const notesUpdateDoc = {
        $set: {'history.notes': body.notes},
      };
      await db.collection("users").updateOne(query, notesUpdateDoc); // See above
    }
    if (body.verify !== undefined) { // true or false
      const verifyUpdateDoc = {
        $set: {'permissions.verified': body.verify},
      };
      await db.collection("users").updateOne(query, verifyUpdateDoc); // See above
      if (body.verify) {
        // If anyone else has the same email as a newly verified user, we need to get rid of it
        const verifiedUser = await db.collection("users").findOne(query, { projection: { email: 1 } });
        await db.collection("users").updateMany({ _id: { $ne: new ObjectId(verifiedUser._id) }, $and: [ {email: verifiedUser.email}, {email: {$ne: ""}} ]}, { $set: { email: "", verificationKey: "", otp: "", 'permissions.verified': false } });
      }
    }
    if (body.admin !== undefined) { // true or false
      if (process.env.SUPERADMIN !== user._id || user._id === uid) {
        res.status(403).json({ message: "You do not have permission to edit this user\'s admin status." });
        return;
      }
      const adminUpdateDoc = {
        $set: {'permissions.admin': body.admin},
      };
      await db.collection("users").updateOne(query, adminUpdateDoc); // See above
    }
    if (body.warn && body.warning && !body.clearWarnings) {
      const warningDoc = {
        reason: body.warning,
        timestamp: Math.floor(Date.now()/1000),
        by: new ObjectId(user._id),
      };
      const warnUpdateDoc = {
        $set: {'permissions.warned': true},
        $push: {
          'history.warnings': {
            $each: [ warningDoc ],
            $position: 0,
          },
        },
      };
      await db.collection("users").updateOne(query, warnUpdateDoc); // See above
    } else if (body.clearWarnings) {
      if (process.env.SUPERADMIN !== user._id) {
        res.status(403).json({ message: "You do not have permission to pardon users." });
        return;
      }
      const warnUpdateDoc = {
        $set: {
          'permissions.warned': false,
          'history.warnings': [],
        },
      };
      await db.collection("users").updateOne(query, warnUpdateDoc); // See above
    }
    if (body.ban !== undefined && body.ban) { // true or false
      const banUpdateDoc = {
        $set: {'permissions.banned': body.ban, 'history.ban.reason': body.banReason, 'history.ban.timestamp': Math.floor(Date.now()/1000), 'history.ban.by': new ObjectId(user._id)},
      };
      await db.collection("users").updateOne(query, banUpdateDoc); // See above
    } else if (body.ban !== undefined && !body.ban) {
      const banUpdateDoc = {
        $set: {'permissions.banned': body.ban},
      };
      await db.collection("users").updateOne(query, banUpdateDoc); // See above
    } else if (body.ban === undefined && body.banReason) {
      const banReasonUpdateDoc = {
        $set: {'history.ban.reason': body.banReason, 'history.ban.timestamp': Math.floor(Date.now()/1000), 'history.ban.by': new ObjectId(user._id)},
      };
      await db.collection("users").updateOne(query, banReasonUpdateDoc); // See above
    }
    const lastEditDoc = {
      $set: {
        'history.lastEdit.timestamp': Math.floor(Date.now()/1000),
        'history.lastEdit.by': new ObjectId(user._id),
      },
    };
    await db.collection("users").updateOne(query, lastEditDoc); // See above
    res.json(updated);
  } else if (req.method === 'DELETE') {
    if (user._id === uid) {
      res.status(401).json({ message: "You can\'t delete your own account from the admin panel." });
      return;
    } else if (process.env.SUPERADMIN !== user._id) {
      res.status(403).json({ message: "You do not have permission to delete users." });
      return;
    }
    const deletedUser = await db.collection("users").deleteOne({ _id: new ObjectId(uid) });
    await db.collection("tasks").deleteMany({ owner: new ObjectId(uid) }); // See above
    await db.collection("collections").deleteMany({ owner: new ObjectId(uid) }); // See above
    res.json(deletedUser);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
