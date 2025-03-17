import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const userId = searchParams.get("userId");

  let query = "SELECT * FROM projects WHERE 1=1";
  const values = [];

  if (category && category !== "all") {
    query += " AND category = $1";
    values.push(category);
  }

  if (search) {
    query += " AND (title LIKE $2 OR description LIKE ?)";
    values.push(`%${search}%`, `%${search}%`);
  }

  if (userId) {
    query += " AND user_id = $3";
    values.push(userId);
  }

  query +=
    sort === "newest" ? " ORDER BY createdAt DESC" : " ORDER BY upvotes DESC";

  const projects = await connection.query(query, values);
  return NextResponse.json(projects.rows);
}

export async function POST(request) {
  const user = await getCurrentUser();
  //   const session = await getServerSession(authOptions)
  //   if (!session?.user) {
  //     return new NextResponse("Unauthorized", { status: 401 })
  //   }

  const data = await request.json();
  const { title, description, category, technologies, githubUrl, demoUrl } =
    data;

  const query = `
    INSERT INTO projects (
      id, title, description, 
      author, category, technologies, githubUrl, 
      demoUrl, user_id, createdAt
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
  `;

  const values = [
    `proj-${Date.now()}`,
    title,
    description,
    user.name,
    category,
    JSON.stringify(technologies),
    githubUrl,
    demoUrl,
    user.id,
  ];

  await connection.query(query, values);
  return new NextResponse("Project created", { status: 201 });
}
