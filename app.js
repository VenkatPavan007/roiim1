const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const routes = require('./routes/paymentRoutes');

const MONGODB_URI =  'mongodb://venkat:mlabs123@ds123346.mlab.com:23346/heroku_dxlf3wwd';

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
var PORT = process.env.PORT || 5000;
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(routes);

mongoose
  .connect(MONGODB_URI || process.env.MONGOLAB_AQUA_URI )
  .then(result => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });