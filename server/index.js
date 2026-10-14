require('dotenv').config()

const express = require('express')
const cors = require('cors')
const pool = require('./db')
const ensureSchema = require('./migrations')
const { router: apiRouter, uploadDirectory } = require('./routes')

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(uploadDirectory, { dotfiles: 'deny', index: false }))
app.use('/api', apiRouter)

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ server: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Database health check failed:', error.message)
    res.status(503).json({ server: 'ok', database: 'disconnected' })
  }
})

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error)
    return
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    res.status(400).json({ error: 'Request body must contain valid JSON.' })
    return
  }

  if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({ error: 'Upload at most 8 images, each no larger than 5 MB.' })
    return
  }

  if (error.message === 'Only JPEG, PNG, and WebP image files are allowed.') {
    res.status(400).json({ error: error.message })
    return
  }
  if (error.status === 400) {
    res.status(400).json({ error: error.message })
    return
  }

  console.error('API request failed:', error.message)
  res.status(500).json({ error: 'The request could not be completed. Please try again.' })
})

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Backend database setup failed:', error.message)
    process.exitCode = 1
  })
