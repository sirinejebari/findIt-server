/**
 * Created by sirine on 5/21/17.
 */
var index = 'sirinecorp';
var ElasticClient = require('../models/elasticClient.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var model = {};

model.authorize = function (req, res, next) {
  return new Promise(function (resolve, reject) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'];

    if (token) {
      jwt.verify(token, req.app.get('superSecret'), function (err, decoded) {
        if (err) reject({success: false, message: 'Unauthorized', error: err, status: 401});

        else   resolve(decoded);
      });
    } else {
      reject({
        success: false,
        message: 'No token provided.',
        status: 403
      });

    }
  })
};

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
        console.log("type of response", typeof response)
        console.log("response is", response)
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
        resolve(response._source)
      }
    });
  })

}

model.createResource = function (type, body) {
  if (type == 'customer') {
    var passwordHash = bcrypt.hashSync(body.password);
    body.password = passwordHash;
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
    }, function (response, error) {
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
  fields.state = 'valid';
  console.log(fields, type)
  //TODO handle expiry_date
  //TODO within x km from lat long
  return new Promise(function (resolve, reject) {

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
model.searchExactly = function (type, fields) {
  return new Promise(function (resolve, reject) {

    ElasticClient.search({
      index: index,
      type: type,
      body: {
        "query": {
          "constant_score" : {
            "filter" : {
              "term" : {
                "phone_number" : "+21626596487"
              }
            }
          }
        }
      }
    }).then(function (data) {
      console.log("***********************", data)

      if (data) {
        resolve(data.hits.hits)
      }
    }, function (err) {
      reject(err)
    })
  })
}
function buildMatchQueryFields(data) {
  var output = []
  Object.keys(data).forEach(function (key) {
    var match = {}
    match[key.toString()] = data[key]
    var object = {"match": match}
    output.push(object)

  });
  return output
}

module.exports = model;
