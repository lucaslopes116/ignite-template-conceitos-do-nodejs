const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Usuario nao encontrado" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAllReadyExists = users.find((user) => user.username === username);

  if (userAllReadyExists) {
    return response
      .status(400)
      .json({ error: "Ja existe usuario com esse username" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.status(201).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (!title || !deadline) {
    return response.status(400).json({ error: "bad" });
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const { id } = request.params;

  const taskUser = user.todos.find((task) => task.id === id);

  if (!taskUser) {
    return response.status(404).json({ error: "Todo nao existe" });
  }

  taskUser.title = title;
  taskUser.deadline = deadline;

  const done = taskUser.done;

  return response.status(201).json({ title, deadline, done });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskUser = user.todos.find((task) => task.id === id);

  if (!taskUser) {
    return response.status(404).json({ error: "Task nao existe" });
  }

  taskUser.done = true;

  return response.status(201).json({ ...taskUser });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskUser = user.todos.find((task) => task.id === id);

  if (!taskUser) {
    return response.status(404).json({ error: "Todo nao encontrado" });
  }

  let taskIndex = user.todos.findIndex((task) => task.id === id);

  let tasksList = user.todos;

  tasksList.splice(taskIndex, 1);

  return response.status(204).send();
});

module.exports = app;
