/**
 * Created by sirine on 5/21/17.
 */

var express = require('express');
var router = express.Router();
var model = require('../models/model.js');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var app = require('../app');
var bcrypt = require('bcrypt-nodejs');

router.post('/', function(req, res) {
  // find the user
  model.search('customers', {'email': req.body.email} ).then(function (user, err) {

    if (err) throw err;

    if (!user.length) {
      res.status(404).json({success: false, message: 'Authentication failed. User not found.'});
    } else {
      var uniqueUser = user[0]._source
      userId = user[0]._id

      // check if password matches
      if (!bcrypt.compareSync(req.body.password, uniqueUser.password)) {
        res.status(401).json({success: false, message: 'Authentication failed. Wrong password.'});
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(uniqueUser,req.app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });
        delete uniqueUser.password;
        uniqueUser.id = userId;
        // return the information including token as JSON
        res.json({
          success: true,
          token: token,
          user: uniqueUser
        });
      }
    }
  })
});
module.exports = router;


