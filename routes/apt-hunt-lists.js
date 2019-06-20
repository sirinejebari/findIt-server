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

router.post('/add-to-list/:id', (req, res) => {
    model.authorize(req).then((data) => {
        if (!req.body.user || req.body.user === '') {
            return res.status(400).json({ error: "User is missing" });
        }
        if (!req.body.link || req.body.link === '') {
            return res.status(400).json({ error: "Link is missing" });
        }
        model.createResource(type, {
            ...req.body,
            listId: req.params.id,
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
        model.createResource(listType, {
            ownerId: data.elementId,
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
        model.searchExactly('customers', "email", req.body.email).then((user, err) => {

            if (err) {
                (err) => {
                    return res.status(400).json({ error: 'an error has occurred', message: err });
                }
            }
            if (!user.length) {
                return res.status(404).json({ error: `cant find user with email ${req.body.email}. Please make sure this person has an account.` });

            }
            else {
                let foundUser = user[0]["_source"]
                let payload = req.body.list;
                if(payload.contributors && payload.contributors.indexOf(foundUser.elementId) >= 0){
                    return res.status(400).json({error: 'list already shared with this user'})
                } else {
                    let newContributorsList = new Array(1).fill(foundUser.elementId)
                    payload.contributors =  payload.contributors ?  payload.contributors.push(foundUser.elementId): newContributorsList
                     model.editResource(listType, req.params.id,req.body.list).then((data, err)=> {
                         if(err) {
                             res.status(err.status).json({error: err})
                         }
                         delete data.ctx;
                         res.json(data)
                      })
                }
            }
        })
        
    }).catch(function (err) {
        res.status(err.status).json({ error: err });
    });
})

router.get('/apt-hunt-list-by-user', (req, res) => {
    model.authorize(req).then(function (data) {
        model.search(listType, { 'ownerId': data.elementId }).then(data => {
            let results = data.hits.hits.map(rslt => rslt['_source'])
            res.json({
                total: data.hits.total,
                results: results
            })
        }).catch(err => {
            res.status(err.status).json({ error: err });
        })
    }).catch(function (err) {
        res.status(err.status).json({ error: err });
    });
})

router.get('/ads-in-list/:id', (req, res) => {
    model.authorize(req).then(function (data) {
        model.search(type, { 'listId': req.params.id }).then(data => {
            let results = data.hits.hits.map(rslt => rslt['_source'])
            res.json({
                total: data.hits.total,
                results: results.map(hit => {

                    return {
                        ...hit,
                        user: JSON.parse(hit.user)
                    }
                })
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