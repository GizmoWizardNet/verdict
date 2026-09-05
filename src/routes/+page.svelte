<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import GlassOrbLoader from '$lib/icons/GlassOrbLoader.svelte';
	import VerdictMark from '$lib/icons/VerdictMark.svelte';

	let query = $page.url.searchParams.get('q') ?? '';
	let results: any[] = [];
	let loading = false;
	let searched = false;
	let errorMsg = '';

	async function runSearch(q: string) {
		query = q;
		loading = true;
		errorMsg = '';
		searched = true;
		goto(`/?q=${encodeURIComponent(q)}`, { replaceState: true, keepFocus: true, noScroll: true });
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			results = data.results;
		} catch (e) {
			errorMsg = 'Search failed — check that SearXNG is reachable.';
			results = [];
		} finally {
			loading = false;
		}
	}

	if (query) runSearch(query);
</script>

{#if !searched}
	<section class="hero">
		<VerdictMark size={64} />
		<h1 class="display">VERDICT</h1>
		<p class="tagline">search the change</p>
		<div class="hero-search">
			<SearchBar bind:value={query} autofocus on:search={(e) => runSearch(e.detail)} />
		</div>
	</section>
{:else}
	<div class="results-search">
		<SearchBar bind:value={query} on:search={(e) => runSearch(e.detail)} />
	</div>

	{#if loading}
		<div class="loading">
			<GlassOrbLoader />
			<span>Consulting the crowd…</span>
		</div>
	{:else if errorMsg}
		<p class="error glass">{errorMsg}</p>
	{:else if results.length === 0}
		<p class="empty glass">No results yet. Try a different query, or index a site yourself.</p>
	{:else}
		<div class="results">
			{#each results as result (result.url)}
				<ResultCard {result} />
			{/each}
		</div>
	{/if}
{/if}

<style>
	.hero {
		min-height: 70vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		text-align: center;
	}
	.hero h1 {
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		margin-top: 0.5rem;
	}
	.tagline {
		font-size: 1.1rem;
		color: var(--ink-soft);
		margin: 0 0 1.5rem;
		letter-spacing: 0.02em;
	}
	.hero-search {
		width: min(560px, 90vw);
	}
	.results-search {
		margin: 1.5rem 0;
		max-width: 720px;
	}
	.results {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 780px;
	}
	.loading {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--ink-soft);
		padding: 2rem 0;
	}
	.error,
	.empty {
		padding: 1.2rem 1.4rem;
		border-radius: var(--radius-md);
		color: var(--ink-soft);
		max-width: 620px;
	}
</style>
