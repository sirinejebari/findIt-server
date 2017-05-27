var express = require('express');
var model = require('../models/model.js');

var router = express.Router();
var type = 'ad'
var index = 'sirinecorp';

router.get('/', function (req, res, next) {
  model.getAllForType(type).then(function (data) {
    res.json(data.hits.hits)
  }, function (err) {
    res.json({error: err.message})

  })
});

router.get('/:id', function (req, res, next) {
  model.getResource(req.params.id, type).then(function (data) {
    res.json(data)
  }, function (err) {
    res.json({error: err})
  })
});

router.post('/', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.createResource(type, req.body)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({error: error.message});
      });
  }).catch(function (err) {
    res.json({error: err});
  });

})
//TODO doesnt work, to figure out later
router.put('/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.editResource(type, req.params.id, req.body)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({error: error.message});
      });
  }).catch(function (err) {
    res.json({error: err});
  });
});

router.delete('/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.deleteResource(type, req.params.id)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({error: error.message});
      });
  }).catch(function (err) {
    res.json({error: err});
  });
})


module.exports = router;
