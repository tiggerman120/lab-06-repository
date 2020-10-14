'use strict';

//3rd party dependancies
require('dotenv').config();

const express = require('express');
const app = express();
const pg = require('pg');

//application constants
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);
//windows user
//put UN and PW in connection string

//localhost:3000/add?first=Garrett&last=Cintron
app.get('/add', (req, res) => {
  let firstName = req.query.first;
  let lastName = req.query.last;
  //POSTGRES IS CASE SENSITIVE AND ALL LOWERCASE it is standard to capitalize to differentiate between commands and varaiables but make variables lowercase
  //INSERT INTO people -> lets add something to the people table
  //(first_name, last_name) VALUES ($1, $2) -> lets update with real values
  //those values are going to be inserted into our actual query later (client.query)
  let SQL = 'INSERT INTO people (first_name, last_name) VALUES ($1, $2) RETURNING *;';
  let name = [firstName, lastName];

  client.query
});

//connect to our database
client.connect()
  .then(() => {
    //start the database if the server connection worked
    app.listen(PORT, () => {
      console.log(`server up on ${PORT}`);
    })
      .catch(err => {
        console.error('connection error:')
      })
  });
//this route will retrieve a list of all items from our people table
app.get('/people', (req, res) => {
  //simple query to get everything from the people table
  let SQL = 'SELECT * FROM people';
//here we query the DB to get those people
  client.query(SQL)
    .then(results => {
      //if it worked we've got an array of all the people
      res.status(200).json(results);
    })//if it didnt work
    .catch( err => {
      console.error('db error:', err);
    })
});
//env file
//PORT=3333
//DATABASE_URL=postgres://localhost:5432/sql-sample
//WINDOWS_DB_URL=postgres://<username>:<password>@localhost:5432/db-name
//postgres username and password
//env file above


//this will be used to cache our data while our server is running
//we need to pipe this data into
const locations = {};
//locations: {city}
locations[city] = locationconstructor;

{
  'seattle': {
    search_query = seattle;
    formatted_query = seattle, WA, USA,
    latitude
    longitude

  }
}