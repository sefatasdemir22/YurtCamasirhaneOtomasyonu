-- Eğer varsa eski tabloları temizle
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS machines;
DROP TABLE IF EXISTS users;

-- Kullanıcılar Tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    block_name VARCHAR(10) NOT NULL,
    role VARCHAR(10) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Makineler Tablosu
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    block_name VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'wash' veya 'dry'
    machine_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);

-- Randevular Tablosu
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    machine_id INT REFERENCES machines(id),
    date DATE NOT NULL,
    slot_start TIME NOT NULL,
    slot_end TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(machine_id, date, slot_start)
);

-- Örnek Makineleri Ekle (A ve B Blok)
INSERT INTO machines (block_name, type, machine_number) VALUES 
('A', 'wash', 1), ('A', 'wash', 2), ('A', 'dry', 1), ('A', 'dry', 2),
('B', 'wash', 1), ('B', 'wash', 2), ('B', 'dry', 1), ('B', 'dry', 2);