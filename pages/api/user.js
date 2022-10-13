import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req, res) {
  if (req.method === 'GET') {
    if (req.session.user) {
      const client = await clientPromise;
      const db = client.db("data");
      const query = { _id: ObjectId(req.session.user.id) };
      const userInfo = await db.collection("users").findOne(query);
      const user = {
        ...req.session.user,
        isLoggedIn: true,
        email: userInfo.email,
        profilePicture: userInfo.profilePicture,
        history: { joined: userInfo.history.joined, banReason: userInfo.history.banReason, warnings: userInfo.history.warnings },
        shareKey: userInfo.shareKey,
        permissions: userInfo.permissions,
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
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(user.id) };
    if (body.acknowledgedWarning) {
      try {
        const warnUpdateDoc = {
          $set: {'permissions.warned': false},
        };
        const updatedWarn = await db.collection('users').updateOne(query, warnUpdateDoc);
        res.json(updatedWarn);
      } catch (error) {
        res.status(500).json({ "message": error.data.message });
      }
    } else {
      res.status(418).json({ message: "Under construction" });
      return;
    }
  } else if (req.method === 'DELETE') {
    if (user.permissions.admin) {
      res.status(403).json({ message: "Trying to take the easy way out, huh? I don\'t think so..." });
      return;
    }
    const client = await clientPromise;
    const db = client.db("data");
    const deletedTasks = await db.collection("tasks").deleteMany({ owner: ObjectId(user._id) });
    const deletedCollections = await db.collection("collections").deleteMany({ owner: ObjectId(user._id) });
    const deletedUser = await db.collection("users").deleteOne({ _id: ObjectId(user._id) });
    res.json(deletedUser);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
