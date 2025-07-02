const express = require("express");
const router = express.Router();

// Route dosyalarını dahil et
const authUsersRouter = require("./auth_users");
const categoryRouter = require("./category");
const transactionRouter = require("./transaction");

// Route'lara yönlendir
router.use("/auth_users", authUsersRouter);
router.use("/category", categoryRouter);
router.use("/transaction", transactionRouter);

module.exports = router;
