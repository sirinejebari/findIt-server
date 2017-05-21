/**
 * Created by sirine on 5/21/17.
 */
var express = require('express');
var model = require('../models/model.js');

var router = express.Router();
var type = 'customer'
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, req.app.get('superSecret'), function(decoded, err) {
      if (err) {
        return res.json({ success: false, message: 'Unauthorized' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        console.log(req.decoded)
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
});

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
