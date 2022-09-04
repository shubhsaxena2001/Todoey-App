//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-shubh:Test123@cluster0.vqikw9n.mongodb.net/todoeyDB"
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "Hit the checkbox to delete an item",
});

const item4 = new Item({
  name: "Or just add '/ListName' (eg. '/Work', '/Home', etc.) in the URL to create a new list",
});

const defaultItems = [item1, item2, item3, item4];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

let today = new Date();
let day = "";
var options = { weekday: "long", month: "long", day: "numeric" };
day = today.toLocaleDateString("en-US", options);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log("Successfully saved default items to DB.");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, listItems: foundItems });
    }
    // if(err) console.log(err);
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.item;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // item.save();
  // res.redirect("/");
});

// app.post("/delete", (req, res) => {
//   const checkedItemId = req.body.checkbox;

//   Item.findByIdAndRemove(checkedItemId, (err) => {
//     if (err) console.log(err);
//   });
//   res.redirect("/");
// });

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  // const customListName = req.params.customListName;
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing list
        res.render("list", {
          listTitle: foundList.name,
          listItems: foundList.items,
        });
      }
    }
  });
});

// app.get("/work", (req, res)=>{
//   res.render("list", {listTitle: "Work List", listItems: items})
// })

// app.post("/work", (req, res)=>{
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// })

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
