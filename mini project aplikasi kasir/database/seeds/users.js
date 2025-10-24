const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // hapus semua data dulu
  await knex('users').del();

  // tambahkan admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  await knex('users').insert([
    { name: 'Admin', email: 'admin@example.com', password: hashedPassword }
  ]);
};
