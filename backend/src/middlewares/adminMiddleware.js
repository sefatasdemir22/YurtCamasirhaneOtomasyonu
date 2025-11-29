const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    res.status(403).json({ error: 'Erişim Reddedildi! Bu işlem sadece Yöneticiler içindir.' });
  }
};

module.exports = adminCheck;