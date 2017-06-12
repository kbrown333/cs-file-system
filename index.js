console.log('Initializing File System');
process.title = "cs-file-system";
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');

var app = express();
app.set('env', 'development');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));

//CREATE STATIC PATH FOR CLIENT FILES
app.set('views', path.join(__dirname, 'client/src'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html')
app.use(express.static(path.join(__dirname, 'client/src')));
app.use('/media', express.static(path.join(__dirname, 'dev')));

//INITIALIZE JSON-DABATABSE
require('./jsdb/data_model').init();

//Load Middleware Functions
var mw_Index = require('./routes/static/index');
var mw_Files = require('./routes/files');

//Route Paths to Middleware
app.use('/', mw_Index);
app.use('/api/files', mw_Files);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('cs-file-system');

//START SERVER
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
console.log('Application available at port: ' + app.get('port'));

//INITIALIZE GLOBAL CACHE
var NodeCache = require( "node-cache" );
global.default_cache = new NodeCache();

//MAP MUSIC TO DATABASE
require('./controllers/song_map').map();
