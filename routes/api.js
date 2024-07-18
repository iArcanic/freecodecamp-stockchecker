"use strict";

var expect = require("chai").expect;
let mongodb = require("mongodb");
let mongoose = require("mongoose");

module.exports = function (app) {

  // MongoDB database connection string
  let uri =
    "mongodb+srv://" +
    process.env.USER +
    ":" +
    process.env.PW +
    "@" +
    process.env.CLUSTER +
    process.env.DB +
    "?retryWrites=true&w=majority&appName=" +
    process.env.APP_NAME;

  // Connect to the MongoDB database
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Schema
  let stockSchema = new mongoose.Schema({
    name: {type: String, required: true},
    likes: {type: Number, default: 0},,
    ips: [String]
  });

  // Model
  let Stock = mongoose.model("Stock", stockSchema);

  app.route("/api/stock-prices").get(function (req, res) {});
};
