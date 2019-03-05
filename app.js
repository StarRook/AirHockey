require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

const bodyParser = require('body-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// MySQL Connection so we can run queries!
const connection = require('./db/connection');

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
  console.log(req.cookies);
  res.render('index', {
    page: req.url,
  });
});

app.get('/airhockey', function(req, res) {
  res.render('airhockey', {
    page: req.url,
  });
});

app.post('/register', function(req, res) {
    if (!req.body.username || !req.body.password) {
      return res.status(401).send('Missing required fields');
    }

    bcrypt.hash(req.body.password, 10, (err, hash) => {
      connection.query(`INSERT INTO users (username, password) VALUES ('${req.body.username}', '${hash}')`, (err, result) => {
        if (!err) {
          return res.status(200).send('Account created successfully');
        } else {
          return res.status(401).send('MySQL Error' + err);
        }
      });
    });
});

app.post('/login', function(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(403).send('Missing required fields');
  }

  connection.query(`SELECT * FROM users WHERE username = '${req.body.username}'`, (err, result) => {
    console.log(result);
    if (err) {
      return res.status(403).send('No user with this username');
    }
    if (result.length > 0) {

      bcrypt.compare(req.body.password, result[0].password, (hashErr, hashResult) => {
        if (hashErr) {
          return res.status(403).send('Error white signing in.');
        }
        if (hashResult) {
          const payload = {
            id: result[0].id,
            username: result[0].username,
            expiresIn: '12h'
          };

          jwt.sign(payload, process.env.JWT_SECRET, {algorithm: 'HS256'}, (jwtErr, token) => {
            if (jwtErr) {
              console.log(jwtErr);
              return res.status(403).send('Error while signing in...');
            }
            res.cookie('token', token, {secure: false, httpOnly: true});
            res.status(200).send({username: result[0].username});
          });
        } else {
          res.status(403).send('Wrong password');
        }
      });

    } else {
      res.status(403).send('No user with this username');
    }
  })

});

const verifyToken = (req, res, next) => {
  const cookie = req.cookies.token;
  if (typeof cookie !== "undefined") {
    req.token = cookie;
    next();
  } else {
    res.sendStatus(403);
  }
};

app.post('/logout', verifyToken, (req, res) => {
  try {
    jwt.verify(req.token, process.env.JWT_SECRET);
    res.clearCookie('token');
    res.status(200).send('OK!');
  } catch (e) {
    console.log(e);
    res.status(403).send(e);
  }
});

app.get('/protected', verifyToken, (req, res) => {
  try {
    jwt.verify(req.token, process.env.JWT_SECRET);
    res.status(200).send('OK!');
  } catch (err) {
    console.log(err);
    res.status(403).send('Bad!');
  }
});

// Aseta server kuuntelemaan porttia 3000.
http.listen(process.env.PORT || port, () => {
  console.log('listening on *:3000');
});