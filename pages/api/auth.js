import clientPromise from "lib/mongodb";
import { compare, hash } from 'bcryptjs';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import fetchJson from "lib/fetchJson";
import { allowedChars } from "lib/allowedChars";

export default withIronSessionApiRoute(authRoute, sessionOptions);

async function authRoute(req, res) {
  if (req.method === 'POST') {
    //const { username, password, gReCaptchaToken } = await req.body;
    const { username, password } = await req.body;
    
    //Check if robot
    /*const captchaResponse = await fetchJson("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${gReCaptchaToken}`,
    })
    if (process.env.VERCEL_ENV !== "preview") {
      if (!captchaResponse || !captchaResponse.success || captchaResponse.action !== "loginFormSubmit" || captchaResponse.score <= 0.5) {
        res.status(401).json({ message: "reCAPTCHA verification failed, please try again." });
        return;
      }
    }*/
    
    //Check if IP banned
    var ip;
    if (req.headers["cf-connecting-ip"]) {
      ip = req.headers["cf-connecting-ip"];
    } else {
      ip = req.headers["x-forwarded-for"].split(',')[0];
    }
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
        res.status(401).json({ message: 'Your account has been banned for the following reason: ' + userInfo.history.ban.reason + '. Please contact us at appeals@tracktask.eu.org if you would like to appeal or request more information.' });
        return;
      } else {
        res.status(401).json({ message: 'Your account has been banned, please contact us at appeals@tracktask.eu.org if you would like to appeal or request more information.' });
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
      const ipUpdate = await db.collection("users").updateOne(query, ipUpdateDoc);
      const user = { isLoggedIn: true, id: userInfo._id, username: userInfo.username, profilePicture: userInfo.profilePicture, permissions: userInfo.permissions, history: { "banReason": userInfo.history.ban.reason } };
      req.session.user = user;
      await req.session.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    const { username, password, email, gReCaptchaToken } = await req.body;
    
    //Check if robot
    const captchaResponse = await fetchJson("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${gReCaptchaToken}`,
    })
    if (process.env.VERCEL_ENV !== "preview") {
      if (!captchaResponse || !captchaResponse.success || captchaResponse.action !== "joinFormSubmit" || captchaResponse.score <= 0.5) {
        res.status(401).json({ message: "reCAPTCHA verification failed, please try again." });
        return;
      }
    }
    
    //Check if IP banned
    var ip;
    if (req.headers["cf-connecting-ip"]) {
      ip = req.headers["cf-connecting-ip"];
    } else {
      ip = req.headers["x-forwarded-for"].split(',')[0];
    }
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
      res.status(401).json({ message: "Username is not available, please choose something different." }); // user already exists
      return;
    }
    
    //Otherwise...
    try {
      const newUser = {
        username: cleanUsername,
        password: await hash(password, 10),
        email: cleanEmail,
        profilePicture: "",
        history: {
          joined: Math.floor(Date.now()/1000),
          lastLogin: 0,
          lastEdit: {
            timestamp: "",
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
      }
      const createdUser = await db.collection("users").insertOne(newUser);
      const createdUsername = await db.collection("users").findOne({ _id: createdUser.insertedId }, { projection: { username: 1 } });
      res.json(createdUsername);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    await req.session.destroy();
    res.json({ isLoggedIn: false, id: "", username: "", permissions: {} });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
