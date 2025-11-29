import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './.env' });

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'presente' : 'não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'presente' : 'não definida');

// Inicializar o cliente do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export default supabase;