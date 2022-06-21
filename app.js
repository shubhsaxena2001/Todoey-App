//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

let items = [] ;
app.get("/", function(req, res){
  let today = new Date();
  let day = "";
  var options = { weekday: 'long', month: 'long', day: 'numeric' };
  day = today.toLocaleDateString("en-US", options)
  res.render('list', {kindOfDay: day, listItems: items});
});

app.post("/", (req, res)=>{
  let item = req.body.item;
  items.push(item);
  res.redirect("/");
})

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
