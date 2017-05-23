const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const should = chai.should();

chai.use(chaiHttp);

describe("Recipes", function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });
  it("should list items on GET", function() {
    return chai.request(app).get("/Recipes").then(function(res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a("array");

      res.body.length.should.be.at.least(1);

      const expectedKeys = ["id", "name", "ingredients"];

      for (let i = 0; i < res.body.length; i++) {
        const item = res.body[i];
        item.should.be.a("object");
        item.should.include.keys(expectedKeys);
      }
    });
  });

  it("should add an item on POST", function() {
    const newItem = {
      name: "apple pie",
      ingredients: ["milk", "apples", "sugar"]
    };
    return chai.request(app).post("/Recipes").send(newItem).then(function(res) {
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a("object");
      res.body.should.include.keys("id", "name", "ingredients");
      res.body.id.should.not.be.null;
      res.body.should.deep.equal(Object.assign(newItem, { id: res.body.id }));
    });
  });

  it("should update items on PUT", function() {
    const updateData = {
      name: "chocolate milk",
      ingredients: ["milk", "chocolate", "ice cream"]
    };
    return chai
      .request(app)
      .get("/Recipes")
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai
          .request(app)
          .put(`/Recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.deep.equal(updateData);
      });
  });

  it("should delete items on DELETE", function() {
    return chai
      .request(app)
      .get("/Recipes")
      .then(function(res) {
        return chai.request(app).delete(`/Recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
