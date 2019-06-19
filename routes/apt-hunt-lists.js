var express = require('express');
var model = require('../models/model.js');
var router = express.Router();
var type = 'apt-hunt-ad'
var listType = 'apt-hunt-list'

router.get('/apt-hunt', function (req, res, next) {
    model.authorize(req).then(function (data) {
        let userId = data.elementId
        model.search(type, { userId: userId })
            .then(function (data) {
                res.json({
                    total: data.hits.total,
                    results: data.hits.hits.map(hit => {
                        let item = hit["_source"];
                        item = {
                            ...item,
                            user: JSON.parse(item.user)
                        }
                        return item
                    })
                })
            }, function (error) {
                res.json({ error: error.message });
            });
    }).catch(function (err) {
        res.status(err.status).json({ error: err });
    });
});

router.get('/apt-hunt/:id', function (req, res, next) {
    model.getResource(req.params.id, type).then(function (data) {
        res.json(data)
    }, function (err) {
        res.json({ error: err })
    })
});

router.post('/apt-hunt', (req, res) => {
    model.authorize(req).then((data) => {
        if (!req.body.user || req.body.user === '') {
            return res.status(400).json({ error: "User is missing" });
        }
        if (!req.body.link || req.body.link === '') {
            return res.status(400).json({ error: "Link is missing" });
        }
        model.createResource(type, {
            ...req.body,
            user: JSON.stringify(req.body.user),
            userId: req.body.user.id,
            status: 'PENDING'
        })
            .then(function (data) {
                let result = {
                    ...data,
                    user: JSON.parse(data.user)
                }
                res.json(result)
            }, function (error) {
                res.json({ error: error });
            });
    }).catch(function (err) {
        res.status(err.status).json({ error: err });
    });
})

router.post('/apt-hunt-list', (req, res) => {
    model.authorize(req).then(data => {
        if (!req.body.ownerId || req.body.ownerId === '') {
            return res.status(400).json({ error: "ownerId is missing" });
        }
        model.createResource(listType, {
            ownerId: req.body.ownerId,
            name: req.body.name ? req.body.name : 'Unnamed list'
        }).then(data => {
            res.status(200).json(data)
        }, err => {
            res.status(err.status).json({ error: err })
        })
    }).catch(err => {
        res.status(err.status).json({ error: err })
    })
})
router.put('/add-contributer/:id', (req, res) => {
    model.authorize(req).then(function (data) {
        console.log(req.params, req.body)
       // model.editResource(listType, req.params.id, req.body)
    }).catch(function (err) {
        res.status(err.status).json({ error: err });
    });
})

router.get('/apt-hunt-list-by-user', (req, res) => {
    model.authorize(req).then(function (data) {
        model.search(listType, { 'ownerId': data.elementId }).then(data => {
            res.json({
                total: data.hits.total,
                results: data.hits.hits
            })
        }).catch(err => {
            res.status(err.status).json({ error: err });
        })
    }).catch(function (err) {
        res.status(err.status).json({ error: err });
    });
})
router.delete('/apt-hunt/:id', function (req, res, next) {
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

module.exports = router;