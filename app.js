require('dotenv').config();
const express = require('express');
const app = express();

const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

const strategy = new JwtStrategy(opts, (payload, next) => {
  // TODO: GET USER FROM DB
  const user = null;
  next(null, user);
});

passport.use(strategy);
app.use(passport.initialize());

const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
require('./server/server')(io);
const port = 3000;

// View Engine Setup for EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Kun client pyytää get metodilla "/" urlia lähetä sille index.html
app.get('/', function(req, res){
  res.render('index');
});

app.get('/airhockey', function(req, res) {
  res.render('airhockey', {
    page: req.url,
  });
});

app.post('/register', function(req, res) {

});

app.post('/login', function(req, res) {

});

app.get('/protected', passport.authenticate('jwt', {session: false}), function(req, res) {
  res.send('im protected');
});

// Aseta server kuuntelemaan porttia 3000.
http.listen(process.env.PORT || port, function(){
  console.log('listening on *:3000');
});