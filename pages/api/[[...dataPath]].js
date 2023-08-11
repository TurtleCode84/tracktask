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
    res.status(200).json({ message: "TrackTask API", isOnline: { frontend: true, backend: true, notifications: true }, maintenance: false });
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

    if (req.method === 'GET') { // Returns a task or array of tasks

      const ownTasksQuery = {
        hidden: false,
        owner: new ObjectId(user.id),
      };
      const tasksOptions = {
        projection: { name: 1, description: 1, dueDate: 1, created: 1, owner: 1, completion: 1, priority: 1 },
      };
      const inCollectionsQuery = {
        hidden: false,
        $or: [
          { owner: new ObjectId(user.id) },
          { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id), role: {$not: /pending/i}}} },
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
          if (dataPath[1] && data.length < 1) {
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
              const allFilteredCollections = allCollections[j].tasks.filter(task => String(task) === String(data[i]._id));
              if (allFilteredCollections.length > 0) {

                var collectionRole;
                if (allCollections[j].owner == user.id) {
                  collectionRole = "owner";
                } else {
                  collectionRole = allCollections[j].sharing.sharedWith.find(element => element.id == user.id)?.role;
                  if (!collectionRole) {
                    res.status(500).json({ debug: allCollections[j], ownerTest: user.id == allCollections[j].owner });
                    return;
                  }
                }
                const collectionInfo = {
                  _id: allCollections[j]._id,
                  name: allCollections[j].name,
                  role: collectionRole,
                };
                
                taskInCollection.push(collectionInfo); // Returns defined if in collection
              }
            }
            data[i].collections = taskInCollection;
          }

        } catch (error) {
          res.status(500).json({ message: error.message });
          return;
        }

      }

      // Remove array if single task, otherwise sort
      if (data.length === 1 && dataPath[1]) {
        data = data[0];
      } else {
        data.sort((a, b) => a.dueDate ? 1 : -1);
        data.sort((a, b) => a.priority ? 1 : -1);
        data.sort((a, b) => a.completion.completed ? 1 : -1);
      }

      // Return data
      res.json(data);

    } else if (req.method === 'POST') { // Creates a new task

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
          notified: false,
        };
        if (dueDate) {
          newTask.dueDate = moment(dueDate).unix();
        } else {
          newTask.dueDate = 0;
        }
        const createdTask = await db.collection("tasks").insertOne(newTask);
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
              $nin: [new ObjectId(createdTask.insertedId)], // Safety validation in case of edit conflict
            },
            hidden: false,
            owner: new ObjectId(user.id),
          };
          const addedCollections = await db.collection("collections").updateMany(addCollectionsQuery, {$push: {tasks: new ObjectId(createdTask.insertedId)}});
        }
        res.json(createdTask);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }

    } else if (req.method === 'DELETE') { // Deletes a task

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

    } else if (req.method === 'PATCH') { // Updates a task

      // Make sure there is a valid task ID to update
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid task ID" });
        return;
      }

      const body = await req.body;
      const taskInCollabCollectionQuery = {
        hidden: false,
        'sharing.shared': true,
        'sharing.sharedWith': {
          $elemMatch: {
            id: new ObjectId(user.id),
            $and: [
              {role: {$not: /pending/i}},
              {$or: [
                {role: "collaborator"},
                {role: "contributor"},
              ]},
            ],
          }
        },
        tasks: new ObjectId(dataPath[1]),
      };
      const ownTaskQuery = {
        _id: new ObjectId(dataPath[1]),
        hidden: false,
        owner: new ObjectId(user.id),
      };
      const taskQuery = { // Dangerous!
        _id: new ObjectId(dataPath[1]),
        hidden: false,
      };
      var updateDoc = {};

      // Check if proper perms are present
      var perms;
      const isOwnTask = await db.collection("tasks").countDocuments(ownTaskQuery);
      if (isOwnTask >= 1) {
        perms = "edit";
      } else {
        const isCollabTask = await db.collection("collections").countDocuments(taskInCollabCollectionQuery);
        if (isCollabTask >= 1) {
          perms = "complete";
        } else {
          res.status(403).json({ message: "You do not have permission to edit this task!" });
          return;
        }
      }

      if (perms === "complete") {

        if (body.completion) {
          updateDoc.completion = {};
          updateDoc.completion.completed = body.completion.completed;
          updateDoc.completion.completedBy = body.completion.completedBy;
        }

      } else if (perms === "edit") {

        if (body.name) {updateDoc.name = body.name.trim().slice(0, 55)} // Enforce length limit
        if (body.description) {updateDoc.description = body.description.trim().slice(0, 500)}
        if (body.dueDate !== undefined) {
          if (body.dueDate) {
            updateDoc.dueDate = moment(body.dueDate).unix();
          } else {
            updateDoc.dueDate = 0;
          }
          updateDoc.notified = false;
        }
        if (body.priority !== undefined) {updateDoc.priority = body.priority}
        if (body.completion) {
          updateDoc.completion = {};
          updateDoc.completion.completed = body.completion.completed;
          updateDoc.completion.completedBy = body.completion.completedBy;
        }

      } else {
        res.status(403).json({ message: "Permissions error" }); // This should not happen
        return;
      }
      updateDoc = {
        $set: updateDoc,
      }
      try {
        const updatedTask = await db.collection("tasks").updateOne(taskQuery, updateDoc); // Dangerous!
        res.json(updatedTask);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }

    } else if (req.method === 'PUT') { // Does nothing

      res.status(405).json({ message: "Method not allowed" });
      return;

    } else {
      res.status(405).json({ message: "Method not allowed" });
      return;
    }
    
  } else if (dataPath[0] === "collections") {

    if (req.method === 'GET') { // Returns a collection or array of collections

      const collectionsQuery = {
        hidden: false,
        $or: [
          { owner: new ObjectId(user.id) },
          { 'sharing.shared': true, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id)}} },
        ],
      };
      const collectionsOptions = {
        sort: { created: -1 },
        projection: { name: 1, description: 1, created: 1, owner: 1, sharing: 1, tasks: 1 },
      };
      const sortedTasksOptions = {
        sort: { 'completion.completed': 1, priority: -1, dueDate: 1 },
        projection: { name: 1, description: 1, dueDate: 1, created: 1, owner: 1, completion: 1, priority: 1 },
      };

      var data;

      if (dataPath[1] && !ObjectId.isValid(dataPath[1])) {

        res.status(422).json({ message: "Invalid collection ID" });
        return;

      } else {

        if (dataPath[1]) {
          collectionsQuery._id = new ObjectId(dataPath[1]);
        }

        try {
          data = await db.collection("collections").find(collectionsQuery, collectionsOptions).toArray();
        } catch (error) {
          res.status(500).json({ message: error.message });
        }

        // At this point we can tell if the collection exists
        if (dataPath[1] && data.length < 1) {
          res.status(404).json({ message: "Collection not found" });
          return;
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
              data[i].tasks = await db.collection("tasks").find({ _id: {$in: data[i].tasks}, hidden: false }, sortedTasksOptions).toArray();
          }
        }
        data.sort((a, b) => a.pending ? -1 : 1); // Push share requests to the top

      }

      // Remove array if single task
      if (data.length === 1 && dataPath[1]) {data = data[0]}

      // Return data
      res.json(data);

    } else if (req.method === 'POST') { // Creates a new collection

      const { name, description } = await req.body;
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
            shared: false,
            sharedWith: [],
          },
          hidden: false,
          owner: new ObjectId(user.id),
          created: Math.floor(Date.now()/1000),
          tasks: [],
        };
        const createdCollection = await db.collection("collections").insertOne(newCollection);
        res.json(createdCollection);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }

    } else if (req.method === 'DELETE') { // Deletes a collection

      // Make sure there is a valid collection ID to delete
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid collection ID" });
        return;
      }

      const query = {
        hidden: false, // Cannot be hidden
        _id: new ObjectId(dataPath[1]), // Matches the specified collection ID
        owner: new ObjectId(user.id), // Can only be deleted by the owner of the collection
      };

      // Attempt to delete the collection and return acknowledgement
      // In the future, I could try to delete the task ID from any collections it is in
      try {
        const deletedCollection = await db.collection("collections").deleteOne(query);
        res.json(deletedCollection);
      } catch (error) {
        res.status(500).json(error);
        return;
      }

    } else if (req.method === 'PATCH') { // Updates or adds/removes tasks from a collection

      // Make sure there is a valid task ID to delete
      /*if (dataPath[1] && !ObjectId.isValid(dataPath[1])) {

        res.status(422).json({ message: "Invalid task ID" });
        return;

      } else {

        const body = await req.body;
        const query = {
          _id: new ObjectId(id),
          hidden: false,
          owner: new ObjectId(user.id),
        };
        var updateDoc = {};

        if (dataPath[1]) {} // Updating collection

        if (body.name) {updateDoc.name = body.name.trim().slice(0, 55)} // Enforce length limit
        if (body.description) {updateDoc.description = body.description.trim().slice(0, 500)}
        if (body.shared !== undefined) {
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

      }*/

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
    
  } else if (req.method === 'POST') { // Create a new task or collection
    
  } else if (req.method === 'DELETE') { // Deletes a task or collection
    
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

  }*/
}
