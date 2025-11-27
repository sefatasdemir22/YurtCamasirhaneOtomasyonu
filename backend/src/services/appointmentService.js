const pool = require('../config/db');

// 1. Bloktaki makineleri getir
const getMachinesByBlock = async (blockName) => {
  const result = await pool.query(
    'SELECT * FROM machines WHERE block_name = $1 ORDER BY machine_number', 
    [blockName]
  );
  return result.rows;
};

// 2. YENİ: Belirli bir makine ve tarih için DOLU SAATLERİ getir
const getTakenSlots = async (machineId, date) => {
  const result = await pool.query(
    'SELECT slot_start FROM appointments WHERE machine_id = $1 AND date = $2',
    [machineId, date]
  );
  // Sadece saatleri dizi olarak döndür (Örn: ["09:00", "14:00"])
  // substring(0,5) veritabanından gelen HH:MM:SS formatını HH:MM yapar
  return result.rows.map(row => row.slot_start.substring(0, 5)); 
};

// 3. YENİ: Kullanıcının o günkü kullanım hakkını hesapla
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

// 4. Randevu Oluştur (Güncellenmiş Kural Kontrollü Hali)
const createAppointment = async (userId, machineId, date, slotStart, slotEnd) => {
  
  // A) Makinenin türünü bul (Yıkama mı Kurutma mı?)
  const machineRes = await pool.query('SELECT type FROM machines WHERE id = $1', [machineId]);
  
  if (machineRes.rows.length === 0) {
    throw new Error('Makine bulunamadı.');
  }
  
  const machineType = machineRes.rows[0].type;

  // B) Kotayı Kontrol Et (Yıkama ve Kurutma ayrı ayrı 2 hak)
  const quotas = await getUserQuota(userId, date);
  
  if (machineType === 'wash' && quotas.washCount >= 2) {
    throw new Error('HATA: Bugün için Çamaşır Yıkama hakkınız (2 adet) doldu!');
  }
  if (machineType === 'dry' && quotas.dryCount >= 2) {
    throw new Error('HATA: Bugün için Kurutma hakkınız (2 adet) doldu!');
  }

  // C) Çakışma Kontrolü (O saat dolu mu?)
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

const addMachine = async (blockName, type, machineNumber) => {
  const result = await pool.query(
    'INSERT INTO machines (block_name, type, machine_number) VALUES ($1, $2, $3) RETURNING *',
    [blockName, type, machineNumber]
  );
  return result.rows[0];
};

// YENİ: Makine Sil
const deleteMachine = async (machineId) => {
  // Önce bu makineye ait randevuları sil (Yoksa hata verir - Foreign Key hatası)
  await pool.query('DELETE FROM appointments WHERE machine_id = $1', [machineId]);
  
  // Sonra makineyi sil
  const result = await pool.query('DELETE FROM machines WHERE id = $1 RETURNING *', [machineId]);
  return result.rows[0];
};

const updateMachineStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE machines SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

// Export kısmına eklemeyi UNUTMA:
module.exports = { 
  getMachinesByBlock, 
  createAppointment, 
  getTakenSlots, 
  getUserQuota,
  addMachine,
  deleteMachine,
  updateMachineStatus // <-- Eklendi
};