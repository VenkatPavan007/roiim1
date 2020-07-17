const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const routes = require('./routes/paymentRoutes');

const MONGODB_URI =  'mongodb+srv://venkat:mongodb123@cluster0-co7kp.mongodb.net/roiim';

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
var PORT = process.env.PORT || 3000;
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(routes);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });