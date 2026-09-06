import { ogCache } from './cache';

export interface OgTags {
	title?: string;
	description?: string;
	image?: string;
	siteName?: string;
	type?: string;
}

const META_TAG_RE = /<meta\s+[^>]*>/gi;
const PROP_RE = /(?:property|name)\s*=\s*["']([^"']+)["']/i;
const CONTENT_RE = /content\s*=\s*["']([^"']*)["']/i;

export async function fetchOgTags(url: string, timeoutMs = 2500): Promise<OgTags> {
	const cached = ogCache.get(url) as OgTags | undefined;
	if (cached) return cached;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	let tags: OgTags = {};
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VerdictBot/1.0; +https://verdict.search)' }
		});
		const html = await res.text();
		const head = html.slice(0, html.indexOf('</head>') > -1 ? html.indexOf('</head>') : 20000);

		const rawTags: Record<string, string> = {};
		for (const match of head.match(META_TAG_RE) ?? []) {
			const prop = match.match(PROP_RE)?.[1];
			const content = match.match(CONTENT_RE)?.[1];
			if (prop && content) rawTags[prop.toLowerCase()] = content;
		}

		const titleFallback = head.match(/<title>([^<]*)<\/title>/i)?.[1];

		tags = {
			title: rawTags['og:title'] ?? titleFallback,
			description: rawTags['og:description'] ?? rawTags['description'],
			image: rawTags['og:image'],
			siteName: rawTags['og:site_name'],
			type: rawTags['og:type']
		};
	} catch {
		tags = {};
	} finally {
		clearTimeout(timeout);
	}

	const hasData = Object.values(tags).some(Boolean);
	ogCache.set(url, tags, hasData ? 30 * 60 * 1000 : 5 * 60 * 1000);

	return tags;
}