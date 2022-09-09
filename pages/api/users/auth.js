import clientPromise from "../../../lib/mongodb";
import { hash } from 'bcryptjs';
//import { NextRequest } from 'next/server'; // unneeded?

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
    const passwordHashed = await hash(password, 10);
    const query = { username: username.toLowerCase(), password: passwordHashed };
    const userExists = await db.collection("users").countDocuments(query);
    if (userExists < 1) {
      res.status(422).json({ error: 'incorrect username or password', ...passwordHashed });
      return;
    }
    
    //Get the rest of the user info
    //const projection = { username: 1, "history.joined": 1, permissions: 1, bio: 1, profilePicture: 1 };
    const userInfo = await db.collection("users").find(query)/*.project(projection)*/;
    
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
    //Formulate and update IP list in database
    if (userInfo.history.loginIpList[4]) {
      const temp = userInfo.history.loginIpList.unshift(ip);
      const newIpList = userInfo.history.loginIpList.pop();
    } else {
      const newIpList = userInfo.history.loginIpList.unshift(ip);
    }
    const ipUpdateDoc = {
      $set: {
        "history.loginIpList.$": newIpList,
        "history.lastLogin": Math.floor(Date.now()/1000),
      },
    };
    const ipUpdate = await db.collection('users').updateOne(query, ipUpdateDoc);
    const status = await db.collection('sessions').insertOne({
      userId: userInfo._id,
      expires: Math.floor((Date.now()/1000) + 3600), // Current timestamp plus 60 minutes
    });
    //Send success response
    res.status(201).json({ message: 'user logged in', ...status });
  } else {
    //Response for other than POST method
    res.status(405).json({ error: 'method not allowed' });
  }
}

export default handler;
