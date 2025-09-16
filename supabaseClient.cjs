const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SUPABASE_KEY:', process.env.SUPABASE_ANON_KEY ? 'Loaded' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase

