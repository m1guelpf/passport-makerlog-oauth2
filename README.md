# Passport strategy for MakerLog OAuth2

[Passport](http://passportjs.org/) strategies for authenticating with [MakerLog](http://getmakerlog.com/).

This module lets you authenticate using MakerLog in your Node.js [Express](http://expressjs.com/) (or [Connect](http://www.senchalabs.org/connect/)) server applications. 


## Install

    $ npm install passport-makerlog-oauth2

## Usage of OAuth 2.0

#### Configure Strategy

The MakerLog OAuth 2.0 authentication strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```
var MakerLogStrategy = require('passport-makerlog-oauth2').MakerLogOAuth2Strategy;

passport.use(new MakerLogStrategy({
    clientID:     MAKERLOG_CLIENT_ID,
    clientSecret: MAKERLOG_CLIENT_SECRET,
    callbackURL: "http://yourdormain:3000/auth/makerlog/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ makerlogId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'makerlog'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```
app.get('/auth/makerlog',
  passport.authenticate('makerlog', { scope: ['tasks'] }
));

app.get( '/auth/makerlog/callback', passport.authenticate( 'makerlog', { 
        successRedirect: '/auth/makerlog/success',
        failureRedirect: '/auth/makerlog/failure'
}));
```
