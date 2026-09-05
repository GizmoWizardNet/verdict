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

/**
 * Fetches a page and extracts OpenGraph + fallback meta tags.
 * Intentionally lightweight (regex, not a full DOM parser) since this only
 * runs against the <head> chunk of arbitrary third-party pages and needs to
 * stay fast and dependency-free.
 */
export async function fetchOgTags(url: string, timeoutMs = 4000): Promise<OgTags> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VerdictBot/1.0; +https://verdict.search)' }
		});
		const html = await res.text();
		const head = html.slice(0, html.indexOf('</head>') > -1 ? html.indexOf('</head>') : 20000);

		const tags: Record<string, string> = {};
		for (const match of head.match(META_TAG_RE) ?? []) {
			const prop = match.match(PROP_RE)?.[1];
			const content = match.match(CONTENT_RE)?.[1];
			if (prop && content) tags[prop.toLowerCase()] = content;
		}

		const titleFallback = head.match(/<title>([^<]*)<\/title>/i)?.[1];

		return {
			title: tags['og:title'] ?? titleFallback,
			description: tags['og:description'] ?? tags['description'],
			image: tags['og:image'],
			siteName: tags['og:site_name'],
			type: tags['og:type']
		};
	} catch {
		return {};
	} finally {
		clearTimeout(timeout);
	}
}
