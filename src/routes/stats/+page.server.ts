import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { computeUserBadges } from '$lib/server/badges';

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

	const { data: votes } = await supabaseAdmin
		.from('votes')
		.select('value, created_at, site:sites(id, title, url, domain, upvotes, downvotes)')
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false });

	const castVotes = votes ?? [];

	let agreementEligible = 0;
	let agreementMatches = 0;
	for (const v of castVotes) {
		const site = v.site as unknown as { upvotes: number; downvotes: number } | null;
		if (!site) continue;
		const majority = Math.sign(site.upvotes - site.downvotes);
		if (majority === 0) continue;
		agreementEligible++;
		if (Math.sign(v.value) === majority) agreementMatches++;
	}
	const agreementRate = agreementEligible > 0 ? Math.round((agreementMatches / agreementEligible) * 100) : null;

	const dayKeys = new Set(castVotes.map((v) => new Date(v.created_at).toISOString().slice(0, 10)));
	let streak = 0;
	const cursor = new Date();
	cursor.setUTCHours(0, 0, 0, 0);
	if (!dayKeys.has(cursor.toISOString().slice(0, 10))) {
		cursor.setUTCDate(cursor.getUTCDate() - 1);
	}
	while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
		streak++;
		cursor.setUTCDate(cursor.getUTCDate() - 1);
	}

	const verdictCount = castVotes.length;
	// Same computation the vote endpoint uses to decide which achievement
	// toasts to fire, so the badge shelf here always matches.
	const badges = await computeUserBadges(supabaseAdmin, session.user.id);

	return {
		sites: sites ?? [],
		totals: { count: sites?.length ?? 0, upvotes: totalUp, downvotes: totalDown },
		verdicts: {
			cast: verdictCount,
			streak,
			agreementRate,
			agreementEligible,
			recent: castVotes.slice(0, 8)
		},
		badges
	};
};