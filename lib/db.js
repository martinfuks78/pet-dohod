import { sql } from '@vercel/postgres'

/**
 * Inicializace databázových tabulek
 * Spusť tento skript jednou při prvním nastavení
 */
export async function initDatabase() {
  try {
    // Tabulka pro workshopy
    await sql`
      CREATE TABLE IF NOT EXISTS workshops (
        id SERIAL PRIMARY KEY,
        date VARCHAR(100) NOT NULL,
        location VARCHAR(200) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'public' nebo 'corporate'
        capacity INTEGER,
        price_single INTEGER,
        price_couple INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Tabulka pro registrace
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        workshop_id INTEGER REFERENCES workshops(id),

        -- Účastník
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address VARCHAR(300),
        city VARCHAR(100),
        zip VARCHAR(20),

        -- Typ registrace
        registration_type VARCHAR(20) NOT NULL, -- 'single' nebo 'pair'

        -- Partner (pokud je to pár)
        partner_first_name VARCHAR(100),
        partner_last_name VARCHAR(100),
        partner_email VARCHAR(200),

        -- Workshop info (denormalizováno pro snadný přístup)
        workshop_date VARCHAR(100) NOT NULL,
        workshop_location VARCHAR(200) NOT NULL,
        price VARCHAR(50) NOT NULL,

        -- Poznámky
        notes TEXT,

        -- Status
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'

        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Tabulka pro newsletter
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(200) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `

    // Vytvoř ukázkové workshopy
    await sql`
      INSERT INTO workshops (date, location, type, capacity, price_single, price_couple)
      VALUES
        ('15.-16. března 2026', 'Praha - Vinohrady', 'public', 20, 4800, 7800),
        ('12.-13. dubna 2026', 'Brno - centrum', 'public', 20, 4800, 7800),
        ('17.-18. května 2026', 'Praha - Vinohrady', 'public', 20, 4800, 7800)
      ON CONFLICT DO NOTHING
    `

    console.log('✅ Database initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}

/**
 * Vytvoří novou registraci
 */
export async function createRegistration(data) {
  const result = await sql`
    INSERT INTO registrations (
      first_name, last_name, email, phone,
      address, city, zip,
      registration_type,
      partner_first_name, partner_last_name, partner_email,
      workshop_date, workshop_location, price,
      notes, status
    ) VALUES (
      ${data.firstName}, ${data.lastName}, ${data.email}, ${data.phone},
      ${data.address || null}, ${data.city || null}, ${data.zip || null},
      ${data.registrationType},
      ${data.partnerFirstName || null}, ${data.partnerLastName || null}, ${data.partnerEmail || null},
      ${data.workshopDate}, ${data.workshopLocation}, ${data.price},
      ${data.notes || null}, 'pending'
    )
    RETURNING *
  `
  return result.rows[0]
}

/**
 * Získá všechny registrace
 */
export async function getAllRegistrations() {
  const result = await sql`
    SELECT * FROM registrations
    ORDER BY created_at DESC
  `
  return result.rows
}

/**
 * Aktualizuje status registrace
 */
export async function updateRegistrationStatus(id, status) {
  await sql`
    UPDATE registrations
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `
}

/**
 * Smaže registraci
 */
export async function deleteRegistration(id) {
  await sql`
    DELETE FROM registrations
    WHERE id = ${id}
  `
}

/**
 * Přidá email do newsletteru
 */
export async function subscribeToNewsletter(email) {
  try {
    await sql`
      INSERT INTO newsletter_subscribers (email)
      VALUES (${email})
      ON CONFLICT (email) DO UPDATE
      SET is_active = true
    `
    return { success: true }
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Email už je přihlášený' }
    }
    throw error
  }
}

/**
 * Získá všechny workshopy
 */
export async function getAllWorkshops() {
  const result = await sql`
    SELECT * FROM workshops
    WHERE is_active = true
    ORDER BY created_at DESC
  `
  return result.rows
}

/**
 * Vytvoří nový workshop
 */
export async function createWorkshop(data) {
  const result = await sql`
    INSERT INTO workshops (
      date, location, type, capacity,
      price_single, price_couple, is_active
    ) VALUES (
      ${data.date}, ${data.location}, ${data.type || 'public'},
      ${data.capacity || null},
      ${data.priceSingle}, ${data.priceCouple},
      ${data.isActive !== undefined ? data.isActive : true}
    )
    RETURNING *
  `
  return result.rows[0]
}

/**
 * Aktualizuje workshop
 */
export async function updateWorkshop(id, data) {
  const result = await sql`
    UPDATE workshops
    SET
      date = ${data.date},
      location = ${data.location},
      type = ${data.type || 'public'},
      capacity = ${data.capacity || null},
      price_single = ${data.priceSingle},
      price_couple = ${data.priceCouple},
      is_active = ${data.isActive !== undefined ? data.isActive : true}
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0]
}

/**
 * Smaže workshop (soft delete - nastaví is_active na false)
 */
export async function deleteWorkshop(id) {
  await sql`
    UPDATE workshops
    SET is_active = false
    WHERE id = ${id}
  `
}

/**
 * Získá počet registrací pro konkrétní workshop
 */
export async function getWorkshopRegistrationCount(workshopDate, workshopLocation) {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM registrations
    WHERE workshop_date = ${workshopDate}
    AND workshop_location = ${workshopLocation}
    AND status != 'cancelled'
  `
  return parseInt(result.rows[0].count)
}
