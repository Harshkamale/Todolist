//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _  =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-harsh:Test123@cluster0.7ysed.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema = {
  name:String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name :" welcome to do lit! "
});
const item2 = new Item({
  name :"Press ++ to add items "
});
const item3 = new Item({
  name :"Press -- to delete item "
});
const defaultItems = [item1,item2,item3];

const ListSchema = {
  name : String,
  items : [itemsSchema]
};
const List = mongoose.model("List", ListSchema);


app.get("/", function(req, res) {

Item.find({},function(err, foundItems){
  if (foundItems.length === 0) {
    Item.insertMany(defaultItems,function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("successfully inserted");
      }

    });
      res.redirect("/");
  } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const ListName = req.body.list;

  const item = new Item({
    name :  itemName
  });

  if (ListName === "Today"){
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:ListName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ListName );
    })
  }

});
app.post("/delete",function(req,res){
  const checkedItemId =req.body.checkbox;
  const listName = req.body.listName;
  if (listName==="Today") {
    tem.findByIdAndRemove(checkedItemId,function(err){
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id : checkedItemId}}},function(err,foundList){
      if (!err) {
        res.redirect("/"+listName);
      }
    });
  }





});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
       if (!foundList) {
         const list = new List({
           name : customListName,
           items : defaultItems,
         });
         list.save();
         res.redirect("/" + customListName);
       } else {
         res.render("list",{listTitle:customListName, newListItems: foundList.items});
       }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
