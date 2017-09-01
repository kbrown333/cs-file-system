var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');
var root = path.join(__dirname, '..', '..', 'client');

/* GET home page. */
router.get('/:version', function(req, res) {
    var version_path = `lib/${req.params.version}/`;
    var full_path = path.join(root, version_path);
    console.log(`Loading specific app version: ${version_path}`);
    fs.lstat(full_path, function (err, stats) {
        if (err) {
            console.log(`Error loading path "${version_path}", loading default application.`);
            return res.render('index', { src_path: 'src/' });
        }
        else {
            return res.render('index', { src_path: version_path });
        }
    });
});

router.get('/', function (req, res) {
    res.render('index', { src_path: 'src/' });
});

module.exports = router;
