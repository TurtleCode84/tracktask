import clientPromise from "lib/mongodb";
import { hash } from 'bcryptjs';
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import fetchJson from "lib/fetchJson";

export default withIronSessionApiRoute(reportsRoute, sessionOptions);

async function reportsRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (req.method === 'GET' && user.permissions.admin) {
    res.status(418).json({ message: "Under construction" });
    return;
  } else if (req.method === 'POST') {
    //const { username, password, email } = await req.body;
    res.status(418).json({ message: "Under construction" });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
