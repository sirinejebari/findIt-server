var ElasticClient = require('../models/elasticClient.js');
var model = {};
index= 'apt-hunt-list';


model.getListsByContributerId = (id) => {
    return new Promise(function (resolve, reject) {
        ElasticClient.search({
            index: index,
            body: {
                "query": {
                    "term": {
                        "contributors": {
                            "value": id,
                            "boost": 1.0
                        }
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