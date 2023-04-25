import clientPromise from "lib/mongodb";
import { ObjectId } from 'mongodb'
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import fetchJson from "lib/fetchJson";

export default withIronSessionApiRoute(impersonateRoute, sessionOptions);

async function impersonateRoute(req, res) {
  if (req.method === 'POST') {
    const { id } = await req.body;
    const user = req.session.user;
    
    if (!user || !user.isLoggedIn || !user.permissions.admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    } else if (process.env.SUPERADMIN !== user.id) {
      res.status(403).json({ message: "You do not have permission to impersonate this user." });
      return;
    }
    
    //Validate
    if (!id || !ObjectId.isValid(id)) {
      res.status(401).json({ message: "Invalid data" });
      return;
    }
    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");
    
    //Check existing user
    const query = { _id: new ObjectId(id) };
    const userExists = await db.collection("users").countDocuments(query);
    if (userExists < 1) {
      res.status(404).json({ message: "User does not exist" }); // user does not exist
      return;
    }
    //Get basic user info
    const options = { projection: { _id: 1, username: 1, profilePicture: 1, permissions: 1, "history.banReason": 1, "history.loginIpList": 1 } };
    const userInfo = await db.collection("users").findOne(query, options);
    try {
      const lastEditUpdateDoc = { //update user lastEdit information
        $set: {
            'history.lastEdit.timestamp': Math.floor(Date.now()/1000),
            'history.lastEdit.by': new ObjectId(user.id), //CURRENT user
        },
      };
      const lastEditUpdate = await db.collection('users').updateOne(query, lastEditUpdateDoc);
      const newUser = { isLoggedIn: true, isImpersonating: true, id: userInfo._id, username: userInfo.username, profilePicture: userInfo.profilePicture, permissions: userInfo.permissions, history: { "banReason": userInfo.history.banReason } };
      req.session.user = newUser;
      await req.session.save();
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
