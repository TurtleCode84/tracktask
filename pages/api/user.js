import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { allowedChars } from "lib/allowedChars";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import { compare, hash } from "bcryptjs";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req, res) {
  if (req.method === 'GET') { // Returns info for the current user
    if (req.session.user) {
      const client = await clientPromise;
      const db = client.db("data");
      const query = { _id: new ObjectId(req.session.user.id) };
      const userInfo = await db.collection("users").findOne(query);
      const taskCount = await db.collection("tasks").countDocuments({ hidden: false, owner: new ObjectId(req.session.user.id) });
      const collectionCount = await db.collection("collections").countDocuments({ hidden: false, owner: new ObjectId(req.session.user.id) });
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
      if (userInfo.history.lastEdit.by != req.session.user.id) {
        delete userInfo.history.lastEdit.by;
      }
      const user = {
        ...req.session.user,
        isLoggedIn: true,
        username: userInfo.username,
        email: userInfo.email,
        profilePicture: userInfo.profilePicture,
        history: { joined: userInfo.history.joined, ban: { reason: userInfo.history.ban.reason, timestamp: userInfo.history.ban.timestamp }, warnings: userInfo.history.warnings, lastEdit: userInfo.history.lastEdit },
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
  } else if (req.method === 'POST') { // Updates the current user
    const body = await req.body;

    const client = await clientPromise;
    const db = client.db("data");

    const sessionUser = req.session.user;
    const user = await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) });
    if (!sessionUser || !sessionUser.isLoggedIn || user.permissions.banned ) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const query = { _id: new ObjectId(user._id) };
    if (body.acknowledgedWarning) {
      try {
        const warnUpdateDoc = {
          $set: {'permissions.warned': false},
        };
        const updatedWarn = await db.collection("users").updateOne(query, warnUpdateDoc);
        const lastEditDoc = {
          $set: {
            'history.lastEdit.timestamp': Math.floor(Date.now()/1000),
            'history.lastEdit.by': new ObjectId(user._id),
          },
        };
        await db.collection("users").updateOne(query, lastEditDoc);
        res.json(updatedWarn);
      } catch (error) {
        res.status(500).json({ message: error.data.message });
      }
    } else {
      const blacklist = process.env.BLACKLIST.split(',');
      var updateUser = {};
      if (body.username && user.permissions.verified) {
        const cleanUsername = body.username.trim().toLowerCase();
        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
          res.status(422).json({ message: "Username length must be within 3 to 20 characters." });
          return;
        }
        const splitUsername = cleanUsername.split('');
        var contains = blacklist.some(element => { // Check for blacklisted elements
          if (cleanUsername.includes(element.toLowerCase())) {
            return true;
          }
        });
        if (!cleanUsername) {
          contains = true;
        }
        for (var i=0; i<splitUsername.length; i++) { // Check for disallowed username characters
          if (!allowedChars.includes(splitUsername[i])) {
            contains = true;
          }
        }
        if (contains && blacklist) { // Figure out a way to do this when no blacklist is provided
          res.status(403).json({ message: "The username you provided is not allowed, please choose something else." });
          return;
        }
        const taken = await db.collection("users").countDocuments({ username: cleanUsername });
        if (taken > 0) {
          res.status(403).json({ message: "Username is already taken!" });
          return;
        } else {
          updateUser.username = cleanUsername;
        }
      } else if (body.username) {
        res.status(403).json({ message: "Only verified users can change their username!" });
        return;
      }
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
      if (body.profilePicture !== undefined) {updateUser.profilePicture = body.profilePicture;}
      const updateDoc = {
        $set: updateUser,
      };
      const updated = await db.collection("users").updateOne(query, updateDoc);
      if (body.email !== undefined) {
        const cleanEmail = body.email.trim().toLowerCase();
        var contains = blacklist.some(element => { // Check for blacklisted elements
          if (cleanEmail.includes(element.toLowerCase())) {
            return true;
          }
        });
        contains = contains || (cleanEmail && !/(^.+@.+\..+[^.]$)/i.test(cleanEmail));
        if (contains && blacklist) { // Figure out a way to do this when no blacklist is provided
          res.status(403).json({ message: "The email you provided is not allowed, please choose something else." });
          return;
        }
        const taken = await db.collection("users").countDocuments({ email: cleanEmail, 'permissions.verified': true });
        if (taken > 0) {
          res.status(403).json({ message: "Email is already linked to an account!" });
          return;
        } else {
          const emailDoc = { $set: {email: cleanEmail, 'permissions.verified': false, verificationKey: "", otp: ""} };
          await db.collection("users").updateOne(query, emailDoc);
        }
      }
      const lastEditDoc = {
        $set: {
          'history.lastEdit.timestamp': Math.floor(Date.now()/1000),
          'history.lastEdit.by': new ObjectId(user._id),
        },
      };
      await db.collection("users").updateOne(query, lastEditDoc);
      res.json(updated);
    }
  } else if (req.method === 'DELETE') { // Deletes the current user and their data
    const client = await clientPromise;
    const db = client.db("data");

    const sessionUser = req.session.user;
    const user = await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) });
    if (user.permissions.admin) {
      res.status(403).json({ message: "For security reasons, admins cannot delete their own accounts. Please contact a developer for data deletion." });
      return;
    }
    await db.collection("tasks").deleteMany({ owner: new ObjectId(user._id) });
    await db.collection("collections").deleteMany({ owner: new ObjectId(user._id) });
    const deletedUser = await db.collection("users").deleteOne({ _id: new ObjectId(user._id) });
    res.json(deletedUser);
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
