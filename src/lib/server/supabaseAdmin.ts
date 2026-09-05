import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/database.types';

/**
 * Service-role client — bypasses RLS. Only ever imported from `+server.ts`
 * files (never shipped to the client). Used for reads/writes that need to
 * see or touch data across all users, e.g. attaching community scores to
 * search results, or the trigger-backed vote tallies.
 */
export const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false }
});
