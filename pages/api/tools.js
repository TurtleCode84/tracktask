import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import moment from "moment";

export default withIronSessionApiRoute(toolsRoute, sessionOptions);

async function toolsRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  { tool, param } = req.query;
  if (req.method === 'GET') {
    if (tool) {
      if (tool === "userInfo") {
        //get public user info
      } else {
        res.status(418).json({ message: "Under construction" });
        return;
      }
    } else {
      res.status(422).json({ message: "You must specify a tool to use!" });
      return;
    }
  } else if (req.method === 'POST') {
    res.status(418).json({ message: "Under construction" });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
