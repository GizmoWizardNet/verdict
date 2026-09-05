import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) throw redirect(303, '/');

	const { data: sites } = await supabaseAdmin
		.from('sites')
		.select('*')
		.eq('indexed_by', session.user.id)
		.order('created_at', { ascending: false });

	const totalUp = (sites ?? []).reduce((a, s) => a + s.upvotes, 0);
	const totalDown = (sites ?? []).reduce((a, s) => a + s.downvotes, 0);

	return {
		sites: sites ?? [],
		totals: { count: sites?.length ?? 0, upvotes: totalUp, downvotes: totalDown }
	};
};
