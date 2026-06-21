const { Client } = require('pg');

async function test(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('SUCCESS:', url.split('@')[1]);
    await client.end();
  } catch (e) {
    console.error('FAILED:', url.split('@')[1], e.message);
  }
}

async function main() {
  const url6543 = 'postgresql://postgres.mnqsusuuqqzlwxxbttoc:vimnak-qavbeK-matri6@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
  const url5432 = 'postgresql://postgres.mnqsusuuqqzlwxxbttoc:vimnak-qavbeK-matri6@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
  
  await test(url6543);
  await test(url5432);
}

main();
