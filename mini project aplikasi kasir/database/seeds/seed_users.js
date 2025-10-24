const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Hapus semua data lama
  await knex('users').del();

  // Hash password
  const password = await bcrypt.hash('123456', 10);

  // Insert user baru
  await knex('users').insert([
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: password,
    },
  ]);
};
