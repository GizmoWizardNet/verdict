import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

interface VoteBody {
	url: string;
	title?: string;
	description?: string;
	image?: string;
	value: 1 | -1 | 0; // 0 = retract vote
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session) throw error(401, 'You need to sign in with Google or Discord to vote.');

	const body = (await request.json()) as VoteBody;
	if (!body.url || ![1, -1, 0].includes(body.value)) {
		throw error(400, 'Invalid vote payload');
	}

	// Ensure the site exists (auto-created from search results on first vote —
	// this is the "encourage rating sites which have not been rated" path).
	let { data: site } = await supabaseAdmin.from('sites').select('id').eq('url', body.url).single();

	if (!site) {
		const domain = new URL(body.url).hostname;
		const { data: created, error: insertErr } = await supabaseAdmin
			.from('sites')
			.insert({
				url: body.url,
				domain,
				title: body.title,
				description: body.description,
				og_image: body.image,
				is_manual: false
			})
			.select('id')
			.single();
		if (insertErr) throw error(500, insertErr.message);
		site = created;
	}

	if (body.value === 0) {
		const { error: delErr } = await supabaseAdmin
			.from('votes')
			.delete()
			.eq('site_id', site.id)
			.eq('user_id', session.user.id);
		if (delErr) throw error(500, delErr.message);
	} else {
		const meta = session.user.user_metadata ?? {};
		const { error: upsertErr } = await supabaseAdmin.from('votes').upsert(
			{
				site_id: site.id,
				user_id: session.user.id,
				value: body.value,
				voter_name: meta.full_name ?? meta.name ?? meta.user_name ?? session.user.email ?? 'A Verdict user',
				voter_avatar: meta.avatar_url ?? null
			},
			{ onConflict: 'site_id,user_id' }
		);
		if (upsertErr) throw error(500, upsertErr.message);
	}

	const { data: updated } = await supabaseAdmin
		.from('sites')
		.select('upvotes, downvotes')
		.eq('id', site.id)
		.single();

	return json({ siteId: site.id, ...updated });
};
