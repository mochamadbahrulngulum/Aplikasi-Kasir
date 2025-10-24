exports.seed = async function(knex) {
  await knex('products').del();
  await knex('products').insert([
    { name: 'Produk A', price: 10000, stock: 50 },
    { name: 'Produk B', price: 20000, stock: 30 }
  ]);
};
