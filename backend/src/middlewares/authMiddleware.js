const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Token'ı başlık (Header) kısmından al
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Erişim reddedildi. Token yok!' });
  }

  try {
    // 2. Token'ı doğrula (Bizim gizli anahtarımızla mı imzalanmış?)
    // "Bearer <token>" formatını temizle
    const tokenClean = token.replace('Bearer ', '');
    
    const verified = jwt.verify(tokenClean, process.env.JWT_SECRET);
    req.user = verified; // Token içindeki bilgileri (id, role, blockName) isteğe ekle
    next(); // Sorun yok, geçebilirsin
  } catch (err) {
    res.status(400).json({ error: 'Geçersiz Token!' });
  }
};

module.exports = verifyToken;