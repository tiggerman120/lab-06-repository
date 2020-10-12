'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());