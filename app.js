const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
const databasePath = path.join(__dirname, "todoApplication.db");
let database = null;

const initializeDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database error: ${error.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// const hasPriorityAndStatusProperties = (requestQuery) => {
//   return (
//     requestQuery.status !== undefined && requestQuery.priority !== undefined
//   );
// };

// const hasPriorityProperty = (requestQuery) => {
//   return requestQuery.priority !== undefined;
// };

// const hasStatusproperty = (requestQuery) => {
//   return requestQuery.status !== undefined;
// };

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasTodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

// app.get("/todos/", async (request, response) => {
//   const { search_q = "", priority, status } = request.query;
//   let getTodosQuery = "";
//   switch (true) {
//     case hasStatusAndPriorityProperties(request.query):
//       getTodosQuery = `
//           SELECT
//             *
//           FROM
//             todo
//           WHERE
//             todo LIKE '%${search_q}%'
//             AND priority='${priority}'
//             AND status='${status}';`;
//       break;
//     case hasPriority(request.query):
//       getTodosQuery = `
//           SELECT
//             *
//           FROM
//             todo
//           WHERE
//             todo LIKE '%${search_q}%'
//             AND priority='${priority}';`;
//       break;
//     case hasStatus(request.query):
//       getTodosQuery = `
//           SELECT
//             *
//           FROM
//             todo
//           WHERE
//             todo LIKE '%${search_q}%'
//             AND status='${status}';`;
//       break;
//     default:
//       getTodosQuery = `
//           SELECT
//             *
//           FROM
//             todo
//           WHERE
//             todo LIKE '%${search_q}%';`;
//   }
//   const todoArray = await database.all(getTodosQuery);
//   respond.send(todoArray);
// });

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            id=${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
    INSERT INTO
      todo(id,todo,priority,status)
    VALUES
      (${id},'${todo}','${priority}','${status}');`;
  await database.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todo, priority, status } = request.body;
  const { todoId } = request.params;
  let message = "";
  let updateQuery = "";
  switch (true) {
    case hasStatus(request.body):
      updateQuery = `
            UPDATE 
              todo
            SET
              status='${status}'
            WHERE
              id=${todoId};`;
      message = "Status Updated";
      break;
    case hasPriority(request.body):
      updateQuery = `
            UPDATE 
              todo
            SET
              priority='${priority}'
            WHERE
              id=${todoId};`;
      message = "Priority Updated";
      break;
    case hasTodoProperty(request.body):
      updateQuery = `
            UPDATE 
              todo
            SET
              todo='${todo}'
            WHERE
              id=${todoId};`;
      message = "Todo Updated";
      break;
  }
  await database.run(updateQuery);
  response.send(message);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM
          todo
        WHERE
          id=${todoId}`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
