const app = require('express')();
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// connection configurations
const dbOpt = {
  host: 'localhost',
  user: 'root',
  password: '1',
  database: 'test',
  connectTimeout: 0
};

function mConnection() {
  mc = mysql.createConnection(dbOpt);

  mc.connect(err => {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(mConnection, 2000);
      /* We introduce a delay before attempting to reconnect,
      to avoid a hot loop, and to allow our node script to
      process asynchronous requests in the meantime.
      If you're also serving http, display a 503 error. */
    }
  });

  mc.on('error', err => {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      /* Connection to the MySQL server is usually
      lost due to either server restart, or a
      connnection idle timeout (the wait_timeout
        server variable configures this) */
      mConnection();
    } else {
      throw err;
    }
  });
}

// create a connection
let mc;
// connect to database
mConnection();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Search for Tasks with ‘bug’ in their name
app.get('/tasks', function(req, res) {
  let keyword = req.query.search;

  keyword
    ? mc.query('SELECT * FROM tasks WHERE name LIKE ? ', ['%' + keyword + '%'], function(error, results, fields) {
        if (error) throw error;
        return res.send({
          error: false,
          data: results,
          message: 'Tasks search list.'
        });
      })
    : mc.query('SELECT * FROM tasks', function(error, results, fields) {
        if (error) return;
        return res.send({
          error: false,
          data: results,
          message: 'tasks list.'
        });
      });
});

app.get('/groups', function(req, res) {
  mc.query('SELECT * FROM groups', function(error, results, fields) {
    if (error) return;
    return res.send({
      error: false,
      data: results,
      message: 'groups list.'
    });
  });
});

// Retrieve task with id
app.get('/task', function(req, res) {
  let task_id = req.query.id;

  mc.query('SELECT * FROM tasks where id=?', task_id, function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results[0],
      message: 'Task id ' + task_id
    });
  });
});

// Add a new task
app.post('/task', function(req, res) {
  let task = req.body.task;

  if (!task) {
    return res.status(400).send({
      error: true,
      message: 'Please provide task'
    });
  }

  const keys = Object.keys(task)
    .reduce((str, item) => str + `"${item}",`, '')
    .slice(0, -1);
  const values = Object.values(task)
    .reduce((str, item) => str + `"${item}",`, '')
    .slice(0, -1);

  mc.query('INSERT INTO tasks SET ? ', task, function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'New task has been created successfully.'
    });
  });
});

//  Update task with id
app.put('/task', function(req, res) {
  let task_id = req.body.task_id;
  let task = req.body.task;

  if (!task_id || !task) {
    return res.status(400).send({
      error: task,
      message: 'Please provide task and task_id'
    });
  }

  mc.query('UPDATE tasks SET ? WHERE id = ?', [task, task_id], function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Task has been updated successfully.'
    });
  });
});

//  Delete task
app.delete('/task', function(req, res) {
  let task_id = req.query.id;

  mc.query('DELETE FROM tasks WHERE id = ?', [task_id], function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Task has been deleted successfully.'
    });
  });
});

// Add a new item
app.post('/item', function(req, res) {
  let item = req.body.item;

  if (!item) {
    return res.status(400).send({
      error: true,
      message: 'Please provide item'
    });
  }

  const keys = Object.keys(item)
    .reduce((str, it) => str + `"${it}",`, '')
    .slice(0, -1);
  const values = Object.values(item)
    .reduce((str, it) => str + `"${it}",`, '')
    .slice(0, -1);

  mc.query('INSERT INTO items SET ? ', item, function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'New item has been created successfully.'
    });
  });
});

// Retrieve item with task_id
app.get('/item', function(req, res) {
  let task_id = req.query.id;

  mc.query('SELECT * FROM items where task_id=?', task_id, function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Task id ' + task_id
    });
  });
});

// Retrieve items
app.get('/items', function(req, res) {
  mc.query('SELECT * FROM items', function(error, results, fields) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Items List'
    });
  });
});
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
/* app.listen(8080, function() {
  console.log('Node app is running on port 8080');
});
 */

module.exports = app;
