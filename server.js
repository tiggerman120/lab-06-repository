'use strict'; //necessary for strict mode
//pulling in express packages
require('dotenv').config(); //requires the dotenv hidden file
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

//application constants
const app = express();
const PORT = process.env.PORT || 3000; //opens a port OR port 3000

//middleware method that allows open access to our API
app.use(cors());
//simple test route which returns a homepage
app.get('/', (request, response) => {
  response.send();
});
//a route to demonstrate the throwing of an error
// app.get('/', (request, response) => {
//   throw new Error('not authorized to access this route');
// });

//our first "kinda real" API route -> we can use the response object to power our frontends or APIs
// app.get('test/route', (resuest, response) => {

// })

//gets location data from json with use of functions
app.get('/location', handleLocation);

//gets weather data from json with use of functions
app.get('/weather', weatherConf);

//error message for handling invalid user requests
function errorMessage(request, response) {
  response.status(500).send('not found');
}


//creates location data
function Location(geoData, city) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
  // this.locationData = this;
}
//creates weather data
function Weather(obj2) {
  // this.city = obj2.city.name;
  this.forecast = obj2.weather.description;
  this.time = obj2.datetime;//left side is self-made right side is named by the API THAT IS IMPORTANT TO NAME THEM BY API DOCS
  // this.search_query = city;
}
//when you get to the internet no neatly packed info just tons of crap data. using constructor function to format the data so it looks nice when it goes back to the user. not the whole response from the internet.
//handles location data. should also throw error message.
//this is our main lecture component TUESDAY pulling data from an external resource
//vs pulling data from our own(such as a file)
// app.get('/location', (request, response) => {
function handleLocation(request, response) { //this response does not work without a placeholder request
  try {//the function tries everything inside the try
    const city = request.query.city; //querys the city information
    let key = process.env.GEOCODE_API_KEY;//setting keys value for key value pair
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;// finding the city info using the key/value pair
    superagent.get(url)//going to get the city information from url path
      .then(data => { //data already has data in it from previous line
        let geoData = data.body[0];//setting the data to a variable named geoData
        let locationData = new Location(geoData, city); // "seattle" -> localhost:3000/location?city=seattle //creating a new instance of a city
        response.json(locationData);//send info back to the user.

      });
  } catch (error) {//if something goes wrong this "catches" it.
    console.log('ERROR', error);//tells me the error
    response.status(500).send('So sorry');//this sends an error message back to the user
  }
}

//handles weather data. should also throw error message
function weatherConf(request, response) {
  try {
    // let weatherArr = [];
    console.log(request.query);
    let lat = request.query.latitude;//taking the latitude from the (codefellows) front end NOT the API
    let lon = request.query.longitude;//taking the longtitude from the (codefellows) front end NOT the API
    // let city = request.query.search_query;//querys the city information
    let key = process.env.WEATHER_API_KEY;//THIS GETS THE WEATHER API KEY
    const weatherAPI = `https://api.weatherbit.io/v2.0/forecast/daily?key=${key}&lat=${lat}&lon=${lon}`//setting up the api request url to do next line
    // the cities info using the key value pair

    superagent.get(weatherAPI)//query the weather API
      .then(data => {//this is a callback with the weather data from previous line
        console.log(data.body.data);
        console.log(weatherAPI);
        let weatherArr = data.body.data.map(weather => {//this is the start of a map method loop that is used to turn raw weatherdata
          return new Weather(weather);//this creates a new instance of the city queryd by user
          //weatherArr.push(skyData);//pushes the data into an empty array to store values
        })
        response.json(weatherArr);//this sends weather back to the user
      });
  } catch (error) {//need this if things go bad
    errorMessage();//this sends a message back to the user that things went wrong
  }
}


app.get('*', errorMessage)

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});

// otherwise if an error is handed off, handle it here
