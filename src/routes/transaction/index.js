const express = require("express");
const router = express.Router();
const knex = require("../../db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../../middleware/verifyToken.js");

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction management
 */

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - category_id
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { amount, description, category_id } = req.body;

    const newTransaction = await knex("transaction")
      .insert({
        id: uuidv4(),
        amount,
        description,
        category_id,
        auth_user_id: req.user.id,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .returning("*");

    res.status(201).json(newTransaction[0]);
  } catch (error) {
    console.error("POST /transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /transaction:
 *   get:
 *     summary: Get all transactions with pagination, filtering, sorting
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const sortBy = req.query.sortBy || "created_at";
    const order = req.query.order === "desc" ? "desc" : "asc";
    const descriptionFilter = req.query.description;

    let query = knex("transaction").where({ auth_user_id: req.user.id });

    if (descriptionFilter) {
      query = query.andWhere("description", "like", `%${descriptionFilter}%`);
    }

    const transactions = await query
      .orderBy(sortBy, order)
      .limit(pageSize)
      .offset(offset);

    res.json(transactions);
  } catch (error) {
    console.error("GET /transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /transaction/{id}:
 *   get:
 *     summary: Get a single transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: The transaction data
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await knex("transaction")
      .where({ id, auth_user_id: req.user.id })
      .first();

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("GET /transaction/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




/**
 * @swagger
 * /transaction/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - category_id
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category_id } = req.body;

    const updated = await knex("transaction")
      .where({ id, auth_user_id: req.user.id })
      .update({
        amount,
        description,
        category_id,
        updated_at: knex.fn.now(),
      })
      .returning("*");

    res.json(updated[0]);
  } catch (error) {
    console.error("PUT /transaction/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /transaction/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await knex("transaction")
      .where({ id, auth_user_id: req.user.id })
      .del();

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("DELETE /transaction/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
