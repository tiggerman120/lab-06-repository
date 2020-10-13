'use strict'; //necessary for strict mode

require('dotenv').config(); //requires the dotenv hidden file

const express = require('express');
const cors = require('cors');
// const { response } = require('express');

const app = express();

const PORT = process.env.PORT || 3000; //opens a port OR port 3000

app.use(cors());
//i need to ask what this does
app.get('/', (request, response) => {
  response.send();
});
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
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
//creates weather data
function Weather(obj2, city) {
  // this.city = obj2.city.name;
  this.forecast = obj2.weather.description;
  this.time = obj2.valid_date;
  this.city = city;
}
//when you get to the internet no neatly packed info just tons of crap data. using constructor function to format the data so it looks nice when it goes back to the user. not the whole response from the internet.
//handles location data. should also throw error message.
function handleLocation(request, response) { //this response does not work without a placeholder request
  try {
    let geoData = require('./data/location.json');
    const city = request.query.city;
    let locationData = new Location(geoData, city); // "seattle" -> localhost:3000/location?city=seattle
    response.json(locationData);
  } catch(error) {
    errorMessage();
    // response.status(500).send('not found');
  }
}//you'll need to loop through data

//handles weather data. should also throw error message
function weatherConf (request, response) {
  try {
    let weatherArr = [];
    let obj = require('./data/weather.json');
    obj.data.forEach(label => {
      let city = request.query.city;
      let skyData = new Weather(label, city);
      weatherArr.push(skyData);
    });
    response.send(weatherArr);
  } catch(error) {
    errorMessage();
    // response.status(500).send('not found');
  }
}


app.get('*', errorMessage)

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});

// otherwise if an error is handed off, handle it here
