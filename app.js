import express from 'express';
//import db from './db/db';

// Set up the express app
const app = express();
const PORT = 3001;

app.use(express.json())

const {MongoClient} = require('mongodb');
const crypto = require("crypto");
const redis = require("redis");
var cors = require('cors')

app.use(cors());

// get all todos
app.post('/user/login', (req, res) => {
    if ( ! ( Object.keys(req.body).includes("mail") &
             Object.keys(req.body).includes("password"))) {
        res.status(501).send({
            message: 'You are missing some field.',
        })    
    }
    else{
        getRegister(req.body.mail).catch(console.error).then(data => {
            if (data === null) {
                res.status(501).send({
                    message: 'User not found.',
                })      
            }
            else {
                if (data.mail === req.body.mail & data.password === req.body.password) {
                    
                    const client = redis.createClient();

                    client.on("error", function(error) {
                      console.error(error);
                    });

                    client.hmset(data.mail, {username:data.name+ " " + data.lastName, _id:JSON.stringify(data._id)});
                    client.expire(data.mail, 20);
                    res.status(200).send({
                        message: 'Data retrieved successfully',
                    })
                }
                else {
                    res.status(200).send({
                        message: 'User and password are wrong.',
                    })
                }
                
            }
            
        });   
    }
});

app.post('/user/session', (req, res) => {
    if ( !Object.keys(req.body).includes("mail")){
        res.status(501).send({
            message: 'You are missing mail field.',
        })
    } 
    else {

        const client = redis.createClient();
        client.hgetall(req.body.mail, function(err, reply) {
            
            res.status(200).send({
                username: reply.username,
                _id: reply._id.replace(/\"/g, ""),
                message: 'Ok.',
            })    
          });
    }
});

 


app.delete('/user/:_id', (req, res) => {

    deleteRegister(req.params._id).catch(console.error);
    res.status(200).send({
        message: 'Deleted successfully ' + req.params._id,
    })   
});

app.post('/user/signin', (req, res) => {

    if ( ! ( Object.keys(req.body).includes("name") & 
             Object.keys(req.body).includes("lastName") & 
             Object.keys(req.body).includes("mail") &
             Object.keys(req.body).includes("password"))) {
        res.status(501).send({
            message: 'You are missing some field.',
        })    
    }
    else{
        insertNewRegister(req.body).catch(console.error).then(data => {
            res.status(200).send({
                _id: data,
                message: 'Data retrieved successfully',
            })
        });   
    }
  });

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});

const URI = "mongodb://root:example@localhost:27017/?retryWrites=true&w=majority&useUnifiedTopology=true";

async function insertNewRegister(newValue){   
    const client = new MongoClient(URI);
    var result ;

    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        result = await client.db("PersonalInformation").collection("Users").insertOne(newValue);
         
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result.insertedId;
}

async function deleteRegister(newValue){  
    const client = new MongoClient(URI);
    var result ;

    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        var mongo = require('mongodb');
        var o_id= new mongo.ObjectID(newValue);

        await client.db("PersonalInformation").collection("Users").deleteOne({'_id':o_id});
         
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function getRegister(newValue){   
    const client = new MongoClient(URI);
    var result ;

    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        result = await client.db("PersonalInformation").collection("Users").findOne({'mail':newValue});
         
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}
 