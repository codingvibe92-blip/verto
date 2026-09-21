import { Client } from 'pg';

async function test() {
  console.log('Testing Supabase PostgreSQL connection...');
  const client = new Client({
    host: 'db.yxrmcwqurxpcbecszske.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '*AK8?QJee2_!buW',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL!');
    const res = await client.query('SELECT version(), current_database(), current_user;');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err: any) {
    console.error('Connection error:', err.message);
  }
}

test();
