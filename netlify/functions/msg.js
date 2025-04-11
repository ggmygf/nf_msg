import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_PHLsR1ZNV6aD@ep-bold-scene-a6n861l1-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require'
});

export async function handler(event) {
  await client.connect();

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    await client.query(
      `INSERT INTO messages (id, message) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET message = EXCLUDED.message`, 
      [body.message]
    );
    await client.end();
    return { statusCode: 200, body: 'OK' };
  }

  const res = await client.query('SELECT message FROM messages WHERE id = 1');
  await client.end();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: res.rows[0]?.message || '' }),
    headers: { 'Content-Type': 'application/json' }
  };
}
