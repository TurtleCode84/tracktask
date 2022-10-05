import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import moment from "moment";

export default withIronSessionApiRoute(tasksRoute, sessionOptions);

async function tasksRoute(req, res) {
  const user = req.session.user;
  if (!user || !user.isLoggedIn || user.permissions.banned ) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db("data");
  if (req.method === 'GET') { // Get all unhidden tasks or collections for the logged in user
    const { collections, filter } = req.query;
    const query = {
      hidden: false,
      $or: [
        { owner: ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: ObjectId(user.id)}} },
      ],
    };
    const taskoptions = {
      sort: { priority: -1, dueDate: 1 },
      projection: { name: 1, description: 1, dueDate: 1, owner: 1, completion: 1, priority: 1 },
    };
    var data;
    if (collections !== "true") {
      if (filter === "recent") {
        query.created = {$lte: (Math.floor(Date.now()/1000) + 86400)};
      } else if (filter === "upcoming") {
        query.dueDate = {$gt: Math.floor(Date.now()/1000)};
      } else if (filter === "overdue") {
        query.dueDate = {$lte: Math.floor(Date.now()/1000)};
      } else if (filter === "notdue") {
        query.dueDate = 0;
      }
      try {
        data = await db.collection("tasks").find(query, taskoptions).toArray();
        if (filter === "upcoming" || filter === "overdue") {
          data = data.filter(task => task.dueDate !== 0);
        }
      } catch (error) {
        res.status(200).json([]);
        return;
      }
    } else {
      const collectionoptions = {
        sort: { created: -1 },
        projection: { name: 1, description: 1, created: 1, owner: 1, sharing: 1, tasks: 1 },
      };
      try {
        data = await db.collection("collections").find(query, collectionoptions).toArray();
      } catch (error) {
        res.status(200).json([]);
      }
      for (var i=0; i<data.length; i++) {
        data[i].tasks = await db.collection("tasks").find({ _id: {$in: data[i].tasks} }, taskoptions).toArray();
      }
    }
    if (data.length === 0 && collections !== "true") {
      res.status(404).json({ message: "No tasks found" });
      return;
    } else if (data.length === 0) {
      res.status(404).json({ message: "No collections found" });
      return;
    }
    res.json(data);
  } else if (req.method === 'POST') { // Create a new task
    const { name, description, dueDate, markPriority } = await req.body;
    if (!name || !description) {
      res.status(422).json({ message: "Invalid data" });
      return;
    } else if (name.trim().length > 55 || description.trim().length > 500) {
      res.status(422).json({ message: "Length of title and description must not exceed 55 and 500 characters respectively." });
      return;
    }
    // Otherwise...
    try {
      const newTask = {
        name: name.trim(),
        description: description.trim(),
        hidden: false,
        owner: ObjectId(user.id),
        created: Math.floor(Date.now()/1000),
        completion: {
          completed: 0,
          completedBy: "",
        },
        priority: markPriority,
      };
      if (dueDate) {
        newTask.dueDate = moment(dueDate).unix();
      } else {
        newTask.dueDate = 0;
      }
      const createdTask = await db.collection('tasks').insertOne(newTask);
      res.json(createdTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  } else if (req.method === 'DELETE') { // Deletes a task or collection
    const { id, collection } = req.query;
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid object ID" });
      return;
    }
    const query = {
      hidden: false,
      _id: ObjectId(id),
      $or: [
        { owner: ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: ObjectId(user.id)}} },
      ],
    };
    try {
      if (collection !== true) {
        const deletedItem = await db.collection("tasks").deleteOne(query);
        res.json(deletedItem);
      } else {
        const deletedItem = await db.collection("collections").deleteOne(query);
        res.json(deletedItem);
      }
    } catch (error) {
      res.status(500).json(error);
      return;
    }
  } else if (req.method === 'PATCH') { // Updates a task (collections coming soon)
    const body = await req.body;
    const { id, collection } = req.query;
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid object ID" });
      return;
    }
    const query = {
      _id: ObjectId(id),
      hidden: false,
      $or: [
        { owner: ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: ObjectId(user.id)}} },
      ],
    };
    var updateDoc = {};
    if (body.name) {updateDoc.name = body.name.trim().slice(0, 55)} // If you're really going to try to pass the limit via API...
    if (body.description) {updateDoc.description = body.description.trim().slice(0, 500)}
    if (body.dueDate !== undefined) {
      if (body.dueDate) {
        updateDoc.dueDate = moment(body.dueDate).unix();
      } else {
        updateDoc.dueDate = 0;
      }
    }
    if (body.priority !== undefined) {updateDoc.priority = body.priority}
    if (body.completion) {
      updateDoc.completion = {};
      updateDoc.completion.completed = body.completion.completed;
      updateDoc.completion.completedBy = body.completion.completedBy;
    }
    updateDoc = {
      $set: updateDoc,
    }
    try {
      if (collection !== true) {
        const updatedTask = await db.collection("tasks").updateOne(query, updateDoc);
        res.json(updatedTask);
      } else {
        res.status(418).json({ message: "Under construction" });
        return;
      }
    } catch (error) {
      res.status(500).json(error);
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
}
