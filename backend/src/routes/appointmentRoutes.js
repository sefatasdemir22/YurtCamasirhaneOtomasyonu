const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const verifyToken = require('../middlewares/authMiddleware');
const adminCheck = require('../middlewares/adminMiddleware');

// Öğrenci Rotaları
router.get('/machines', verifyToken, appointmentController.getMachines);
router.get('/availability', verifyToken, appointmentController.getAvailability);
router.get('/quota', verifyToken, appointmentController.getQuota);
router.post('/book', verifyToken, appointmentController.bookMachine);

// YÖNETİCİ Rotaları
router.post('/machine', verifyToken, adminCheck, appointmentController.addMachine);
router.delete('/machine/:id', verifyToken, adminCheck, appointmentController.deleteMachine);
// YENİ EKLENEN ROTA:
router.patch('/machine/:id/status', verifyToken, adminCheck, appointmentController.toggleStatus);

module.exports = router;