import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { ObjectId } from 'mongodb'
import clientPromise from "lib/mongodb";
import moment from "moment";

export default withIronSessionApiRoute(adminDataRoute, sessionOptions);

async function adminDataRoute(req, res) {
  const user = req.session.user;
  const { dataPath, filter } = req.query;
  const allowedPaths = ["tasks", "collections"];

  if (!dataPath || dataPath.length > 2 || !allowedPaths.includes(dataPath[0])) {
    res.status(404).json({ message: "Endpoint not found" });
    return;
  } else if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  // At this point we know that the first parameter is either tasks or collections, and the user is an authorized admin
  // So now we might as well initialize the DB connector

  const client = await clientPromise;
  const db = client.db("data");

  if (dataPath[0] === "tasks") {

    if (req.method === 'GET') { // Returns a task or array of tasks, but only if reported
      
      const reportedTasksQuery = {};
      const tasksOptions = {
        projection: { name: 1, description: 1, dueDate: 1, created: 1, owner: 1, completion: 1, priority: 1, hidden: 1 },
      };

      var data;

      if (dataPath[1] && !ObjectId.isValid(dataPath[1])) {

        res.status(422).json({ message: "Invalid task ID" });
        return;

      } else {

        const reportedTasks = await db.collection("reports").find({ type: "task" }, { projection: { reported: 1 } }).toArray();
        var reportedTaskIds = [];
        reportedTasks.forEach(task => reportedTaskIds.push(new ObjectId(task.reported._id)));

        if (dataPath[1]) {
          reportedTasksQuery.$and = [
            { _id: { $in: reportedTaskIds } },
            { _id: new ObjectId(dataPath[1]) },
          ];
        } else {
          reportedTasksQuery._id = { $in: reportedTaskIds };
          if (filter === "recent") {
            reportedTasksQuery.created = {$gte: (Math.floor(Date.now()/1000) - 172800)}; // 2 days ago
          } else if (filter === "upcoming") {
            reportedTasksQuery.dueDate = {$gt: Math.floor(Date.now()/1000)};
          } else if (filter === "overdue") {
            reportedTasksQuery.dueDate = {$lte: Math.floor(Date.now()/1000)};
          } else if (filter === "notdue") {
            reportedTasksQuery.dueDate = 0;
          }
        }

        try {

          data = await db.collection("tasks").find(reportedTasksQuery, tasksOptions).toArray();

          if (data.length === 0 && dataPath[1]) {
            
            /*var taskIds = [];
            data.forEach(item => taskIds.push(String(item._id)));*/

            // Get and append tasks from reported collections as well
            const reportedCollections = await db.collection("reports").find({ $or: [ type: "collection", type: "share" ] }, { projection: { reported: 1 } }).toArray();
            var reportedCollectionIds = [];
            reportedCollections.forEach(collection => {
              const collectionReportedId = new ObjectId(collection.reported._id);
              if (!reportedCollectionIds.includes(collectionReportedId)) {
                reportedCollectionIds.push(collectionReportedId);
              }
            });
            const inReportedCollections = await db.collection("collections").countDocuments({ _id: { $in: reportedCollectionIds }, tasks: new ObjectId(dataPath[1]) });
            
            if (inReportedCollections > 0) {
              data = data.concat(await db.collection("tasks").find({ _id: new ObjectId(dataPath[1]) }).toArray());
            }

            //data.push({ debug: {irp: inReportedCollections, rci: reportedCollectionIds, rc: reportedCollections, dp: dataPath[1]} });

            /*var reportedCollectionsTasks = [];
            allCollections.forEach(allCollection => {
              reportedCollectionsTasks.push(...allCollection.tasks.filter(task => !taskIds.includes(String(task))));
            });
            reportedCollectionsTasks = reportedCollectionsTasks.filter(sharedTask => String(sharedTask) === String(dataPath[1]));

            data = data.concat(await db.collection("tasks").find({ _id: { $in: reportedCollectionsTasks } }).toArray());*/
          
          }
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
              delete reportedTasksQuery.created; // Might find a better way to do this
              delete reportedTasksQuery.dueDate;
            }
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
        data.sort((a, b) => a.dueDate < b.dueDate && a.dueDate > 0 ? -1 : 1);
        data.sort((a, b) => a.priority ? -1 : 1);
      }

      // Return data
      res.json(data);

    } else if (req.method === 'POST') { // Does nothing

      res.status(405).json({ message: "Method not allowed" });
      return;

    } else if (req.method === 'DELETE') { // Deletes a task

      // Make sure there is a valid task ID to delete
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid task ID" });
        return;
      }

      const reportedTasks = await db.collection("reports").find({ type: "task" }, { projection: { reported: 1 } }).toArray();
      var reportedTaskIds = [];
      reportedTasks.forEach(task => reportedTaskIds.push(task.reported));
      
      const query = {
        $and: [
          { _id: { $in: reportedTaskIds } }, // Is a reported task
          { _id: new ObjectId(dataPath[1]) }, // Matches the specified task ID
        ],
      };

      // Attempt to delete the task and return acknowledgement
      try {
        const deletedTask = await db.collection("tasks").deleteOne(query);
        res.json(deletedTask);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }

    } else if (req.method === 'PATCH') { // Updates a task (WIP)

      // Make sure there is a valid task ID to update
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid task ID" });
        return;
      }

      res.status(503).json({ message: "Under construction" });
      return;

      const reportedTasks = await db.collection("reports").find({ type: "task" }, { projection: { reported: 1 } }).toArray();
      var reportedTaskIds = [];
      reportedTasks.forEach(task => reportedTaskIds.push(task.reported));

      const body = await req.body;
      const taskInCollabCollectionQuery = {
        hidden: false,
        $or: [
          { owner: new ObjectId(user.id) },
          {
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
            }
        }
      ],
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

        if (body.name) {updateDoc.name = body.name.trim().slice(0, 55);} // Enforce length limit
        if (body.description) {updateDoc.description = body.description.trim().slice(0, 500);}
        if (body.dueDate !== undefined) {
          if (body.dueDate) {
            updateDoc.dueDate = moment(body.dueDate).unix();
          } else {
            updateDoc.dueDate = 0;
          }
          updateDoc.notified = false;
        }
        if (body.priority !== undefined) {updateDoc.priority = body.priority;}
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
      };
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

    if (req.method === 'GET') { // Returns a collection or array of collections, but only if reported

      const reportedCollectionsQuery = {};
      const collectionsOptions = {
        sort: { created: -1 },
        projection: { name: 1, description: 1, created: 1, owner: 1, sharing: 1, tasks: 1, hidden: 1 },
      };
      const sortedTasksOptions = {
        sort: { 'completion.completed': 1, priority: -1, dueDate: 1 },
        projection: { name: 1, description: 1, dueDate: 1, created: 1, owner: 1, completion: 1, priority: 1, hidden: 1 },
      };

      var data;

      if (dataPath[1] && !ObjectId.isValid(dataPath[1])) {

        res.status(422).json({ message: "Invalid collection ID" });
        return;

      } else {

        const reportedCollections = await db.collection("reports").find({ $or: [ {type: "collection"}, {type: "share"} ] }, { projection: { reported: 1 } }).toArray();
        var reportedCollectionIds = [];
        reportedCollections.forEach(collection => reportedCollectionIds.push(new ObjectId(collection.reported._id)));

        if (dataPath[1]) {
          reportedCollectionsQuery.$and = [
            { _id: { $in: reportedCollectionIds } },
            { _id: new ObjectId(dataPath[1]) },
          ];
        } else {
          reportedCollectionsQuery._id = { $in: reportedCollectionIds };
        }

        try {
          data = await db.collection("collections").find(reportedCollectionsQuery, collectionsOptions).toArray();
        } catch (error) {
          res.status(500).json({ message: error.message });
        }

        // At this point we can tell if the collection exists
        if (dataPath[1] && data.length < 1) {
          res.status(404).json({ message: "Collection not found" });
          return;
        }
        
        for (var i=0; i<data.length; i++) {
          data[i].tasks = await db.collection("tasks").find({ _id: {$in: data[i].tasks} }, sortedTasksOptions).toArray();
        }

      }

      // Remove array if single collection
      if (data.length === 1 && dataPath[1]) {data = data[0];}

      // Return data
      res.json(data);

    } else if (req.method === 'POST') { // Does nothing

      res.status(405).json({ message: "Method not allowed" });
      return;

    } else if (req.method === 'DELETE') { // Deletes a collection

      // Make sure there is a valid collection ID to delete
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid collection ID" });
        return;
      }

      const reportedCollections = await db.collection("reports").find({ $or: [ {type: "collection"}, {type: "share"} ] }, { projection: { reported: 1 } }).toArray();
      var reportedCollectionIds = [];
      reportedCollections.forEach(collection => reportedCollectionIds.push(collection.reported));

      const query = {
        $and: [
          { _id: { $in: reportedCollectionIds } }, // Is a reported collection
          { _id: new ObjectId(dataPath[1]) }, // Matches the specified collection ID
        ],
      };

      // Attempt to delete the collection and return acknowledgement
      // In the future, I could try to delete the task ID from any collections it is in
      try {
        const deletedCollection = await db.collection("collections").deleteOne(query);
        res.json(deletedCollection);
      } catch (error) {
        res.status(500).json({ message: error.message });
        return;
      }

    } else if (req.method === 'PATCH') { // Updates or adds/removes tasks from a collection (WIP)

      // Make sure there is a valid collection ID to update
      if (dataPath[1] && !ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid collection ID" });
        return;
      }

      res.status(503).json({ message: "Under construction" });
      return;

      const body = await req.body;
      var updateDoc = {};

      if (dataPath[1]) { // Updating a specific collection
        const query = {
          _id: new ObjectId(dataPath[1]),
          hidden: false,
          owner: new ObjectId(user.id),
        };
        if (body.name) {updateDoc.name = body.name.trim().slice(0, 55);} // Enforce length limit
        if (body.description) {updateDoc.description = body.description.trim().slice(0, 500);}
        if (body.shared !== undefined && user.permissions.verified) {
          updateDoc = {
            $set: {
              ...updateDoc,
              'sharing.shared': body.shared,
            },
          };
        } else {
          updateDoc = {
            $set: updateDoc,
          };
        }
        try {
          const updatedCollection = await db.collection("collections").updateOne(query, updateDoc);
          res.json(updatedCollection);
        } catch (error) {
          res.status(500).json({ message: error.message });
          return;
        }
      } else { // Adding a task to collections
        // The following query will return null if the user does not own the task
        const taskInfo = await db.collection("tasks").findOne({_id: new ObjectId(body.taskId), owner: new ObjectId(user.id), hidden: false}, { projection: { owner: 1 } });

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
          var updatedCollections;
          if (addCollectionsId.length > 0) {
            if (!taskInfo) {
              res.status(403).json({ message: "You do not own this task!" });
              return;
            }
            const addCollectionsQuery = {
              _id: {
                $in: addCollectionsId,
              },
              tasks: {
                $nin: [new ObjectId(body.taskId)],
              },
              hidden: false,
              $or: [
                { owner: new ObjectId(user.id) },
                {
                  'sharing.shared': true,
                  'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id), role: "contributor"}}
                },
              ],
              // Anyone can only add their own tasks
            };
            updatedCollections = await db.collection("collections").updateMany(addCollectionsQuery, {$push: {tasks: new ObjectId(body.taskId)}});
          }
          if (removeCollectionsId.length > 0) {
            const removeCollectionsQuery = {
              _id: {
                $in: removeCollectionsId,
              },
              tasks: {
                $in: [new ObjectId(body.taskId)],
              },
              hidden: false,
              $or: [
                { owner: new ObjectId(user.id) },
                {
                  'sharing.shared': true,
                  'sharing.sharedWith': {$elemMatch: {id: new ObjectId(user.id), role: "contributor"}},
                  tasks: {$in : [new ObjectId(taskInfo?._id)]}
                },
              ],
              // Contributors can only remove their own tasks, owners can remove any task
            };
            updatedCollections = await db.collection("collections").updateMany(removeCollectionsQuery, {$pull: {tasks: new ObjectId(body.taskId)}});
          }
          res.json(updatedCollections); // Output whatever updates last
        } catch (error) {
          res.status(500).json({ message: error.message });
          return;
        }
      }

    } else if (req.method === 'PUT') { // Shares a collection (WIP)

      res.status(503).json({ message: "Under construction" });
      return;
      
      const body = await req.body;
      
      // Make sure there is a valid collection ID to share
      if (!ObjectId.isValid(dataPath[1])) {
        res.status(422).json({ message: "Invalid collection ID" });
        return;
      } else if (!body.action) {
        res.status(422).json({ message: "An action must be specified" });
        return;
      }

      if (body.action === "share") {

        const roles = ["viewer", "collaborator", "contributor"];
        if (!body.username || !body.role || !roles.includes(body.role)) {
          res.status(422).json({ message: "Invalid data" });
          return;
        } else if (user.username === body.username) {
          res.status(403).json({ message: "Collection is already shared with this user!" });
          return;
        }
        const validateUser = await db.collection("users").findOne({username: body.username.trim().toLowerCase(), 'permissions.banned': false}, { projection: { _id: 1 } });
        if (!validateUser) {
          res.status(404).json({ message: "User not found!" });
          return;
        }
        const query = {
          _id: new ObjectId(dataPath[1]),
          hidden: false,
          owner: new ObjectId(user.id),
        };
        const validateCollection = await db.collection("collections").findOne({...query, 'sharing.sharedWith': {$elemMatch: {id: new ObjectId(validateUser._id)}} });
        if (validateCollection) {
          res.status(403).json({ message: "Collection is already shared with this user!" });
          return;
        }
        const pendingRole = "pending-" + body.role;
        const updateDoc = {
          $push: {
            'sharing.sharedWith': {id: validateUser._id, role: pendingRole },
          },
        };
        try {
          const sharedCollection = await db.collection("collections").updateOne(query, updateDoc);
          res.json(sharedCollection);
        } catch (error) {
          res.status(500).json({ message: error.message });
          return;
        }
      } else if (body.action === "accept") {

        res.status(422).json({ message: "This feature is coming VERY soon!" });
        return;

      } else if (body.action === "reject") {

        res.status(422).json({ message: "This feature is coming VERY soon!" });
        return;

      } else if (body.action === "modify") {

        res.status(422).json({ message: "This feature is coming VERY soon!" });
        return;

      } else if (body.action === "remove") {

        res.status(422).json({ message: "This feature is coming VERY soon!" });
        return;

      } else {
        res.status(422).json({ message: "Invalid action" });
        return;
      }
      
    } else {
      res.status(405).json({ message: "Method not allowed" });
      return;
    }

  } else {
    res.status(404).json({ message: "Endpoint not found" }); // Redundant
    return;
  }
}