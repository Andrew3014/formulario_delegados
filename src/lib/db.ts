import mysql from 'mysql2/promise';
import { normalizeFullName, normalizeSentence } from './validation';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'basketbol_cochabamba_delegados',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS delegados_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombres VARCHAR(100) NOT NULL,
        apellido_paterno VARCHAR(100) NOT NULL,
        apellido_materno VARCHAR(100) NOT NULL,
        ci VARCHAR(20) NOT NULL,
        club_pertenece VARCHAR(200) NOT NULL,
        cargo VARCHAR(100) NOT NULL,
        tiempo_en_club INT NOT NULL,
        telefono VARCHAR(14) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
}

export async function submitDelegadoForm(data: DelegadoFormData) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO delegados_submissions 
       (nombres, apellido_paterno, apellido_materno, ci, club_pertenece, cargo, tiempo_en_club, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizeFullName(data.nombres),
        normalizeFullName(data.apellido_paterno),
        normalizeFullName(data.apellido_materno),
        data.ci.trim(),
        normalizeSentence(data.club_pertenece),
        normalizeSentence(data.cargo),
        data.tiempo_en_club,
        data.telefono,
      ]
    );
    return result;
  } finally {
    connection.release();
  }
}

export async function getAllDelegados() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM delegados_submissions ORDER BY apellido_paterno ASC, apellido_materno ASC, nombres ASC`
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getDelegadoById(id: number) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM delegados_submissions WHERE id = ?`,
      [id]
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function deleteAllDelegados() {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(`TRUNCATE TABLE delegados_submissions`);
    return result;
  } finally {
    connection.release();
  }
}

export async function findDuplicateDelegado(data: DelegadoFormData): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM delegados_submissions WHERE ci = ?`,
      [data.ci.trim()]
    );
    const list = rows as DelegadoFormData[];
    const norm = {
      nombres: normalizeFullName(data.nombres),
      apellido_paterno: normalizeFullName(data.apellido_paterno),
      apellido_materno: normalizeFullName(data.apellido_materno),
      ci: data.ci.trim(),
      club_pertenece: normalizeSentence(data.club_pertenece),
      cargo: normalizeSentence(data.cargo),
      tiempo_en_club: data.tiempo_en_club,
    };
    return list.some((row) =>
      row.nombres === norm.nombres &&
      row.apellido_paterno === norm.apellido_paterno &&
      row.apellido_materno === norm.apellido_materno &&
      row.ci.trim() === norm.ci &&
      row.club_pertenece === norm.club_pertenece &&
      row.cargo === norm.cargo &&
      row.tiempo_en_club === norm.tiempo_en_club
    );
  } finally {
    connection.release();
  }
}

export interface DelegadoFormData {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  club_pertenece: string;
  cargo: string;
  tiempo_en_club: number;
  telefono: string;
}

export interface DelegadoSubmission extends DelegadoFormData {
  id: number;
  created_at: string;
  updated_at: string;
}