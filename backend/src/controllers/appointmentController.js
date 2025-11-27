const appointmentService = require('../services/appointmentService');

// 1. Makineleri Getir
const getMachines = async (req, res) => {
  try {
    const machines = await appointmentService.getMachinesByBlock(req.user.blockName);
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Müsaitlik Durumu (Dolu Saatler)
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

// 3. Kota Sorgula
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

// 4. Randevu Al
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
const addMachine = async (req, res) => {
  try {
    const { blockName, type, machineNumber } = req.body;
    const machine = await appointmentService.addMachine(blockName, type, machineNumber);
    res.status(201).json({ message: 'Makine eklendi ✅', machine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    await appointmentService.deleteMachine(id);
    res.json({ message: 'Makine silindi 🗑️' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' veya 'maintenance' gelecek
    
    const machine = await appointmentService.updateMachineStatus(id, status);
    res.json({ message: 'Durum güncellendi ✅', machine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export kısmına eklemeyi UNUTMA:
module.exports = { 
  getMachines, 
  bookMachine, 
  getAvailability, 
  getQuota,
  addMachine,
  deleteMachine,
  toggleStatus // <-- Eklendi
};