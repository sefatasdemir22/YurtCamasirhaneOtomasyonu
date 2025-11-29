const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (username, password, blockName) => {
  const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (userCheck.rows.length > 0) throw new Error('Bu kullanıcı adı zaten alınmış.');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await pool.query(
    'INSERT INTO users (username, password, block_name) VALUES ($1, $2, $3) RETURNING id, username, block_name, role',
    [username, hashedPassword, blockName]
  );
  return newUser.rows[0];
};

// LOGIN FONKSİYONU
const login = async (username, password) => {
  // 1. Kullanıcıyı bul
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (!user) throw new Error('Kullanıcı bulunamadı!');

  // 2. Şifreyi kontrol et
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Hatalı şifre!');

  // 3. Token oluştur (Kimlik Kartı)
  const token = jwt.sign(
    { id: user.id, role: user.role, blockName: user.block_name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } 
  );

  return { token, user };
};

module.exports = { register, login };