const appointmentService = require('../services/appointmentService');

// 1. Makineleri Getirme
const getMachines = async (req, res) => {
  try {
    const machines = await appointmentService.getMachinesByBlock(req.user.blockName);
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Müsaitlik Durumu
const getAvailability = async (req, res) => {
  try {
    const { machineId, date } = req.query;
    if (!machineId || !date) return res.status(400).json({ error: 'Eksik bilgi.' });
    
    const takenSlots = await appointmentService.getTakenSlots(machineId, date);
    res.json(takenSlots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Kota Sorgulama
const getQuota = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Tarih gerekli.' });

    const userId = req.user.id;
    const quota = await appointmentService.getUserQuota(userId, date);
    res.json(quota);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Randevu Alma
const bookMachine = async (req, res) => {
  try {
    const { machineId, date, slotStart, slotEnd } = req.body;
    const userId = req.user.id;

    const appointment = await appointmentService.createAppointment(
      userId, machineId, date, slotStart, slotEnd
    );

    res.status(201).json({ message: 'Randevu alındı! ✅', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 5. Admin: Makine Ekleme
const addMachine = async (req, res) => {
  try {
    const { blockName, type, machineNumber } = req.body;
    const machine = await appointmentService.addMachine(blockName, type, machineNumber);
    res.status(201).json({ message: 'Makine eklendi ✅', machine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Admin: Makine Silme
const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    await appointmentService.deleteMachine(id);
    res.json({ message: 'Makine silindi 🗑️' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Admin: Durum Değiştirme
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    const machine = await appointmentService.updateMachineStatus(id, status);
    res.json({ message: 'Durum güncellendi ✅', machine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Randevularımı Getir
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getMyAppointments(req.user.id);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. Randevu İptal Et
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await appointmentService.cancelAppointment(id, req.user.id);
    res.json({ message: 'Randevu iptal edildi 🗑️' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 10. İstatistikleri Getir
const getStats = async (req, res) => {
  try {
    const stats = await appointmentService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 11. Arıza Bildirme
const reportFault = async (req, res) => {
  try {
    const { machineId, description } = req.body;
    await appointmentService.reportFault(req.user.id, machineId, description);
    res.status(201).json({ message: 'Bildirim alındı. Teşekkürler! 🙏' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 12. Arızanın mesajı/bildirimi
const getReports = async (req, res) => {
  try {
    const reports = await appointmentService.getAllReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 13. Arıza çözüldü mesajı
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    await appointmentService.deleteReport(id);
    res.json({ message: 'Sorun çözüldü, bildirim silindi ✅' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// EXPORT
module.exports = { 
  getMachines, bookMachine, getAvailability, getQuota,
  addMachine, deleteMachine, toggleStatus,
  getMyAppointments, cancelAppointment, getStats, reportFault,
  getReports, resolveReport
};