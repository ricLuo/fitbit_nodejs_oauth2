var express = require('express');
var app     = express();
var config  = require( './config.json' );
var fs      = require( 'fs' );
var path = require('path');
var Fitbit  = require( 'fitbit-oauth2' );

var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');

//deal with session and clear cookies becuase fitbit doesn't allow third party login
var session = require("express-session");

app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

//Returns middleware that only parses urlencoded bodies.
// This parser accepts only UTF-8 encoding of the body
app.use(bodyParser.urlencoded({'extended':'true'}));

app.use(bodyParser.json());

//  json or Json Api semanticly on top of Json
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));      //override http header, say XMLHttpRequest





// Simple token persist functions.
//
var tfile = 'fb-token.json';
// var persist = {
//     read: function( filename, cb ) {
//         fs.readFile( filename, { encoding: 'utf8', flag: 'r' }, function( err, data ) {
//             if ( err ) return cb( err );
//             try {
//                 var token = JSON.parse( data );
//                 cb( null, token );
//             } catch( err ) {
//                 cb( err );
//             }
//         });
//     },
//     write: function( filename, token, cb ) {
//         console.log( 'persisting new token:', JSON.stringify( token ) );
//         fs.writeFile( filename, JSON.stringify( token ), cb );
//     }
// };

// Instanciate a fitbit client.  See example config below.
//
var fitbit = new Fitbit( config.fitbit );

app.use(session({ secret: config.fitbit, cookie: { maxAge: 60000 }}));

// In a browser, http://localhost:4000/fitbit to authorize a user for the first time.
//

app.get('/fitbit', function (req, res) {
    console.log(fitbit.authorizeURL() );
    res.redirect( fitbit.authorizeURL() );

});

// Callback service parsing the authorization token and asking for the access token.  This
// endpoint is refered to in config.fitbit.authorization_uri.redirect_uri.  See example
// config below.
//
app.get('/callback', function (req, res, next) {
    var code = req.query.code;
    fitbit.fetchToken( code, function( err, token ) {
        if ( err ) return next( err );

        // req.session.authorized = true;
        // req.session.access_token = token.access_token;
        // req.session.save();

        res.redirect( '/' );
        // persist the token
        // persist.write( tfile, token, function( err ) {
        //     if ( err ) return next( err );
        //     res.redirect( '/fb-profile' );
        // });


    });
});

// Call an API.  fitbit.request() mimics nodejs request() library, automatically
// adding the required oauth2 headers.  The callback is a bit different, called
// with ( err, body, token ).  If token is non-null, this means a refresh has happened
// and you should persist the new token.
//

app.get( '/fb-profile', function( req, res, next ) {
  var token =
    fitbit.request({
        uri: "https://api.fitbit.com/1/user/-/profile.json",
        method: 'GET',
    }, function( err, body, token ) {
        if ( err ) return next( err );
        var profile = JSON.parse( body );
        // if token is not null, a refesh has happened and we need to persist the new token
        if ( token ){
          // res.send( '<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
          // res.json(profile);
            // persist.write( tfile, token, function( err ) {
            //     if ( err ) return next( err );
                    res.send(JSON.stringify( profile, null, 2 ));
            // });
          }
        else
            res.send( JSON.stringify( profile, null, 2 ));
            // res.json(profile);
    });

    app.get("/logout", function(req, res) {
        // req.session.authorized = false;
        // req.session.access_token = null;
        // req.session.save();
        console.log(req.cookies);
        res.clearCookie('user');
        // req.session.destroy();
        console.log('Successfully logged out.');


    //     cookie = req.cookies;
    //     for (var prop in cookie) {
    //         if (!cookie.hasOwnProperty(prop)) {
    //             continue;
    //         }
    //     res.cookie(prop, '', {expires: new Date(0)});
    // }
        res.redirect("/");
    });

    var path = require('path');

    app.get('*', function(req, res){
      // res.sendFile(path.resolve('public/js/index_test.html'));
      res.sendFile(path.join(__dirname+'/./public/index.html'));
      // C:\backup\Desktop\Web_Project\MyWebSite\public\js\index_test.html
    });
});

app.listen(8080);
