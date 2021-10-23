const event = require('codeceptjs').event;
const unirest = require('unirest');
const container = require('codeceptjs').container;
const reporter = container.helpers('Mochawesome');
const recorder = require('codeceptjs').recorder;

const defaultConfig = {
  api: {
    protocol: 'https',
    host: 'api.browserstack.com',
    resource: 'automate'
  }
};

module.exports = (config) => {
  config = Object.assign(defaultConfig, config);

  event.dispatcher.on(event.test.passed, test => {
    markTest(_getSessionId(), 'passed');
  });

  event.dispatcher.on(event.test.failed, (test, error) => {
    markTest(_getSessionId(), 'failed', error);
  });

  event.dispatcher.on(event.test.started, (test) => {
    updateTestName(_getSessionId(), test.title);
  });

  event.dispatcher.on(event.suite.before, (suite) => {
    container.helpers(config.helper).config.desiredCapabilities['build'] = suite.title;
  });

  event.dispatcher.on(event.test.after, test => {
    recorder.add('add browserstack session info', test => {
      return getSessionInfo(_getSessionId()).then(result => {
        reporter.addMochawesomeContext({
          title: 'BrowserStack Session Info',
          value: {
            data: result
          }
        });
      })
    });
  });

  async function markTest(sessionId, status, reason) {
    const body = {};
    body['status'] = status;
    if (reason) body['reason'] = reason;

    const request = unirest
      .put(_buildUrl(config.api.protocol, config.api.host, config.api.resource, 'sessions', `${sessionId}.json`))
      .headers(_buildHeaders())
      .auth(_buildAuth())
      .send(body);
    await _executeRequest(request).catch(e => console.error(e));
  }

  async function updateTestName(sessionId, name) {
    const body = {};
    body['name'] = name;

    const request = unirest
      .put(_buildUrl(config.api.protocol, config.api.host, config.api.resource, 'sessions', `${sessionId}.json`))
      .headers(_buildHeaders())
      .auth(_buildAuth())
      .send(body);

    await _executeRequest(request).catch(e=>console.error(e));
  }

  async function getSessionInfo(sessionId) {
    const request = unirest
      .get(_buildUrl(config.api.protocol, config.api.host, config.api.resource, 'sessions', `${sessionId}.json`))
      .headers(_buildHeaders())
      .auth(_buildAuth());

    const result = await _executeRequest(request).catch(e=>console.error(e));
    return result.body;
  }

  function _getSessionId() {
    return container.helpers(config.helper).browser.sessionId;
  }

  function _buildHeaders() {
    const headers = {};
    headers['Content-Type'] = 'application/json';

    return headers;
  }

  function _buildAuth() {
    const auth = {};
    auth['user'] = config.user;
    auth['pass'] = config.key;

    return auth;
  }

  function _buildUrl(protocol, host, resource, identifier, action, queries = {}) {
    const url = [
      protocol + '://' + host,
      resource,
      identifier,
      action
    ];

    const cleanedUrl = url.filter(chunk => !!chunk);

    const query = Object.keys(queries)
      .map((label) => `${label}=${queries[label]}`)
      .join('&');
    
    return cleanedUrl.join('/') + (query ? '?' + query : '');
  }

  function _executeRequest(request) {
    return new Promise((resolve, reject) => {
      request
        .end(response => {
          if (response.status === 200){
            resolve(response);
          } else {
            reject(response);
          }
        });
    });
  }
}
