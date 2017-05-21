/**
 * Created by sirine on 5/21/17.
 */
var index = 'sirinecorp';
var ElasticClient = require('../models/elasticClient.js');

var model = {};

model.getAllForType = function (type) {
  return new Promise(function (resolve, reject) {
    ElasticClient.search({
      index: index,
      type: type,
      body: {
        "query": {
          "match_all": {}
        }
      }
    }).then(function (response) {
      if (response) {
        resolve(response)
      }
    }, function (error) {
      reject(error)
    })
  })
}

model.getResource = function (id, type) {
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

model.createResource = function (type, body) {
  var lastId;
  return new Promise(function (resolve, reject) {
    ElasticClient.count({
      index: index,
      type: type
    }).then(function (data) {
      lastId = data.count + 1
      ElasticClient.create({
        index: index,
        type: type,
        id: lastId,
        body: body
      }, function (error, response) {
        if (error) {
          reject(error)
        }
        if (response) {
          model.getResource(lastId, type).then(function (data) {
            resolve(data)
          }).catch(function (err) {
            reject(error)
          })
        }
      })
    })
  })

}

model.editResource = function (type, id, data) {
  return new Promise(function (resolve, reject) {

    ElasticClient.update({
      index: index,
      type: type,
      id: id,
      body: {
        script: {
          "inline": "ctx._source= params",
          "lang": "painless",
          "params": data
        }
      }
    }, function (error, response) {
      if (error) {
        reject(error)
      }
      if (response) {
        model.getResource(id, type).then(function (data) {
          resolve(data)
        }).catch(function (err) {
          reject(error)
        })
      }
    })
  })

}
model.deleteResource = function (type, id) {
  return new Promise(function (resolve, reject) {

    ElasticClient.delete({
      index: index,
      type: type,
      id: id
    }, function ( response,error) {
      if (error) {
        reject(error)
      }
      if (response) {
        resolve(response)
      }
    })

  })

}
module.exports = model;
