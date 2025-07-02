exports.up = function(knex) {
  return knex.schema.alterTable("category", function(table) {
    table
      .uuid("auth_user_id")
      .notNullable()
      .defaultTo("1d7824e3-b30a-471a-8724-940ee5c5f559") // burada test için var olan bir user id yaz
      .references("id")
      .inTable("auth_users")
      .onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("category", function(table) {
    table.dropColumn("auth_user_id");
  });
};
