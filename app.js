require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "My little secret of cosmos",
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



///////////// CONNECTION TO mongoDB AND CREATING Schemas AND Models //////////
mongoose.connect("mongodb://localhost:27017/usersDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

///// USER SCHEMA //////
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// ADDING PASSPORT PLUGIN // 
userSchema.plugin(passportLocalMongoose);

////// ADDING AUTHENTICATION ////// -This step must be done before creating model.
// userSchema.plugin(encrypt, {secret:  process.env.SECRET, encryptedFields: ["password"]});


///// USER MODEL /////
const User = mongoose.model("User", userSchema);

/// SETTING UP PASSPORT FOR USER MODEL ///
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets"); 
            });
        }
    });


});

app.post("/login", function(req, res){
    
    const user = new User({
        username: req.body.username, 
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });


});




const port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("server started on port 3000.");
});
