var express = require('express');
var router = express.Router();

var ElasticClient= require('../models/elasticClient.js');


router.get('/', function(req, res, next) {
  ElasticClient.search({
    index: 'sirinecorp',
    type: 'ad',
    body: {
      "query": {
        "match_all": {}
      }
    }
  }).then(function (body) {
    var hits = body.hits.hits;
    res.json(hits);
  }, function (error) {
    console.trace(error.message);
  });
});



module.exports = router;
