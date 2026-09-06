import type { SupabaseClient } from '@supabase/supabase-js';

export interface BadgeDef {
	id: string;
	label: string;
	earned: boolean;
}

/**
 * Computes every achievement badge for a user from scratch. Used both by the
 * stats page (to render the badge shelf) and by the vote endpoint (to figure
 * out whether a vote just unlocked something new, so we can toast it).
 */
export async function computeUserBadges(
	supabaseAdmin: SupabaseClient,
	userId: string
): Promise<BadgeDef[]> {
	const { data: sites } = await supabaseAdmin
		.from('sites')
		.select('id')
		.eq('indexed_by', userId);

	const { data: votes } = await supabaseAdmin
		.from('votes')
		.select('value, created_at, site:sites(upvotes, downvotes)')
		.eq('user_id', userId);

	const castVotes = votes ?? [];
	const verdictCount = castVotes.length;

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
	const agreementRate =
		agreementEligible > 0 ? Math.round((agreementMatches / agreementEligible) * 100) : null;

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

	return [
		{ id: 'first-verdict', label: 'First Verdict', earned: verdictCount >= 1 },
		{ id: 'ten-verdicts', label: '10 Verdicts', earned: verdictCount >= 10 },
		{ id: 'fifty-verdicts', label: '50 Verdicts', earned: verdictCount >= 50 },
		{ id: 'hundred-verdicts', label: '100 Verdicts', earned: verdictCount >= 100 },
		{ id: 'streak-3', label: '3-Day Streak', earned: streak >= 3 },
		{ id: 'streak-7', label: '7-Day Streak', earned: streak >= 7 },
		{
			id: 'sharp-juror',
			label: 'Sharp Juror',
			earned: agreementEligible >= 10 && (agreementRate ?? 0) >= 90
		},
		{ id: 'first-index', label: 'First Site Indexed', earned: (sites?.length ?? 0) >= 1 }
	];
}
