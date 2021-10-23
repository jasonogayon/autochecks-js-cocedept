const config = require('config');
const assert = require('chai').assert;
const I = actor();
const timeout = config.get('timeout');



class Page {

  constructor(url) {
    this.url = url;
    I.say(`URL: ${this.url}`);
  }



  /**
   * Retrieves the number of visible elements found in the page.
   *
   * @function getVisibleQty
   * @param {Object} element Browser element.
   * @return {Number} Number of elements found.
  */
  async getVisibleQty(element) {
    return await I.grabNumberOfVisibleElements(element);
  }


  /**
   * Retrieve an element's value.
   *
   * @exports getValue
   * @param {Object} element Browser element.
   * @return {String} Browser element value.
  */
  async getValue(element) {
    I.waitForVisible(element, timeout);
    return await I.grabValueFrom(element);
  }


  /**
   * Retrieve an element's text content.
   *
   * @exports getTextContent
   * @param {Object} element Browser element.
   * @param {Boolean} waitForElement Waits for the element to be visible, or not. Defaults to true.
   * @return {String} Browser element text content.
  */
  async getTextContent(element, waitForElement = true) {
    if (waitForElement) {
      I.waitForVisible(element, timeout);
    }
    return (await I.grabTextFrom(element)).toString();
  }


  /**
   * Retrieve an element's attribute value.
   *
   * @exports getAttributeValue
   * @param {Object} element Browser element.
   * @param {String} attribute Element attribute.
   * @return {String} Browser element attribute value.
  */
  async getAttributeValue(element, attribute) {
    I.waitForVisible(element, timeout);
    return await I.grabAttributeFrom(element, attribute);
  }


  /**
   * Checks if text is visible in the page.
   *
   * @function seeText
   * @param {Object} text Text to check if visible.
  */
  async seeText(text) {
    await I.see(text);
  }


  /**
   * Checks if text is not visible in the page.
   *
   * @function dontSeeText
   * @param {Object} text Text to check if not visible.
  */
  async dontSeeText(text) {
    await I.dontSee(text);
  }


  /**
  * Redirects user to the page, with load options.
  *
  * @function load
  * @param {URI} url URL to load, defaults to null.
  */
  async load(url, extraWaitSeconds) {
    I.amOnPage(url || this.url);
    if (extraWaitSeconds) I.wait(extraWaitSeconds);
  }


  /**
  * Reloads the page.
  *
  * @function reload
  */
  async reload() {
    I.refreshPage();
  }


  /**
   * Retrieve the page URL.
   *
   * @exports getUrl
   * @return {URI} Page URL.
  */
  async getUrl() {
    return await I.grabCurrentUrl();
  }


  /**
  * Wait for a specific time to pass.
  *
  * @function wait
  * @param {Number} seconds Number of seconds to wait.
  */
  async wait(seconds) {
    if (seconds) I.wait(seconds);
  }


  /**
  * Waits for an element to be visible.
  *
  * @function waitFor
  */
  async waitFor(element, extraWaitSeconds) {
    I.waitForVisible(element, timeout);
    if (extraWaitSeconds) I.wait(extraWaitSeconds);
  }



  /**
  * Reloads the page and waits for an element to be visible.
  *
  * @function reloadAndWaitFor
  */
  async reloadAndWaitFor(element, extraWaitSeconds) {
    I.refreshPage();
    I.waitForVisible(element, timeout);
    if (extraWaitSeconds) I.wait(extraWaitSeconds);
  }


  /**
  * Click a page element.
  * @param {Object} element Browser element.
  * @param {Boolean} waitForElement Waits for the element to be visible, or not. Defaults to true.
  *
  * @function click
  */
  async click(element, waitForElement = true) {
    if (waitForElement) I.waitForVisible(element, timeout);
    I.click(element);
  }


  /**
  * Scroll an element into view smoothly.
  *
  * @function scrollIntoViewSmoothly
  */
  async scrollIntoViewSmoothly(element) {
    I.waitForVisible(element, timeout);
    I.scrollIntoView(element, { behavior: "smooth", block: "center", inline: "center" });
    I.wait(2);
  }


  /**
  * Scroll to the bottom of the page.
  *
  * @function scrollPageToBottom
  */
  async scrollPageToBottom(extraWaitSeconds) {
    I.scrollPageToBottom();
    if (extraWaitSeconds) I.wait(extraWaitSeconds);
  }


  /**
  * Drag and drops an element from one position to another.
  *
  * @function dragAndDrop
  */
  async dragAndDrop(from, to) {
    I.dragAndDrop(from, to);
    I.wait(2);
  }


