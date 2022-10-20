import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

async function logoutRoute(req, res) {
  await req.session.destroy();
  res.json({ isLoggedIn: false, id: "", username: "", permissions: {} });
}
