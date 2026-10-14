const { randomUUID } = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const multer = require('multer')
const pool = require('./db')
const {
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
} = require('./auth')

const router = require('express').Router()
const uploadDirectory = path.join(__dirname, 'uploads')
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter(req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, and WebP image files are allowed.'))
      return
    }
    callback(null, true)
  },
})

const serviceCategoryNames = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  'home-repair': 'Home repair',
  'appliance-repair': 'Appliance repair',
  cleaning: 'Cleaning',
  carpentry: 'Carpentry',
  painting: 'Painting',
  hvac: 'HVAC / air conditioning',
  landscaping: 'Landscaping / gardening',
  other: 'Other',
}

const propertyTypeNames = {
  apartment: 'Apartment / flat',
  'independent-house': 'Independent house',
  villa: 'Villa',
  land: 'Land / plot',
  commercial: 'Commercial property',
  office: 'Office',
  other: 'Other',
}

function isValidIndianPhone(phone) {
  return typeof phone === 'string' && /^[6-9]\d{9}$/.test(phone)
}

function text(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
    ? value.trim()
    : null
}

function arrayOfStrings(value, maxItems, maxLength) {
  if (!Array.isArray(value) || value.length > maxItems) return null
  const values = value.map((item) => text(item, maxLength))
  return values.every(Boolean) ? [...new Set(values)] : null
}

function positiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function imageExtension(file) {
  const bytes = file.buffer
  if (file.mimetype === 'image/jpeg'
      && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (
    file.mimetype === 'image/png'
      && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) return 'png'
  if (file.mimetype === 'image/webp'
      && bytes.toString('ascii', 0, 4) === 'RIFF'
      && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

async function saveImages(connection, tableName, listingId, files) {
  const allowedTables = {
    property_listing_images: 'property_listing_id',
    service_listing_images: 'service_listing_id',
  }
  const foreignKey = allowedTables[tableName]
  if (!foreignKey) throw new Error('Unsupported listing image table.')

  const savedPaths = []
  if (files.length === 0) return savedPaths

  try {
    await fs.mkdir(uploadDirectory, { recursive: true })
    for (const [index, file] of files.entries()) {
      const extension = imageExtension(file)
      if (!extension) {
        const error = new Error('One or more files are not valid JPEG, PNG, or WebP images.')
        error.status = 400
        throw error
      }

      const filename = `${randomUUID()}.${extension}`
      const imagePath = path.join(uploadDirectory, filename)
      await fs.writeFile(imagePath, file.buffer, { flag: 'wx' })
      savedPaths.push(imagePath)
      await connection.execute(
        `INSERT INTO ${tableName} (${foreignKey}, image_url, sort_order) VALUES (?, ?, ?)`,
        [listingId, `/uploads/${filename}`, index],
      )
    }
    return savedPaths
  } catch (error) {
    await Promise.all(savedPaths.map((imagePath) => fs.unlink(imagePath).catch(() => {})))
    throw error
  }
}

router.post('/auth/register', requireFrontendOrigin, async (req, res, next) => {
  const fullName = text(req.body.fullName, 150)
  const email = text(req.body.email, 254)?.toLowerCase()
  const phone = req.body.phone
  const businessName = text(req.body.businessName, 200)
  const profileDescription = text(req.body.description, 5000)
  const password = req.body.password
  const providerType = req.body.providerType
  const roles = arrayOfStrings(req.body.propertyProviderRoles, 7, 30)
  const categories = arrayOfStrings(req.body.serviceCategories, 10, 100)
  const serviceAreas = arrayOfStrings(req.body.serviceAreas, 50, 200)
  const propertyLocations = arrayOfStrings(req.body.propertyLocations, 50, 200)
  const propertyCategories = arrayOfStrings(req.body.propertyCategories, 10, 100)
  const providesServices = providerType === 'service' || providerType === 'both'
  const providesProperties = providerType === 'property' || providerType === 'both'

  if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || !isValidIndianPhone(phone) || !businessName
      || !['service', 'property', 'both'].includes(providerType)
      || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    res.status(400).json({ error: 'Check your name, email, 10-digit mobile number, provider type, and password (at least 8 characters).' })
    return
  }
  if ((providesProperties && (!roles?.length || !propertyLocations?.length || !propertyCategories?.length))
      || (providesServices && (!categories?.length || !serviceAreas?.length))) {
    res.status(400).json({ error: 'Select the required provider roles, categories, and service/property locations.' })
    return
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const passwordHash = await hashPassword(password)
    const [providerResult] = await connection.execute(
      `INSERT INTO providers
        (full_name, email, phone, business_name, password_hash, profile_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone, businessName, passwordHash, profileDescription],
    )
    const providerId = providerResult.insertId

    const typeCodes = providerType === 'both' ? ['service', 'property'] : [providerType]
    const [providerTypeRows] = await connection.query(
      'SELECT id, code FROM provider_types WHERE code IN (?)',
      [typeCodes],
    )
    if (providerTypeRows.length !== typeCodes.length) {
      throw new Error('Provider type lookup data is missing. Check the provider_types table.')
    }
    for (const typeRow of providerTypeRows) {
      await connection.execute(
        'INSERT INTO provider_provider_types (provider_id, provider_type_id) VALUES (?, ?)',
        [providerId, typeRow.id],
      )
    }

    if (providesProperties) {
      const [roleRows] = await connection.query(
        'SELECT id, code FROM property_provider_roles WHERE code IN (?)',
        [roles],
      )
      if (roleRows.length !== roles.length) {
        res.status(400).json({ error: 'One or more selected property roles are invalid.' })
        await connection.rollback()
        return
      }
      for (const role of roleRows) {
        await connection.execute(
          'INSERT INTO provider_property_roles (provider_id, role_id) VALUES (?, ?)',
          [providerId, role.id],
        )
      }
      for (const location of propertyLocations) {
        await connection.execute(
          'INSERT INTO provider_property_locations (provider_id, location) VALUES (?, ?)',
          [providerId, location],
        )
      }
      for (const category of propertyCategories) {
        await connection.execute(
          'INSERT INTO provider_property_categories (provider_id, category) VALUES (?, ?)',
          [providerId, category],
        )
      }
    }

    if (providesServices) {
      const normalizedCategories = categories.map((category) => serviceCategoryNames[category.toLowerCase()] || category)
      const [categoryRows] = await connection.query(
        'SELECT id, name FROM service_categories WHERE name IN (?)',
        [normalizedCategories],
      )
      if (categoryRows.length !== normalizedCategories.length) {
        res.status(400).json({ error: 'One or more selected service categories are invalid.' })
        await connection.rollback()
        return
      }
      for (const category of categoryRows) {
        await connection.execute(
          'INSERT INTO provider_service_categories (provider_id, category_id) VALUES (?, ?)',
          [providerId, category.id],
        )
      }
      for (const area of serviceAreas) {
        await connection.execute(
          'INSERT INTO provider_service_areas (provider_id, area) VALUES (?, ?)',
          [providerId, area],
        )
      }
    }

    const sessionToken = await createSession(connection, providerId)
    await connection.commit()
    setSessionCookie(res, sessionToken)
    res.status(201).json({
      provider: { id: providerId, fullName, email, businessName },
    })
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'An account with this email or phone number already exists.' })
      return
    }
    next(error)
  } finally {
    connection.release()
  }
})

router.post('/auth/login', requireFrontendOrigin, async (req, res) => {
  const email = text(req.body.email, 254)?.toLowerCase()
  const password = req.body.password
  if (!email || typeof password !== 'string' || password.length === 0) {
    res.status(400).json({ error: 'Enter your email and password.' })
    return
  }

  const [providers] = await pool.execute(
    `SELECT id, full_name, email, business_name, password_hash
     FROM providers WHERE email = ? LIMIT 1`,
    [email],
  )
  const provider = providers[0]
  if (!provider?.password_hash || !(await verifyPassword(password, provider.password_hash))) {
    res.status(401).json({ error: 'Email or password is incorrect.' })
    return
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(
      'DELETE FROM provider_sessions WHERE provider_id = ? AND expires_at <= UTC_TIMESTAMP()',
      [provider.id],
    )
    const sessionToken = await createSession(connection, provider.id)
    await connection.commit()
    setSessionCookie(res, sessionToken)
    res.json({
      provider: {
        id: provider.id,
        fullName: provider.full_name,
        email: provider.email,
        businessName: provider.business_name,
      },
    })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

router.get('/auth/me', requireProvider, (req, res) => {
  const { id, full_name: fullName, email, business_name: businessName } = req.provider
  res.json({ provider: { id, fullName, email, businessName } })
})

router.post('/auth/logout', requireFrontendOrigin, async (req, res) => {
  const token = getSessionToken(req)
  if (token) {
    await pool.execute('DELETE FROM provider_sessions WHERE token_hash = ?', [hashSessionToken(token)])
  }
  clearSessionCookie(res)
  res.status(204).end()
})

router.post(
  '/property-listings',
  requireFrontendOrigin,
  requireProvider,
  requireProviderType('property'),
  imageUpload.array('photos', 8),
  async (req, res, next) => {
  const {
    title, purpose, furnishingStatus, bedrooms, bathrooms, city, locality, address, description,
  } = req.body
  const propertyType = propertyTypeNames[req.body.category]
  const price = positiveNumber(req.body.price)
  const area = positiveNumber(req.body.area)
  const validPurpose = ['sale', 'rent', 'lease'].includes(purpose)
  const validFurnishing = ['unfurnished', 'semi-furnished', 'fully-furnished'].includes(furnishingStatus)
  if (!text(title, 200) || !propertyType || !validPurpose || !validFurnishing
      || !price || !area || !text(city, 100) || !text(locality, 150)
      || !text(address, 10000) || !text(description, 10000)) {
    res.status(400).json({ error: 'Complete all required property listing fields with valid values.' })
    return
  }

  const connection = await pool.getConnection()
  const savedPaths = []
  try {
    await connection.beginTransaction()
    const [types] = await connection.execute(
      'SELECT id FROM property_types WHERE name = ? LIMIT 1',
      [propertyType],
    )
    if (types.length === 0) {
      res.status(500).json({ error: 'The selected property type is not configured in the database.' })
      await connection.rollback()
      return
    }
    const bedroomValue = bedrooms === 'na' || !bedrooms ? null : bedrooms
    const bathroomValue = bathrooms === 'na' || !bathrooms ? null : bathrooms
    const [result] = await connection.execute(
      `INSERT INTO property_listings
        (provider_id, property_type_id, title, purpose, furnishing_status, price,
         area_sqft, bedrooms, bathrooms, city, locality, address, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.provider.id, types[0].id, title.trim(), purpose, furnishingStatus, price,
        area, bedroomValue, bathroomValue, city.trim(), locality.trim(), address.trim(),
        description.trim(),
      ],
    )
    const files = req.files || []
    savedPaths.push(...await saveImages(connection, 'property_listing_images', result.insertId, files))
    await connection.commit()
    res.status(201).json({ listing: { id: result.insertId, status: 'active' } })
  } catch (error) {
    await connection.rollback()
    await Promise.all(savedPaths.map((imagePath) => fs.unlink(imagePath).catch(() => {})))
    next(error)
  } finally {
    connection.release()
  }
  },
)

router.post(
  '/service-listings',
  requireFrontendOrigin,
  requireProvider,
  requireProviderType('service'),
  imageUpload.array('photos', 8),
  async (req, res, next) => {
  const title = text(req.body.title, 200)
  const categoryName = serviceCategoryNames[req.body.category]
  const price = positiveNumber(req.body.price)
  const pricingUnit = req.body.pricingUnit
  const description = text(req.body.description, 10000)
  const areas = arrayOfStrings(
    Array.isArray(req.body.serviceAreas) ? req.body.serviceAreas : [req.body.serviceAreas],
    50,
    200,
  )
  if (!title || !categoryName || !price || !['visit', 'hour', 'day', 'job'].includes(pricingUnit)
      || !description || !areas?.length) {
    res.status(400).json({ error: 'Complete all required service listing fields and add at least one service area.' })
    return
  }

  const connection = await pool.getConnection()
  const savedPaths = []
  try {
    await connection.beginTransaction()
    const [categories] = await connection.execute(
      'SELECT id FROM service_categories WHERE name = ? LIMIT 1',
      [categoryName],
    )
    if (categories.length === 0) {
      res.status(500).json({ error: 'The selected service category is not configured in the database.' })
      await connection.rollback()
      return
    }
    const [result] = await connection.execute(
      `INSERT INTO service_listings
        (provider_id, category_id, title, price, pricing_unit, description, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [req.provider.id, categories[0].id, title, price, pricingUnit, description],
    )
    for (const area of areas) {
      await connection.execute(
        'INSERT INTO service_listing_areas (service_listing_id, area) VALUES (?, ?)',
        [result.insertId, area],
      )
    }
    const files = req.files || []
    savedPaths.push(...await saveImages(connection, 'service_listing_images', result.insertId, files))
    await connection.commit()
    res.status(201).json({ listing: { id: result.insertId, status: 'active' } })
  } catch (error) {
    await connection.rollback()
    await Promise.all(savedPaths.map((imagePath) => fs.unlink(imagePath).catch(() => {})))
    next(error)
  } finally {
    connection.release()
  }
  },
)

router.get('/property-listings/mine', requireProvider, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT l.id, l.title, t.name AS type, l.purpose, l.price, l.city, l.locality,
            l.status, l.created_at AS createdAt
     FROM property_listings l
     JOIN property_types t ON t.id = l.property_type_id
     WHERE l.provider_id = ?
     ORDER BY l.created_at DESC`,
    [req.provider.id],
  )
  res.json({ listings: rows })
})

router.get('/service-listings/mine', requireProvider, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT l.id, l.title, c.name AS category, l.price, l.pricing_unit AS pricingUnit,
            l.status, l.created_at AS createdAt
     FROM service_listings l
     JOIN service_categories c ON c.id = l.category_id
     WHERE l.provider_id = ?
     ORDER BY l.created_at DESC`,
    [req.provider.id],
  )
  res.json({ listings: rows })
})

router.post('/property-listings/:id/status', requireFrontendOrigin, requireProvider, async (req, res) => {
  const listingId = Number(req.params.id)
  const status = req.body.status
  if (!Number.isSafeInteger(listingId) || listingId < 1 || !['active', 'paused'].includes(status)) {
    res.status(400).json({ error: 'Choose a valid property listing and status.' })
    return
  }

  const [result] = await pool.execute(
    'UPDATE property_listings SET status = ? WHERE id = ? AND provider_id = ?',
    [status, listingId, req.provider.id],
  )
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'Property listing not found.' })
    return
  }
  res.json({ listing: { id: listingId, status } })
})

router.get('/property-listings', async (req, res) => {
  const conditions = ['l.status = ?']
  const parameters = ['active']
  const query = text(req.query.q, 200)
  const type = propertyTypeNames[req.query.type]
  const purpose = ['sale', 'rent', 'lease'].includes(req.query.purpose) ? req.query.purpose : null

  if (query) {
    const terms = query.toLowerCase().split(/\s+/).filter(
      (term) => !['in', 'near', 'at', 'the', 'a', 'an', 'for'].includes(term),
    )
    for (const term of terms) {
      conditions.push('(l.title LIKE ? OR l.city LIKE ? OR l.locality LIKE ? OR l.description LIKE ? OR t.name LIKE ?)')
      const search = `%${term}%`
      parameters.push(search, search, search, search, search)
    }
  }
  if (type) {
    conditions.push('t.name = ?')
    parameters.push(type)
  }
  if (purpose) {
    conditions.push('l.purpose = ?')
    parameters.push(purpose)
  }

  const [rows] = await pool.execute(
    `SELECT l.id, l.title, t.name AS type, l.purpose, l.furnishing_status AS furnishingStatus,
            l.price, l.area_sqft AS areaSqft, l.bedrooms, l.bathrooms, l.city, l.locality,
            l.description, p.business_name AS providerName,
            (SELECT image_url FROM property_listing_images i
             WHERE i.property_listing_id = l.id ORDER BY i.sort_order LIMIT 1) AS imageUrl
     FROM property_listings l
     JOIN property_types t ON t.id = l.property_type_id
     JOIN providers p ON p.id = l.provider_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY l.created_at DESC
     LIMIT 100`,
    parameters,
  )
  res.json({ listings: rows })
})

router.get('/service-listings', async (req, res) => {
  const conditions = ['l.status = ?']
  const parameters = ['active']
  const query = text(req.query.q, 200)
  const category = serviceCategoryNames[req.query.category]
  if (query) {
    const terms = query.toLowerCase().split(/\s+/).filter(
      (term) => !['in', 'near', 'at', 'the', 'a', 'an', 'for'].includes(term),
    )
    for (const term of terms) {
      conditions.push('(l.title LIKE ? OR c.name LIKE ? OR a.area LIKE ? OR l.description LIKE ? OR p.business_name LIKE ?)')
      const search = `%${term}%`
      parameters.push(search, search, search, search, search)
    }
  }
  if (category) {
    conditions.push('c.name = ?')
    parameters.push(category)
  }

  const [rows] = await pool.execute(
    `SELECT l.id, l.title, c.name AS category, l.price, l.pricing_unit AS pricingUnit,
           l.description, p.business_name AS providerName, p.phone AS contactPhone,
           l.created_at AS createdAt,
            GROUP_CONCAT(DISTINCT a.area ORDER BY a.area SEPARATOR ', ') AS serviceAreas,
            (SELECT image_url FROM service_listing_images i
             WHERE i.service_listing_id = l.id ORDER BY i.sort_order LIMIT 1) AS imageUrl
     FROM service_listings l
     JOIN service_categories c ON c.id = l.category_id
     JOIN providers p ON p.id = l.provider_id
     LEFT JOIN service_listing_areas a ON a.service_listing_id = l.id
     WHERE ${conditions.join(' AND ')}
     GROUP BY l.id, c.name, p.business_name, p.phone
     ORDER BY l.created_at DESC
     LIMIT 100`,
    parameters,
  )
  res.json({ listings: rows })
})

module.exports = { router, uploadDirectory }
