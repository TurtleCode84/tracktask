import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import clientPromise from "lib/mongodb";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req, res) {
  if (req.session.user) {
    const client = await clientPromise;
    const db = client.db("data");
    const query = { _id: ObjectId(req.session.user.id) };
    //const options = { projection: { permissions: 1 } };
    const userInfo = await db.collection("users").findOne(query);
    res.json({
      ...req.session.user,
      isLoggedIn: true,
      permissions: userInfo.permissions,
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
