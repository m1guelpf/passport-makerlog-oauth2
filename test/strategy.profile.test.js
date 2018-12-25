/* global describe, it, before, expect */
/* jshint expr: true */

var Strategy = require('../lib').MakerLogOAuth2Strategy;

//Note: Based on https://github.com/jaredhanson/passport-facebook/blob/35662267f19773314eabc3976906403564426b20/test/strategy.profile.test.js
describe('Strategy#userProfile', function() {
    
  describe('fetched from default endpoint', function() {
    var strategy = new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    var makerlogProfileRaw = '{"id":969,"username":"m1guelpf","first_name":"Miguel","last_name":"Piedrafita","status":"working on too many projects","description":"16-year-old developer & teenpreneur","verified":false,"private":false,"avatar":"https://api.getmakerlog.com/media/uploads/avatars/2018/12/06/logo_4wHZgkL.png","streak":10,"streak_end_date":"2018-12-25T19:00:00.031699-05:00","timezone":"America/New_York","week_tda":7,"activity_trend":[0,0,0,0,0,0,2,3,3,5,19,7,26,25,15,6,6,3,0,0,2,41,4,9,17,1,4,16,8,14],"twitter_handle":"m1guelpf","instagram_handle":"","product_hunt_handle":"m1guelpf","github_handle":"m1guelpf","header":"https://api.getmakerlog.com/media/uploads/headers/2018/12/02/background.jpg","is_staff":false,"donor":true,"tester":false,"telegram_handle":"","digest":true,"gold":true,"accent":"#47E0A0"}';

    strategy._oauth2.get = function(url, accessToken, callback) {
      expect(url).to.equal('https://api.getmakerlog.com/me/?format=json');
      expect(accessToken).to.equal('token');
      callback(null, makerlogProfileRaw, undefined);

    };

    var useAuthorizationHeaderforGET_called = false;
    strategy._oauth2.useAuthorizationHeaderforGET = function(use) {
      expect(use).to.be.true;
      useAuthorizationHeaderforGET_called = true;
    };

    var profile;
    
    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });

    it('should use auth header for get', function() {
      expect(useAuthorizationHeaderforGET_called).to.be.true;
    });
    
    it('should parse profile', function() {
      expect(profile.provider).to.equal('makerlog');
      
      expect(profile.id).to.equal('AAA111');
      expect(profile.displayName).to.equal('Homer');
    });
    
    it('should set json property', function() {
      expect(profile._json).to.be.eql(JSON.parse(makerlogProfileRaw));
    });
  });
  
  describe('error caused by invalid token', function() {
    var strategy =  new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{"errors":[{"errorType":"invalid_token","message":"Invalid Token"}],"success":false}';
  
      callback({ statusCode: 401, data: body });
    };
      
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('failed to fetch user profile');
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });

  });
  
  describe('error caused by malformed response', function() {
    var strategy =  new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    };
    
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      //TODO: Library should raise specific error about parsing
      expect(err).to.be.an.instanceOf(SyntaxError);
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  });
  
  describe('internal error', function() {
    var strategy = new Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    };
    
    var err, profile;
    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });
    
    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  });
  
});
