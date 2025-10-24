const knex = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',       // ganti jika server PostgreSQL kamu di tempat lain
    user: 'postgres',        // username PostgreSQL kamu
    password: 'Ulum160823*', // ubah sesuai password kamu
    database: 'warung_madura_db', // ubah sesuai nama database
    port: 5432               // port default PostgreSQL
  }
});

module.exports = knex;
