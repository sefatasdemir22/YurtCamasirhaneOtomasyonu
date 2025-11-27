const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// authController.register veya login'i bulamazsa hata verir.
// 1. adımı doğru yaptıysan burası çalışır.
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;