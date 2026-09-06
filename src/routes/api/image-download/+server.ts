import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const target = url.searchParams.get('url');
	if (!target) throw error(400, 'Missing query parameter "url"');

	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		throw error(400, 'Invalid url');
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw error(400, 'Only http(s) urls are supported');
	}

	const upstream = await fetch(parsed, {
		headers: {
			// Some image hosts (e.g. Pinterest, Reddit-hosted images) 403 requests
			// without a browser-like UA / referer.
			'User-Agent': 'Mozilla/5.0 (compatible; VerdictImageDownload/1.0)'
		}
	});

	if (!upstream.ok || !upstream.body) {
		throw error(upstream.status || 502, 'Failed to fetch image');
	}

	const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
	const extGuess = contentType.split('/')[1]?.split(';')[0] ?? 'jpg';
	let filename = parsed.pathname.split('/').pop() || `image.${extGuess}`;
	if (!filename.includes('.')) filename += `.${extGuess}`;

	return new Response(upstream.body, {
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"`
		}
	});
};
