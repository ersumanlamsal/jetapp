require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

/** import connection file */
const connect = require('./database/conn.js');

const { PORT: port } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(routes);

/** start server only when we have valid connection to database */
connect().then(() => {
  try {
      app.listen(port, () => {
          console.log(`Server connected to http://localhost:${port}`)
      })
  } catch (error) {
      console.log("Cannot connect to the server");
  }
}).catch(error => {
  console.log("Invalid Database Connection");
})

module.exports = app;
