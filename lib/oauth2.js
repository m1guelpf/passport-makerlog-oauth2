/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The MakerLog authentication strategy authenticates requests by delegating to
 * MakerLog using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your MakerLog application's client id
 *   - `clientSecret`  your MakerLog application's client secret
 *   - `callbackURL`   URL to which MakerLog will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new MakerLogStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/makerlog/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://api.makerlog.com/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://api.makerlog.com/oauth2/token';
  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'makerlog';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.authenticate = function(req, options) {
  options || (options = {});

  OAuth2Strategy.prototype.authenticate.call(this, req, options);
};

/**
 * Retrieve user profile from MakerLog.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `makerlog`
 *   - `id`
 *   - `username`
 *   - `first_name`
 *   - `last_name`
 *   - `status`
 *   - `description`
 *   - `verified`
 *   - `private`
 *   - `avatar`
 *   - `streak`
 *   - `streak_end_date`
 *   - `timezone`
 *   - `week_tda`
 *   - `twitter_handle`
 *   - `instagram_handle`
 *   - `product_hunt_handle`
 *   - `github_handle`
 *   - `header`
 *   - `is_staff`
 *   - `donor`
 *   - `tester`
 *   - `telegram_handle`
 *   - `digest`
 *   - `gold`
 *   - `accent`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.get('https://api.getmakerlog.com/me/?format=json', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'makerlog' };
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
};

/**
 * Return extra parameters to be included in the request token
 * request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function(options) {
  var params = options || {};

  var scope = options.scope;
  if (scope) {
    params['scope'] = Array.isArray(scope) ? scope.join(' ') : scope;
  }
  return params;
}

/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/**
 * Export constructors.
 */
exports.Strategy = Strategy;
