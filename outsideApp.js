var config = require( './config/app' );
var fs     = require( 'fs' );
var Fitbit = require( 'fitbit-oauth2' );

// Simple token persist code
//
var tfile = 'fb-token.json';
var persist = {
    read: function( filename, cb ) {
        fs.readFile( filename, { encoding: 'utf8', flag: 'r' }, function( err, data ) {
            if ( err ) return cb( err );
            try {
                var token = JSON.parse( data );
                cb( null, token );
            } catch( err ) {
                cb( err );
            }
        });
    },
    write: function( filename, token, cb ) {
        console.log( 'persisting new token:', JSON.stringify( token ) );
        fs.writeFile( filename, JSON.stringify( token ), cb );
    }
};

// Instanciate the client
//
var fitbit = new Fitbit( config.fitbit );

// Read the persisted token, initially captured by a webapp.
//
persist.read( tfile, function( err, token ) {
    if ( err ) {
        console.log( err );
        process.exit(1);
    }

    // Set the client's token
    fitbit.setToken( token );

    // Make an API call
    fitbit.request({
        uri: "https://api.fitbit.com/1/user/-/profile.json",
        method: 'GET',
    }, function( err, body, token ) {
        if ( err ) {
            console.log( err );
            process.exit(1);
        }
        console.log( JSON.stringify( JSON.parse( body ), null, 2 ) );

        // If the token arg is not null, then a refresh has occured and
        // we must persist the new token.
        if ( token )
            persist.write( tfile, token, function( err ) {
            if ( err ) console.log( err );
                process.exit(0);
            });
        else
            process.exit(0);
    });
});
