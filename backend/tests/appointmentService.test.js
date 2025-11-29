const appointmentService = require('../src/services/appointmentService');
const db = require('../src/config/db');

// Veritabanını taklit etme (Mocking)
// Gerçek veritabanına "bağlanmış gibi" davranacağız.
jest.mock('../src/config/db');

describe('Randevu Servisi Testleri (Unit Tests)', () => {

  afterEach(() => {
    jest.clearAllMocks(); // Her testten sonra hafızayı temizle
  });

  // TEST 1: Başarılı Randevu
  test('✅ Geçerli bilgilerle randevu başarıyla oluşturulmalı', async () => {
    // Senaryo: Makine var, Kota boş, Saat müsait
    db.query
      .mockResolvedValueOnce({ rows: [{ type: 'wash' }] }) // Makine tipi sorgusu
      .mockResolvedValueOnce({ rows: [{ type: 'wash', count: 0 }, { type: 'dry', count: 0 }] }) // Kota sorgusu (0 randevu)
      .mockResolvedValueOnce({ rows: [] }) // Çakışma kontrolü
      .mockResolvedValueOnce({ rows: [{ id: 1, machine_id: 1 }] }); // Kayıt sonucu

    const futureDate = '2030-01-01'; // Gelecek bir tarih
    const result = await appointmentService.createAppointment(1, 1, futureDate, '10:00', '11:00');

    expect(result).toHaveProperty('id'); // Sonuçta bir ID dönmeli
    expect(result.machine_id).toBe(1);
  });

  // TEST 2: Kota Aşımı
  test('❌ Kota doluysa hata fırlatmalı (Business Logic)', async () => {
    // Senaryo: Kullanıcının zaten 2 tane yıkama randevusu var
    db.query
      .mockResolvedValueOnce({ rows: [{ type: 'wash' }] }) // Makine tipi: Yıkama
      .mockResolvedValueOnce({ 
        rows: [
          { type: 'wash', count: 2 }, // Burada 2 randevusu var dedim
          { type: 'dry', count: 0 }
        ] 
      }); 

    const futureDate = '2030-01-01';

    // Hata fırlatmasını bekliyoruz
    await expect(appointmentService.createAppointment(1, 1, futureDate, '10:00', '11:00'))
      .rejects
      .toThrow('HATA: Bugün için Çamaşır Yıkama hakkınız (2 adet) doldu!');
  });

  // TEST 3: Geçmiş Tarih Kontrolü
  test('❌ Geçmiş tarihe randevu alınamamalı', async () => {
    const pastDate = '2020-01-01'; // Geçmiş tarih

    await expect(appointmentService.createAppointment(1, 1, pastDate, '10:00', '11:00'))
      .rejects
      .toThrow('Geçmiş bir tarihe randevu alamazsınız!');
  });

});