import { Pool } from "pg";

const connectionString = process.env.DATABASE_CONNECTION_STRING;

export const connection = new Pool({
  connectionString,
});

export async function query(sql, params) {
  try {
    const rows = await connection.query(sql, params);
    return rows.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Database error occurred");
  }
}

export async function paginatedQuery(
  sql,
  countSql,
  params = [],
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;
  const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
  const paginatedParams = [...params, limit, offset];

  const [rows] = await connection.execute(paginatedSql, paginatedParams);
  const [countResult] = await connection.execute(countSql, params);
  const totalCount = countResult[0].total;

  return {
    data: rows,
    pagination: {
      total: totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page,
      perPage: limit,
    },
  };
}
