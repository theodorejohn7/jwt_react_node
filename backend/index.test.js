const { response } = require("./index");

let chaiHttp = require("chai-http");
let chai = require("chai");
const should = chai.should();
chai.use(chaiHttp);

describe("Login Page Tests", () => {
  it("able to sign in and receive access token, refresh token", (done) => {
    let data = {
      username: "theo",
      password: "123123",
    };
    chai
      .request("http://localhost:5000/api")
      .post("/login")
      .send(data)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.username.should.be.a("string");
        res.body.accessToken.should.be.a("string");
        res.body.isAdmin.should.be.a("boolean");
      });
    done();
  });

  it("able to report wrong credentials", (done) => {
    let data = {
      username: "test",
      password: "test",
    };
    chai
      .request("http://localhost:5000/api")
      .post("/login")
      .send(data)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("string");
      });
    done();
  });

  it("able to receive new  access token based on refresh token", (done) => {
    let data = {
      username: "theo",
      password: "123123",
    };

    let refreshToken = {
      token: "",
    };
    chai
      .request("http://localhost:5000/api")
      .post("/login")
      .send(data)
      .end((err, res) => {
        refreshToken.token = res.body.refreshToken;
        chai
          .request("http://localhost:5000/api")
          .post("/refresh")
          .send(refreshToken)
          .end((err, res) => {
            res.body.should.be.a("object");
            res.should.have.status(200);
            res.body.accessToken.should.be.a("string");
          });
        // res.body.accessToken.should.be.a("string");
      });
    done();
  });

  it("able to delete", (done) => {
    let data = {
      username: "john",
      password: "123123",
    };

    let refreshToken = {
      token: "",
    };

    let accessToken = "Bearer ";

    chai
      .request("http://localhost:5000/api")
      .post("/login")
      .send(data)
      .end((err, res) => {
        accessToken += res.body.accessToken;
        chai
          .request("http://localhost:5000/api/users")
          .delete("/1")
          .set("authorization", accessToken)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.equal("User has been deleted.");
            // res.body.accessToken.should.be.a("string");
          });
        // res.body.accessToken.should.be.a("string");
      });
    done();
  });
});
