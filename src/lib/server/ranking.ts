/**
 * Verdict ranking algorithm.
 *
 * Every result gets a `finalScore` blending two signals:
 *
 *   1. searxngScore   — SearXNG's own relevance score for the query, normalized to 0..1
 *                        against the top result in this result set.
 *   2. communityScore — a Wilson-lower-bound style score derived from upvotes/downvotes,
 *                        so a site with 9 up / 1 down outranks one with 90 up / 60 down,
 *                        but a brand-new site with 0 votes isn't penalized to zero.
 *
 * On top of that we apply an "unrated boost": sites with very few total votes get a
 * temporary multiplier so they surface near the top long enough to actually get rated
 * by the community, decaying to 1.0 as votes accumulate. This is what "encouraging
 * rating sites which have not been rated" means in practice — visibility, not a
 * permanent thumb on the scale.
 */

export interface RankableResult {
	url: string;
	searxngScore: number; // raw score as returned by SearXNG, arbitrary scale
	upvotes: number;
	downvotes: number;
}

export interface RankedResult extends RankableResult {
	communityScore: number;
	finalScore: number;
	unratedBoost: number;
	isCommunityRanked: boolean;
}

const WEIGHT_SEARXNG = 0.4;
const WEIGHT_COMMUNITY = 0.6;

/** Vote count at which the unrated boost has fully decayed away. */
const BOOST_DECAY_VOTES = 12;
/** Multiplier applied to a site with zero votes. */
const MAX_BOOST = 1.35;

/** A site is "Community Ranked" once it has enough net signal to trust the crowd. */
const COMMUNITY_RANKED_MIN_VOTES = 5;
const COMMUNITY_RANKED_MIN_SCORE = 0.65;

/**
 * Wilson score interval lower bound — a standard, well-tested way to rank items by a
 * ratio of positive/negative votes while accounting for sample size (a 2/0 site should
 * not outrank a 400/20 site just because its ratio is nominally higher).
 */
function wilsonLowerBound(upvotes: number, downvotes: number): number {
	const n = upvotes + downvotes;
	if (n === 0) return 0.5; // neutral prior for unrated sites
	const z = 1.96; // 95% confidence
	const p = upvotes / n;
	const denominator = 1 + (z * z) / n;
	const centre = p + (z * z) / (2 * n);
	const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
	return (centre - margin) / denominator;
}

function unratedBoostFor(totalVotes: number): number {
	if (totalVotes >= BOOST_DECAY_VOTES) return 1;
	const t = totalVotes / BOOST_DECAY_VOTES;
	// smoothstep decay from MAX_BOOST down to 1.0
	const eased = t * t * (3 - 2 * t);
	return MAX_BOOST - eased * (MAX_BOOST - 1);
}

export function rankResults(results: RankableResult[]): RankedResult[] {
	const maxSearxng = Math.max(...results.map((r) => r.searxngScore), 1e-6);

	const ranked = results.map((r) => {
		const normalizedSearxng = r.searxngScore / maxSearxng;
		const communityScore = wilsonLowerBound(r.upvotes, r.downvotes);
		const totalVotes = r.upvotes + r.downvotes;
		const boost = unratedBoostFor(totalVotes);

		const base = normalizedSearxng * WEIGHT_SEARXNG + communityScore * WEIGHT_COMMUNITY;
		const finalScore = base * boost;

		const isCommunityRanked =
			totalVotes >= COMMUNITY_RANKED_MIN_VOTES && communityScore >= COMMUNITY_RANKED_MIN_SCORE;

		return {
			...r,
			communityScore,
			finalScore,
			unratedBoost: boost,
			isCommunityRanked
		};
	});

	// Community Ranked results are promoted to the top of the pack (per the brief:
	// "Promote Community Ranked results"), sorted amongst themselves by finalScore,
	// then everything else follows sorted by finalScore.
	return ranked.sort((a, b) => {
		if (a.isCommunityRanked !== b.isCommunityRanked) {
			return a.isCommunityRanked ? -1 : 1;
		}
		return b.finalScore - a.finalScore;
	});
}
