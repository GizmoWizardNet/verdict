import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searxngSearch } from '$lib/server/searxng';
import { rankResults } from '$lib/server/ranking';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { fetchOgTags } from '$lib/server/opengraph';

export const GET: RequestHandler = async ({ url, locals }) => {
	const q = url.searchParams.get('q')?.trim();
	const pageno = Number(url.searchParams.get('page') ?? '1');

	if (!q) throw error(400, 'Missing query parameter "q"');

	// 1. Ask SearXNG for raw relevance-ranked results.
	const raw = await searxngSearch(q, pageno);
	const urls = raw.map((r) => r.url);

	// 2. Pull whatever community data already exists for these URLs.
	const { data: knownSites } = await supabaseAdmin
		.from('sites')
		.select('id, url, upvotes, downvotes, title, description, og_image')
		.in('url', urls.length ? urls : ['__none__']);

	const byUrl = new Map((knownSites ?? []).map((s) => [s.url, s]));

	// 3. Rank by blending SearXNG relevance + community score.
	const ranked = rankResults(
		raw.map((r) => {
			const known = byUrl.get(r.url);
			return {
				url: r.url,
				searxngScore: r.score,
				upvotes: known?.upvotes ?? 0,
				downvotes: known?.downvotes ?? 0
			};
		})
	);

	// 4. Enrich with OG tags — prefer cached ones from Supabase, fetch live for the
	//    rest (capped to keep the response snappy).
	const OG_FETCH_LIMIT = 8;
	let liveFetches = 0;

	const results = await Promise.all(
		ranked.map(async (r) => {
			const raw_ = raw.find((x) => x.url === r.url)!;
			const known = byUrl.get(r.url);

			let og = {
				title: known?.title ?? raw_.title,
				description: known?.description ?? raw_.content,
				image: known?.og_image as string | null | undefined
			};

			if (!og.image && liveFetches < OG_FETCH_LIMIT) {
				liveFetches++;
				const fetched = await fetchOgTags(r.url);
				og = {
					title: og.title ?? fetched.title,
					description: og.description ?? fetched.description,
					image: fetched.image
				};
			}

			let domain = r.url;
			try {
				domain = new URL(r.url).hostname;
			} catch {
				/* ignore malformed url */
			}

			return {
				siteId: known?.id ?? null,
				url: r.url,
				domain,
				title: og.title ?? r.url,
				description: og.description ?? '',
				image: og.image ?? null,
				upvotes: r.upvotes,
				downvotes: r.downvotes,
				communityScore: Math.round(r.communityScore * 100),
				isCommunityRanked: r.isCommunityRanked,
				isUnrated: r.upvotes + r.downvotes === 0
			};
		})
	);

	// 5. Log the query for autocomplete, fire-and-forget.
	const session = await locals.getSession();
	supabaseAdmin.from('search_log').insert({ query: q, user_id: session?.user.id ?? null });

	return json({ query: q, results });
};
