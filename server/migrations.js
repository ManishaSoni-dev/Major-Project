const pool = require('./db')

async function ensureSchema() {
  const [columns] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'providers'`,
  )

  const providerColumns = new Set(columns.map((column) => column.COLUMN_NAME))
  if (!providerColumns.has('password_hash')) {
    await pool.query('ALTER TABLE providers ADD COLUMN password_hash VARCHAR(255) NULL AFTER business_name')
  }
  if (!providerColumns.has('profile_description')) {
    await pool.query('ALTER TABLE providers ADD COLUMN profile_description TEXT NULL')
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provider_sessions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      provider_id BIGINT UNSIGNED NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_provider_sessions_expiry (expires_at),
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provider_property_categories (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      provider_id BIGINT UNSIGNED NOT NULL,
      category VARCHAR(100) NOT NULL,
      UNIQUE KEY uq_provider_property_category (provider_id, category),
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_comments (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NULL,
      email VARCHAR(254) NULL,
      message VARCHAR(2000) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_community_comments_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  const [commentColumns] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'community_comments'`,
  )
  if (!commentColumns.some((column) => column.COLUMN_NAME === 'name')) {
    await pool.query('ALTER TABLE community_comments ADD COLUMN name VARCHAR(100) NULL AFTER id')
  }
}

module.exports = ensureSchema
