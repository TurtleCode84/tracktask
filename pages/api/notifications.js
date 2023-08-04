import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import webpush from "web-push";

export default withIronSessionApiRoute(notificationsRoute, sessionOptions);

async function notificationsRoute(req, res) {
  if (req.method === 'GET') {
    //if (req.headers["Honeybadger-Token"] === process.env.NOTIFICATIONS_HONEYBADGER_TOKEN) {
    if (true) {
      var debug = {};
      const client = await clientPromise;
      const db = client.db("data");
      webpush.setVapidDetails(
        'mailto:tracktask@tracktask.eu.org',
        process.env.NEXT_PUBLIC_NOTIFICATIONS_PUBLIC_KEY,
        process.env.NOTIFICATIONS_PRIVATE_KEY
      );      
      const usersQuery = { 'permissions.banned': false, 'permissions.verified': true, 'notifications.enabled': {$gt: 0} };
      const usersOptions = { projection: { _id: 1, notifications: 1 } };
      try {
        // Due to API constraints, we can only notify task owners
        const users = await db.collection("users").find(usersQuery, usersOptions).toArray(); // This gets verified, non-banned users that have notifications enabled
        debug.users = users.length;
        debug.tasks = [];
        const tasksOptions = {
          projection: { _id: 1, name: 1, description: 1 },
        };
        for (var i=0; i<users.length; i++) {
          const tasksQuery = { hidden: false, owner: new ObjectId(users[i]._id), 'completion.completed': 0, dueDate: {$lte: Math.floor(Date.now()/1000), $gte: users[i].notifications.enabled, $ne: 0}, notified: {$ne: true} };
          const tasks = await db.collection("tasks").find(tasksQuery, tasksOptions).toArray(); // Now we should have all tasks eligible for notification in this particular user
          debug.tasks.push(tasks.length);
          for (var j=0; j<tasks.length; j++) {
            webpush.sendNotification(users[i].notifications.subscription, tasks[j]);
            const notified = await db.collection("tasks").updateOne({ _id: new ObjectId(tasks[j]._id)}, { $set: {notified: true} });
          }
        }
        res.status(200).json({ message: "Notifications successfully delivered", debug: debug });
        return;
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }
    } else {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
  /*} else if (req.method === 'POST') {
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
      res.json(updated);*/
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}