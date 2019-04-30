/**
 * Created by sirine on 5/19/17.
 */
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'https://search-find-it-fk7e4uoy3sng5us6rpfox5fojy.eu-west-3.es.amazonaws.com' })
module.exports = client;
