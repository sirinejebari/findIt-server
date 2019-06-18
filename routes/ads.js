var express = require('express');
var model = require('../models/model.js');
var adModal = require('../models/adModal.js')
var router = express.Router();
var type = 'ads'

router.get('/find-in-bounds/', function (req, res, next) {
  if (Object.keys(req.query).length) {
    let minLat = req.query.minLat
    let maxLat = req.query.maxLat
    let minLong = req.query.minLong
    let maxLong = req.query.maxLong
    if (minLat && minLong && maxLat && maxLong) {
      adModal.queryAdsInBounds({
        minLat: minLat,
        maxLat: maxLat,
        minLong: minLong,
        maxLong: maxLong
      }).then((data) => {
        res.json({
          data: data.hits.hits,
          total: data.hits.total
        })
      }, (error) => {
        console.log(error);
        res.status(500).json({ erreur: error })
      })
    } else {
      res.status(400).json({ error: 'incomplete bounds' })
    }
  } else {
    res.status(400).json({ error: 'missing bounds parameters' });
  }
});


router.get('/', function (req, res, next) {
  model.getAllForType(type).then(function (data) {
    res.json({
      total: data.hits.total.value,
      results: data.hits.hits.map(hit => {
        return hit["_source"]
      })
    })
  }, function (err) {
    res.json({ error: err.message })

  })
});
router.get('/apt-hunt', function (req, res, next) {
  model.getAllForType('apt-hunt-ad').then(function (data) {
    res.json({
      total: data.hits.total.value,
      results: data.hits.hits.map(hit => {
        let item = hit["_source"];
        item = {...item,
        user: JSON.parse(item.user)}
        return item
      })
    })
  }, function (err) {
    res.json({ error: err.message })

  })
});

router.get('/:id', function (req, res, next) {
  model.getResource(req.params.id, type).then(function (data) {
    res.json(data)
  }, function (err) {
    res.json({ error: err })
  })
});

router.get('/apt-hunt/:id', function (req, res, next) {
  model.getResource(req.params.id, 'apt-hunt-ad').then(function (data) {
    res.json(data)
  }, function (err) {
    res.json({ error: err })
  })
});

router.post('/', function (req, res, next) {
  model.authorize(req).then(function (data) {
    if (!req.body.lat || req.body.lat === '') {
      return res.status(400).json({ error: "invalid address: lat missing" });
    }
    if (!req.body.long || req.body.long === '') {
      return res.status(400).json({ error: "invalid address: long missing" });
    }
    if (!req.body.address || req.body.address === '') {
      return res.status(400).json({ error: "missing field : address" });
    }
    if (!req.body.title || req.body.title === '') {
      return res.status(400).json({ error: "missing field : title" });
    }
    if (!req.body.price || req.body.price === '') {
      return res.status(400).json({ error: "missing field : price" });
    }
    if (!req.body.description || req.body.description === '') {
      return res.status(400).json({ error: "missing field : price" });
    }
    if (!req.body.type || req.body.type === '') {
      return res.status(400).json({ error: "missing field : type" });
    }
    if (!req.body.expiration_date || req.body.expiration_date === '') {
      var date = new Date()
      date.setMonth(date.getMonth() + 1);
      req.body.expiration_date = date
    }
    model.createResource(type, req.body)
      .then(function (data) {
        res.json(data)
      }, function (error) {
        res.json({ error: error });
      });
  }).catch(function (err) {
    res.status(err.status).json({ error: err });
  });

})

router.post('/apt-hunt', (req, res) => {
  model.authorize(req).then((data) => {
    if (!req.body.user || req.body.user === '') {
      return res.status(400).json({ error: "User is missing" });
    }
    if (!req.body.link || req.body.link === '') {
      return res.status(400).json({ error: "Link is missing" });
    }
    model.createResource('apt-hunt-ad', {...req.body,
    user: JSON.stringify(req.body.user)})
    .then(function (data) {
      let result = {...data,
      user: JSON.parse(data.user)}
      res.json(result)
    }, function (error) {
      res.json({ error: error });
    });
  }).catch(function (err) {
    res.status(err.status).json({ error: err });
  });
})
//TODO doesnt work, to figure out later
router.put('/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.editResource(type, req.params.id, req.body)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({ error: error.message });
      });
  }).catch(function (err) {
    res.status(err.status).json({ error: err });
  });
});

router.delete('/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.deleteResource(type, req.params.id)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({ error: error.message });
      });
  }).catch(function (err) {
    res.status(err.status).json({ error: err });
  });
})
router.delete('/apt-hunt/:id', function (req, res, next) {
  model.authorize(req).then(function (data) {

    model.deleteResource('apt-hunt-ad', req.params.id)
      .then(function (data) {
        res.json(data._source)
      }, function (error) {
        res.json({ error: error.message });
      });
  }).catch(function (err) {
    res.status(err.status).json({ error: err });
  });
})

router.post('/search', function (req, res, next) {
  model.authorize(req).then(function (data) {
    model.search(type, req.body)
      .then(function (data) {
        res.json(data)
      }, function (error) {
        res.json({ error: error.message });
      });
  }).catch(function (err) {
    res.status(err.status).json({ error: err });
  });

})


module.exports = router;
