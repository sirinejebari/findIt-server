/**
 * Created by sirine on 5/21/17.
 */

var express = require('express');
var router = express.Router();
var model = require('../models/model.js');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var app = require('../app');
router.post('/', function(req, res) {

  // find the user
  model.search('customer', req.body).then(function (user, err) {
    var uniqueUser = user[0]._source

    if (err) throw err;

    if (!uniqueUser) {
      res.json({success: false, message: 'Authentication failed. User not found.'});
    } else if (uniqueUser) {

      // check if password matches
      if (uniqueUser.password != req.body.password) {
        res.json({success: false, message: 'Authentication failed. Wrong password.'});
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(uniqueUser,req.app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  })
});
module.exports = router;


