import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import { compare, hash } from 'bcryptjs';

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req, res) {
  if (req.method === 'GET') {
    if (req.session.user) {
      const client = await clientPromise;
      const db = client.db("data");
      const query = { _id: new ObjectId(req.session.user.id) };
      const userInfo = await db.collection("users").findOne(query);
      const taskCount = await db.collection("tasks").countDocuments({ owner: new ObjectId(req.session.user.id) });
      const collectionCount = await db.collection("collections").countDocuments({ owner: new ObjectId(req.session.user.id) });
      if (!userInfo) {
        await req.session.destroy();
        res.json({
          isLoggedIn: false,
          id: "",
          username: "",
          permissions: {},
        });
        return;
      }
      userInfo.history.warnings.forEach((warning) => {
        delete warning.by;
      });
      const user = {
        ...req.session.user,
        isLoggedIn: true,
        username: userInfo.username,
        email: userInfo.email,
        profilePicture: userInfo.profilePicture,
        history: { joined: userInfo.history.joined, ban: { reason: userInfo.history.ban.reason, timestamp: userInfo.history.ban.timestamp }, warnings: userInfo.history.warnings, lastEdit: userInfo.history.lastEdit.timestamp },
        permissions: userInfo.permissions,
        stats: { tasks: taskCount, collections: collectionCount },
      };
      req.session.user = user;
      await req.session.save();
      res.json(user);
    } else {
      res.json({
        isLoggedIn: false,
        id: "",
        username: "",
        permissions: {},
      });
    }
  } else if (req.method === 'POST') {
    const body = await req.body;
    const user = req.session.user;
    if (!user || !user.isLoggedIn || user.permissions.banned ) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: new ObjectId(user.id) };
    if (body.acknowledgedWarning) {
      try {
        const warnUpdateDoc = {
          $set: {'permissions.warned': false},
        };
        const updatedWarn = await db.collection("users").updateOne(query, warnUpdateDoc);
        const lastEditDoc = {
          $set: {
            'lastEdit.timestamp': Math.floor(Date.now()/1000),
            'lastEdit.by': new ObjectId(user.id),
          },
        };
        const lastEditUpdate = await db.collection("users").updateOne(query, lastEditDoc);
        res.json(updatedWarn);
      } catch (error) {
        res.status(500).json({ "message": error.data.message });
      }
    } else {
      var updateUser = {};
      if (body.username && user.permissions.verified) {
        const taken = await db.collection("users").countDocuments({ username: body.username.trim().toLowerCase() });
        if (taken > 0) {
          res.status(422).json({ message: "Username is already taken!" });
          return;
        } else {
          updateUser.username = body.username.trim().toLowerCase();
        }
      } else if (body.username) {
        res.status(401).json({ message: "Only verified users can change their username!" });
        return;
      }
      if (body.email !== undefined) {updateUser.email = body.email.trim().toLowerCase()}
      if (body.newPassword && body.oldPassword) {
        const currPass = await db.collection("users").findOne(query, { projection: { password: 1 } }); // current password hash
        const passwordMatch = await compare(body.oldPassword, currPass.password); // string vs hash
        if (!passwordMatch) {
          res.status(401).json({ message: "Incorrect current password!" });
          return;
        } else {
          updateUser.password = await hash(body.newPassword, 10);
        }
      }
      if (body.profilePicture !== undefined) {updateUser.profilePicture = body.profilePicture}
      const updateDoc = {
        $set: updateUser,
      };
      const updated = await db.collection("users").updateOne(query, updateDoc);
      const lastEditDoc = {
        $set: {
          'history.lastEdit.timestamp': Math.floor(Date.now()/1000),
          'history.lastEdit.by': new ObjectId(user.id),
        },
      };
      const lastEditUpdate = await db.collection("users").updateOne(query, lastEditDoc);
      res.json(updated);
    }
  } else if (req.method === 'DELETE') {
    const user = req.session.user;
    if (user.permissions.admin) {
      res.status(403).json({ message: "For security reasons, admins cannot delete their own accounts. Please contact a developer for data deletion." });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const deletedTasks = await db.collection("tasks").deleteMany({ owner: new ObjectId(user.id) });
    const deletedCollections = await db.collection("collections").deleteMany({ owner: new ObjectId(user.id) });
    const deletedUser = await db.collection("users").deleteOne({ _id: new ObjectId(user.id) });
    res.json(deletedUser);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
