import clientPromise from "../../../lib/mongodb";
import { hash } from 'bcryptjs';
//import { NextRequest } from 'next/server'; // unneeded?

async function handler(req, res) {
  //Only POST mothod is accepted
  if (req.method === 'POST') {
    //Getting email and password from body
    const { username, email, password } = req.body;
    //Validate
    if (!username || !email || !email.includes('@') || !password) {
      res.status(422).json({ error: 'invalid data' });
      return;
    }
    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");
    //Check existing user
    const uQuery = { username: username.toLowerCase() };
    const userExists = await db.collection("users").countDocuments(uQuery);
    if (userExists > 0) {
      res.status(422).json({ error: 'username is already taken' });
      return;
    }
    //Check existing email
    const eQuery = { email: email.toLowerCase() };
    const emailExists = await db.collection("users").countDocuments(eQuery);
    if (emailExists > 0) {
      res.status(422).json({ error: 'please use a different email' });
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
    //Create user in database
    const status = await db.collection('users').insertOne({
      username: username.toLowerCase(),
      password: await hash(password, 10),
      email: email.toLowerCase(),
      history: {
        joined: Math.floor(Date.now()/1000),
        lastLogin: 0,
        joinedIp: ip,
        loginIpList: [],
      },
      permissions: {
        admin: false,
        banned: false,
        verified: false,
      },
      shareKey: "",
      bio: "Hello, world!",
      profilePicture: "",
    });
    //Send success response
    res.status(201).json({ message: 'user created', ...status });
    //Close DB connection
    //client.close(); // unneeded?
  } else {
    //Response for other than POST method
    res.status(405).json({ error: 'method not allowed' });
  }
}

export default handler;
