const baseUrl = "https://www.todomvc.com/examples/react/#/";

module.exports = {
  headless: false,
  timeout: 120,
  retries: {
    default: 0,
  },
  delays: {
    typing: 5
  },
  urls: {
    ui: {
      home: baseUrl,
    },
  }
};
