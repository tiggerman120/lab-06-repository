'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const { response } = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (request, response) => {
  response.send();
});

app.get('/location', handleLocation);
app.get('/weather', weatherConf);

function errorMessage(request, response) {
  response.status(500).send('not found');
}


//creates location data
function Location(geoData) {
  this.search_query = geoData[0].display_name;
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
//handles location data. should also throw error message.
function handleLocation(request, response) {
  try {
    let geoData = require('./data/location.json');
    // let skylineData = request.query.geoData;
    let locationData = new Location(geoData); // "seattle" -> localhost:3000/location?city=seattle
    response.json(locationData);
    // response.send(locationData);
    
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
