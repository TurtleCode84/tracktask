import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

export default withIronSessionApiRoute(eventsRoute, sessionOptions);

async function eventsRoute(req, res) {
  const user = req.session.user;

  if (!user || user.isLoggedIn === false) {
    res.status(401).end();
    return;
  }

  try {
    const { data: events } =
      "nothing",

    res.json(events);
  } catch (error) {
    res.status(200).json([]);
  }
}
