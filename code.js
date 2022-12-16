// NODE STUFF
const http = require("http");
const path = require("path");
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const portNumber = 5000;
// testing this out
const bodyParser = require('body-parser')
const fetch = require('node-fetch'); // import the fetch function
// let jsonParser = bodyParser.json()
app.listen(portNumber);
/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));
/* view/templating engine */
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
console.log(`Web server is running at http://localhost:${portNumber}`);



// let temperature = 0;
app.get("/", (request, response) => {
	/* Generating the HTML */
	response.render("index");
});

app.get("/weather", (request, response) => {
	response.render("weather");
});

app.post("/weather", (request, response) => {
    let {city} =  request.body;
    const API_KEY = "66b66d16992dabb9bc78dbc6a3b90a70";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
    fetch(url)
    .then(response => response.json()) // parse the response as JSON
    .then(data => {
        //print
        console.log(data);
        let temperature = Math.round((((data.main.temp-273.15)*1.8)+32));
        const variables = {
            city: city,
            temp: temperature
        };
        response.render("weatherConfirmation", variables);
        // send to mongoDB
        mongoData = {city, temperature};
        main();
    })
    .catch(error => {
        // handle any errors here
        console.error(error);
    });
});

// MONGODB
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') });

const username = encodeURIComponent("tushardubey");
const password = encodeURIComponent("cmsc335fall2022");
/* Our database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');



// clear();
async function main() {
    console.log(mongoData);
    // let temperature = apiCall();
    // alert("ENTERED MAIN FUNCTION");
    const uri = `mongodb+srv://${username}:${password}@cluster0.0fv6i1d.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    
    try {
        await client.connect();
        /* Inserting one person */
        // console.log("***** Inserting one person *****");
        // let person = {city: mongoData.city, temp:temperature};
        // await insertPerson(client, databaseAndCollection, person);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    // list all people
    try {
      await client.connect();
      let filter = {};
      const cursor = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);
      
      const result = await cursor.toArray();
      // console.log(`Found: ${result.length} people`);
      // console.log(result);
      // document.writeln(result);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

}

async function insertPerson(client, databaseAndCollection, newPerson) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newPerson);

    console.log(`Person entry created with id ${result.insertedId}`);
}

async function insertMultiplePeople(client, databaseAndCollection, moviesArray) {
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .insertMany(moviesArray);

    console.log(`Inserted ${result.insertedCount} movies`);
}

async function getData(){
  const uri = `mongodb+srv://${username}:${password}@cluster0.0fv6i1d.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try {
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);
    
    const result = await cursor.toArray();
    console.log(`Found: ${result.length} people`);
    console.log(result);
    return result;
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}