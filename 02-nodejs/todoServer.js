/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidV4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const filename = path.join(__dirname, "./todo.json");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/todos", (req, res) => {
  if (fs.existsSync(filename)) {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        res.status(404).send("File not found");
      } else {
        res.status(200).json(JSON.parse(data));
      }
    });
  } else {
    fs.writeFile(filename, JSON.stringify([]), (err, data) => {
      if (err) {
        res.status(404).send("Backend issue");
      } else {
        res.status(200).json(JSON.parse(data));
      }
    });
  }
});

app.get("/todos/:id", (req, res) => {
  if (fs.existsSync(filename)) {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        res.status(404).send("File not found");
      }
      const todos = JSON.parse(data);

      const index = todos.findIndex((item) => item.id === req.params.id);
      if (index === -1) res.status(404).send("Not Found");
      res.status(200).json(todos[index]);
    });
  } else {
    res.status(404).send("Task not found");
  }
});

app.post("/todos", (req, res) => {
  const newTask = {
    id: uuidV4(),
    title: req.body.title,
    description: req.body.description,
    completed: false,
  };

  if (fs.existsSync(filename)) {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        res.status(404).send("File not found");
      }
      const todos = JSON.parse(data);
      todos.push(newTask);

      fs.writeFile(filename, JSON.stringify(todos), (err) => {
        if (err) {
          res.status(404).send("Backend issue");
        } else res.status(201).json(newTask);
      });
    });
  } else {
    fs.writeFile(filename, JSON.stringify([newTask]), (err) => {
      if (err) {
        res.status(404).send("Backend issue");
      } else res.status(201).json(newTask);
    });
  }
});

app.put("/todos/:id", (req, res) => {
  if (fs.existsSync(filename)) {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        res.status(404).send("File not found");
      }

      const todos = JSON.parse(data);
      const index = todos.findIndex((item) => item.id === req.params.id);

      if (index === -1) res.status(404).send();

      fs.writeFile(
        filename,
        JSON.stringify(
          todos.map((todo) => ({
            id: todo.id,
            title: req.body.title || todo.title,
            description: req.body.description || todo,
            completed: req.body.completed || todo.completed,
          }))
        ),
        (err, data) => {
          if (err) {
            res.status(404).send("Backend issue");
          } else {
            res.status(200).send();
          }
        }
      );
    });
  } else {
    fs.writeFile(filename, JSON.stringify([newTask]), (err, data) => {
      if (err) {
        res.status(404).send("Backend issue");
      } else {
        res.status(200).send();
      }
    });
  }
});

app.delete("/todos/:id", (req, res) => {
  if (fs.existsSync(filename)) {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) res.status(500).send();
      console.log(req.params.id);
      const todos = JSON.parse(data);
      const index = todos.findIndex((item) => item.id === req.params.id);
      if (index === -1) res.status(404).send();
      else {
        fs.writeFile(
          filename,
          JSON.stringify(todos.filter((_, i) => index !== i)),
          (err) => {
            if (err) {
              res.status(404).send("Backend issue");
            } else {
              res.status(200).send();
            }
          }
        );
      }
    });
  } else res.status(404).send();
});

app.use((req, res) => {
  res.status(404).send();
});

module.exports = app;
