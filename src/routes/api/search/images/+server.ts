import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searxngImageSearch, type SearxngImageResult } from '$lib/server/searxng';
import { imageSearchCache } from '$lib/server/cache';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	const pageno = Number(url.searchParams.get('page') ?? '1');

	if (!q) throw error(400, 'Missing query parameter "q"');

	const cacheKey = `${q.toLowerCase()}::${pageno}`;
	let results = imageSearchCache.get(cacheKey) as SearxngImageResult[] | undefined;

	if (!results) {
		results = await searxngImageSearch(q, pageno);
		imageSearchCache.set(cacheKey, results, 15 * 60 * 1000);
	}

	return json({ query: q, page: pageno, hasMore: results.length > 0, results });
};