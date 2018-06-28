const fetch = require('node-fetch')
const url = 'http://it4.ecookna.ru:8000/';

async function fetchTasks() {
  return await fetch(`${url}tasks`, {
      method: 'GET'
    })
    .then(res => res.json())
    .then(res => res.data)
    .catch(error => console.error(error));
}

async function writeItem(name, task_id) {
  const body = {
    item: {
      name,
      task_id
    }
  };

  return await fetch(`${url}item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .catch(error => console.error(error));
}

async function writeItems(tasks) {
  for (const task of tasks) {
    await writeItem(task.items, task.id);
  }
}

fetchTasks()
  .then(writeItems)