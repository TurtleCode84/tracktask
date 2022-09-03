/*const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://turtlecode84dba:<password>@cluster0.7aegnb2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/

export default function handler(req, res) {
  const { user } = req.query
  res.end(`Post: ${user.join(', ')}`)
}
