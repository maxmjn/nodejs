require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
const httpPort = 3000
const httpSport = 8000

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// security
var helmet = require('helmet'); //adds HTTP headers to prevent clickjacking,XSS,...
app.use(helmet()); //must be the first app.use() if not does not work

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));

app.get('/sfdc/oauth2', require('./controllers/api/users.controller'));
app.get('/api/users/sfdc', require('./controllers/api/users.controller'));

// make '/app' default route
app.get('/', appRedirect);

// start server
var server = app.listen(httpPort, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

//HTTPS
// to use HTTPS for this app we need to run app on both HTTP and HTTPs because
// app controllers post request to the app itself example look at login.controllers.js
const spdy = require('spdy')
const path = require('path')
const fs = require('fs')
const options = {
    key: fs.readFileSync(__dirname + '/https_cert/server.key'),
    cert:  fs.readFileSync(__dirname + '/https_cert/server.crt')
}
spdy
  .createServer(options, app)
  .listen(httpSport, (error) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    } else {
      console.log('Listening on port: ' + httpSport + '.')
    }
  });

function appRedirect(req, res) {
    // return res.redirect('/app');
    return res.redirect('https://' + req.header('Host').replace(httpPort, httpSport) + '/app'); //since controller uses POST to make /api/users redirect HTTP to HTTPS
};
