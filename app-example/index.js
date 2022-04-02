const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("mastersdb").collection("masters");
    app.listen(3000, function(){
        console.log("Сервер очікує підключення...");
    });
});
 
app.get("/api/masters", function(req, res){  
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, masters){
         
        if(err) return console.log(err);
        res.send(masters)
    });
     
});

app.get("/api/masters/:id", function(req, res){   
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, user){
               
        if(err) return console.log(err);
        res.send(user);
    });
});
   
app.post("/api/masters", jsonParser, function (req, res) {
    if(!req.body) return res.sendStatus(400);
       
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const age = req.body.age;
    const phone = req.body.phone;

    const user = {firstname: firstName, lastname: lastName, age: age, phone: phone};
       
    const collection = req.app.locals.collection;
    collection.insertOne(user, function(err, result){
               
        if(err) return console.log(err);
        res.send(user);
    });
});
    
app.delete("/api/masters/:id", function(req, res){   
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let user = result.value;
        res.send(user);
    });
});
   
app.put("/api/masters", jsonParser, function(req, res){  
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);

    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const age = req.body.age;
    const phone = req.body.phone;
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {phone: phone, age: age, lastname: lastName, firstname: firstName}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const user = result.value;
        res.send(user);
    });
});

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});