import clientPromise from "lib/mongodb";
import { ObjectId } from 'mongodb'
import { hash } from 'bcryptjs';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(reportsRoute, sessionOptions);

async function reportsRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  if (req.method === 'GET' && user.permissions.admin) {
    const { reviewed } = req.query;
    var query;
    if (reviewed === "true") {
      query = { reviewed: {$gt: 0} };
    } else {
      query = { reviewed: 0 };
    }
    const reports = await db.collection("reports").find(query).sort({ timestamp: -1 }).toArray();
    res.json(reports);
  } else if (req.method === 'POST') {
    const { type, reported, reason } = await req.body;
    if (!type || !reported || !reason) {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    try {
      const newReport = {
        reporter: new ObjectId(user.id),
        type: type,
        reason: reason.trim(),
        reported: reported,
        reviewed: 0,
        timestamp: Math.floor(Date.now()/1000),
      };
      const createdReport = await db.collection("reports").insertOne(newReport);
      if (type === "share") {
        const query = {
          _id: new ObjectId(reported._id),
          hidden: false,
          'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id)}},
        };
        const updateDoc = {
          $pull: {
            'sharing.sharedWith': {
              id: new ObjectId(user.id),
            },
          }
        };
        await db.collection("collections").updateOne(query, updateDoc);
      }
      res.json(createdReport);
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  } else if (req.method === 'PATCH' && user.permissions.admin) {
    const { id } = await req.body;
    const query = {_id: new ObjectId(id)};
    const updateDoc = {
      $set: {
        reviewed: Math.floor(Date.now()/1000),
      }
    }
    const updatedReport = await db.collection("reports").updateOne(query, updateDoc);
    res.json(updatedReport);
  } else if (req.method === 'DELETE' && user.permissions.admin) {
    const { id } = await req.query;
    const query = {_id: new ObjectId(id)};
    const deletedReport = await db.collection("reports").deleteOne(query);
    res.json(deletedReport);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
