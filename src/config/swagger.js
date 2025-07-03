// src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tracker API (Knex version)",
      version: "1.0.0",
      description: "Gelir-Gider Takip API dokümantasyonu",
    },
    servers: [
      {
         url: "https://meric-trackerknex.mhkb1d.easypanel.host/api"
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
