const Browserstack = require('browserstack-local');
const moment = require('moment');
require('dotenv').config();

const testsDir = 'tests';
const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);

const reportDir = './output/reports';
let currentDate = moment(new Date()).format("YYYY-MM-DD");
let localIdentifier = `tdmvcr_${Math.round(Math.random() * 1000000)}_${Date.now()}`;
let bs;


exports.config = {
  output: './output',
  multiple: {
    basic: {
      browsers: [
        { browser: 'firefox', windowSize: 'maximize' },
        { browser: 'chrome', windowSize: 'maximize' },
      ]
    }
  },
  helpers: {
    WebDriver: {
      url: 'http://localhost',
      host: 'hub-cloud.browserstack.com',
      user: process.env.BROWSERSTACK_USER || 'user',
      key: process.env.BROWSERSTACK_KEY || 'key',
      browser: process.env.MACHINE_BROWSER || 'safari',
      windowSize: '1366x768',
      desiredCapabilities: {
        'browserstack.local': true,
        'browserstack.localIdentifier': localIdentifier,
        "browserstack.idleTimeout": 180,
        'browserstack.debug': true,
        'browserstack.networkLogs': true,
        'browserstack.video': true,
        'browserstack.console': 'info',
        os: process.env.MACHINE_OS || 'OS X',
        os_version: process.env.MACHINE_OS_VERSION || 'Catalina',
        browser_version: process.env.MACHINE_BROWSER_VERSION || 'latest',
        resolution: process.env.MACHINE_BROWSER_RESOLUTION || '1920x1080',
        project: process.env.PROJECT || 'ToDoMVC-React'
      }
    },
    Mochawesome: {
      disableScreenshots: true
    }
  },
  include: {
    I: './steps.js',
  },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: {
          steps: true,
          verbose: false
        }
      }, 
      mochawesome: {
        stdout: './output/mochawesome_browserstack.log',
        options: {
          reportDir,
          reportFilename: `${currentDate}_browserstack_todomvc-react`,
          reportPageTitle: `ToDoMVC-React Automated Checks (Browserstack): ${currentDate}`,
          reportTitle: `ToDoMVC-React Automated Checks (Browserstack): ${currentDate}`,
          overwrite: false,
          cdn: true,
          json: false
        }
      }
    }
  },
  bootstrap: (done) => {
      bs = new Browserstack.Local();
      const args = { localIdentifier, key: process.env.BROWSERSTACK_KEY };

      bs.start(args, (err) => {
          if (err) throw err;
          done();
      });
  },
  teardown: (done) => {
      bs.stop((err) => {
          if (err) throw err;
          done();
      });
  },
  hooks: [],
  gherkin: {},
  plugins: {
    browserstackApi: {
      require: './plugins/browserstackApi',
      enabled: true,
      user: process.env.BROWSERSTACK_USER || 'user',
      key: process.env.BROWSERSTACK_KEY || 'key',
      helper: 'WebDriver',
      api: {
          protocol: 'https',
          host: 'api.browserstack.com',
          resource: 'automate'
      },
    },
  },
  tests: `./${testsDir}/todos.js`,
  rerun: {
    minSuccess: 1,
    maxReruns: 3,
  },
  timeout: 10000,
  name: 'ToDoMVC-React Automated Checks (Browserstack)'
};
