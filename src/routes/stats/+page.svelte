<script lang="ts">
	import type { PageData } from './$types';
	import { ChevronUp, ChevronDown, Flame, Target, Award } from 'lucide-svelte';
	export let data: PageData;
</script>

<svelte:head>
	<title>Your stats — Verdict</title>
</svelte:head>

<h1 class="display page-title">YOUR STATS</h1>

<div class="summary">
	<div class="glass tile">
		<span class="num">{data.verdicts.cast}</span>
		<span class="label">Verdicts cast</span>
	</div>
	<div class="glass tile">
		<span class="num streak-num"><Flame size={22} /> {data.verdicts.streak}</span>
		<span class="label">Day streak</span>
	</div>
	<div class="glass tile">
		<span class="num">
			{#if data.verdicts.agreementRate !== null}{data.verdicts.agreementRate}%{:else}—{/if}
		</span>
		<span class="label">
			Agreement with the crowd
			{#if data.verdicts.agreementEligible > 0}
				<span class="sub">({data.verdicts.agreementEligible} contested)</span>
			{/if}
		</span>
	</div>
</div>

<!-- Badge shelf -->
<div class="glass badge-shelf">
	<h2 class="section-title"><Award size={16} /> Badges</h2>
	<div class="badges">
		{#each data.badges as badge}
			<span class="badge" class:earned={badge.earned}>{badge.label}</span>
		{/each}
	</div>
</div>

<!-- Sites you indexed -->
<h2 class="section-title standalone">Sites you've indexed</h2>
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

{#if data.verdicts.recent.length > 0}
	<h2 class="section-title standalone"><Target size={16} /> Recent verdicts</h2>
	<div class="site-list">
		{#each data.verdicts.recent as v}
			{@const site = v.site}
			{#if site}
				<a href="/site/{site.id}" class="glass site-row">
					<div>
						<span class="domain">{site.domain}</span>
						<h3>{site.title ?? site.url}</h3>
					</div>
					<div class="row-stats">
						{#if v.value === 1}
							<span class="my-vote up"><ChevronUp size={16} /> You upvoted</span>
						{:else}
							<span class="my-vote down"><ChevronDown size={16} /> You downvoted</span>
						{/if}
					</div>
				</a>
			{/if}
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
		margin-bottom: 1.4rem;
	}
	.tile {
		padding: 1.4rem;
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		text-align: center;
	}
	.num {
		font-family: var(--font-display);
		font-size: 2rem;
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}
	.num.up {
		color: var(--accent);
	}
	.num.down {
		color: #ff6b6b;
	}
	.streak-num {
		color: #ffb347;
	}
	.label {
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.label .sub {
		display: block;
		font-size: 0.72rem;
		color: var(--ink-faint);
	}
	.section-title {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--ink-soft);
		margin: 0 0 0.8rem;
	}
	.section-title.standalone {
		margin-top: 2rem;
	}
	.badge-shelf {
		padding: 1.2rem 1.3rem;
		border-radius: var(--radius-md);
		margin-bottom: 1.4rem;
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.badge {
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		color: var(--ink-faint);
		border: 1px solid var(--glass-border);
	}
	.badge.earned {
		background: linear-gradient(180deg, #4fc3ff, var(--accent));
		color: #05131c;
		border-color: transparent;
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5) inset, 0 6px 16px -6px var(--accent-glow);
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
	.my-vote.up {
		color: var(--accent);
	}
	.my-vote.down {
		color: #ff6b6b;
	}
	@media (max-width: 560px) {
		.summary {
			grid-template-columns: 1fr;
		}
	}
</style>