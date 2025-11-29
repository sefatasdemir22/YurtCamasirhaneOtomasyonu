const pool = require('../config/db');

// 1. Bloktaki makineleri getir
const getMachinesByBlock = async (blockName) => {
  const result = await pool.query(
    'SELECT * FROM machines WHERE block_name = $1 ORDER BY machine_number', 
    [blockName]
  );
  return result.rows;
};

// 2. Belirli bir makine ve tarih için DOLU saatleri getir
const getTakenSlots = async (machineId, date) => {
  const result = await pool.query(
    'SELECT slot_start FROM appointments WHERE machine_id = $1 AND date = $2',
    [machineId, date]
  );
  return result.rows.map(row => row.slot_start.substring(0, 5)); 
};

// 3. Kullanıcının o günkü kullanım hakkını hesapla
const getUserQuota = async (userId, date) => {
  const result = await pool.query(
    `SELECT m.type, COUNT(*) as count 
     FROM appointments a 
     JOIN machines m ON a.machine_id = m.id 
     WHERE a.user_id = $1 AND a.date = $2 
     GROUP BY m.type`,
    [userId, date]
  );

  let washCount = 0;
  let dryCount = 0;

  result.rows.forEach(row => {
    if (row.type === 'wash') washCount = parseInt(row.count);
    if (row.type === 'dry') dryCount = parseInt(row.count);
  });

  return { washCount, dryCount };
};

// 4. Randevu Oluştur tarih kontollü, geçmişe randevu alınamaz
const createAppointment = async (userId, machineId, date, slotStart, slotEnd) => {

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    throw new Error('Geçmiş bir tarihe randevu alamazsınız!');
  }
  
  // A) Makinenin türünü bul
  const machineRes = await pool.query('SELECT type FROM machines WHERE id = $1', [machineId]);
  if (machineRes.rows.length === 0) throw new Error('Makine bulunamadı.');
  
  const machineType = machineRes.rows[0].type;

  // B) Kotayı Kontrol Et
  const quotas = await getUserQuota(userId, date);
  
  if (machineType === 'wash' && quotas.washCount >= 2) {
    throw new Error('HATA: Bugün için Çamaşır Yıkama hakkınız (2 adet) doldu!');
  }
  if (machineType === 'dry' && quotas.dryCount >= 2) {
    throw new Error('HATA: Bugün için Kurutma hakkınız (2 adet) doldu!');
  }

  // C) Çakışma Kontrolü
  const conflictCheck = await pool.query(
    'SELECT * FROM appointments WHERE machine_id = $1 AND date = $2 AND slot_start = $3',
    [machineId, date, slotStart]
  );

  if (conflictCheck.rows.length > 0) {
    throw new Error('Üzgünüz, bu saatte makine zaten dolu.');
  }

  // D) Kaydet
  const newAppointment = await pool.query(
    'INSERT INTO appointments (user_id, machine_id, date, slot_start, slot_end) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, machineId, date, slotStart, slotEnd]
  );

  return newAppointment.rows[0];
};

// 5. Admin: Makine Ekle
const addMachine = async (blockName, type, machineNumber) => {
  const result = await pool.query(
    'INSERT INTO machines (block_name, type, machine_number) VALUES ($1, $2, $3) RETURNING *',
    [blockName, type, machineNumber]
  );
  return result.rows[0];
};

// 6. Admin: Makine Sil
const deleteMachine = async (machineId) => {
  await pool.query('DELETE FROM appointments WHERE machine_id = $1', [machineId]);
  const result = await pool.query('DELETE FROM machines WHERE id = $1 RETURNING *', [machineId]);
  return result.rows[0];
};

// 7. Admin: Makine Durumu Güncelle
const updateMachineStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE machines SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

// 8. Öğrencinin Kendi Randevularını Getir
const getMyAppointments = async (userId) => {
  const result = await pool.query(
    `SELECT a.id, a.date, a.slot_start, a.slot_end, m.type, m.machine_number, m.block_name 
     FROM appointments a
     JOIN machines m ON a.machine_id = m.id
     WHERE a.user_id = $1
     ORDER BY a.date DESC, a.slot_start ASC`,
    [userId]
  );
  return result.rows;
};

// 9. Randevu İptal Et
const cancelAppointment = async (appointmentId, userId) => {
  const result = await pool.query(
    'DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *',
    [appointmentId, userId]
  );
  if (result.rows.length === 0) {
    throw new Error('Randevu bulunamadı veya silme yetkiniz yok.');
  }
  return result.rows[0];
};

// 10. Admin İstatistikleri
const getStats = async () => {
  const typeStats = await pool.query(
    `SELECT m.type, COUNT(*) as count 
     FROM appointments a 
     JOIN machines m ON a.machine_id = m.id 
     GROUP BY m.type`
  );
  return typeStats.rows;
};

// 11. Arıza Bildirimi
const reportFault = async (userId, machineId, description) => {
  const result = await pool.query(
    'INSERT INTO reports (user_id, machine_id, description) VALUES ($1, $2, $3) RETURNING *',
    [userId, machineId, description]
  );
  return result.rows[0];
};

// Tüm Arıza Bildirimlerini Getir (Kullanıcı ve Makine detaylarıyla)
const getAllReports = async () => {
  const result = await pool.query(
    `SELECT r.id, r.description, r.created_at, u.username, m.machine_number, m.type, m.block_name 
     FROM reports r
     JOIN users u ON r.user_id = u.id
     JOIN machines m ON r.machine_id = m.id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
};

// Bildirimi Sil (Çözüldü olarak işaretle)
const deleteReport = async (reportId) => {
  const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING *', [reportId]);
  return result.rows[0];
};

module.exports = { 
  getMachinesByBlock, createAppointment, getTakenSlots, getUserQuota,
  addMachine, deleteMachine, updateMachineStatus,
  getMyAppointments, cancelAppointment, getStats, reportFault,
  getAllReports, deleteReport
};