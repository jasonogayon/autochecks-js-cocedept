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
  assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, `Unable to add todo: ${todo}`);

  // Check that Number of Items Left is Correct
  assert.equal(await app.getTextContent(app.spanTodoCount), "1 item left");
})


Scenario("Can add multiple todos", async (I) => {
  // Add Multiple Todos
  const todos = [ 'todo #1', 'todo #2', 'todo #3' ];
  todos.forEach(async (todo) => {
    await app.addToDo(todo);
  })

  // Check that All Todos are Added
  todos.forEach(async (todo) => {
    assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, `Unable to add todo: ${todo}`);
  })

  // Check that Number of Items Left is Correct
  assert.equal(await app.getTextContent(app.spanTodoCount), `${todos.length} items left`);
})


Scenario("Can remove a todo", async (I) => {
  // Add a Todo
  const todo = 'a sample todo';
  await app.addToDo(todo);

  // Remove Todo
  let hasTodo = (await app.getVisibleQty(`//li[.='${todo}']`)) > 0;
  if (hasTodo) {
    await app.removeToDo(todo);

    // Check that Todo is Removed
    assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 0, `Unable to remove todo: ${todo}`);
  }
})


Scenario("Can edit a todo", async (I) => {
  // Add a Todo
  const todo = 'todo X';
  await app.addToDo(todo);

  // Edit Todo
  let hasTodo = (await app.getVisibleQty(`//li[.='${todo}']`)) > 0;
  if (hasTodo) {
    const newTodo = 'todo Y';
    await app.editToDo(todo, newTodo);

    // Check that Todo is Updated
    assert.equal(await app.getVisibleQty(`//li[.='${newTodo}']`), 1, `Unable to edit todo`);
    assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 0, `Previous todo still exists: ${todo}`);
  }
})


Scenario("Can mark a todo as completed or active", async (I) => {
  // Add a Todo
  const todo = 'a sample todo';
  await app.addToDo(todo);

  let hasTodo = (await app.getVisibleQty(`//li[.='${todo}']`)) > 0;
  if (hasTodo) {
    // Check that Todo is Active by Default
    let todoClass = await app.getAttributeValue(`//li[.='${todo}']`, 'class');
    assert.isFalse(todoClass.includes('completed'), `Todo is marked as completed after being added: ${todo}`);

    // Mark Todo as Completed
    await app.markAsCompleted(todo);

    // Check that Todo is Marked as Completed
    todoClass = await app.getAttributeValue(`//li[.='${todo}']`, 'class');
    assert.isTrue(todoClass.includes('completed'), `Unable to mark todo as completed: ${todo}`);

    // Mark Todo as Active
    await app.markAsCompleted(todo, false);

    // Check that Todo is Marked as Active
    todoClass = await app.getAttributeValue(`//li[.='${todo}']`, 'class');
    assert.isFalse(todoClass.includes('completed'), `Unable to mark todo as active: ${todo}`);
  }
})


Scenario("Can mark all todos as completed or active", async (I) => {
  // Add Multiple Todos
  const todos = [ 'todo #1', 'todo #2', 'todo #3' ];
  todos.forEach(async (todo) => {
    await app.addToDo(todo);
  })

  // Check that All Todos are Added
  todos.forEach(async (todo) => {
    assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, `Unable to add todo: ${todo}`);
  })

  // Check that All Todos are Active by Default
  todos.forEach(async (todo) => {
    let todoClass = await app.getAttributeValue(`//li[.='${todo}']`, 'class');
    assert.isFalse(todoClass.includes('completed'), `Todo is marked as completed after being added: ${todo}`);
  })

  // Mark All Todos as Completed
  await app.toggleAllToDos();

  // Check that All Todos are Marked as Completed
  todos.forEach(async (todo) => {
    let todoClass = await app.getAttributeValue(`//li[.='${todo}']`, 'class');
    assert.isTrue(todoClass.includes('completed'), `Unable to mark todo as completed: ${todo}`);
  })

  // Mark All Todos as Active
  await app.toggleAllToDos();

  // Check that All Todos are Marked as Active
  todos.forEach(async (todo) => {
    let todoClass = await app.getAttributeValue(`//li[.='${todo}']`, 'class');
    assert.isFalse(todoClass.includes('completed'), `Todo is marked as completed after being added: ${todo}`);
  })
})


Scenario("Todo input has a placeholder value of 'What needs to be done?'", async (I) => {
  // Check Todo Input Placeholder Text
  assert.equal(await app.getTextContent(app.inputNewTodo), "");
  assert.equal(await app.getAttributeValue(app.inputNewTodo, 'placeholder'), "What needs to be done?");
})


Scenario("Can view completed or active todos", async (I) => {
  // Add Multiple Todos
  const todos = [ 'todo #1', 'todo #2', 'todo #3' ];
  todos.forEach(async (todo) => {
    await app.addToDo(todo);
  })

  // Check that All Todos are Added
  todos.forEach(async (todo) => {
    assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, `Unable to add todo: ${todo}`);
  })

  // Mark a Single Todo as Completed
  const randomTodo = todos[Math.floor(Math.random() * todos.length)];
  await app.markAsCompleted(randomTodo);

  // View Only Completed Todos and Check that Only One Todo is Visible
  const list = app.listTodos;
  await app.viewCompletedToDos();
  assert.equal(await app.getVisibleQty(list), 1);
  assert.isTrue((await app.getTextContent(list)).includes(randomTodo));

  // View Only Active Todos and Check that the Other Todos are Visible
  await app.viewCompletedToDos(false);
  assert.equal(await app.getVisibleQty(list), 2);
  assert.isFalse((await app.getTextContent(list)).includes(randomTodo));
})


Scenario("Adding a todo from the /completed page adds the todo but won't display from there", async (I) => {
  // Add Multiple Todos
  const todos = [ 'todo #1', 'todo #2', 'todo #3' ];
  todos.forEach(async (todo) => {
    await app.addToDo(todo);
  })

  // View Only Completed Todos
  await app.viewCompletedToDos();

  // Add a Todo
  const todo = 'an active todo';
  await app.addToDo(todo);

  // Check that Todo is Not Displayed in the Page
  assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 0, `Todo is displayed in page when it should not: ${todo}`);

  // Check that Number of Items Left is Correct
  assert.equal(await app.getTextContent(app.spanTodoCount), "4 items left");

  // View Only Active Todos and Check that the Todo is There
  await app.viewCompletedToDos(false);
  assert.equal(await app.getVisibleQty(`//li[.='${todo}']`), 1, `Missing todo: ${todo}`);
})
