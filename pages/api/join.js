import clientPromise from "lib/mongodb";
import { hash } from 'bcryptjs';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { v4 as uuidv4 } from "uuid";

export default withIronSessionApiRoute(joinRoute, sessionOptions);

async function joinRoute(req, res) {
  if (req.method === 'POST') {
    const { username, password, email } = await req.body;
    
    //Check if IP banned
    const ip = req.headers["x-forwarded-for"].split(',')[0];
    const bannedIps = process.env.IPBAN.split(',');
    if (bannedIps.includes(ip)) {
      res.status(403).json({ message: 'Your IP address has been banned from creating accounts due to repeated abuse of the platform. If you believe this may have been a mistake, please contact a TrackTask administrator.' });
      return;
    }
    
    //Validate
    if (!username || !password) {
      res.status(422).json({ message: "Invalid data" });
      return;
    }
    
    const blacklist = process.env.BLACKLIST.split(',');
    if (blacklist.includes(username) || blacklist.includes(email)) {
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
        },
        permissions: {
          admin: false,
          banned: false,
          verified: false,
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
