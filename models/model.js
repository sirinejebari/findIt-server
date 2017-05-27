/**
 * Created by sirine on 5/21/17.
 */
var index = 'sirinecorp';
var ElasticClient = require('../models/elasticClient.js');
var bcrypt = require('bcrypt-nodejs');

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
  if(type == 'customer'){
    var passwordHash = bcrypt.hashSync("bacon");
    body.password= passwordHash;
    console.log(passwordHash)
  }
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

model.search = function (type, fields) {
  console.log("*****************************fields", fields)

  return new Promise(function (resolve, reject) {
    console.log("*****************************data", buildMatchQueryFields(fields))

    ElasticClient.search({
      index: index,
      type: type,
      body: {
        "query": {
          "bool": {
            "should": buildMatchQueryFields(fields)
          }
        }
      }
    }).then(function (data) {

      if (data) {
        resolve(data.hits.hits)
      }
    }, function (err) {
      reject(err)
    })
  })
}
function buildMatchQueryFields(data) {
  var output= []
  Object.keys(data).forEach(function(key) {
    var match = {}
    match[key.toString()]= data[key]
    var object = {"match": match}
    output.push(object)

  });
  return output
}

module.exports = model;
