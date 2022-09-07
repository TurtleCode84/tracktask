import clientPromise from "../../../lib/mongodb";
import { hash } from 'bcryptjs';
import { NextRequest } from 'next/server';

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
    //Check existing
    const checkExisting = await db
      .collection('users')
      .findOne({ username: username });
    //Send error response if duplicate user is found
    if (checkExisting) {
      res.status(422).json({ error: 'username is already taken' });
      client.close();
      return;
    }
    //Hash password
    const status = await db.collection('users').insertOne({
      username,
      password: await hash(password, 10),
      email,
      history: {
        joined: Date.now(),
        lastLogin: 0,
        joinedIp: NextRequest.ip,
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
    client.close();
  } else {
    //Response for other than POST method
    res.status(405).json({ error: 'method not allowed' });
  }
}

export default handler;
