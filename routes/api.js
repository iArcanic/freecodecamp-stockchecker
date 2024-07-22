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
    let twoStocks = false;

    // Anonymize IP function
    const anonymizeIP = (ip) => {
      return ip.split(".").slice(0, 3).join(".") + ".0";
    };

    // Find or Update Stock
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

    // Get Price
    const getPrice = async (stockName) => {
      try {
        const fetchModule = await import("node-fetch");
        const fetch = fetchModule.default;

        const requestUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockName}/quote`;
        const response = await fetch(requestUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return parseFloat(data.latestPrice);
      } catch (error) {
        console.error("Error fetching stock price:", error.message);
        return null;
      }
    };

    // Process Stock
    const processStock = async (stockName, like) => {
      let stockDocument = await findOrUpdateStock(stockName, {});
      if (!stockDocument) return null;

      if (like && stockDocument.ips.indexOf(anonymizeIP(req.ip)) === -1) {
        stockDocument.likes++;
        stockDocument.ips.push(anonymizeIP(req.ip));
        await stockDocument.save();
      }

      const price = await getPrice(stockName);
      return {
        stock: stockDocument.name,
        price: price,
        likes: stockDocument.likes,
      };
    };

    // Process Response
    const processResponse = async () => {
      const stock1 = req.query.stock;
      const like = req.query.like === "true";

      if (Array.isArray(stock1)) {
        twoStocks = true;
        const stockData = await Promise.all(
          stock1.map((stock) => processStock(stock, like)),
        );

        responseObject["stockData"] = stockData.map((stock, index) => {
          return {
            stock: stock.stock,
            price: stock.price,
            rel_likes:
              stock.likes -
              (index === 0 ? stockData[1].likes : stockData[0].likes),
          };
        });
      } else {
        responseObject["stockData"] = await processStock(stock1, like);
      }
      res.json(responseObject);
    };

    processResponse();
  });
};
