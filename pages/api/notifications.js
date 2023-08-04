import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
/*import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import webpush from "web-push";*/

export default withIronSessionApiRoute(notificationsRoute, sessionOptions);

async function notificationsRoute(req, res) {
  /*if (req.method === 'GET') {
    if (req.headers["auth"] === process.env.NOTIFICATIONS_AUTH_TOKEN) {
      const client = await clientPromise;
      const db = client.db("data");
      const query = { 'permissions.banned': false, 'permissions.verified': true, 'notifications.enabled': true };
      const options = { projection: { _id: 1, notifications: 1 } };
      const userInfo = await db.collection("users").find(query, options);
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
      req.session.user = user;
      await req.session.save();
      res.json(user);
    } else {
      res.status(401).json({ message: "Authentication required" });
      return;
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
      var updateUser = {};
      if (body.username && user.permissions.verified) {
        const taken = await db.collection('users').countDocuments({ username: body.username.trim().toLowerCase() });
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
      
      if (body.profilePicture !== undefined) {updateUser.profilePicture = body.profilePicture}
      const updateDoc = {
        $set: updateUser,
      };
      const updated = await db.collection('users').updateOne(query, updateDoc);
      const lastEditDoc = {
        $set: {
          'history.lastEdit.timestamp': Math.floor(Date.now()/1000),
          'history.lastEdit.by': new ObjectId(user.id),
        },
      };
      const lastEditUpdate = await db.collection('users').updateOne(query, lastEditDoc);
      res.json(updated);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }*/
}