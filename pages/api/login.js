import { Octokit } from "octokit";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
const octokit = new Octokit();

export default withIronSessionApiRoute(async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = await req.body;
    
    //Validate
    if (!username) {
      res.status(401).json({ message: "invalid data" });
      return;
    }
    //Connect with database
    const client = await clientPromise;
    const db = client.db("data");
    
    //Check existing user
    const query = { username: username.toLowerCase() };
    const userExists = await db.collection("users").countDocuments(query);
    if (userExists < 1) {
      res.status(401).json({ message: "incorrect username or password" }); // user does not exist
      return;
    }
    //Check the password
    const projection = { password: 1 };
    const userInfo = await db.collection("users").findOne(query).project(projection);
    //Check the password
    const passwordMatch = await compare(password, userInfo.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'incorrect username or password' }); // password is incorrect
      return;
    }
    //Otherwise...
    try {
      const {
        data: { id: _id, username, profilePicture },
      } = await db.collection("users").findOne(query);

      const user = { isLoggedIn: true, id, username, profilePicture };
      req.session.user = user;
      await req.session.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "method not allowed" });
  }
}, sessionOptions);
