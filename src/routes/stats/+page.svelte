<script lang="ts">
	import type { PageData } from './$types';
	import { ChevronUp, ChevronDown } from 'lucide-svelte';
	export let data: PageData;
</script>

<svelte:head>
	<title>Your stats — Verdict</title>
</svelte:head>

<h1 class="display page-title">YOUR STATS</h1>

<div class="summary">
	<div class="glass tile">
		<span class="num">{data.totals.count}</span>
		<span class="label">Sites indexed</span>
	</div>
	<div class="glass tile">
		<span class="num up">{data.totals.upvotes}</span>
		<span class="label">Total upvotes</span>
	</div>
	<div class="glass tile">
		<span class="num down">{data.totals.downvotes}</span>
		<span class="label">Total downvotes</span>
	</div>
</div>

{#if data.sites.length === 0}
	<p class="empty glass">You haven't manually indexed any sites yet. <a href="/index-site">Index one</a>.</p>
{:else}
	<div class="site-list">
		{#each data.sites as site}
			<a href="/site/{site.id}" class="glass site-row">
				<div>
					<span class="domain">{site.domain}</span>
					<h3>{site.title ?? site.url}</h3>
				</div>
				<div class="row-stats">
					<span><ChevronUp size={16} color="var(--accent)" /> {site.upvotes}</span>
					<span><ChevronDown size={16} color="#ff6b6b" /> {site.downvotes}</span>
				</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	.page-title {
		margin: 2rem 0 1.2rem;
		font-size: 1.8rem;
	}
	.summary {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.tile {
		padding: 1.4rem;
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}
	.num {
		font-family: var(--font-display);
		font-size: 2rem;
	}
	.num.up {
		color: var(--accent);
	}
	.num.down {
		color: #ff6b6b;
	}
	.label {
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.empty {
		padding: 1.4rem;
		border-radius: var(--radius-md);
		color: var(--ink-soft);
	}
	.site-list {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.site-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.2rem;
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--paper);
		transition: transform 0.16s var(--ease-aero);
	}
	.site-row:hover {
		transform: translateY(-2px);
	}
	.domain {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	h3 {
		margin: 0.15rem 0 0;
		font-family: var(--font-body);
		font-size: 1rem;
	}
	.row-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.9rem;
	}
	.row-stats span {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	@media (max-width: 560px) {
		.summary {
			grid-template-columns: 1fr;
		}
	}
</style>
