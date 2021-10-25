const Page = require('./_page');

const config = require('config');
const I = actor();
const timeout = config.get('timeout');



class Todo extends Page {

  constructor(url) {
    super(url);

    this.buttonRemove = "//button[@class='destroy']";
    this.header = "//h1[.='todos']";
    this.inputNewTodo = "input.new-todo";
    this.linkAll = "//a[.='All']";
    this.linkActive = "//a[.='Active']";
    this.linkCompleted = "//a[.='Completed']";
    this.listTodos = "//ul[@class='todo-list']//li";
    this.spanTodoCount = "span.todo-count";
    this.toggleAll = "//label[@for='toggle-all']";
    this.toggleComplete = "//input[@class='toggle']";
  }



  /**
   * Add a todo.
   *
   * @function addToDo
   * @param {String} text
  */
  async addToDo(text) {
    const input = this.inputNewTodo;

    I.waitForVisible(input, timeout);
    I.fillField(input, text);
    I.waitForValue(input, text, timeout);
    I.pressKey("Enter");
    I.wait(1);
  }


  /**
   * Remove a todo.
   *
   * @function removeToDo
   * @param {String} text
  */
  async removeToDo(text) {
    const todo = `//li[.='${text}']`;
    const buttonRemove = `${todo}${this.buttonRemove}`;

    I.waitForVisible(todo, timeout);
    I.moveCursorTo(todo);
    I.waitForVisible(buttonRemove, timeout);
    I.wait(2);
    I.click(buttonRemove);
    I.waitForInvisible(buttonRemove, timeout);
  }


  /**
   * Edit a todo.
   *
   * @function editToDo
   * @param {String} text
   * @param {String} newText
  */
  async editToDo(text, newText) {
    const todo = `//li[.='${text}']`;
    const todoEditing = `//li[.='${text}'][contains(@class,'editing')]`;

    I.waitForVisible(todo, timeout);
    I.doubleClick(todo);
    I.waitForVisible(todoEditing, timeout);
    I.pressKey(['CommandOrControl', 'A']);
    I.wait(1);
    (Array.from(newText)).forEach(letter => I.pressKey(letter));
    I.wait(1);
    I.pressKey("Enter");
    I.wait(1);
  }


  /**
   * Mark a todo as completed or active.
   *
   * @function markAsCompleted
   * @param {String} text
   * @param {Boolean} complete
  */
  async markAsCompleted(text, complete = true) {
    const todo = `//li[.='${text}']`;
    const toggleComplete = `${todo}${this.toggleComplete}`;

    I.waitForVisible(toggleComplete, timeout);
    if (complete) I.checkOption(toggleComplete);
    if (!complete) I.uncheckOption(toggleComplete);
    I.wait(1);
  }


  /**
   * Mark all todos as completed or active.
   *
   * @function toggleAllToDos
  */
  async toggleAllToDos() {
    const toggleComplete = this.toggleAll;

    I.waitForVisible(toggleComplete, timeout);
    I.click(toggleComplete);
    I.wait(1);
  }


  /**
   * View completed or active todos.
   *
   * @function viewCompletedToDos
   * @param {Boolean} complete
  */
  async viewCompletedToDos(complete = true) {
    const linkButton = complete ? this.linkCompleted : this.linkActive;

    await this.scrollIntoViewSmoothly(linkButton);
    I.click(linkButton);
    I.wait(1);
  }


}

module.exports = Todo;
