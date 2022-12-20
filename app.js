const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine','ejs'); //tels our app to use EJS as our view engine
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser : true});

const itemSchema = {
    name : String
};

const listSchema = {
    name : String,
    items : [itemSchema]
};

const List = mongoose.model("List",listSchema);

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name : "Welcome to your todolist"
});

const item2 = new Item({
    name : "Hit the + button to add a new item"
});

const item3 = new Item({
    name : "this is very cool as well ig?"
});

const defaultItems = [item1,item2,item3];



app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Default Items Entered Successfully!");
                }
            });
            res.redirect("/");
        }
        else{
            if (err){
                console.log(err);
            }
            else{
                res.render("list",{kindOfDay:"Today",newListItem:foundItems});
            }
        }
    })
    
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const itemNew = new Item({
        name : itemName
    });

    if(listName === "Today"){
        itemNew.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Item added to db successfully!");
            }
        });
        res.redirect("/");
    }
    else{
        List.findOne({name : listName}, function(err,foundList){
            foundList.items.push(itemNew);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
});

app.post("/delete",function(req,res){
    const id = req.body.checkBox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(id,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Removed note");
            }
        });
        res.redirect('/');
    }
    else{
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : id}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
})

app.get("/:listName",function(req,res){
    console.log(req.params.listName);
    nameList = _.capitalize(req.params.listName);
    List.findOne({name : nameList},function(err,foundList){
        if(foundList){
            //show existing list
            res.render("list",{kindOfDay : foundList.name,newListItem : foundList.items});
        }
        else{
            const list = new List({
                name : nameList,
                items : defaultItems
            });
            list.save();
            res.redirect("/"+nameList);
        }
    });
})

app.get("/about",function(req,res){
    res.render("about");
});

app.listen("3000",function(){
    console.log("Server started on port 3000");
});
