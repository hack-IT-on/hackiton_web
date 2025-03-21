import { connection } from "@/util/db";

/**
 * Get events with optional filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} - Array of event objects
 */
export async function getEvents(filters = {}) {
  try {
    let query = "SELECT * FROM events WHERE 1 = 1";
    const queryParams = [];
    let paramCounter = 1;

    if (filters.startDate) {
      query += ` AND date >= $${paramCounter}`;
      queryParams.push(filters.startDate);
      paramCounter++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramCounter}`;
      queryParams.push(filters.endDate);
      paramCounter++;
    }

    if (filters.interest) {
      query += ` AND interest ILIKE $${paramCounter}`;
      queryParams.push(`%${filters.interest}%`);
      paramCounter++;
    }

    query += " ORDER BY date DESC";

    const result = await connection.query(query, queryParams);
    return result.rows;
  } catch (error) {
    console.error("Database error in getEvents:", error);
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
}

/**
 * Create a new event
 * @param {Object} eventData - Event data object
 * @returns {Promise<number>} - ID of the created event
 */
export async function createEvent(eventData) {
  try {
    const { title, description, date, location, interest, user_id } = eventData;

    // Validate required fields
    if (!title || !date || !location || !user_id) {
      throw new Error("Missing required event fields");
    }

    const result = await connection.query(
      `INSERT INTO events (
        title, 
        description, 
        date, 
        location, 
        interest, 
        user_id, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [title, description, date, location, interest, user_id]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error("Database error in createEvent:", error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

/**
 * Get a single event by ID
 * @param {number} id - Event ID
 * @returns {Promise<Object|null>} - Event object or null if not found
 */
export async function getEventById(id) {
  try {
    const result = await connection.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Database error in getEventById:", error);
    throw new Error(`Failed to fetch event: ${error.message}`);
  }
}
