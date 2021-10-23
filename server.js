const cron = require('node-cron');
const express = require('express');
const execProcess = require("./exec_process.js");

const app = express();

/**
 * Cron to pull latest changes
 * from feat/initial-mocha-test branch
 * and run browserstack automated testing
 * 
 * Running every hour of every day
 */
cron.schedule('0 * * * *', function() {
  execProcess.result("sh scripts/browserstack_automate.sh", function(err, response){
    if(!err){
      console.log(response);
    }else {
      console.log(err);
    }
  });
});

app.listen(3001);
