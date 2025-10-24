require("dotenv").config();

const knex = require("knex")({
  client: 'pg',
  connection: {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  pool: { min: 50, max: 100 },
});

const { attachPaginate } = require("knex-paginate");
attachPaginate();

module.exports = knex;
