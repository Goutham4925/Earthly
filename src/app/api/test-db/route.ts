import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getSanitizedDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    const u = new URL(databaseUrl);
    // `sslmode` in the connection string can force verification behavior depending on parsing libs.
    // We want to fully control TLS in code for this health-check endpoint.
    u.searchParams.delete('sslmode');
    return u.toString();
  } catch {
    // Fallback for unexpected URL formats
    return databaseUrl.replace(/([?&])sslmode=[^&]+/g, '').replace(/[?&]$/, '');
  }
}

function getPool() {
  const databaseUrl = getSanitizedDatabaseUrl();
  if (!databaseUrl || databaseUrl.includes('your-aiven-')) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

export async function GET() {
  try {
    const db = getPool();
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: 'DATABASE_URL not configured (or disabled for local dev).',
        },
        { status: 503 }
      );
    }

    const result = await db.query('SELECT NOW() AS now');
    return NextResponse.json({
      success: true,
      time: result.rows[0]?.now ?? null,
    });
  } catch (error) {
    console.error('DB ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
