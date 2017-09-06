const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 9000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const app = express();
const secrets = require("./secrets.js");

app.use(express.static("client"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

secrets.connection;

const db = mongoose.connection;
const Schema = mongoose.Schema;

db.on("error", console.error.bind(console, "connection error:"));

let currentUser;

app.post("/newUser", function(req, res) {
  console.log(req.body);
  let body = req.body;
  let newUser = new User({
    username: body.username,
    password: body.password,
    isAdmin: false
  });
  newUser.save(function(err, newUser) {
    console.log(err);
    if (err) {
      if (err.code === 11000) {
        return res.status(400).send({
          message: "Username is not available."
        });
      } else {
        return res.status(400).send({
          message:
            "Unexpected error, please try again or contact the administrator if problem persists."
        });
      }
    } else {
      return res.status(200).send({ message: "NICE!" });
    }
  });
});

app.post("/login", function(req, res) {
  let body = req.body;
  let un = body.username;
  let pw = body.password;
  let admin = body.isAdmin;
  User.find({ username: un }, function(err, user) {
    if (err) console.error(err);
    if (user.length === 0) {
      return res.status(400).send({
        message: "Incorrect username or password, please try again."
      });
    } else {
      bcrypt.compare(pw, user[0].password, function(err, response) {
        if (err) {
          console.error(err);
          res.status(400).send({
            message:
              "Unexpected error, if problem persists please contact the administrator."
          });
        }
        if (response) {
          res.send(true);
          currentUser = { username: un, isAdmin: admin };
        } else {
          res.send(false);
        }
      });
    }
  });
});

app.get("/logout", function(req, res) {
  currentUser = null;
  res.send(true);
});

app.get("/currentUser", function(req, res) {
  if (currentUser) {
    res.send(currentUser);
  } else {
    res.send(false);
  }
});

//Posts

const postSchema = new Schema({
  user: String,
  line: String,
  store: String,
  date: Date,
  time: Array,
  month: Number,
  comments: String
});

var Post = mongoose.model("Post", postSchema);

// app.get("/", function(req, res) {});

app.get("/demos", function(req, res) {
  const today = new Date();
  const month = today.getMonth();
  Post.find({}, function(err, posts) {
    if (err) {
      console.log(err);
    }
    res.json(posts);
    console.log(posts);
  });
});

app.post("/newDemo", function(req, res) {
  let demo = req.body;
  let newDemo = new Post({
    user: demo.user,
    line: demo.line,
    store: demo.store,
    date: demo.date,
    time: demo.time,
    month: demo.month,
    comments: demo.comments
  });
  newDemo.save(function(err, newDemo) {
    if (err) return console.error(err);
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
