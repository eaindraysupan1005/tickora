import { createClient } from 'npm:@supabase/supabase-js@2'

const kv_table = 'kv_store_f69ab98e'

// Helper function to create a Supabase client with service role key
function createKVClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// Set a key-value pair
export async function set(key: string, value: unknown) {
  const supabase = createKVClient()
  
  const { error } = await supabase
    .from(kv_table)
    .upsert(
      { key, value },
      { onConflict: 'key' }
    )
  
  if (error) {
    throw new Error(`Failed to set key: ${error.message}`)
  }
}

// Get a value by key
export async function get(key: string) {
  const supabase = createKVClient()
  
  const { data, error } = await supabase
    .from(kv_table)
    .select('value')
    .eq('key', key)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to get key: ${error.message}`)
  }
  
  return data ? data.value : null
}

// Delete a key
export async function del(key: string) {
  const supabase = createKVClient()
  
  const { error } = await supabase
    .from(kv_table)
    .delete()
    .eq('key', key)
  
  if (error) {
    throw new Error(`Failed to delete key: ${error.message}`)
  }
}

// Multi-set: Set multiple key-value pairs
export async function mset(keys: string[], values: unknown[]) {
  if (keys.length !== values.length) {
    throw new Error('Keys and values arrays must have the same length')
  }
  
  const supabase = createKVClient()
  
  const pairs = keys.map((key, index) => ({
    key,
    value: values[index]
  }))
  
  const { error } = await supabase
    .from(kv_table)
    .upsert(pairs, { onConflict: 'key' })
  
  if (error) {
    throw new Error(`Failed to set multiple keys: ${error.message}`)
  }
}

// Multi-get: Get multiple values by keys
export async function mget(keys: string[]) {
  const supabase = createKVClient()
  
  const { data, error } = await supabase
    .from(kv_table)
    .select('key, value')
    .in('key', keys)
  
  if (error) {
    throw new Error(`Failed to get multiple keys: ${error.message}`)
  }
  
  return data || []
}

// Multi-delete: Delete multiple keys
export async function mdel(keys: string[]) {
  const supabase = createKVClient()
  
  const { error } = await supabase
    .from(kv_table)
    .delete()
    .in('key', keys)
  
  if (error) {
    throw new Error(`Failed to delete multiple keys: ${error.message}`)
  }
}

// Get by prefix: Get all values where key starts with prefix
export async function getByPrefix(prefix: string) {
  const supabase = createKVClient()
  
  const { data, error } = await supabase
    .from(kv_table)
    .select('key, value')
    .like('key', `${prefix}%`)
  
  if (error) {
    throw new Error(`Failed to get by prefix: ${error.message}`)
  }
  
  return data || []
}
