import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searxngSearch, type SearxngResult } from '$lib/server/searxng';
import { rankResults } from '$lib/server/ranking';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { fetchOgTags } from '$lib/server/opengraph';
import { searxngOgCache } from '$lib/server/cache';

interface EnrichedResult extends SearxngResult {
	og: { title?: string; description?: string; image?: string };
}

async function getEnrichedSearxngResults(q: string, pageno: number): Promise<EnrichedResult[]> {
	const cacheKey = `${q.toLowerCase()}::${pageno}`;
	const cached = searxngOgCache.get(cacheKey) as EnrichedResult[] | undefined;
	if (cached) return cached;

	const raw = await searxngSearch(q, pageno);

	const OG_FETCH_LIMIT = 8;
	let liveFetches = 0;

	const enriched = await Promise.all(
		raw.map(async (r): Promise<EnrichedResult> => {
			let og: EnrichedResult['og'] = {};
			if (liveFetches < OG_FETCH_LIMIT) {
				liveFetches++;
				og = await fetchOgTags(r.url);
			}
			return { ...r, og };
		})
	);

	searxngOgCache.set(cacheKey, enriched, 10 * 60 * 1000);
	return enriched;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const q = url.searchParams.get('q')?.trim();
	const pageno = Number(url.searchParams.get('page') ?? '1');

	if (!q) throw error(400, 'Missing query parameter "q"');

	// 1. Get SearXNG relevance + OG data (cached — see above).
	const enriched = await getEnrichedSearxngResults(q, pageno);
	const urls = enriched.map((r) => r.url);

	// 2. Pull whatever community data already exists for these URLs. Always
	//    live — this is a single fast indexed query, and it's what makes
	//    votes and community-submitted titles/images show up immediately.
	const { data: knownSites } = await supabaseAdmin
		.from('sites')
		.select('id, url, upvotes, downvotes, title, description, og_image')
		.in('url', urls.length ? urls : ['__none__']);

	const byUrl = new Map((knownSites ?? []).map((s) => [s.url, s]));

	// 3. Rank by blending SearXNG relevance + community score.
	const ranked = rankResults(
		enriched.map((r) => {
			const known = byUrl.get(r.url);
			return {
				url: r.url,
				searxngScore: r.score,
				upvotes: known?.upvotes ?? 0,
				downvotes: known?.downvotes ?? 0
			};
		})
	);

	// 4. Assemble the final response.
	const results = ranked.map((r) => {
		const item = enriched.find((x) => x.url === r.url)!;
		const known = byUrl.get(r.url);

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
			title: known?.title ?? item.og.title ?? item.title,
			description: known?.description ?? item.og.description ?? item.content ?? '',
			image: (known?.og_image as string | null | undefined) ?? item.og.image ?? null,
			upvotes: r.upvotes,
			downvotes: r.downvotes,
			communityScore: Math.round(r.communityScore * 100),
			isCommunityRanked: r.isCommunityRanked,
			isUnrated: r.upvotes + r.downvotes === 0
		};
	});

	const session = await locals.getSession();
	supabaseAdmin.from('search_log').insert({ query: q, user_id: session?.user.id ?? null });

	return json({ query: q, page: pageno, hasMore: enriched.length > 0, results });
};