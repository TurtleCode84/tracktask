import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import webpush from "web-push";

export default withIronSessionApiRoute(notificationsRoute, sessionOptions);

async function notificationsRoute(req, res) {
  if (req.method === 'GET') {
    if (req.headers["honeybadger-token"] === process.env.NOTIFICATIONS_AUTH_TOKEN) {
      var debug = {};
      const client = await clientPromise;
      const db = client.db("data");
      webpush.setVapidDetails(
        'mailto:hello@tracktask.eu.org',
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
            webpush.sendNotification(users[i].notifications.subscription, JSON.stringify(tasks[j]));
            await db.collection("tasks").updateOne({ hidden: false, _id: new ObjectId(tasks[j]._id)}, { $set: {notified: true} });
          }
        }
        //console.warn({ debug: debug });
        res.status(200).json({ message: "Success" });
        return;
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }
    } else {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
  } else if (req.method === 'POST') {
    const { subscription } = await req.body;

    const client = await clientPromise;
    const db = client.db("data");

    const sessionUser = req.session.user;
    const user = sessionUser ? await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) }) : undefined;
    if (!sessionUser || !sessionUser.isLoggedIn || !user || user.permissions.banned ) {
      res.status(401).json({ message: "Authentication required" });
      return;
    } else if (!user.permissions.verified) {
      res.status(403).json({ message: "You do not have permission to modify your subscription!" });
      return;
    }
    const query = { _id: user._id };
    const updateDoc = {
      $set: {
        'notifications.enabled': Math.floor(Date.now()/1000)-60, // 1 minute ago to avoid conflicts with new tasks
        'notifications.subscription': subscription,
      },
    };
    const options = { upsert: true };
    try {
      const updated = await db.collection("users").updateOne(query, updateDoc, options);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  } else if (req.method === 'DELETE') {
    const client = await clientPromise;
    const db = client.db("data");

    const sessionUser = req.session.user;
    const user = sessionUser ? await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) }) : undefined;
    if (!sessionUser || !sessionUser.isLoggedIn || !user || user.permissions.banned ) {
      res.status(401).json({ message: "Authentication required" });
      return;
    } else if (!user.permissions.verified) {
      res.status(403).json({ message: "You do not have permission to modify your subscription!" });
      return;
    }
    const query = { _id: user._id };
    const updateDoc = {
      $set: {
        'notifications.enabled': 0,
        'notifications.subscription': {},
      },
    };
    const options = { upsert: true };
    try {
      const updated = await db.collection("users").updateOne(query, updateDoc, options);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}