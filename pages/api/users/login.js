import clientPromise from "../../../lib/mongodb";
import { compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function handler(req, res) {
  //Only POST mothod is accepted
  if (req.method === 'POST') {
    //Getting email and password from body
    const { username, password } = req.body;
    //Validate
    if (!username || !password) {
      res.status(422).json({ error: 'invalid data' });
      return;
    }
    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");
    
    //Check existing user
    const query = { username: username.toLowerCase() };
    const userExists = await db.collection("users").countDocuments(query);
    if (userExists < 1) {
      res.status(422).json({ error: 'incorrect username or password' }); // user does not exist
      return;
    }
    //Get the rest of the user info
    //const projection = { username: 1, "history.joined": 1, permissions: 1, bio: 1, profilePicture: 1 };
    const userInfo = await db.collection("users").findOne(query); /*.project(projection)*/
    //Check the password
    const passwordMatch = await compare(password, userInfo.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'incorrect username or password' }); // password is incorrect
      return;
    }
    //Check if banned
    const isBanned = await db.collection("users").countDocuments({ username: userInfo.username, "permissions.banned": true });
    if (isBanned > 0) {
      res.status(401).json({ error: 'your account has been banned, please contact a site admin for more information' }); // user is banned
      return;
    }
    //Check if already session
    const sessionExists = await db.collection("sessions").countDocuments({ userId: userInfo._id });
    if (sessionExists > 0) {
      res.status(422).json({ error: 'you are already logged in' }); // user is already logged in
      return;
    }
    //Get user IP
    /*const ipList = req.headers["x-forwarded-for"].split(',');
    const ip = ipList[ipList.length-1];*/
    const ip = req.headers["x-forwarded-for"].split(',')[0];
    /*if (req.headers["x-forwarded-for"]) {
      const ip = req.headers["x-forwarded-for"].split(',')[0];
    } else if (req.headers["x-real-ip"]) {
      const ip = req.connection.remoteAddress;
    } else {
      const ip = req.connection.remoteAddress;
    }*/
    //Push current user IP to database
    /*if (userInfo.history.loginIpList[4] !== null) {
      const temp = userInfo.history.loginIpList.unshift(ip);
      newIpList = userInfo.history.loginIpList.pop();
    } else {
      newIpList = userInfo.history.loginIpList.unshift(ip);
    }*/
    const ipUpdateDoc = {
      $set: {
        "history.lastLogin": Math.floor(Date.now()/1000),
      },
      $push: {
        "history.loginIpList": ip,
      },
    };
    const ipUpdate = await db.collection('users').updateOne(query, ipUpdateDoc);
    //Create new session
    const status = await db.collection('sessions').insertOne({
      userId: userInfo._id,
      expires: Math.floor((Date.now()/1000) + 3600), // Current timestamp plus 60 minutes
      sessionKey: uuidv4(),
    });
    //Send success response
    res.status(201).json({ message: 'user logged in', ...status });
  } else {
    //Response for other than POST method
    res.status(405).json({ error: 'method not allowed' });
  }
}

export default handler;