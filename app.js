require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");

///////////// CONNECTION TO mongoDB AND CREATING Schemas AND Models //////////
mongoose.connect("mongodb://localhost:27017/usersDB", {useNewUrlParser: true, useUnifiedTopology: true});

///// USER SCHEMA //////
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

////// ADDING AUTHENTICATION ////// -This step must be done before creating model.
// userSchema.plugin(encrypt, {secret:  process.env.SECRET, encryptedFields: ["password"]});


///// USER MODEL /////
const User = mongoose.model("User", userSchema);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    });
});

app.post("/login", function(req, res){
    const userName = req.body.username;
    const password = md5(req.body.password);

    User.findOne({email: userName}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser && foundUser.password === password){
                res.render("secrets");
            }else{
                res.send("wrong password");
            }
        }
    });
});




const port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("server started on port 3000.");
});
