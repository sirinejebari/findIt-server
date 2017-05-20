var express = require('express');
var router = express.Router();
var type = 'ad'
var index = 'sirinecorp';

var ElasticClient = require('../models/elasticClient.js');


router.get('/', function (req, res, next) {
  ElasticClient.search({
    index: index,
    type: type,
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

router.get('/:id', function (req, res, next) {
  getResource(req.params.id).then(function (data) {
    res.json(data)
  }, function (err) {
    res.json({error: err})
  })
});

router.post('/', function (req, res, next) {
  ElasticClient.count({
    index: index,
    type: type
  }).then(function (data) {

    var lastid = data.count + 1
    ElasticClient.create({
      index: index,
      type: type,
      id: lastid,
      body: req.body
    })
      .then(function (body) {
        setTimeout(function () {
          getResource(lastid).then(function (data) {
            res.json(data._source)
          }, function (err) {
            res.json({error: err})
          })
        }, function (error) {
          res.json({error: error.message});
        });
      }, 5000);

  })
});

function getResource(id) {
  return new Promise(function (resolve, reject) {
    ElasticClient.get({
      index: index,
      type: type,
      id: id
    }, function (error, response) {
      if (error) {
        reject(error)
      }
      if (response) {
        resolve(response)
      }
    });
  })

}

module.exports = router;