  /**
   * Reload the page if an element is not displayed, until it gets displayed.
   * Utility step, for ocassions when the page does not load its content and needs a page reload.
   *
   * @exports reloadPageIfNecessary
   * @param element Element to wait for and reload until element is present
   * @param maxRetries Maximum number of reload retries. Default is 3.
   * @param waitSecondsInitial Number of wait seconds before the first element visibility check. Default 5s.
   * @param waitSecondsPerRetry Number of wait seconds per retry before each element visibility check. Default 10s.
   * @param forceError Throws an assertion error if element is still not visible after multiple reloads. Defaults to true.
  */
  async reloadPageIfNecessary(element, maxRetries = 3, waitSecondsInitial = 5, waitSecondsPerRetry = 10, forceError = true) {
    let numberOfElementsAfterRefresh;

    I.wait(waitSecondsInitial);
    let elementIsNotVisible = (await this.getNumberOfItems(element)) === 0;

    while (elementIsNotVisible) {
      I.wait(waitSecondsPerRetry);
      if (maxRetries > 0) {
        maxRetries -= 1;

        numberOfElementsAfterRefresh = (await this.getNumberOfItems(element));

        elementIsNotVisible = numberOfElementsAfterRefresh === 0;
      } else {
        let error = `Can't seem to find the following element after multiple reloads: ${element}`;
        if (forceError) assert.isTrue(numberOfElementsAfterRefresh > 0, error);
        return { canContinue: false, error: error };
      }
      if (elementIsNotVisible) I.refreshPage();
    }

    return { canContinue: true, error: null };
  }


  /**
   * Checks for errors on form submit until a certain max retry, until an error is found, or until successful submit.
   * Utility step, checks for errors every 5 seconds.
   *
   * @param {String} urlSubstring URL substring of current page. Used to check whether page has changed or not.
   * @param {String} errorElement Element locator used to check for errors.
   * @param {Number} maxRetries Maximum retries. Defaults to 20.
   * @exports checkForErrorUntilUrlChanges
  */
  async checkForErrorUntilUrlChanges(urlSubstring, errorElement, maxRetries = 20) {
    let noErrors = (await this.getNumberOfItems(errorElement)) === 0;
    let stillInPage = (await this.getUrl()).includes(urlSubstring);

    while (noErrors && stillInPage && maxRetries > 0) {
      I.wait(5);
      maxRetries -= 1;

      noErrors = (await this.getNumberOfItems(errorElement)) === 0;
      if (!noErrors) {
        I.saveScreenshot(`error-${urlSubstring.replace("/", "")}.png`);
        return {
          canContinue: false,
          error: (await this.getTextContent(errorElement)).toString()
        }
      }

      stillInPage = (await this.getUrl()).includes(urlSubstring);
      if (!stillInPage) break;
    }

    return { canContinue: true, error: '' };
  }


  /**
   * Checks for errors on form submit until a certain max retry, until an error is found, or until successful submit.
   * Utility step, checks for errors every 5 seconds.
   *
   * @param {String} visibleElement Element to check if still visible. Used to check whether form has changed or not.
   * @param {String} errorElement Element locator used to check for errors. Defaults to this.spanInputError.
   * @param {Number} maxRetries Maximum retries. Defaults to 20.
   * @exports checkForErrorUntilElementNotVisible
  */
  async checkForErrorUntilElementNotVisible(visibleElement, errorElement = this.spanInputError, maxRetries = 20) {
    let noErrors = (await this.getNumberOfItems(errorElement)) === 0;
    let stillInForm = (await this.getNumberOfItems(visibleElement)) > 0;

    if (!noErrors) {
      return {
        canContinue: false,
        error: (await this.getTextContent(errorElement)).toString(),
        stillInForm: true
      }
    }

    while (noErrors && stillInForm && maxRetries > 0) {
      I.wait(5);
      maxRetries -= 1;

      noErrors = (await this.getNumberOfItems(errorElement)) === 0;
      if (!noErrors) {
        return {
          canContinue: false,
          error: (await this.getTextContent(errorElement)).toString(),
          stillInForm: true
        }
      }

      stillInForm = (await this.getNumberOfItems(visibleElement)) > 0;
      if (!stillInForm) break;
    }

    stillInForm = (await this.getNumberOfItems(visibleElement)) > 0;
    if (stillInForm) return { canContinue: false, error: 'Still In Form But No Errors', stillInForm: true };

    return { canContinue: true, error: '', stillInForm: false };
  }


  /**
   * Switch to the next tab.
   *
   * @function switchToNextTab
  */
  async switchToNextTab() {
    I.wait(10);
    I.switchToNextTab();
  }


  /**
  * Get temporary email address step using Temp-Mail.Org.
  *
  * @function getTemporaryEmail
  * @return {String} A temp-mail temporary email.
  */
  async getTemporaryEmail() {
    I.amOnPage("https://www.fakemail.net/");

    let emailElement = "//span[@id='email']";
    I.waitForVisible(emailElement, timeout);
    I.wait(5);
    return await I.grabTextFrom(emailElement);
  }


}

module.exports = Page;
