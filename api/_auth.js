const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquante dans les variables d\'environnement');
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function hashPassword(motDePasse) {
  const sel = await bcrypt.genSalt(10);
  return bcrypt.hash(motDePasse, sel);
}

async function comparePassword(motDePasse, hash) {
  return bcrypt.compare(motDePasse, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function getUtilisateurDepuisRequete(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

module.exports = {
  cors,
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getUtilisateurDepuisRequete,
};
