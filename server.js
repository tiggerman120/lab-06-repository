'use strict'; //necessary for strict mode
//pulling in express packages
require('dotenv').config(); //requires the dotenv hidden file
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const { response } = require('express');

//application constants
const app = express();
const PORT = process.env.PORT || 3000; //opens a port OR port 3000
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

//middleware method that allows open access to our API
app.use(cors());

//simple test route which returns a homepage
app.get('/', (request, response) => {//probably needs removed eventually
  response.send('hello world');
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
//gets trails data from client
app.get('/trails', trailHandler);
//gets movie data from client
app.get('/movies', superSecretAgent);
//gets yelp data from client
app.get('/yelp', yelpHandler);
//gets error message(things go wrong)
app.get('*', errorMessage)

//error message for handling invalid user requests
function errorMessage(request, response) {

  response.status(500).send('OOPS!');
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
function Weather(obj2) {//obj2 could be named better
  // this.city = obj2.city.name;
  this.forecast = obj2.weather.description;
  this.time = obj2.datetime;//left side is self-made right side is named by the API THAT IS IMPORTANT TO NAME THEM BY API DOCS
  // this.search_query = city;
}

function Trail(getTrailData) {
  this.name = getTrailData.name;
  this.location = getTrailData.location;
  this.length = getTrailData.length;
  this.stars = getTrailData.stars;
  this.star_votes = getTrailData.starVotes;//these are the values needed for the codefellows front end
  this.summary = getTrailData.summary;
  this.url = getTrailData.url;
  this.conditions = getTrailData.conditionStatus;
  this.condition_date = getTrailData.conditionDate.split(' ')[0];
  this.condition_time = getTrailData.conditionDate.split(' ')[1];
}

function Movie(movieHandler) {
  this.title = movieHandler.original_title;
  this.overview = movieHandler.overview;
  this.average_votes = movieHandler.vote_average;
  this.total_votes = movieHandler.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movieHandler.poster_path}`
  // console.log(this.image_url);
  // console.log(movieHandler);
  this.popularity = movieHandler.popularity;
  this.released_on = movieHandler.release_date;
}

function Yelp(yelpHandler) {
  this.name = yelpHandler.name;
  this.image_url = yelpHandler.image_url;
  this.price = yelpHandler.price;
  this.rating = yelpHandler.rating;
  this.url = yelpHandler.url;
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
    let sql = 'SELECT * FROM location WHERE search_query=$1' //select all from location where search_query is the first thing in the array(index 0 sql is dumb)
    let sqlArr = [city];//an array with the city data inside of it
    client.query(sql, sqlArr)//querying the sql client
      .then(sqldata => {
        if (sqldata.rows.length) {//if rows has a length greater than zero the if statement fires
          response.json(sqldata.rows[0]);//sends the table to the user from the database
        } else {
          superagent.get(url)//going to get the city information from url path
            .then(data => { //data already has data in it from previous line
              let geoData = data.body[0];//setting the data to a variable named geoData
              let locationData = new Location(geoData, city); // "seattle" -> localhost:3000/location?city=seattle //creating a new instance of a city
              databaseStorage(locationData)
              response.json(locationData);//send info back to the user.
            })
        }
      })
  } catch (error) {//if something goes wrong this "catches" it.
    console.log('ERROR', error);//tells me the error
    errorMessage();//this sends an error message back to the user
  }
}

//handles weather data. should also throw error message
function weatherConf(request, response) {
  try {
    // let weatherArr = [];
    // console.log(request.query);
    let lat = request.query.latitude;//taking the latitude from the (codefellows) front end NOT the API
    let lon = request.query.longitude;//taking the longtitude from the (codefellows) front end NOT the API
    // let city = request.query.search_query;//querys the city information
    let key = process.env.WEATHER_API_KEY;//THIS GETS THE WEATHER API KEY
    const weatherAPI = `https://api.weatherbit.io/v2.0/forecast/daily?key=${key}&lat=${lat}&lon=${lon}`//setting up the api request url to do next line
    // the cities info using the key value pair

    superagent.get(weatherAPI)//query the weather API
      .then(data => {//this is a callback with the weather data from previous line
        // console.log(data.body.data);//useful information
        // console.log(weatherAPI);//useful information
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

function trailHandler(request, response) {

  try {
    //the client is requesting information
    //this is the information being requested below
    let lat = request.query.latitude;//taking the latitude from the codefellows front end
    let lon = request.query.longitude;//taking the longitude from the codefellows front end
    let key = process.env.TRAIL_API_KEY;//THIS GETS THE WEATHER API
    const trailAPI = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${key}`

    //requesting data from API
    superagent.get(trailAPI)//query the trail API
      .then(trailData => {//trailData is a callback name with the trailAPI data
        // console.log(trailData.body);
        let trailArr = trailData.body.trails.map(trail => {//looping through trailData using the map method to output trail
          // parseFloat(trailArr);
          return new Trail(trail);//returning a instance with the value of trail
        })
        response.json(trailArr);//sending that info back to the user
      })
      .catch((error) => {
        console.log(error)//this is if things go wrong in the get section
        errorMessage()
      });
  } catch (error) {//i need this if things go bad
    errorMessage();//this sends an error message if the catch throws
  }//catch statements could be written better
}

function superSecretAgent(request, response) {
  let movieArr;
  const fetchMovies = request.query.search_query
  const movieAPI = `https://api.themoviedb.org/3/search/movie/?api_key=7c369e0c853afa123b8c37409ff0ec46&query=${fetchMovies}`
  if (!movieAPI) {
    console.log('no movie api');
  } else {
    superagent.get(movieAPI)//getting the movie data from the...
      .then(movieData => {
        // console.log(movieData.body);
        movieArr = movieData.body.results.map(movies => {//mapping over the movieData
          return new Movie(movies);//creating new instances of the movie object
        })
        response.json(movieArr)
        // console.log(movieArr);
        // databaseStorage(movieArr);//sending the info to the database
        // console.log(movieArr);
        return movieArr
      }).catch(error => {
        errorMessage();
      })
    // console.log(movieArr)
    return movieArr;//returning the value of movieArr
  }
}

// function movieHandler(request, response) {
//   const fetchMovies = request.query.search_query;//getting the info

//   console.log(fetchMovies)
//   console.log(superSecretAgent(fetchMovies))
//   let movieArr2 = superSecretAgent(fetchMovies)




//   console.log(movieArr2);
//  ;//sending the info back to the user
// }

function yelpHandler(request, response) {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let key = 'Bearer ' + process.env.YELP_API_KEY;
  const fetchYelp = request.query.search_query;
  // console.log(key);
  const yelpAPI = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}&categories=restaurants`

  // function superYelpAgent
  superagent.get(yelpAPI)
    .set('Authorization', key)
    .then(yelpData => {
      // console.log(yelpData.body);
      let yelpArr = yelpData.body.businesses.map(yelp => {
        return new Yelp(yelp);
      })
      console.log(yelpArr);
      response.json(yelpArr)
      // yelpArr = yelpData.body
    }).catch(error => {
      console.log(error);
    }).catch(error => {
      errorMessage();
    });
}

function databaseStorage(location) {
  let sql = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)'
  let sqlArr = [location.search_query, location.formatted_query, location.latitude, location.longitude];
  client.query(sql, sqlArr);//this asks the sql client for the information

}


app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});

// otherwise if an error is handed off, handle it here
