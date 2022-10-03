const express = require("express");
const path = require("path");
const { v4 } = require("uuid");
const app = express();
require("dotenv").config({ path: __dirname + "/.env" });
const AWS = require("aws-sdk");

const convertFormToJson = require("multer")(); // convert form to json

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "payper2";

app.use(express.static(__dirname + "/css"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/templates"));

app.get("/add", (req, res) => {
  return res.render("addPost");
});

app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.log("error", err);
      return res.send("Internall server error");
    }

    return res.render("home", { data: data.Items });
  });
});

app.post("/add", convertFormToJson.fields([]), (req, res) => {
  console.log(req.body);
  const { name, author, ISMB, pages, year } = req.body;

  const params = {
    TableName: tableName,
    Item: {
      id: v4(),
      name,
      author,
      ISMB,
      pages,
      year,
    },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log("put err:", err);
      return res.send("Internall server error");
    } else {
      return res.redirect("/");
    }
  });
});

app.post("/delete", convertFormToJson.fields([]), (req, res) => {
  const params = {
    TableName: tableName,
    Key: {
      id: req.body.id,
    },
  };

  docClient.delete(params, (err, data) => {
    if (err) {
      console.log("delete err:", err);
      return res.send("internal server error");
    }

    return res.redirect("/");
  });
});

app.post("/update", convertFormToJson.fields([]), (req, res) => {});

app.listen(3000, () => {
  console.log("Server is running");
});
