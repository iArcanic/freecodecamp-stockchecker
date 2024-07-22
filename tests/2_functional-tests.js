const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let stock = "GOOG";
  let stock2 = "MSFT";

  test("Viewing one stock", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: stock })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        done();
      });
  });

  test("Viewing one stock and liking it", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: stock, like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        done();
      });
  });

  test("Viewing the same stock and liking it again", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: stock, like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        done();
      });
  });

  test("Viewing two stocks", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: [stock, stock2] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], "stock");
        assert.property(res.body.stockData[0], "price");
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "stock");
        assert.property(res.body.stockData[1], "price");
        assert.property(res.body.stockData[1], "rel_likes");
        done();
      });
  });

  test("Viewing two stocks and liking them", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: [stock, stock2], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], "stock");
        assert.property(res.body.stockData[0], "price");
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "stock");
        assert.property(res.body.stockData[1], "price");
        assert.property(res.body.stockData[1], "rel_likes");
        done();
      });
  });
});
