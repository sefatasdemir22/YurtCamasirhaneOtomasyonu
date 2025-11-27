const authService = require('../services/authService');
const Joi = require('joi');

// KAYIT OL
const register = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
    blockName: Joi.string().valid('A', 'B').required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { username, password, blockName } = req.body;
    const user = await authService.register(username, password, blockName);
    
    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu! 🎉',
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GİRİŞ YAP
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, user } = await authService.login(username, password);

    res.json({
      message: 'Giriş başarılı! 🚀',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        block_name: user.block_name
      }
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// DIŞARI AÇMA (Export)
module.exports = { register, login };