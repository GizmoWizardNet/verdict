import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searxngAutocomplete } from '$lib/server/searxng';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q || q.length < 2) return json({ suggestions: [] });

	const [searxSuggestions, { data: popular }] = await Promise.all([
		searxngAutocomplete(q).catch(() => [] as string[]),
		supabaseAdmin.rpc('autocomplete_queries', { prefix: q, limit_count: 5 })
	]);

	const popularQueries = (popular ?? []).map((p: { query: string }) => p.query);

	// Merge, de-dupe (case-insensitive), popular Verdict searches take priority
	// since they reflect what *this* community actually searches for.
	const seen = new Set<string>();
	const merged: string[] = [];
	for (const s of [...popularQueries, ...searxSuggestions]) {
		const key = s.toLowerCase();
		if (!seen.has(key)) {
			seen.add(key);
			merged.push(s);
		}
	}

	return json({ suggestions: merged.slice(0, 8) });
};
