const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var http = require("http");
const { WebhookClient } = require("dialogflow-fulfillment");
const expressApp = express().use(bodyParser.json());


// const dburi =
  // "MongoDB Database connection link";
 
mongoose.connect(dburi, { useNewUrlParser: true }).catch(err => {
  console.log("error occured", err);
});

// connection

mongoose.connect(dburi, { useNewUrlParser: true }).catch(err => {
  console.log("error occured", err);
});

mongoose.connection.on('error', function (err) {//any error if occured
  console.log('Mongoose connection error: ', err);
  process.exit(1);
})
mongoose.connection.on("connected", () => {
  console.log("Connected with database");
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected with database.");
  process.exit(1);
});

// connection(end)
var userDetail = new mongoose.Schema({
    Phone: { type: String, required: true },
    Location: { type: String, required: true },
    Date: { type: String, required: true }
  },
  {collection: "covid-bot data"},
  );
var model = new mongoose.model("userInfo", userDetail);

// code to prevent app from sleeping

setInterval(function () {
  http.get("https://covid19project12.herokuapp.com");
}, 1800000);

// end

expressApp.post("/webhook", function (request, response, next) {
    const _agent = new WebhookClient({  request, response  });
  
    function welcome(agent) {
      agent.add(`Good day! you want to book a room`);
    }
  
    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    function start(agent) {
      const telephone = agent.parameters.telephone;
      const city = agent.parameters.location;
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;

      var saveData = new model({
        Phone: telephone,
        Location: city,
        Date: `${dateTime}`
      });
  
     saveData.save((err, mydata) => {
       
      if (!err) {
          console.log("mydata: ", mydata);
        } else {
          console.log(err);
          agent.add(`Error while writing on database`);
        
        }
      });

      agent.add(`Contact Number: ${telephone} ; City: ${city}`);
      agent.add(`We have captured your info. Kindly type "Go" to enter the FAQ section`);
    }


    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Starting", start);
    intentMap.set("Default Fallback Intent", fallback);
  
    _agent.handleRequest(intentMap);
  });
  expressApp.listen(process.env.PORT || 3000, function () {
    console.log("app is running in 3000");
  });
  