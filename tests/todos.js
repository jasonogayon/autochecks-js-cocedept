const assert = require('chai').assert;
const config = require('config');
const urls = config.get('urls');

const ToDo = require('./pages/todo');
const app = new ToDo(urls.ui.home);



Feature('ToDos')



Before(async (I) => {
  // Go to ToDoMVC React Page
  await app.load();
  await app.waitFor(app.header);
});



Scenario("Can add a single todo", async (I) => {
  // Add a Todo
  const todo = 'a sample todo';
  await app.addToDo(todo);

  // Check that Todo is Added
  assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, "Todo not displayed on list");
})


Scenario("Can add multiple todos", async (I) => {
  // Add Multiple Todos
  const todos = [ 'todo #1', 'todo #2', 'todo #3' ];
  todos.forEach(async (todo) => {
    await app.addToDo(todo);
  })

  // Check that All Todos are Added
  todos.forEach(async (todo) => {
    assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, "Todo not displayed on list");
  })
})