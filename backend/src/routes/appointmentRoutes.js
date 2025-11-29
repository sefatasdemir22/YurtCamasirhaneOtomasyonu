const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const verifyToken = require('../middlewares/authMiddleware');
const adminCheck = require('../middlewares/adminMiddleware');

//  ÖĞRENCİ İŞLEMLERİ
router.get('/machines', verifyToken, appointmentController.getMachines);
router.get('/availability', verifyToken, appointmentController.getAvailability);
router.get('/quota', verifyToken, appointmentController.getQuota);
router.post('/book', verifyToken, appointmentController.bookMachine);

// Randevularım ve İptal
router.get('/my-appointments', verifyToken, appointmentController.getMyAppointments);
router.delete('/cancel/:id', verifyToken, appointmentController.cancelAppointment);

// Arıza Bildirimi
router.post('/report', verifyToken, appointmentController.reportFault);

// YÖNETİCİ İŞLEMLERİ
router.post('/machine', verifyToken, adminCheck, appointmentController.addMachine);
router.delete('/machine/:id', verifyToken, adminCheck, appointmentController.deleteMachine);
router.patch('/machine/:id/status', verifyToken, adminCheck, appointmentController.toggleStatus);
// Raporları Listele
router.get('/admin/reports', verifyToken, adminCheck, appointmentController.getReports);
// Raporu Sil
router.delete('/admin/reports/:id', verifyToken, adminCheck, appointmentController.resolveReport);


// İstatistikler
router.get('/admin/stats', verifyToken, adminCheck, appointmentController.getStats);

module.exports = router;