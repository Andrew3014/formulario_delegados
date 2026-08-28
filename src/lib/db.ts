import mysql from 'mysql2/promise';

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
       (nombres, apellido_paterno, apellido_materno, ci, club_pertenece, cargo, tiempo_en_club)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.nombres,
        data.apellido_paterno,
        data.apellido_materno,
        data.ci,
        data.club_pertenece,
        data.cargo,
        data.tiempo_en_club,
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

export interface DelegadoFormData {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  club_pertenece: string;
  cargo: string;
  tiempo_en_club: number;
}

export interface DelegadoSubmission extends DelegadoFormData {
  id: number;
  created_at: string;
  updated_at: string;
}