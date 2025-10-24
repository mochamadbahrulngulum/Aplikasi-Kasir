exports.up = function(knex) {
  return knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary().unsigned();
    table.integer("user_id").unsigned().references("id").inTable("users");
    table.decimal("total", 10, 2).defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("transactions");
};


