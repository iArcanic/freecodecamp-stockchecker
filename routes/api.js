"use strict";

var expect = require("chai").expect;
let mongodb = require("mongodb");
let mongoose = require("mongoose");

module.exports = function (app) {
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

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  app.route("/api/stock-prices").get(function (req, res) {});
};
