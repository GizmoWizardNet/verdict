import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searxngImageSearch } from '$lib/server/searxng';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	const pageno = Number(url.searchParams.get('page') ?? '1');

	if (!q) throw error(400, 'Missing query parameter "q"');

	const results = await searxngImageSearch(q, pageno);

	return json({ query: q, results });
};
