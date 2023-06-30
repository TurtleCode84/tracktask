import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import moment from "moment";

export default withIronSessionApiRoute(dataRoute, sessionOptions);

async function dataRoute(req, res) {
  const user = req.session.user;
  const { dataPath, filter } = req.query;
  const allowedPaths = ["tasks", "collections"];

  if (!dataPath) {
    res.status(200).json({ message: "TrackTask API", status: "online", maintenance: false });
    return;
  } else if (dataPath.length > 2 || !allowedPaths.includes(dataPath[0])) {
    res.status(404).json({ message: "Endpoint not found" });
    return;
  } else if (!user || !user.isLoggedIn || user.permissions.banned) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  // At this point we know that the first parameter is either tasks or collections, and the user is authorized
  // So now we might as well initialize the DB connector

  const client = await clientPromise;
  const db = client.db("data");

  if (dataPath[0] === "tasks") {

    if (req.method === 'GET') { // Returns an array with a task or list of tasks

      const ownTasksQuery = {
        hidden: false,
        owner: new ObjectId(user.id),
      };
      const tasksOptions = {
        sort: { 'completion.completed': 1, priority: -1, dueDate: 1 },
        projection: { name: 1, description: 1, dueDate: 1, created: 1, owner: 1, completion: 1, priority: 1 },
      };
      const inCollectionsQuery = {
        hidden: false,
        $or: [
          { owner: new ObjectId(user.id) },
          { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id)}} }, // Need to add regex to exclude pending collections
        ],
      };

      var data;

      if (dataPath[1] && !ObjectId.isValid(dataPath[1])) {

        res.status(422).json({ message: "Invalid task ID" });
        return;

      } else {

        if (dataPath[1]) {
          ownTasksQuery._id = new ObjectId(dataPath[1]);
        } else {
          if (filter === "recent") {
            ownTasksQuery.created = {$gte: (Math.floor(Date.now()/1000) - 172800)}; // 2 days ago
          } else if (filter === "upcoming") {
            ownTasksQuery.dueDate = {$gt: Math.floor(Date.now()/1000)};
          } else if (filter === "overdue") {
            ownTasksQuery.dueDate = {$lte: Math.floor(Date.now()/1000)};
          } else if (filter === "notdue") {
            ownTasksQuery.dueDate = 0;
          }
        }

        try {

          data = await db.collection("tasks").find(ownTasksQuery, tasksOptions).toArray();
          var taskIds = [];
          data.forEach(item => taskIds.push(String(item._id)));

          // Get and append shared tasks from collections as well
          const allCollections = await db.collection("collections").find(inCollectionsQuery).toArray();
          var sharedTasks = [];
          allCollections.forEach(allCollection => {
            sharedTasks.push(...allCollection.tasks.filter(task => !taskIds.includes(String(task))));
          });
          if (dataPath[1]) {
            sharedTasks = sharedTasks.filter(sharedTask => String(sharedTask) === String(dataPath[1]));
          }
          const sharedTasksQuery = {
            ...ownTasksQuery,
            _id: {
              $in: sharedTasks,
            },
          }
          delete sharedTasksQuery.owner;
          data = data.concat(await db.collection("tasks").find(sharedTasksQuery, tasksOptions).toArray());
          // data should now contain all owned and shared tasks
          
          // At this point we can tell if the task exists
          if (data.length < 1) {
            res.status(404).json({ message: "Task not found" });
            return;
          }

          if (!dataPath[1]) {
            if (filter === "upcoming" || filter === "overdue") {
              data = data.filter(task => task.dueDate !== 0);
            }
            if (filter === "upcoming" || filter === "overdue" || filter === "notdue") {
              data = data.filter(task => task.completion.completed === 0);
            }
            if (filter) {
              delete ownTasksQuery.created; // Might find a better way to do this
              delete ownTasksQuery.dueDate;
            }
          }

          data.collections = [];
          for (var i=0; i<data.length; i++) {
            var taskInCollection = [];
            for (var j=0; j<allCollections.length; j++) {
              const allFilteredCollections = allCollections[j].tasks.filter(task => new ObjectId(task) === new ObjectId(data[i]._id)); // String or ObjectId?
              if (allFilteredCollections.length > 0) {

                /*var collectionRole;
                if (new ObjectId(allCollections[j].owner) === new ObjectId(user.id)) {
                  collectionRole = "owner";
                } else {
                  collectionRole = allCollections[j].sharing.sharedWith.find(element => new ObjectId(element.id) === new ObjectId(user.id)).role;
                  if (!collectionsRole) {
                    res.status(500).json({ debug: allCollections[j], ownerTest: new ObjectId(user.id) === new ObjectId(allCollections[j].owner) });
                    return;
                  }
                }

                const collectionInfo = {
                  name: allCollections[j].name,
                  role: collectionRole,
                };*/
                
                taskInCollection.push(allCollections[j].name); // Returns defined if in collection
              }
            }
            data[i].collections = taskInCollection;
          }

        } catch (error) {
          res.status(500).json({ message: error.message });
          return;
        }

      }

      // Remove array if single task
      if (data.length === 1) {data = data[0]}

      // Return data
      res.json(data);

    } else if (req.method === 'POST') {

      res.status(503).json({ message: "Under construction" });
      return;

    } else if (req.method === 'DELETE') {

      // Make sure there is a valid task ID to delete
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid task ID" });
        return;
      }

      const query = {
        hidden: false, // Cannot be hidden
        _id: new ObjectId(dataPath[1]), // Matches the specified task ID
        owner: new ObjectId(user.id), // Can only be deleted by the owner of the task
      };

      // Attempt to delete the task and return acknowledgement
      try {
        const deletedTask = await db.collection("tasks").deleteOne(query);
        res.json(deletedTask);
      } catch (error) {
        res.status(500).json(error);
        return;
      }

    } else if (req.method === 'PATCH') {

      res.status(503).json({ message: "Under construction" });
      return;

    } else if (req.method === 'PUT') {

      res.status(503).json({ message: "Under construction" });
      return;

    } else {
      res.status(405).json({ message: "Method not allowed" });
      return;
    }
    
  } else if (dataPath[0] === "collections") {

    if (req.method === 'GET') {

      res.status(503).json({ message: "Under construction" });
      return;

    } else if (req.method === 'POST') {

      res.status(503).json({ message: "Under construction" });
      return;

    } else if (req.method === 'DELETE') {

      // Make sure there is a valid collection ID to delete
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid collection ID" });
        return;
      }

      const query = {
        hidden: false, // Cannot be hidden
        _id: new ObjectId(id), // Matches the specified collection ID
        owner: new ObjectId(user.id), // Can only be deleted by the owner of the collection
      };

      // Attempt to delete the collection and return acknowledgement
      try {
        const deletedCollection = await db.collection("collections").deleteOne(query);
        res.json(deletedCollection);
      } catch (error) {
        res.status(500).json(error);
        return;
      }

    } else if (req.method === 'PATCH') {

      res.status(503).json({ message: "Under construction" });
      return;

    } else if (req.method === 'PUT') {

      res.status(503).json({ message: "Under construction" });
      return;
      
    } else {
      res.status(405).json({ message: "Method not allowed" });
      return;
    }

  } else {
    res.status(404).json({ message: "Endpoint not found" }); // Redundant
    return;
  }





  /*if (req.method === 'GET') { // Get all unhidden tasks or collections for the logged in user
    const query = {
      hidden: false,
      $or: [
        { owner: new ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id)}} },
      ],
    };
    const taskoptions = {
      sort: { 'completion.completed': 1, priority: -1, dueDate: 1 },
      projection: { name: 1, description: 1, dueDate: 1, created: 1, owner: 1, completion: 1, priority: 1 },
    };
    var data;
    if (collections !== "true") {
      if (filter === "recent") {
        query.created = {$gte: (Math.floor(Date.now()/1000) - 172800)}; // 2 days ago
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
        if (filter === "upcoming" || filter === "overdue" || filter === "notdue") {
          data = data.filter(task => task.completion.completed === 0);
        }
        if (filter) {
          delete query.created; // Might find a better way to do this
          delete query.dueDate;
        }
        const allCollections = await db.collection("collections").find(query).toArray();
        data.collections = [];
        for (var i=0; i<data.length; i++) {
          var taskInCollection = [];
          for (var j=0; j<allCollections.length; j++) {
            const allFilteredCollections = allCollections[j].tasks.filter(task => String(task) === String(data[i]._id));
            if (allFilteredCollections.length > 0) {
              taskInCollection.push(allCollections[j].name); // Returns defined if in collection
            }
          }
          data[i].collections = taskInCollection;
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
        if (data[i].sharing.sharedWith.some((element) => element.id == user.id && element.role.split('-')[0] === "pending")) {
          delete data[i].tasks;
          delete data[i].sharing;
          data[i].pending = true;
        } else {
          if (data[i].owner == user.id) {
            data[i].sharing.role = "owner";
          } else {
            data[i].sharing.role = data[i].sharing.sharedWith.filter(element => element.id == user.id)[0]?.role;
          }
            data[i].tasks = await db.collection("tasks").find({ _id: {$in: data[i].tasks}, hidden: false }, taskoptions).toArray();
        }
      }
      data = data.sort((a, b) => a.pending ? -1 : 1); // Push share requests to the top
    }
    if (data.length === 0 && collections !== "true") {
      res.status(404).json({ message: "No tasks found!" });
      return;
    } else if (data.length === 0) {
      res.status(404).json({ message: "No collections found!" });
      return;
    }
    res.json(data); // Return the tasks
  } else if (req.method === 'POST') { // Create a new task or collection
    const { collection } = req.query;
    if (collection === "true") { // Collection
      const { name, description, shared } = await req.body;
      if (!name || !description) {
        res.status(422).json({ message: "Invalid data" });
        return;
      } else if (name.trim().length > 55 || description.trim().length > 500) {
        res.status(422).json({ message: "Length of title and description must not exceed 55 and 500 characters respectively." });
        return;
      } else if (user.stats.collections >= 100) {
        res.status(403).json({ message: "Woah there, we didn't expect you to create so many collections! Try deleting a few before making a new one." });
        return;
      }
      try {
        const newCollection = {
          name: name.trim(),
          description: description.trim(),
          sharing: {
            shared: shared,
            sharedWith: [],
          },
          hidden: false,
          owner: new ObjectId(user.id),
          created: Math.floor(Date.now()/1000),
          tasks: [],
        };
        const createdCollection = await db.collection('collections').insertOne(newCollection);
        res.json(createdCollection);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }
    } else { // Task
      const { name, description, dueDate, addCollections, markPriority } = await req.body;
      if (!name || !description) {
        res.status(422).json({ message: "Invalid data" });
        return;
      } else if (name.trim().length > 55 || description.trim().length > 500) {
        res.status(422).json({ message: "Length of title and description must not exceed 55 and 500 characters respectively." });
        return;
      } else if (user.stats.tasks >= 10000) {
        res.status(403).json({ message: "Woah there, we didn't expect you to create so many tasks! If you have tasks completed over a year ago, we'll remove them within the week to clear space for new tasks, otherwise you should delete a few before creating any more." });
        return;
      }
      try {
        const newTask = {
          name: name.trim(),
          description: description.trim(),
          hidden: false,
          owner: new ObjectId(user.id),
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
        if (addCollections) {
          var addCollectionsId = [];
          for (var i=0; i<addCollections.length; i++) {
            addCollectionsId[i] = new ObjectId(addCollections[i]);
          }
          const addCollectionsQuery = {
            _id: {
              $in: addCollectionsId,
            },
            tasks: {
              $nin: [new ObjectId(createdTask.insertedId)], // Safety validation in case of weird timing
            },
            hidden: false,
            owner: new ObjectId(user.id),
          };
          const addedCollections = await db.collection('collections').updateMany(addCollectionsQuery, {$push: {tasks: new ObjectId(createdTask.insertedId)}});
        }
        res.json(createdTask);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }
    }
  } else if (req.method === 'DELETE') { // Deletes a task or collection
    const { id, collection } = req.query;
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid object ID" });
      return;
    }
    const query = {
      hidden: false,
      _id: new ObjectId(id),
      $or: [
        { owner: new ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id), role: "editor"}} }, //change so only owner can delete
      ],
    };
    try {
      if (collection !== "true") {
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
  } else if (req.method === 'PATCH') { // Updates a task or collection
    const body = await req.body;
    const { id, collection } = req.query;
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid object ID" });
      return;
    }
    const query = {
      _id: new ObjectId(id),
      hidden: false,
      $or: [
        { owner: new ObjectId(user.id) },
        { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id), role: "editor"}} },
      ],
    };
    var updateDoc = {};
    if (collection !== "true") {
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
        const updatedTask = await db.collection("tasks").updateOne(query, updateDoc);
        res.json(updatedTask);
      } catch (error) {
        res.status(500).json(error);
        return;
      }
    } else {
      if (body.name) {updateDoc.name = body.name.trim().slice(0, 55)} // If you're really going to try to pass the limit via API...
      if (body.description) {updateDoc.description = body.description.trim().slice(0, 500)}
      if (body.shared !== undefined) { // Find a better way to do this
        updateDoc = {
          $set: {
            ...updateDoc,
            'sharing.shared': body.shared,
          },
        }
      } else {
        updateDoc = {
          $set: updateDoc,
        }
      }
      var addCollectionsId = [];
      if (body.addCollections) {
        for (var i=0; i<body.addCollections.length; i++) {
          addCollectionsId[i] = new ObjectId(body.addCollections[i]);
        }
      }
      var removeCollectionsId = [];
      if (body.removeCollections) {
        for (var i=0; i<body.removeCollections.length; i++) {
          removeCollectionsId[i] = new ObjectId(body.removeCollections[i]);
        }
      }
      try {
        const updatedCollection = await db.collection("collections").updateOne(query, updateDoc);
        if (addCollectionsId.length > 0) {
          const addCollectionsQuery = {
            _id: {
              $in: addCollectionsId,
            },
            tasks: {
              $nin: [new ObjectId(id)],
            },
            hidden: false,
            owner: new ObjectId(user.id),
          };
          const addedTasks = await db.collection("collections").updateMany(addCollectionsQuery, {$push: {tasks: new ObjectId(id)}});
        }
        if (removeCollectionsId.length > 0) {
          const removeCollectionsQuery = {
            _id: {
              $in: removeCollectionsId,
            },
            tasks: {
              $in: [new ObjectId(id)],
            },
            hidden: false,
            owner: new ObjectId(user.id),
          };
          const removedTasks = await db.collection("collections").updateMany(removeCollectionsQuery, {$pull: {tasks: new ObjectId(id)}});
        }
        res.json(updatedCollection);
      } catch (error) {
        res.status(500).json(error);
        return;
      }
    }
  } else if (req.method === 'PUT') { // Shares a collection
    const { username, role } = await req.body;
    const { id } = req.query;
    const roles = ["viewer", "collaborator", "editor"];
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid collection ID" });
      return;
    } else if (!username || !role || !roles.includes(role)) {
      res.status(422).json({ message: "Invalid data" });
      return;
    } else if (user.username === username) {
      res.status(403).json({ message: "Collection is already shared with this user!" });
      return;
    }
    const validateUser = await db.collection("users").findOne({username: username.trim().toLowerCase(), 'permissions.banned': false}, { projection: { _id: 1 } });
    if (!validateUser) {
      res.status(404).json({ message: "Username not found!" });
      return;
    }
    const query = {
      _id: new ObjectId(id),
      hidden: false,
      owner: new ObjectId(user.id),
    };
    const validateCollection = await db.collection('collections').findOne({...query, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(validateUser._id)}} });
    if (validateCollection) {
      res.status(403).json({ message: "Collection is already shared with this user!" });
      return;
    }
    const pendingRole = "pending-" + role;
    const updateDoc = {
      $push: {
        'sharing.sharedWith': {id: validateUser._id, role: pendingRole },
      },
    }
    try {
      const sharedTask = await db.collection('collections').updateOne(query, updateDoc);
      res.json(sharedTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }*/
}
