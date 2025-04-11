// netlify/functions/msg.js
const { Client } = require("pg");

exports.handler = async function (event) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing DATABASE_URL env variable" }),
    };
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    if (event.httpMethod === "POST") {
      const body = new URLSearchParams(event.body);
      const msg = body.get("message")?.trim();

      if (!msg) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Empty message" }),
        };
      }

      await client.query("INSERT INTO messages (id, message) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET message = $1", [msg]);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET - fetch latest message
    const result = await client.query("SELECT message FROM messages WHERE id = 1");
    const message = result.rows[0]?.message || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    };

  } catch (err) {
    console.error("DB error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  } finally {
    await client.end(); // avoid reuse issues
  }
  console.log('Event:', event);
};
