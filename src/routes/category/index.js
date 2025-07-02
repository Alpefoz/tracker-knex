const express = require("express");
const router = express.Router();
const knex = require("../../db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../../middleware/verifyToken.js");

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category management
 */

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const categories = await knex("category").where({ auth_user_id: req.user.id });
    res.json(categories);
  } catch (error) {
    console.error("GET /category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, type } = req.body;

    const newCategory = await knex("category")
      .insert({
        id: uuidv4(),
        name,
        type,
        auth_user_id: req.user.id,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .returning("*");

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error("POST /category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/category/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const updated = await knex("category")
      .where({ id, auth_user_id: req.user.id })
      .update({ name, type, updated_at: knex.fn.now() })
      .returning("*");

    res.json(updated[0]);
  } catch (error) {
    console.error("PUT /category/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await knex("category")
      .where({ id, auth_user_id: req.user.id })
      .del();

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /category/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
