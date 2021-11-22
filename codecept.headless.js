const config = require('config');
const moment = require('moment');
require('dotenv').config();

const reportDir = './output';
const testsDir = 'tests';
let currentDate = moment(new Date()).format("YYYY-MM-DD");


const browser = process.env.HEADLESS_BROWSER || 'chrome';
const driverCapabilities = browser === 'firefox'
  ? {
    url: 'http://localhost',
    browser: 'firefox',
    desiredCapabilities: {
      browserName: "firefox",
      'moz:firefoxOptions': {
        args: ['--headless'],
        prefs: {
          "permissions.default.microphone": 1,
          "permissions.default.camera": 1,
          "media.navigator.permission.disabled": true,
          "media.navigator.streams.fake": true
        }
      }
    }
  }
  : {
    url: 'http://localhost',
    browser: "chrome",
    desiredCapabilities: {
      browserName: "chrome",
      chromeOptions: {
        args: [
          '--headless',
          '--window-size=1440,900',
          '--disable-gpu',
          '--no-sandbox',
          "use-fake-device-for-media-stream",
          "use-fake-ui-for-media-stream",
        ],
        prefs: {
          "profile.default_content_setting_values.media_stream_mic": 1,
          "profile.default_content_setting_values.media_stream_camera": 1,
          "profile.default_content_setting_values.geolocation": 1,
          "profile.default_content_setting_values.notifications": 1
        }
      }
    }
  }



exports.config = {
  output: './output',
  helpers: {
    WebDriver: driverCapabilities,
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
          verbose: true
        }
      },
      mochawesome: {
        stdout: './output/mochawesome_headless.log',
        options: {
          reportDir,
          reportFilename: `${currentDate}_headless_todomvc_react`,
          reportPageTitle: `ToDoMVC-React Automated Checks (Headless): ${currentDate}`,
          reportTitle: `ToDoMVC-React Automated Checks (Headless): ${currentDate}`,
          overwrite: true,
          cdn: true,
          json: false
        }
      }
    }
  },
  bootstrap: false,
  teardown: null,
  hooks: [],
  gherkin: {},
  plugins: {
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true
    }
  },
  tests: `./${testsDir}/*.js`,
  rerun: {
    minSuccess: 1,
    maxReruns: 3,
  },
  timeout: 10000,
  name: 'ToDoMVC-React Automated Checks (Headless)'
};
