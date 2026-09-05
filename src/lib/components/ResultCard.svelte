<script lang="ts">
	import VoteButtons from '$lib/components/VoteButtons.svelte';
	import CommunityRankedBadge from '$lib/icons/CommunityRankedBadge.svelte';
	import UnratedSpark from '$lib/icons/UnratedSpark.svelte';

	export let result: {
		siteId: string | null;
		url: string;
		domain: string;
		title: string;
		description: string;
		image: string | null;
		upvotes: number;
		downvotes: number;
		communityScore: number;
		isCommunityRanked: boolean;
		isUnrated: boolean;
	};
</script>

<article class="glass card" class:ranked={result.isCommunityRanked}>
	<VoteButtons
		url={result.url}
		title={result.title}
		description={result.description}
		image={result.image}
		bind:upvotes={result.upvotes}
		bind:downvotes={result.downvotes}
	/>

	<div class="body">
		<div class="meta-row">
			<span class="domain">{result.domain}</span>
			{#if result.isCommunityRanked}
				<span class="tag ranked-tag"><CommunityRankedBadge size={14} /> Community Ranked</span>
			{:else if result.isUnrated}
				<span class="tag unrated-tag"><UnratedSpark size={14} /> Not yet rated — be first</span>
			{/if}
		</div>

		<a href={result.url} class="title-link" target="_blank" rel="noopener noreferrer">
			<h3>{result.title}</h3>
		</a>

		{#if result.description}
			<p class="description">{result.description}</p>
		{/if}

		<div class="footer">
			{#if result.siteId}
				<a href="/site/{result.siteId}" class="who-voted">See who voted →</a>
			{/if}
			<span class="score" title="Blended SearXNG + community score">Verdict score: {result.communityScore}</span>
		</div>
	</div>

	{#if result.image}
		<img src={result.image} alt="" class="thumb" loading="lazy" />
	{/if}
</article>

<style>
	.card {
		display: flex;
		gap: 1rem;
		padding: 1.1rem 1.2rem;
		border-radius: var(--radius-md);
		transition: transform 0.18s var(--ease-aero), box-shadow 0.18s var(--ease-aero);
		/* .glass sets overflow: hidden (to clip its top sheen highlight), which also
		   clips the "FIRST VERDICT" / "VERDICT DELIVERED" popup rendered by
		   VoteButtons since it's positioned absolutely above the card bounds.
		   Override it here so the popup isn't cut off. */
		overflow: visible;
	}
	.card:hover {
		transform: translateY(-2px);
	}
	.card.ranked {
		border-color: var(--accent-soft);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.5) inset,
			0 0 0 1px var(--accent-soft),
			0 18px 40px -14px var(--accent-glow);
	}
	.body {
		flex: 1;
		min-width: 0;
	}
	.meta-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.3rem;
	}
	.domain {
		font-size: 0.82rem;
		color: var(--ink-faint);
	}
	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
	}
	.ranked-tag {
		background: var(--accent-soft);
		color: #d9f0ff;
	}
	.unrated-tag {
		background: rgba(255, 255, 255, 0.1);
		color: var(--ink-soft);
	}
	.title-link {
		text-decoration: none;
	}
	h3 {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1.08rem;
		color: var(--paper);
		margin: 0 0 0.25rem;
	}
	.title-link:hover h3 {
		color: var(--accent);
	}
	.description {
		font-size: 0.92rem;
		color: var(--ink-soft);
		margin: 0 0 0.5rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.8rem;
	}
	.who-voted {
		color: var(--accent);
		text-decoration: none;
	}
	.score {
		color: var(--ink-faint);
	}
	.thumb {
		width: 96px;
		height: 96px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-border);
		flex-shrink: 0;
	}
	@media (max-width: 560px) {
		.thumb {
			display: none;
		}
	}
</style>
