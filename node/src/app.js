require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const { PORT: port } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(routes);
app.listen(port, () => {
  console.log(`Local host started on http://localhost:${port}`)
});

module.exports = app;
