"use strict";

var expect = require("chai").expect;
const mongodb = require("mongodb");
const mongoose = require("mongoose");

module.exports = function (app) {
  // MongoDB database connection string
  const uri =
    "mongodb+srv://" +
    process.env.DB_USER +
    ":" +
    process.env.DB_PASSWORD +
    "@" +
    process.env.CLUSTER +
    "/" +
    process.env.DB +
    "?retryWrites=true&w=majority&appName=" +
    process.env.APP_NAME;

  // Connect to the MongoDB database
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

  // Schema
  const stockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    likes: { type: Number, default: 0 },
    ips: [String],
  });

  // Model
  const Stock = mongoose.model("Stock", stockSchema);

  app.route("/api/stock-prices").get(async function (req, res) {
    let responseObject = {};
    responseObject["stockData"] = {};

    // Variable to determine the number of stocks
    let twoStocks = false;

    // Output response
    const outputResponse = () => {
      return res.json(responseObject);
    };

    // Find/update Stock document
    const findOrUpdateStock = async (stockName, documentUpdate) => {
      try {
        const stockDocument = await Stock.findOneAndUpdate(
          { name: stockName },
          documentUpdate,
          { new: true, upsert: true },
        );
        return stockDocument;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    // Like stock
    const likeStock = async (stockName, nextStep) => {};

    // Get price
    const getPrice = async (stockDocument) => {
      try {
        const fetchModule = await import("node-fetch");
        const fetch = fetchModule.default;

        const requestUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${stockDocument["name"]}`;
        const response = await fetch(requestUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const price = data.chart.result[0].meta.regularMarketPrice;
        stockDocument["price"] = parseFloat(price);

        return parseFloat(price);
      } catch (error) {
        console.error("Error fetching stock price:", error.message);
        return null;
      }
    };

    // Build response for one stock
    const processOneStock = (stockDocument) => {
      responseObject["stockData"]["stock"] = stockDocument["name"];
      responseObject["stockData"]["price"] = stockDocument["price"];
      responseObject["stockData"]["likes"] = stockDocument["likes"];
    };

    let stocks = [];

    // Build response for two stocks
    const processTwoStocks = (stockDocuments) => {};

    // Process inputs
    if (typeof req.query.stock == "string") {
      twoStocks = true;

      // Stock 1
      let stockName = req.query.stock;
      let documentUpdate = {};
      const stockDocument = await findOrUpdateStock(stockName, documentUpdate);
      if (stockDocument) {
        await getPrice(stockDocument);
        processOneStock(stockDocument);
        outputResponse();
      }

      // Stock 2
    }
  });
};
