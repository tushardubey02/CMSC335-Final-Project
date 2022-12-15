// NODE STUFF
const http = require("http");
const path = require("path");
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const portNumber = 5000;
// testing this out
const bodyParser = require('body-parser')
// let jsonParser = bodyParser.json()
app.listen(portNumber);
/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));
/* view/templating engine */
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
console.log(`Web server is running at http://localhost:${portNumber}`);



const data = [];
let findStr;
app.get("/", (request, response) => {
	/* Generating the HTML */
	response.render("index");
});

app.get("/weather", (request, response) => {
	response.render("weather");
});

mongoData = {};

function apiCall(input){
    console.log("Making API call...");
    const fetch = require('node-fetch'); // import the fetch function
    const API_KEY = "66b66d16992dabb9bc78dbc6a3b90a70"; // replace with your own API key
    const city = "London"; // replace with the city you want to get weather data for

    // create the URL for the API request
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
    let ans = 0;
    // make the API request
    fetch(url)
    .then(response => response.json()) // parse the response as JSON
    .then(data => {
        // do something with the weather data here
        console.log(data);
        console.log("Temp in Kelvin: " , data.main.temp);
        console.log("Temp in farenheit: " , (((data.main.temp-273)*1.8)+32));
        ans = (((data.main.temp-273)*1.8)+32);
    })
    .catch(error => {
        // handle any errors here
        console.error(error);
    });
    return ans;
}

app.post("/weather", (request, response) => {

  let {city} =  request.body;
    // get temp from weather api
  let temperature = apiCall();
  console.log("In post the api recieves: ", temperature);
  mongoData = {city, temperature};

  // send to mongoDB
  main();
  const variables = {
    city: city,
    temp: temperature
  };
    response.render("weatherConfirmation", variables);
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

async function clear(){
  const uri = `mongodb+srv://${username}:${password}@cluster0.0fv6i1d.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  
  try {
      await client.connect();
      // Clear
      await client.connect();
      // console.log("***** Clearing Collection *****");
      const result = await client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .deleteMany({});
      // console.log(`Deleted documents ${result.deletedCount}`);
      return result.deletedCount;

  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}

async function find(min){
  const uri = `mongodb+srv://${username}:${password}@cluster0.0fv6i1d.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try {
    await client.connect();
            // console.log("***** Looking up one movie *****");
            // let movieName = "Batman";
            // await lookUpOneEntry(client, databaseAndCollection, movieName);

            console.log("***** Looking up many *****");
            await lookUpMany(client, databaseAndCollection, min.gpa);
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }

}

async function lookUpMany(client, databaseAndCollection, min) {
  // console.log(min);
  let filter = {gpa : { $gte: min}};
  const cursor = client.db(databaseAndCollection.db)
  .collection(databaseAndCollection.collection)
  .find(filter);

  // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
  // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
  const result = await cursor.toArray();
  console.log(result);
  return result;
}

//driver
// mongoRetrieved = getData();
// mostRecentInput = mongoRetrieved[mongoRetrieved.length-1];
// console.log(mongoRetrieved);
// main().catch(console.error);

async function findEmail(emailIn) {
  const uri = `mongodb+srv://${username}:${password}@cluster0.0fv6i1d.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  let ans;
  try {
      await client.connect();
              console.log("***** Looking up one movie *****");
              let email = emailIn;
              ans = await lookUpOneEntry(client, databaseAndCollection, email);
              console.log(ans);

  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
   return ans;
}

async function lookUpOneEntry(client, databaseAndCollection, emailIn) {
  let filter = {email: emailIn};
  const result = await client.db(databaseAndCollection.db)
                      .collection(databaseAndCollection.collection)
                      .findOne(filter);

 if (result) {
     console.log(result);
     return result;
 } else {
     console.log(`No movie found with name ${email}`);
 }
}