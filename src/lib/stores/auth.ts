import { writable } from 'svelte/store';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '$lib/supabaseClient';

export const session = writable<Session | null>(null);

export function initAuthListener(initial: Session | null) {
	session.set(initial);
	supabase.auth.onAuthStateChange((_event, newSession) => {
		session.set(newSession);
	});
}

export async function signInWith(provider: 'google' | 'discord') {
	await supabase.auth.signInWithOAuth({
		provider,
		options: { redirectTo: `${window.location.origin}/auth/callback` }
	});
}

export async function signOut() {
	await supabase.auth.signOut();
}
