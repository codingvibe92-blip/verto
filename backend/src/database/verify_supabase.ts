import { Client } from 'pg';

const SUPABASE_CONFIG = {
  host: 'db.yxrmcwqurxpcbecszske.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '*AK8?QJee2_!buW',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

async function verifyAll() {
  const client = new Client(SUPABASE_CONFIG);
  await client.connect();

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log(`\n================================================================`);
  console.log(`SUPABASE CLUSTER VERIFICATION: https://yxrmcwqurxpcbecszske.supabase.co`);
  console.log(`Total Public Tables: ${tables.rows.length}`);
  console.log(`================================================================\n`);

  let totalRecords = 0;
  for (const t of tables.rows) {
    const countRes = await client.query(`SELECT COUNT(*) as n FROM public."${t.table_name}"`);
    const count = parseInt(countRes.rows[0].n, 10);
    totalRecords += count;
    console.log(`  [✓] ${t.table_name.padEnd(28)} : ${count.toString().padStart(4)} rows`);
  }

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Total Seeded Records Across Cluster: ${totalRecords}`);
  console.log(`----------------------------------------------------------------`);

  // Verify key relationships
  const userRoleRes = await client.query(`
    SELECT u.name, u.email, r.name as role_name, r.slug as role_slug
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    ORDER BY u.id;
  `);

  console.log('\nVerified Admin & User Accounts in Supabase:');
  for (const u of userRoleRes.rows) {
    console.log(`  - ${u.name} (${u.email}) -> Role: [${u.role_name}] (${u.role_slug})`);
  }

  const productsRes = await client.query(`
    SELECT p.sku, p.name, p.selling_price, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id;
  `);

  console.log('\nVerified Catalog SKUs in Supabase:');
  for (const p of productsRes.rows) {
    console.log(`  - [${p.sku}] ${p.name} - ₹${p.selling_price} (${p.category_name})`);
  }

  await client.end();
}

verifyAll().catch(console.error);
