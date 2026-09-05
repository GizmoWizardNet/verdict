import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { fetchOgTags } from '$lib/server/opengraph';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) throw error(401, 'Sign in to manually index a site.');

	const { url } = (await request.json()) as { url: string };
	if (!url) throw error(400, 'Missing url');

	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw error(400, 'That does not look like a valid URL.');
	}

	const og = await fetchOgTags(parsed.toString());

	const { data, error: insertErr } = await supabaseAdmin
		.from('sites')
		.insert({
			url: parsed.toString(),
			domain: parsed.hostname,
			title: og.title ?? parsed.hostname,
			description: og.description ?? null,
			og_image: og.image ?? null,
			indexed_by: session.user.id,
			is_manual: true
		})
		.select()
		.single();

	if (insertErr) {
		if (insertErr.code === '23505') throw error(409, 'This site is already indexed.');
		throw error(500, insertErr.message);
	}

	return json(data);
};
