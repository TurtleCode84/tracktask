import clientPromise from "lib/mongodb";
import { compare } from 'bcryptjs';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = await req.body;
    
    //Validate
    if (!username || !password) {
      res.status(401).json({ message: "Invalid data" });
      return;
    }
    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");
    
    //Check existing user
    const query = { username: username.toLowerCase() };
    const userExists = await db.collection("users").countDocuments(query);
    if (userExists < 1) {
      res.status(401).json({ message: "Incorrect username or password" }); // user does not exist
      return;
    }
    //Get basic user info
    const options = { projection: { password: 1, _id: 1, username: 1, profilePicture: 1, permissions: 1, "history.banReason": 1 } };
    const userInfo = await db.collection("users").findOne(query, options);
    //Check the password
    const passwordMatch = await compare(password, userInfo.password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Incorrect username or password' }); // password is incorrect
      return;
    }
    //Check if banned (beta)
    if (userInfo.permissions.banned) {
      if (userInfo.history.banReason) {
        res.status(401).json({ message: 'Your account has been banned for the following reason: ' + userInfo.history.banReason + ' Please contact a TrackTask administrator for more information.' }); // password is incorrect
        return;
      } else {
        res.status(401).json({ message: 'Your account has been banned, please contact a TrackTask administrator for more information.' }); // password is incorrect
        return;
      }
    }
    //Otherwise...
    try {
      const ip = req.headers["x-forwarded-for"].split(',')[0];
      const ipUpdateDoc = { //update user IP and lastLogin
        $set: {
          "history.lastLogin": Math.floor(Date.now()/1000),
        },
        $push: {
          "history.loginIpList": ip,
        },
      };
      const ipUpdate = await db.collection('users').updateOne(query, ipUpdateDoc);
      const user = { isLoggedIn: true, id: userInfo._id, username: userInfo.username, profilePicture: userInfo.profilePicture, permissions: userInfo.permissions, history: { "banReason": userInfo.history.banReason } };
      req.session.user = user;
      await req.session.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}, sessionOptions);
