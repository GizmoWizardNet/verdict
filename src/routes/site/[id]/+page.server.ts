import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export const load: PageServerLoad = async ({ params }) => {
	const { data: site, error: siteErr } = await supabaseAdmin
		.from('sites')
		.select('*')
		.eq('id', params.id)
		.single();

	if (siteErr || !site) throw error(404, 'Site not found');

	const { data: votes } = await supabaseAdmin
		.from('votes')
		.select('value, voter_name, voter_avatar, created_at')
		.eq('site_id', params.id)
		.order('created_at', { ascending: false });

	return { site, votes: votes ?? [] };
};
