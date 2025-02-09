import { connection } from "@/util/db";

export async function getEvents(filters = {}) {
  let query = "SELECT * FROM events WHERE is_active = 1";
  const queryParams = [];

  if (filters.startDate) {
    query += " AND date >= ?";
    queryParams.push(filters.startDate);
  }

  if (filters.endDate) {
    query += " AND date <= ?";
    queryParams.push(filters.endDate);
  }

  if (filters.interest) {
    query += " AND interest LIKE ?";
    queryParams.push(`%${filters.interest}%`);
  }

  query += " ORDER BY id desc";

  const [events] = await connection.execute(query, queryParams);

  return events;
}

export async function createEvent(eventData) {
  const { title, description, date, location, interest, user_id } = eventData;

  const [result] = await connection.execute(
    "INSERT INTO events (title, description, date, location, interest, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    [title, description, date, location, interest, user_id]
  );

  return result.insertId;
}
