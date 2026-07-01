const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquante dans les variables d\'environnement');
}

const sql = neon(process.env.DATABASE_URL);

async function query(text, params = []) {
  const rows = await sql(text, params);
  return { rows };
}

module.exports = { query, sql };
