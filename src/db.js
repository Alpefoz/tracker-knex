const knex = require('knex');
const knexConfig = require('../knexfile');

const db = knex(knexConfig.development);
console.log("DB URL:", process.env.DATABASE_URL);

module.exports = db;
