/**
 * Created by sirine on 5/19/17.
 */
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
module.exports = client;
