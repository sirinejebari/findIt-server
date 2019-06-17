/**
 * Created by sirine on 5/21/17.
 */
var ElasticClient = require('../models/elasticClient.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var model = {};

model.authorize = function (req, res, next) {
  return new Promise(function (resolve, reject) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'];

    if (token) {
      jwt.verify(token, req.app.get('superSecret'), function (err, decoded) {
        if (err) reject({ success: false, message: 'Unauthorized', error: err, status: 401 });

        else {
          resolve(decoded);
        }
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

model.getAllForType = function (index) {
  return new Promise(function (resolve, reject) {
    ElasticClient.search({
      index: index,
      body: {
        "query": {
          "match_all": {}
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

model.getResource = function (id, index) {

  return new Promise(function (resolve, reject) {
    ElasticClient.get({
      index: index,
      type: index,
      id: id
    }, function (error, response) {
      if (error) {
        reject(error)
      }
      if (response) {
        resolve(response.body._source)
      }
    });
  })

}

model.createResource = function (index, body) {
  if (index == 'customers') {
    var passwordHash = bcrypt.hashSync(body.password);
    body.password = passwordHash;
  }
  var lastId;
  return new Promise(function (resolve, reject) {
    ElasticClient.search({
      index: index,
      body: {
        "aggs" : {
          "max_id" : { "max" : { "field" : "elementId" } }
      }
    }
    }).then(function (data) {

      lastId = data.body.aggregations.max_id.value + 1
      body.elementId = lastId;

        ElasticClient.create({
          index: index,
          type: index,
          id: lastId,
          body: body
        }, function (error, response) {
          if (error) {
            reject(error)
          }
          if (response) {
            model.getResource(lastId, index).then(function (data) {
              resolve(data)
            }).catch(function (err) {
              reject(err)
            })
          }
        })
    }, (err) => {
      console.log('error when counting', err)
      reject(err)
    })
  })

}

model.editResource = function (index, id, data) {
  return new Promise(function (resolve, reject) {

    ElasticClient.update({
      index: index,
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
model.deleteResource = function (index, id) {
  return new Promise(function (resolve, reject) {

    ElasticClient.delete({
      index: index,
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

model.search = function (index, fields) {
  fields.state = 'valid';
  //TODO handle expiry_date
  //TODO within x km from lat long
  return new Promise(function (resolve, reject) {

    ElasticClient.search({
      index: index,
      body: {
        "query": {
          "bool": {
            "should": buildMatchQueryFields(fields)
          }
        }
      }
    }).then(function (data) {

      if (data) {
        resolve(data.body.hits.hits)
      }
    }, function (err) {
      reject(err)
    })
  })
}
model.searchExactly = function (index, fieldname, value) {
  return new Promise(function (resolve, reject) {

    let body = {
      "query": {
        "match": {
        }
      }
    }
    body.query.match[fieldname] = {
      "query": value,
      "operator": "and"
    }
    ElasticClient.search({
      index: index,
      body: body
    }).then(function (data) {
      if (data) {
        resolve(data.body.hits.hits)
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
    var object = { "match": match }
    output.push(object)

  });
  return output
}

module.exports = model;
