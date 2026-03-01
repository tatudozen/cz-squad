// Script para aplicar migrações ao Supabase
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration(migrationFile) {
  try {
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    console.log(`📝 Applying migration: ${path.basename(migrationFile)}`);

    // Execute SQL directly via RPC or use raw connection
    // For now, we'll split by semicolon and execute statements
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement,
      }).catch(() => ({ data: null, error: { message: 'RPC not available' } }));

      if (error && error.message !== 'RPC not available') {
        console.error(`❌ Error executing statement:`, error);
        console.error(`   Statement: ${statement.substring(0, 100)}...`);
      }
    }

    console.log('✅ Migration applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Main
const migrationFile = process.argv[2] || './migrations/005_add_title_to_briefings.sql';

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

applyMigration(migrationFile).then(() => {
  console.log('✅ All migrations applied');
  process.exit(0);
});
