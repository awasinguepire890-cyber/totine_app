const { query } = require('./_db');
const { cors, hashPassword, signToken } = require('./_auth');

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { nom, telephone, mot_de_passe } = req.body;

    if (!nom || !telephone || !mot_de_passe) {
      return res.status(400).json({
        error: 'Le nom, le téléphone et le mot de passe sont requis',
      });
    }

    if (mot_de_passe.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    const telephoneNormalise = telephone.replace(/\s+/g, '');

    const existant = await query(
      `SELECT id FROM utilisateurs WHERE telephone = $1 LIMIT 1`,
      [telephoneNormalise]
    );

    if (existant.rows.length > 0) {
      return res.status(409).json({ error: 'Ce numéro est déjà enregistré' });
    }

    const motDePasseHash = await hashPassword(mot_de_passe);

    const { rows } = await query(
      `INSERT INTO utilisateurs (nom, telephone, mot_de_passe_hash, role)
       VALUES ($1, $2, $3, 'membre')
       RETURNING id, nom, telephone, role`,
      [nom, telephoneNormalise, motDePasseHash]
    );

    const nouvelUtilisateur = rows[0];

    const token = signToken({
      id: nouvelUtilisateur.id,
      telephone: nouvelUtilisateur.telephone,
      role: nouvelUtilisateur.role,
    });

    return res.status(201).json({
      token,
      utilisateur: nouvelUtilisateur,
    });
  } catch (err) {
    console.error('Erreur register:', err);
    return res.status(500).json({ error: 'Erreur serveur, réessaie plus tard' });
  }
};
