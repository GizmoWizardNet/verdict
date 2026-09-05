<script lang="ts">
	import type { PageData } from './$types';
	import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-svelte';
	export let data: PageData;

	$: upvoters = data.votes.filter((v) => v.value === 1);
	$: downvoters = data.votes.filter((v) => v.value === -1);
</script>

<svelte:head>
	<title>{data.site.title ?? data.site.domain} — Verdict</title>
</svelte:head>

<div class="glass panel">
	<div class="head">
		{#if data.site.og_image}
			<img src={data.site.og_image} alt="" class="thumb" />
		{/if}
		<div>
			<span class="domain">{data.site.domain}</span>
			<h1>{data.site.title ?? data.site.url}</h1>
			<a href={data.site.url} target="_blank" rel="noopener noreferrer" class="visit">
				Visit site <ExternalLink size={14} />
			</a>
			{#if data.site.description}
				<p class="desc">{data.site.description}</p>
			{/if}
		</div>
	</div>

	<div class="tally">
		<div class="stat">
			<ChevronUp size={18} color="var(--accent)" />
			<span>{data.site.upvotes} upvotes</span>
		</div>
		<div class="stat">
			<ChevronDown size={18} color="#ff6b6b" />
			<span>{data.site.downvotes} downvotes</span>
		</div>
		{#if data.site.is_manual}
			<div class="stat">Manually indexed</div>
		{/if}
	</div>
</div>

<div class="voter-columns">
	<div class="glass voter-col">
		<h2>Upvoted by</h2>
		{#if upvoters.length === 0}
			<p class="none">No upvotes yet.</p>
		{:else}
			<ul>
				{#each upvoters as v}
					<li>
						{#if v.voter_avatar}<img src={v.voter_avatar} alt="" referrerpolicy="no-referrer" />{/if}
						<span>{v.voter_name}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="glass voter-col">
		<h2>Downvoted by</h2>
		{#if downvoters.length === 0}
			<p class="none">No downvotes yet.</p>
		{:else}
			<ul>
				{#each downvoters as v}
					<li>
						{#if v.voter_avatar}<img src={v.voter_avatar} alt="" referrerpolicy="no-referrer" />{/if}
						<span>{v.voter_name}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.panel {
		padding: 1.5rem;
		border-radius: var(--radius-lg);
		margin: 1.5rem 0;
	}
	.head {
		display: flex;
		gap: 1.2rem;
	}
	.thumb {
		width: 88px;
		height: 88px;
		object-fit: cover;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-border);
	}
	.domain {
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	h1 {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.4rem;
		margin: 0.15rem 0 0.4rem;
	}
	.visit {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--accent);
		text-decoration: none;
		font-size: 0.85rem;
	}
	.desc {
		color: var(--ink-soft);
		margin-top: 0.6rem;
	}
	.tally {
		display: flex;
		gap: 1.4rem;
		margin-top: 1.2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--glass-border);
	}
	.stat {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		color: var(--ink-soft);
	}
	.voter-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.voter-col {
		padding: 1.2rem;
		border-radius: var(--radius-md);
	}
	.voter-col h2 {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 0.8rem;
	}
	.voter-col ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.voter-col li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--ink-soft);
	}
	.voter-col img {
		width: 24px;
		height: 24px;
		border-radius: 50%;
	}
	.none {
		color: var(--ink-faint);
		font-size: 0.88rem;
	}
	@media (max-width: 560px) {
		.voter-columns {
			grid-template-columns: 1fr;
		}
		.head {
			flex-direction: column;
		}
	}
</style>
