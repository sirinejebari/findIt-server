var ElasticClient = require('../models/elasticClient.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var model = {};
index= 'ads';


model.queryAdsInBounds = (bounds) => {
    return new Promise(function (resolve, reject) {
        ElasticClient.search({
            index: index,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "range": {
                                    "lat": {
                                        "gte": bounds.minLat,
                                        "lte": bounds.maxLat
                                    }
                                }
                            },
                            {
                                range: { 
                                    "long": {
                                        "gte": bounds.minLong,
                                        "lte": bounds.maxLong
                                    }
                                }
                            }
                        ]
                    }
                    
                }
            }
        }).then(function (response) {
            if (response) {
                resolve(response.body)
            }
        }, function (error) {
            reject(error)
        })
    })
}



module.exports = model;