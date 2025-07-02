exports.up = function (knex) {
  return knex.schema.createTable("transaction", function (table) {
    table.uuid("id").primary();
    table.string("title").notNullable();
    table.decimal("amount", 14, 2).notNullable();
    table
      .enu("type", ["income", "expense"], { useNative: true, enumName: "transaction_type" })
      .notNullable();
    table.uuid("category_id").notNullable();
    table.uuid("auth_user_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign("category_id")
      .references("id")
      .inTable("category")
      .onDelete("CASCADE");

    table
      .foreign("auth_user_id")
      .references("id")
      .inTable("auth_users")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transaction");
};
