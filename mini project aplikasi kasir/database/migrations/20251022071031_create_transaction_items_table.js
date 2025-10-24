exports.up = function(knex) {
  return knex.schema.createTable("transaction_items", (table) => {
    table.increments("id").primary().unsigned();
    table.integer("transaction_id").unsigned().references("id").inTable("transactions");
    table.integer("product_id").unsigned().references("id").inTable("products");
    table.integer("quantity").defaultTo(1);
    table.decimal("subtotal", 10, 2);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("transaction_items");
};
