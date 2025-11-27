const adminCheck = (req, res, next) => {
  // authMiddleware zaten req.user bilgisini doldurmuştu
  if (req.user && req.user.role === 'admin') {
    next(); // Geç patron, yetkin var.
  } else {
    res.status(403).json({ error: 'Erişim Reddedildi! Bu işlem sadece Yöneticiler içindir.' });
  }
};

module.exports = adminCheck;