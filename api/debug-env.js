module.exports = async function handler(req, res) {
  res.status(200).json({
    DATABASE_URL_present: !!process.env.DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    JWT_SECRET_present: !!process.env.JWT_SECRET,
    JWT_SECRET_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    VERCEL_ENV: process.env.VERCEL_ENV || 'inconnu',
  });
};
