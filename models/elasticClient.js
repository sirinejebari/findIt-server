/**
 * Created by sirine on 5/19/17.
 */
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
module.exports = client;
