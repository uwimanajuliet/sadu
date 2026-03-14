import db from '../config/db.js';

export const getAds = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ads.*, categories.name AS category_name
      FROM ads
      LEFT JOIN categories ON ads.category_id = categories.id
      ORDER BY ads.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('getAds error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT ads.*, categories.name AS category_name
      FROM ads
      LEFT JOIN categories ON ads.category_id = categories.id
      WHERE ads.type = ?
      ORDER BY ads.created_at DESC
    `, [type]);
    res.json(rows);
  } catch (error) {
    console.error('getAdsByType error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT ads.*, categories.name AS category_name
      FROM ads
      LEFT JOIN categories ON ads.category_id = categories.id
      WHERE ads.category_id = ?
      ORDER BY ads.created_at DESC
    `, [categoryId]);
    res.json(rows);
  } catch (error) {
    console.error('getAdsByCategory error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAd = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT ads.*, categories.name AS category_name
      FROM ads
      LEFT JOIN categories ON ads.category_id = categories.id
      WHERE ads.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Ad not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('getAd error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createAd = async (req, res) => {
  const { title, description, category_id, type, location, contact_info, google_form_link, deadline } = req.body;
  const image = req.file ? req.file.filename : null;

  console.log('Create ad body:', req.body);
  console.log('Create ad file:', req.file);

  if (!title || !type) {
    return res.status(400).json({ message: 'Title and type are required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ads (title, description, category_id, type, location, contact_info, image, google_form_link, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        category_id || null,
        type,
        location || null,
        contact_info || null,
        image,
        google_form_link || null,
        deadline || null
      ]
    );
    res.status(201).json({ message: 'Ad created', id: result.insertId });
  } catch (error) {
    console.error('createAd error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAd = async (req, res) => {
  const { id } = req.params;
  const { title, description, category_id, type, location, contact_info, google_form_link, deadline } = req.body;
  const image = req.file ? req.file.filename : null;

  console.log('Update ad body:', req.body);

  try {
    const [existing] = await db.query('SELECT * FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Ad not found' });

    const updatedImage = image || existing[0].image;

    await db.query(
      `UPDATE ads SET title=?, description=?, category_id=?, type=?, location=?, contact_info=?, image=?, google_form_link=?, deadline=?
       WHERE id=?`,
      [
        title || existing[0].title,
        description || existing[0].description,
        category_id || existing[0].category_id,
        type || existing[0].type,
        location || existing[0].location,
        contact_info || existing[0].contact_info,
        updatedImage,
        google_form_link || existing[0].google_form_link,
        deadline || existing[0].deadline,
        id
      ]
    );
    res.json({ message: 'Ad updated' });
  } catch (error) {
    console.error('updateAd error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAd = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM ads WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ad not found' });
    res.json({ message: 'Ad deleted' });
  } catch (error) {
    console.error('deleteAd error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};