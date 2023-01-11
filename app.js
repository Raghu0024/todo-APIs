const express = require("express");
const sqllite3 = require("sqlite3");
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
      driver: sqllite3.Database,
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

 const hasStatusAndPriorityProperties=(requestQuery)=>{
    return(requestQuery.status!==undefined && requestQuery.priority!==undefined);
 };

 const hasPriority=(requestQuery)=>{
     return(requestQuery.priority!==undefined);
 };

 const hasStatus=(requestQuery)=>{
     return(requestQuery.status!==undefined);
 };

const hasStatusProperty=(requestQuery)=>{
   return(requestQuery.status!==undefined);
 };

 const hasPriorityProperty=(requestQuery)=>{
     return(requestQuery.priority!==undefined);
 };

 const hasTodoProperty=(requestQuery)=>{
     return(requestQuery.todo!==undefined);
 };

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority} = request.query;
  let getTodosQuery = ""
  switch (true) {
      case hasStatusAndPriorityProperties(request.query):
          getTodosQuery=`
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND priority='${priority}'
            AND status='${status}';`;
          break;
      case hasPriority(request.query):
          getTodosQuery=`
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND priority='${priority}';`;
          break;
      case hasStatus(request.query):
          getTodosQuery=`
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND status='${status}';`;
          break;
      default:
          getTodosQuery=`
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%';`;
          break;
  }
  const todoArray = await database.all(getTodosQuery);
  respond.send(todoArray);
});


app.get("/todo/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const getTodoQuery=`
          SELECT
            *
          FROM
            todo
          WHERE
            id=${todoId};`;
const todo = await database.get(getTodoQuery);
response.send(todo);
});

app.post("/todos/",async(request,response)=>{
    const {id,todo,priority,status}=request.body;
    const createTodoQuery=`
    INSERT INTO
      todo(id,todo,priority,status)
    VALUES
      (${id},'${todo}','${priority}','${status}');`;
    await database.run(createTodoQuery);
    console.log("Todo Successfully Added");
});

app.put("/todos/:todoId/",async(request,response)=>{
    const {todo,priority,status}=request.body;
    const {todoId}=request.params;
    let message=""
    let updateQuery=""
    switch (true) {
        case hasStatusProperty(request.body):
            updateQuery=`
            UPDATE 
              todo
            SET
              status='${status}'
            WHERE
              id=${todoId};`;
            message="Status Updated"
            break;
        case hasPriorityProperty(request.body):
            updateQuery=`
            UPDATE 
              todo
            SET
              priority='${priority}'
            WHERE
              id=${todoId};`;
            message="Priority Updated"
            break;
        case hasTodoProperty(request.body):
            updateQuery=`
            UPDATE 
              todo
            SET
              todo='${todo}'
            WHERE
              id=${todoId};`;
            message="Todo Updated"
            break;
    }
    await database.run(updateQuery);
    response.send(message);
})

app.delete("/todo/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const deleteTodoQuery=`
        DELETE FROM
          todo
        WHERE
          id=${todoId}`;
 await database.get(deleteTodoQuery);
response.send("Todo Deleted");
});


export.modules =app;