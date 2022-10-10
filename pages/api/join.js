import clientPromise from "lib/mongodb";
import { hash } from 'bcryptjs';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { v4 as uuidv4 } from "uuid";
import fetchJson from "lib/fetchJson";

export default withIronSessionApiRoute(joinRoute, sessionOptions);

async function joinRoute(req, res) {
  if (req.method === 'POST') {
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
      res.status(403).json({ message: "Your IP address has been banned from creating accounts due to repeated abuse of the platform. If you believe this may have been a mistake, please contact a TrackTask administrator." });
      return;
    }
    
    //Validate
    if (!username || !password) {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    
    const blacklist = process.env.BLACKLIST.split(',');
    const contains = blacklist.some(element => {
      if (username.toLowerCase().includes(element.toLowerCase()) || email.toLowerCase().includes(element.toLowerCase())) {
        return true;
      }
    });
    if (contains) {
      res.status(403).json({ message: "The username or email you provided is not allowed, please choose something else." });
      return;
    } else if (username.includes("@") || username.includes(" ") || username.includes("`") || username.includes("&") || username.includes("\"")) {
      res.status(403).json({ message: "Your username contains forbidden characters (@, space, \`, &, \"), please remove them." });
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
      db.collection('users').dropIndex( { "email": 1 } );
      db.collection('users').createIndex( { "email": 1 }, { unique: false } );
      const newUser = {
        username: username.toLowerCase(),
        password: await hash(password, 10),
        email: email.toLowerCase(),
        history: {
          joined: Math.floor(Date.now()/1000),
          lastLogin: 0,
          joinedIp: ip,
          loginIpList: [],
          banReason: "",
          notes: "",
          warnings: [],
        },
        permissions: {
          admin: false,
          banned: false,
          verified: false,
          warned: false,
        },
        shareKey: uuidv4(),
        profilePicture: "",
      }
      const createdUser = await db.collection('users').insertOne(newUser);
      res.json(createdUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
