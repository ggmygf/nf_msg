// netlify/functions/msg.js
const { Client } = require('pg');

exports.handler = async function(event) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect(); // Only connect inside the handler

    if (event.httpMethod === 'POST') {
      const { message } = JSON.parse(event.body);
      await client.query(`
        INSERT INTO messages (id, message)
        VALUES (1, $1)
        ON CONFLICT (id) DO UPDATE SET message = EXCLUDED.message
      `, [message]);

      return {
        statusCode: 200,
        body: 'OK'
      };
    }

    // GET message
    const res = await client.query('SELECT message FROM messages WHERE id = 1');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: res.rows[0]?.message || '' }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (err) {
    console.error('Function Error:', err);
    return {
      statusCode: 500,
      body: 'Server error'
    };
  } finally {
    await client.end(); // Always close the connection
  }
};
