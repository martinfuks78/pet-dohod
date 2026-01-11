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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        start_date DATE,
        end_date DATE,
        program TEXT,
        address TEXT,
        what_to_bring TEXT,
        instructor_info TEXT,
        bank_account VARCHAR(100),
        variable_symbol VARCHAR(50),
        amount INTEGER
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

        -- Platební údaje
        variable_symbol VARCHAR(20),

        -- Poznámky
        notes TEXT,

        -- Status
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'

        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Přidat variable_symbol sloupec, pokud neexistuje (migrace)
    await sql`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS variable_symbol VARCHAR(20)
    `

    // Přidat couple_group_id pro propojení párů
    await sql`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS couple_group_id VARCHAR(50)
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

    // Ukázkové workshopy byly odstraněny - admin si vytváří vlastní

    console.log('✅ Database initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}

/**
 * Vytvoří novou registraci
 * Pro páry vytvoří 2 záznamy propojené přes couple_group_id
 */
export async function createRegistration(data, workshopVariableSymbol = null) {
  const isPair = data.registrationType === 'pair'

  // Pro páry vygeneruj couple_group_id
  const coupleGroupId = isPair ? `COUPLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null

  // Vytvoř první registraci (hlavní účastník)
  const result1 = await sql`
    INSERT INTO registrations (
      first_name, last_name, email, phone,
      address, city, zip,
      registration_type,
      partner_first_name, partner_last_name, partner_email,
      workshop_date, workshop_location, price,
      notes, status, couple_group_id
    ) VALUES (
      ${data.firstName}, ${data.lastName}, ${data.email}, ${data.phone},
      ${data.address || null}, ${data.city || null}, ${data.zip || null},
      ${data.registrationType},
      ${data.partnerFirstName || null}, ${data.partnerLastName || null}, ${data.partnerEmail || null},
      ${data.workshopDate}, ${data.workshopLocation}, ${data.price},
      ${data.notes || null}, 'pending', ${coupleGroupId}
    )
    RETURNING *
  `

  const registration1 = result1.rows[0]

  // Vygeneruj VS pro první registraci
  let variableSymbol1 = generateVariableSymbol(registration1.id, workshopVariableSymbol)

  await sql`
    UPDATE registrations
    SET variable_symbol = ${variableSymbol1}
    WHERE id = ${registration1.id}
  `

  // Pro páry: vytvoř druhou registraci (partner)
  let registration2 = null
  if (isPair && data.partnerFirstName && data.partnerLastName) {
    const result2 = await sql`
      INSERT INTO registrations (
        first_name, last_name, email, phone,
        address, city, zip,
        registration_type,
        partner_first_name, partner_last_name, partner_email,
        workshop_date, workshop_location, price,
        notes, status, couple_group_id
      ) VALUES (
        ${data.partnerFirstName}, ${data.partnerLastName},
        ${data.partnerEmail || data.email}, ${data.phone},
        ${data.address || null}, ${data.city || null}, ${data.zip || null},
        ${data.registrationType},
        ${data.firstName}, ${data.lastName}, ${data.email},
        ${data.workshopDate}, ${data.workshopLocation}, ${data.price},
        ${data.notes || null}, 'pending', ${coupleGroupId}
      )
      RETURNING *
    `

    registration2 = result2.rows[0]

    // Použij stejný VS pro partnera
    await sql`
      UPDATE registrations
      SET variable_symbol = ${variableSymbol1}
      WHERE id = ${registration2.id}
    `
  }

  // Vrať hlavní registraci s VS (+ info o partnerovi pokud existuje)
  return {
    ...registration1,
    variable_symbol: variableSymbol1,
    partnerRegistrationId: registration2?.id || null
  }
}

/**
 * Helper funkce pro generování variabilního symbolu
 */
function generateVariableSymbol(registrationId, workshopVariableSymbol) {
  if (workshopVariableSymbol) {
    const sequence = String(registrationId).padStart(3, '0')
    return `${workshopVariableSymbol}${sequence}`
  } else {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const sequence = String(registrationId).padStart(4, '0')
    return `${year}${month}${sequence}`
  }
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
    ORDER BY
      CASE
        WHEN start_date IS NOT NULL THEN start_date
        ELSE created_at::date
      END ASC
  `
  return result.rows
}

/**
 * Vytvoří nový workshop
 * Automaticky generuje 'date' text z start_date a end_date
 */
export async function createWorkshop(data) {
  // Automaticky vygenerovat textové datum z start_date a end_date
  let generatedDate = ''
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    const startDay = start.getDate()
    const endDay = end.getDate()
    const startMonth = start.toLocaleDateString('cs-CZ', { month: 'long' })
    const endMonth = end.toLocaleDateString('cs-CZ', { month: 'long' })
    const year = start.getFullYear()

    // Pokud jsou různé měsíce, zobraz oba
    if (startMonth !== endMonth) {
      generatedDate = `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`
    } else {
      generatedDate = `${startDay}. - ${endDay}. ${startMonth} ${year}`
    }
  } else if (data.startDate) {
    const start = new Date(data.startDate)
    generatedDate = start.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const result = await sql`
    INSERT INTO workshops (
      name, date, location, type, capacity,
      price_single, is_active,
      start_date, end_date, program, address, what_to_bring, instructor_info,
      bank_account, variable_symbol
    ) VALUES (
      ${data.name || null},
      ${generatedDate}, ${data.location}, ${data.type || 'public'},
      ${data.capacity || null},
      ${data.priceSingle},
      ${data.isActive !== undefined ? data.isActive : true},
      ${data.startDate || null},
      ${data.endDate || null},
      ${data.program || null},
      ${data.address || null},
      ${data.whatToBring || null},
      ${data.instructorInfo || null},
      ${data.bankAccount || null},
      ${data.variableSymbol || null}
    )
    RETURNING *
  `
  return result.rows[0]
}

/**
 * Aktualizuje workshop
 * Automaticky generuje 'date' text z start_date a end_date
 */
export async function updateWorkshop(id, data) {
  // Automaticky vygenerovat textové datum z start_date a end_date
  let generatedDate = ''
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    const startDay = start.getDate()
    const endDay = end.getDate()
    const startMonth = start.toLocaleDateString('cs-CZ', { month: 'long' })
    const endMonth = end.toLocaleDateString('cs-CZ', { month: 'long' })
    const year = start.getFullYear()

    // Pokud jsou různé měsíce, zobraz oba
    if (startMonth !== endMonth) {
      generatedDate = `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`
    } else {
      generatedDate = `${startDay}. - ${endDay}. ${startMonth} ${year}`
    }
  } else if (data.startDate) {
    const start = new Date(data.startDate)
    generatedDate = start.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const result = await sql`
    UPDATE workshops
    SET
      name = ${data.name || null},
      date = ${generatedDate},
      location = ${data.location},
      type = ${data.type || 'public'},
      capacity = ${data.capacity || null},
      price_single = ${data.priceSingle},
      is_active = ${data.isActive !== undefined ? data.isActive : true},
      start_date = ${data.startDate || null},
      end_date = ${data.endDate || null},
      program = ${data.program || null},
      address = ${data.address || null},
      what_to_bring = ${data.whatToBring || null},
      instructor_info = ${data.instructorInfo || null},
      bank_account = ${data.bankAccount || null},
      variable_symbol = ${data.variableSymbol || null}
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
