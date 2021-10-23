const Page = require('./_page');

const config = require('config');
const I = actor();
const timeout = config.get('timeout');



class Todo extends Page {

  constructor(url) {
    super(url);

    this.header = "//h1[.='todos']";
    this.newTodo = "input.new-todo";
  }



  /**
   * Add a todo.
   *
   * @function addToDo
   * @param {Object} text
  */
  async addToDo(text) {
    const input = this.newTodo;

    I.waitForVisible(input, timeout);
    I.fillField(input, text);
    I.waitForValue(input, text, timeout);
    I.pressKey("Enter");
    I.wait(1);
  }


}

module.exports = Todo;
