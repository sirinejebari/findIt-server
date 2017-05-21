/**
 * Created by sirine on 5/21/17.
 */
var express = require('express');
var model = require('../models/model.js');

var router = express.Router();
var type = 'customer'
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
  model.createResource(type, req.body)
    .then(function (data) {
      res.json(data._source)
    }, function (error) {
      res.json({error: error.message});
    });

})
//TODO doesnt work, to figure out later
router.put('/:id', function (req, res, next) {
  model.editResource(type, req.params.id, req.body)
    .then(function (data) {
      res.json(data._source)
    }, function (error) {
      res.json({error: error.message});
    });

})

router.delete('/:id', function (req, res, next) {
  model.deleteResource(type, req.params.id)
    .then(function (data) {
      res.json(data._source)
    }, function (error) {
      res.json({error: error.message});
    });

})

router.post('/search', function (req, res, next) {
  model.search(type, req.body).then(function (data) {
    res.json(data.hits.hits)
  }, function (error) {
    res.json({error: error.message});
  })
})


module.exports = router;
