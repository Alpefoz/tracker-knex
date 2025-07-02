const express = require("express");
const router = express.Router();
const knex = require("../../db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../../middleware/verifyToken.js");

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction işlemleri
 */

/**
 * @swagger
 * /transaction:
 *   get:
 *     summary: Tüm transactionları getir
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction listesi başarıyla döndürüldü
 *       401:
 *         description: Yetkisiz
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const transactions = await knex("transaction")
      .where("auth_user_id", req.user.id)
      .select("*");
    res.json(transactions);
  } catch (error) {
    console.error("GET /transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Yeni bir transaction oluştur
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - category_id
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category_id:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       201:
 *         description: Transaction başarıyla oluşturuldu
 *       401:
 *         description: Yetkisiz
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, amount, category_id, type } = req.body;

    const newTransaction = await knex("transaction")
      .insert({
        id: uuidv4(),
        title,
        amount,
        category_id,
        type,
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
 * /transaction/{id}:
 *   put:
 *     summary: Transaction güncelle
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Güncellenecek transaction ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category_id:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction başarıyla güncellendi
 *       401:
 *         description: Yetkisiz
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category_id, type } = req.body;

    const updated = await knex("transaction")
      .where({ id, auth_user_id: req.user.id })
      .update({
        title,
        amount,
        category_id,
        type,
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
 *     summary: Transaction sil
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Silinecek transaction ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction başarıyla silindi
 *       401:
 *         description: Yetkisiz
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await knex("transaction")
      .where({ id, auth_user_id: req.user.id })
      .del();

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("DELETE /transaction/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
