/**
 * Created by sirine on 5/21/17.
 */
var express = require('express');
var model = require('../models/model.js');

var router = express.Router();
var type = 'customer'


router.get('/', function (req, res, next) {
  model.getAllForType(type).then(function (data) {
    //res.json(data)
    res.json({
      total: data.hits.total.value,
      results: data.hits.hits.map(hit => {
        return hit["_source"]
      })
    })
  }, function (err) {
    console.log(err);
    res.json({error: err.message})

  })
});

router.get('/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {
    model.getResource(req.params.id, type).then(function (data) {
      res.json(data)
    }, function (err) {
      res.json({error: err})
    })
  }).catch(function (err) {
    res.status(err.status).json({error: err});
  })

});

router.post('/', function (req, res, next) {
  if (!req.body.first_name || req.body.first_name === '') {
    return res.status(400).json({error: "missing field : first_name"});
  }
  if (!req.body.last_name || req.body.last_name === '') {
    return res.status(400).json({error: "missing field : last_name"});
  }
  if (!req.body.email || req.body.email === '') {
    return res.status(400).json({error: "missing field : email"});
  }
  if (!req.body.password || req.body.password === '') {
    return res.status(400).json({error: "missing field : password"});
  }
  if (req.body.password.length < 6) {
    return res.status(400).json({error: "password too short"});
  }
  if (!req.body.phone_number || req.body.phone_number === '') {
    return res.status(400).json({error: "missing field : phone_number"});
  }

  model.search('customer', {email: req.body.email}).then(function (user, err) {
    if (user.length) {
      var uniqueUser = user[0]._source
      if (err) throw err;
      if (uniqueUser && user[0]._score >= 1) {
        return res.status(400).json({error: "email address already used"});
      }
    }
  });

  model.search('customer', {phone_number: req.body.phone_number}).then(function (user, err) {
    if (user.length) {
      var uniqueUser = user[0]._source
      if (err) throw err;
      if (uniqueUser && user[0]._score >= 1) {
        return res.status(400).json({error: "phone_number already used"});
      }
    }
  })

  model.createResource(type, req.body)
    .then(function (data) {
      res.json(data._source)
    }, function (error) {
      res.json({error: error});
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
      })
  }).catch(function (err) {
    res.status(err.status).json({error: err});
  });

})

router.delete('/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {
    model.deleteResource(type, req.params.id)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({error: error.message});
      });
  }).catch(function (err) {
    res.status(err.status).json({error: err});
  });
})

router.post('/search', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.search(type, req.body).then(function (data) {
      res.json(data.hits.hits)
    }, function (error) {
      res.json({error: error.message});
    })
  }).catch(function (err) {
    res.status(err.status).json({error: err});
  });
})


module.exports = router;
