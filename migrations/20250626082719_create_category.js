exports.up = function (knex) {
  return knex.schema.createTable("category", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.enu("type", ["income", "expense"]).notNullable();
    table.uuid("auth_user_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("category");
};
