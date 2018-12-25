var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MakerLogStrategy = require('./lib').MakerLogOAuth2Strategy;
var passport = require('passport');
var app = express();

app.use(cookieParser());
app.use(bodyParser());

app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session({
  resave: false,
  saveUninitialized: true
}));

const CLIENT_ID = '<YOUR_CLIENT_ID>';
const CLIENT_SECRET = '<YOUR_CLIENT_SECRET>';

app.use(passport.initialize());

var makerlogStrategy = new MakerLogStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  scope: ['tasks'],
  callbackURL: "http://localhost:3000/auth/makerlog/callback"
}, function(accessToken, refreshToken, profile, done) {
  // TODO: save accessToken here for later use

  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });

});

passport.use(makerlogStrategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var makerlogAuthenticate = passport.authenticate('makerlog', {
  successRedirect: '/auth/makerlog/success',
  failureRedirect: '/auth/makerlog/failure'
});

app.get('/auth/makerlog', makerlogAuthenticate);
app.get('/auth/makerlog/callback', makerlogAuthenticate);

app.get('/auth/makerlog/success', function(req, res, next) {
  res.send(req.user);
});

app.listen(3000);
