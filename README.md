# 🧺 Yurt Çamaşırhane Otomasyon Sistemi

Bu proje, üniversite yurtlarındaki çamaşırhane yoğunluğunu yönetmek, adil kullanım sağlamak ve arıza süreçlerini dijitalleştirmek amacıyla geliştirilmiş modern bir web uygulamasıdır.

## 🚀 Özellikler

### 🎓 Öğrenci Paneli
* **Kayıt ve Giriş:** JWT tabanlı güvenli kimlik doğrulama.
* **Randevu Alma:** Müsait makine ve saatleri anlık görüntüleme.
* **Akıllı Kota Sistemi:** Günde en fazla 2 randevu (Çamaşır ve Kurutma ayrı ayrı) sınırı.
* **Randevu Yönetimi:** Geçmiş ve aktif randevuları listeleme, iptal etme.
* **Arıza Bildirimi:** Bozuk makineleri yönetime anında bildirme.

### 🛡️ Yönetici (Admin) Paneli
* **Dashboard & Analiz:** Sistem kullanım istatistiklerini (Çamaşır/Kurutma oranı) grafiksel olarak görüntüleme.
* **Makine Yönetimi:** Yeni makine ekleme, silme ve bilgilerini güncelleme.
* **Bakım Modu:** Tek tuşla makineyi "Bakıma" alma (Pasif) ve tekrar "Aktif" etme.
* **Arıza Takibi:** Öğrencilerden gelen arıza bildirimlerini görüntüleme ve "Çözüldü" olarak işaretleme.

## 🛠️ Kullanılan Teknolojiler

Bu proje **Modern Yazılım Mimarisi** prensiplerine uygun olarak geliştirilmiştir.

| Alan | Teknoloji |
|---|---|
| **Frontend** | React.js (Vite), Material UI (MUI), Recharts, Axios |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | PostgreSQL (İlişkisel Veritabanı) |
| **DevOps** | Docker & Docker Compose (Konteyner Mimarisi) |
| **Güvenlik** | BCrypt (Şifreleme), JWT (Token), Middleware Koruması |

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Gereksinimler
* Node.js (v16 veya üzeri)
* Docker Desktop (Veritabanı için)

### 2. Projeyi İndirin
git clone https://github.com/sefatasdemir22/YurtCamasirhaneOtomasyonu.git
cd YurtCamasirhaneOtomasyonu

### 3. Veritabanını Başlatın (Docker)
Ana dizinde terminali açın ve şu komutu çalıştırın:
docker compose up -d

### 4. Backend'i Başlatın
Yeni bir terminalde:
cd backend
npm install
npm run dev

*Sunucu http://localhost:3000 adresinde çalışacaktır.*

### 5. Frontend'i Başlatın
Yeni bir terminalde:
cd frontend
npm install
npm run dev

*Uygulama http://localhost:5173 adresinde açılacaktır.*

## 🧪 Test Kullanıcıları

Sistemi denemek için aşağıdaki hazır kullanıcıları kullanabilirsiniz:

| Rol | Kullanıcı Adı | Şifre |
|---|---|---|
| **Yönetici (Admin)** | afes7896 | afes7896 |
| **Öğrenci** | afes78965 | afes78965 |

---
**Geliştirici:** Sefa Taşdemir
**Ders:** BİL403 Yazılım Mühendisliği - Dönem Projesig