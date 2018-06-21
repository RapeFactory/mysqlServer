const app = require('express')();
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// connection configurations
function mConnection () {
  const mc = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1',
    database: 'test',
    connectTimeout: 0
  });
  mc.connect();
  return mc;
}

// connect to database
const mc = mConnection();

// reconnect on error
mc.on('error', err => {
  console.log(err);
  mc.connect();
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// default route
app.get('/', function (req, res) {
  return res.send({
    error: true,
    message: 'create a request'
  })
});

// Search for Tasks with ‘bug’ in their name
app.get('/tasks', function (req, res) {

  let keyword = req.query.search;

  keyword ?
    mc.query("SELECT * FROM tasks WHERE name LIKE ? ", ['%' + keyword + '%'], function (error, results, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results,
        message: 'Tasks search list.'
      });
    }) :
    mc.query('SELECT * FROM tasks', function (error, results, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results,
        message: 'tasks list.'
      });
    });
});

app.get('/groups', function (req, res) {
  mc.query('SELECT * FROM groups', function (error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'groups list.'
    });
  });
});

// Retrieve task with id 
app.get('/task', function (req, res) {

  let task_id = req.query.id;

  mc.query('SELECT * FROM tasks where id=?', task_id, function (error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results[0],
      message: 'Task id ' + task_id
    });
  });

});

// Add a new task  
app.post('/task', function (req, res) {

  let task = req.body.task;

  if (!task) {
    return res.status(400).send({
      error: true,
      message: 'Please provide task'
    });
  }

  const keys = Object.keys(task).reduce((str, item) => str + `"${item}",`, "").slice(0, -1);
  const values = Object.values(task).reduce((str, item) => str + `"${item}",`, "").slice(0, -1);

  mc.query("INSERT INTO tasks SET ? ", task, function (error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'New task has been created successfully.'
    });
  });
});

//  Update task with id
app.put('/task', function (req, res) {

  let task_id = req.body.task_id;
  let task = req.body.task;

  if (!task_id || !task) {
    return res.status(400).send({
      error: task,
      message: 'Please provide task and task_id'
    });
  }

  mc.query("UPDATE tasks SET ? WHERE id = ?", [task, task_id], function (error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Task has been updated successfully.'
    });
  });
});

//  Delete task
app.delete('/task', function (req, res) {

  let task_id = req.query.id;

  mc.query('DELETE FROM tasks WHERE id = ?', [task_id], function (error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Task has been deleted successfully.'
    });
  });

});


// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
  console.log('Node app is running on port 8080');
});

