import { SEARXNG_BASE_URL } from '$env/static/private';

export interface SearxngResult {
	url: string;
	title: string;
	content?: string;
	score: number;
	engine?: string;
}

/**
 * Queries the self-hosted SearXNG instance's JSON API.
 * SearXNG must have `formats: [html, json]` enabled in settings.yml for this to work
 * (see /searxng/settings.yml in this repo).
 */
export async function searxngSearch(query: string, pageno = 1): Promise<SearxngResult[]> {
	const url = new URL('/search', SEARXNG_BASE_URL);
	url.searchParams.set('q', query);
	url.searchParams.set('format', 'json');
	url.searchParams.set('pageno', String(pageno));

	const res = await fetch(url, {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		throw new Error(`SearXNG request failed: ${res.status} ${res.statusText}`);
	}

	const data = await res.json();

	return (data.results ?? []).map((r: any) => ({
		url: r.url,
		title: r.title,
		content: r.content,
		score: r.score ?? 0,
		engine: r.engine
	}));
}

export interface SearxngImageResult {
	url: string;
	title: string;
	img_src: string;
	thumbnail_src: string;
	source: string;
	engine?: string;
}

/**
 * Same JSON API, but scoped to SearXNG's "images" category. img_src is the
 * full-resolution image (hosted on the source site, not proxied), and
 * thumbnail_src is a smaller preview — SearXNG's own image engines
 * (Bing/Google/etc) always provide both.
 */
export async function searxngImageSearch(query: string, pageno = 1): Promise<SearxngImageResult[]> {
	const url = new URL('/search', SEARXNG_BASE_URL);
	url.searchParams.set('q', query);
	url.searchParams.set('format', 'json');
	url.searchParams.set('categories', 'images');
	url.searchParams.set('pageno', String(pageno));

	const res = await fetch(url, {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		throw new Error(`SearXNG image request failed: ${res.status} ${res.statusText}`);
	}

	const data = await res.json();

	return (data.results ?? [])
		.filter((r: any) => r.img_src)
		.map((r: any) => ({
			url: r.url,
			title: r.title ?? '',
			img_src: r.img_src,
			thumbnail_src: r.thumbnail_src || r.img_src,
			source: r.source ?? (() => {
				try {
					return new URL(r.url).hostname;
				} catch {
					return r.url;
				}
			})(),
			engine: r.engine
		}));
}

export interface AutocompleteResult {
	suggestions: string[];
}

/** SearXNG also exposes an autocomplete endpoint (google backend by default). */
export async function searxngAutocomplete(query: string): Promise<string[]> {
	const url = new URL('/autocompleter', SEARXNG_BASE_URL);
	url.searchParams.set('q', query);

	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!res.ok) return [];
	const data = await res.json();
	// SearXNG returns [query, [suggestions...]]
	return Array.isArray(data) ? data[1] ?? [] : [];
}
