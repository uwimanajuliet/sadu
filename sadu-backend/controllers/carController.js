import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const getCars = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cars ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAvailableCars = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cars WHERE status = 'available' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Car not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCar = async (req, res) => {
  try {
    const { name, brand, model, year, price_per_day, seats, transmission, fuel_type, description, status } = req.body;
    const image = req.file ? req.file.filename : null;
    const [result] = await db.query(
      `INSERT INTO cars (name, brand, model, year, price_per_day, seats, transmission, fuel_type, image, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, model, year, price_per_day, seats, transmission, fuel_type, image, description, status || 'available']
    );
    res.status(201).json({ id: result.insertId, message: 'Car created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    const { name, brand, model, year, price_per_day, seats, transmission, fuel_type, description, status } = req.body;
    const image = req.file ? req.file.filename : null;

    if (image) {
      const [rows] = await db.query('SELECT image FROM cars WHERE id = ?', [req.params.id]);
      if (rows.length && rows[0].image) {
        const oldPath = path.join(__dirname, '../uploads', rows[0].image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    await db.query(
      `UPDATE cars SET name=?, brand=?, model=?, year=?, price_per_day=?, seats=?,
       transmission=?, fuel_type=?, description=?, status=?
       ${image ? ', image=?' : ''}
       WHERE id=?`,
      image
        ? [name, brand, model, year, price_per_day, seats, transmission, fuel_type, description, status, image, req.params.id]
        : [name, brand, model, year, price_per_day, seats, transmission, fuel_type, description, status, req.params.id]
    );
    res.json({ message: 'Car updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT image FROM cars WHERE id = ?', [req.params.id]);
    if (rows.length && rows[0].image) {
      const imgPath = path.join(__dirname, '../uploads', rows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};