import clientPromise from "lib/mongodb";
import { compare, hash } from "bcryptjs";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import fetchJson from "lib/fetchJson";
import parseUuid from "lib/parseUuid";
import { allowedChars } from "lib/allowedChars";

export default withIronSessionApiRoute(authRoute, sessionOptions);

async function authRoute(req, res) {
  if (req.method === 'POST') { // login
    //const { username, password, cf_turnstile } = await req.body;
    const { username, password } = await req.body;
    
    //Check if robot
    var ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"].split(',')[0];
    /*const turnstileResponse = await fetchJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        reponse: cf_turnstile,
        remoteip: ip,
      })
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!turnstileResponse || !turnstileResponse.success || turnstileResponse.action !== "loginFormSubmit") {
        res.status(403).json({ message: "Turnstile verification failed, please try again." });
        return;
      }
    }*/
    
    //Check if IP banned
    const bannedIps = process.env.IPBAN.split(',');
    if (bannedIps.includes(ip)) {
      res.status(403).json({ message: 'Your IP address has been banned from logging in due to repeated abuse of the platform. If you believe this may have been a mistake or would like to appeal, please contact us at appeals@tracktask.eu.org.' });
      return;
    }
    
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
    const options = { projection: { password: 1, _id: 1, username: 1, profilePicture: 1, permissions: 1, "history.ban.reason": 1, "history.loginIpList": 1 } };
    const userInfo = await db.collection("users").findOne(query, options);
    //Check the password
    const passwordMatch = await compare(password, userInfo.password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Incorrect username or password' }); // password is incorrect
      return;
    }
    //Check if banned
    if (userInfo.permissions.banned) {
      if (userInfo.history.ban.reason) {
        res.status(401).json({ message: 'Your account has been banned for the following reason: ' + userInfo.history.ban.reason + '. Please contact appeals@tracktask.eu.org if you would like to appeal or request more information.' });
        return;
      } else {
        res.status(401).json({ message: 'Your account has been banned, please contact appeals@tracktask.eu.org if you would like to appeal or request more information.' });
        return;
      }
    }
    //Otherwise...
    //Superadmin antidox
    if (process.env.SUPERADMIN == userInfo._id) {
      ip = "0.0.0.0";
    }
    ip = ip + "," + Math.floor(Date.now()/1000);
    try {
      const ipUpdateDoc = { //update user IP and lastLogin
        $set: {
          "history.lastLogin": Math.floor(Date.now()/1000),
        },
        $push: {
          "history.loginIpList": {
            $each: [ ip ],
            $position: 0,
            $slice: 5,
          },
        },
      };
      await db.collection("users").updateOne(query, ipUpdateDoc);
      const user = { isLoggedIn: true, id: userInfo._id, username: userInfo.username, profilePicture: userInfo.profilePicture, permissions: userInfo.permissions, history: { } };
      req.session.user = user;
      await req.session.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') { // signup
    const { username, password, email, cf_turnstile } = await req.body;

    //Check if robot
    var ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"].split(',')[0];
    const turnstileResponse = await fetchJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        reponse: cf_turnstile,
        remoteip: ip,
      })
    });
    console.warn(turnstileResponse);
    if (process.env.VERCEL_ENV !== "preview") {
      if (!turnstileResponse || !turnstileResponse.success || turnstileResponse.action !== "joinFormSubmit") {
        res.status(403).json({ message: "Turnstile verification failed, please try again." });
        return;
      }
    }
    
    //Check if IP banned
    const bannedIps = process.env.IPBAN.split(',');
    if (bannedIps.includes(ip)) {
      res.status(403).json({ message: "Your IP address has been banned from creating accounts due to repeated abuse of the platform. If you believe this may have been a mistake or would like to appeal, please contact us at appeals@tracktask.eu.org." });
      return;
    }
    
    //Validate
    if (!username || !password) {
      res.status(422).json({ message: "Invalid data" });
      return;
    } else if (username.length < 3 || username.length > 20) {
      res.status(422).json({ message: "Username length must be within 3 to 20 characters." });
      return;
    }
    
    const blacklist = process.env.BLACKLIST.split(',');
    const cleanUsername = username.trim().toLowerCase();
    const splitUsername = cleanUsername.split('');
    const cleanEmail = email.trim().toLowerCase();
    var contains = blacklist.some(element => { // Check for blacklisted elements
      if (cleanUsername.includes(element.toLowerCase()) || cleanEmail.includes(element.toLowerCase())) {
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
    contains = contains || (cleanEmail && !/(^.+@.+\..+[^.]$)/i.test(cleanEmail));
    if (contains && blacklist) { // Figure out a way to do this when no blacklist is provided
      res.status(403).json({ message: "The username or email you provided is not allowed, please choose something else." });
      return;
    }
      
    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");
    
    //Check existing user
    const query = { username: username.toLowerCase() };
    const userExists = await db.collection("users").countDocuments(query);
    if (userExists > 0) {
      res.status(403).json({ message: "Username is not available, please choose something different." }); // user already exists
      return;
    }
    const emailQuery = { email: cleanEmail, 'permissions.verified': true }; // prevents an unverified user from squatting on an unowned email
    const emailExists = await db.collection("users").countDocuments(emailQuery);
    if (emailExists > 0) {
      res.status(403).json({ message: "Email is already linked to an account, please use a different one." }); // email already in use
      return;
    }
    
    //Otherwise...
    try {
      const newUser = {
        username: cleanUsername,
        password: await hash(password, 10),
        email: cleanEmail,
        verificationKey: "",
        otp: "",
        profilePicture: "",
        history: {
          joined: Math.floor(Date.now()/1000),
          lastLogin: 0,
          lastEdit: {
            timestamp: 0,
            by: "",
          },
          joinedIp: ip,
          loginIpList: [],
          ban: {
            reason: "",
            timestamp: 0,
            by: "",
          },
          notes: "",
          warnings: [],
        },
        permissions: {
          admin: false,
          banned: false,
          verified: false,
          warned: false,
        },
        notifications: {
          enabled: 0,
          subscription: {},
        },
      };
      const createdUser = await db.collection("users").insertOne(newUser);
      const createdUsername = await db.collection("users").findOne({ _id: createdUser.insertedId }, { projection: { username: 1 } });
      res.json(createdUsername);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PATCH') { // password reset
    const { key, password, cf_turnstile } = await req.body;
    var ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"].split(',')[0];
    const turnstileResponse = await fetchJson("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        reponse: cf_turnstile,
        remoteip: ip,
      })
    });
    if (process.env.VERCEL_ENV !== "preview") {
      if (!turnstileResponse || !turnstileResponse.success || turnstileResponse.action !== "passwordResetFormSubmit") {
        res.status(403).json({ message: "Turnstile verification failed, please try again." });
        return;
      }
    }
    if (!password) {
      res.status(422).json({ message: "Invalid data" });
      return;
    }

    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");

    const matchUser = await db.collection("users").findOne({ 'permissions.banned': false, $and: [ {otp: key}, {otp: {$ne: ""}} ] }, { projection: { otp: 1 } });
    if (key && matchUser && (Date.now() - parseUuid(matchUser.otp)) < 3600000) {
      const resetPassword = await db.collection("users").updateOne({ _id: matchUser._id }, { $set: { password: await hash(password, 10), otp: "", 'history.lastEdit.timestamp': Math.floor(Date.now()/1000), 'history.lastEdit.by': matchUser._id } });
      res.json(resetPassword);
    } else {
      res.status(403).json({ message: "Invalid password reset key, please generate a new one." });
      return;
    }
  } else if (req.method === 'DELETE') { // deletion
    await req.session.destroy();
    res.json({ isLoggedIn: false, id: "", username: "", permissions: {} });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
