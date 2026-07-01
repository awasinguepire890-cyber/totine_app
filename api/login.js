const { query } = require('./_db');
const { cors, comparePassword, signToken } = require('./_auth');

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { telephone, mot_de_passe } = req.body;

    if (!telephone || !mot_de_passe) {
      return res.status(400).json({
        error: 'Le numéro de téléphone et le mot de passe sont requis',
      });
    }

    const telephoneNormalise = telephone.replace(/\s+/g, '');

    const { rows } = await query(
      `SELECT id, nom, telephone, mot_de_passe_hash, role
       FROM utilisateurs
       WHERE telephone = $1
       LIMIT 1`,
      [telephoneNormalise]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const utilisateur = rows[0];

    const motDePasseValide = await comparePassword(
      mot_de_passe,
      utilisateur.mot_de_passe_hash
    );

    if (!motDePasseValide) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = signToken({
      id: utilisateur.id,
      telephone: utilisateur.telephone,
      role: utilisateur.role,
    });

    return res.status(200).json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        telephone: utilisateur.telephone,
        role: utilisateur.role,
      },
    });
  } catch (err) {
    console.error('Erreur login:', err);
    return res.status(500).json({ error: 'Erreur serveur, réessaie plus tard' });
  }
};
