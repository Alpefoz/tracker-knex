/**
 * @swagger
 * tags:
 *   name: AuthUsers
 *   description: Kullanıcı kimlik doğrulama işlemleri
 */

const express = require("express");
const router = express.Router();
const knex = require("../../db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../../middleware/verifyToken.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * @swagger
 * /auth_users/signup:
 *   post:
 *     summary: Yeni kullanıcı kaydı (Sign up)
 *     tags: [AuthUsers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kullanıcı oluşturuldu
 *       400:
 *         description: Email zaten kullanılıyor
 *       500:
 *         description: Sunucu hatası
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // email daha önce kullanılmış mı kontrol et
    const exists = await knex("auth_users").where({ email }).first();
    if (exists) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // veritabanına ekle
    const newUser = await knex("auth_users")
      .insert({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        active: true,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .returning(["id", "name", "email", "active"]);

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error("POST /auth_users/signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * @swagger
 * /auth_users/signin:
 *   post:
 *     summary: Kullanıcı giriş yapar (Sign in)
 *     tags: [AuthUsers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı, JWT döner
 *       401:
 *         description: Geçersiz kimlik bilgisi
 *       500:
 *         description: Sunucu hatası
 */
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    // email ile kullanıcıyı bul
    const user = await knex("auth_users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // şifreyi bcrypt ile kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // jwt üret
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /auth_users:
 *   get:
 *     summary: Tüm kullanıcıları getirir (token gereklidir)
 *     tags: [AuthUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *       401:
 *         description: Yetkisiz
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await knex("auth_users").select("id", "name", "email", "active");
    res.json(users);
  } catch (error) {
    console.error("GET /auth_users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /auth_users/{id}:
 *   get:
 *     summary: ID’ye göre kullanıcı getir (token ve kendi ID’si gereklidir)
 *     tags: [AuthUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgisi
 *       403:
 *         description: Yetkisiz erişim
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const user = await knex("auth_users").where({ id }).first();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("GET /auth_users/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /auth_users/{id}:
 *   put:
 *     summary: Kullanıcıyı günceller (token ve kendi ID’si gereklidir)
 *     tags: [AuthUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncellenmiş kullanıcı
 *       403:
 *         description: Yetkisiz erişim
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (req.user.id !== id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const updated = await knex("auth_users")
      .where({ id })
      .update({
        name,
        email,
        password,
        updated_at: knex.fn.now(),
      })
      .returning(["id", "name", "email", "active"]);

    res.json(updated[0]);
  } catch (error) {
    console.error("PUT /auth_users/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /auth_users/{id}:
 *   delete:
 *     summary: Kullanıcıyı siler (token ve kendi ID’si gereklidir)
 *     tags: [AuthUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı silindi
 *       403:
 *         description: Yetkisiz erişim
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    await knex("auth_users").where({ id }).del();

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE /auth_users/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;

module.exports = router;
