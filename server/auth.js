const { randomBytes, scrypt: scryptCallback, timingSafeEqual, createHash } = require('node:crypto')
const { promisify } = require('node:util')
const pool = require('./db')

const scrypt = promisify(scryptCallback)
const sessionCookieName = 'smartserve_session'
const sessionLifetimeSeconds = 60 * 60 * 24 * 7

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

async function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(':')
  if (!saltHex || !hashHex) return false

  const expectedHash = Buffer.from(hashHex, 'hex')
  const actualHash = await scrypt(password, Buffer.from(saltHex, 'hex'), expectedHash.length)
  return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash)
}

function getSessionToken(req) {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return null

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`))

  return cookie ? decodeURIComponent(cookie.slice(sessionCookieName.length + 1)) : null
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}${secure}`,
  )
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`,
  )
}

async function createSession(connection, providerId) {
  const token = randomBytes(32).toString('hex')
  await connection.execute(
    'INSERT INTO provider_sessions (provider_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))',
    [providerId, hashSessionToken(token), sessionLifetimeSeconds],
  )
  return token
}

async function requireProvider(req, res, next) {
  const token = getSessionToken(req)
  if (!token) {
    res.status(401).json({ error: 'Sign in as a provider to continue.' })
    return
  }

  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.full_name, p.email, p.phone, p.business_name
       FROM provider_sessions s
       JOIN providers p ON p.id = s.provider_id
       WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [hashSessionToken(token)],
    )

    if (rows.length === 0) {
      clearSessionCookie(res)
      res.status(401).json({ error: 'Your provider session expired. Please sign in again.' })
      return
    }

    req.provider = rows[0]
    next()
  } catch (error) {
    next(error)
  }
}

function requireProviderType(typeCode) {
  return async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 1
         FROM provider_provider_types ppt
         JOIN provider_types pt ON pt.id = ppt.provider_type_id
         WHERE ppt.provider_id = ? AND pt.code = ?
         LIMIT 1`,
        [req.provider.id, typeCode],
      )
      if (rows.length === 0) {
        res.status(403).json({ error: `Your account is not registered to create ${typeCode} listings.` })
        return
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}

function requireFrontendOrigin(req, res, next) {
  const origin = req.get('origin')
  if (origin && origin !== 'http://localhost:5173') {
    res.status(403).json({ error: 'Requests from this origin are not allowed.' })
    return
  }
  next()
}

module.exports = {
  clearSessionCookie,
  createSession,
  getSessionToken,
  hashPassword,
  hashSessionToken,
  requireFrontendOrigin,
  requireProvider,
  requireProviderType,
  setSessionCookie,
  verifyPassword,
}
