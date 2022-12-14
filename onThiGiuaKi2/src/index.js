const express = require("express");
const convertFormToJson = require("multer")();
const path = require("path");
const { v4 } = require("uuid");
require("dotenv").config({
  path: __dirname + "/.env",
});
const AWS = require("aws-sdk");
const app = express();

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TableName = "paper2";

app.use(express.static(__dirname + "/css"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/templates");

app.get("/new", (req, res) => {
  return res.render("newPost");
});

app.post("/new", convertFormToJson.fields([]), (req, res) => {
  const obj = req.body;
  console.log(req.body);

  const params = {
    TableName,
    Item: {
      id: v4(),
      ...obj,
    },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      return res.send("internal server error");
    } else {
      return res.redirect("/");
    }
  });
});

app.get("/", (req, res) => {
  const params = {
    TableName,
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.log(err);
      return res.send("internal server error");
    }

    return res.render("home", { data: data.Items ? data.Items : [] });
  });
});

app.listen(3000, () => {
  console.log("server is running!");
});
