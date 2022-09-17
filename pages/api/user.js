import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req, res) {
  if (req.session.user) {
    //get db user stuff
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
      id: "",
      username: "",
      permissions: {},
    });
  }
}
