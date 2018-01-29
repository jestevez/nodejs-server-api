'use strict';

const config = require('./config');
const index = require('../app/controllers/index');

module.exports = function (app, router) {

    var apiPrefix = config.apiPrefix;

    // Version
    router.route('/version').get(index.version);

    
    // Home
    router.get('/', function(req, res) {
        res.json({ message: 'No hay nada!' });
    });

    // Dummy
    router.get('/test', function (req, res) {
        var data = {
            name: 'Jose Luis Estevez',
            website: 'http://joseluisestevez.com'
        };
        res.json(data);
    });


    router.post('/post', function (req, res) {

        if (req.body.Id && req.body.Title && req.body.Director &&
                req.body.Year && req.body.Rating) {

            res.status(200).json({Id: req.body.Id})
            
        } else {
            res.status(500).json({error: 'There was an error!'});
        }

    });
    
    // Register all our routes
    app.use(apiPrefix, router);
};


