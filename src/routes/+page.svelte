<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import ImageResults from '$lib/components/ImageResults.svelte';
	import GlassOrbLoader from '$lib/icons/GlassOrbLoader.svelte';
	import VerdictMark from '$lib/icons/VerdictMark.svelte';
	import { Github, Globe, Image as ImageIcon } from 'lucide-svelte';
	import type { ImageResult } from '$lib/types/image';

	let query = '';
	let results: any[] = [];
	let loading = false;
	let searched = false;
	let errorMsg = '';

	type Tab = 'web' | 'images';
	let activeTab: Tab = 'web';

	let images: ImageResult[] = [];
	let imagesLoading = false;
	let imagesErrorMsg = '';
	// Which query the current `images` array belongs to, so switching to the
	// Images tab only re-fetches when the search term actually changed.
	let imagesForQuery: string | null = null;

	// Tracks the "q" param we last synced from, independent of the `query`
	// variable (which is also bound to the search input and changes on every
	// keystroke). Comparing against `query` directly caused the block below to
	// re-fire while typing and reset the input back to empty.
	let lastUrlQuery: string | null = null;

	async function runSearch(q: string) {
		query = q;
		loading = true;
		errorMsg = '';
		searched = true;
		activeTab = 'web';
		// goto() only works in the browser. During SSR (e.g. a direct request
		// to "/?q=..." or a server-rendered navigation), this block still runs
		// to fetch and render results, but there's no client-side history to
		// update, so calling goto() here would throw and crash the request.
		if (browser) {
			goto(`/?q=${encodeURIComponent(q)}`, { replaceState: true, keepFocus: true, noScroll: true });
		}
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

	async function runImageSearch(q: string) {
		imagesLoading = true;
		imagesErrorMsg = '';
		try {
			const res = await fetch(`/api/search/images?q=${encodeURIComponent(q)}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			images = data.results;
			imagesForQuery = q;
		} catch (e) {
			imagesErrorMsg = 'Image search failed — check that SearXNG is reachable.';
			images = [];
		} finally {
			imagesLoading = false;
		}
	}

	function selectTab(tab: Tab) {
		activeTab = tab;
		if (tab === 'images' && imagesForQuery !== query) {
			runImageSearch(query);
		}
	}

	// SvelteKit reuses this same component instance for every navigation to "/"
	// (e.g. clicking the sidebar's Home link, or the browser back/forward
	// buttons) — it doesn't get remounted. The old code only read the "q"
	// query param once at the top of <script>, so returning to a bare "/"
	// after searching left the stale results on screen until a full page
	// refresh. This only reacts to $page.url actually changing (tracked via
	// lastUrlQuery), not to the user typing.
	$: {
		const q = $page.url.searchParams.get('q') ?? '';
		if (q !== lastUrlQuery) {
			lastUrlQuery = q;
			if (q) {
				if (q !== query) runSearch(q);
			} else {
				query = '';
				searched = false;
				results = [];
				errorMsg = '';
				activeTab = 'web';
				images = [];
				imagesForQuery = null;
				imagesErrorMsg = '';
			}
		}
	}
</script>

{#if !searched}
	<section class="hero">
		<VerdictMark size={64} />
		<h1 class="display">VERDICT</h1>
		<p class="tagline">search the change</p>
		<div class="hero-search">
			<SearchBar bind:value={query} autofocus on:search={(e) => runSearch(e.detail)} />
		</div>
		<div class="hero-footer">
			<span class="hero-credit">a product of GizmoWizardNet 2026</span>
			<a
				class="glass-btn github-btn"
				href="https://github.com/GizmoWizardNet/verdict"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Github size={16} />
				GitHub
			</a>
		</div>
	</section>
{:else}
	<div class="results-search">
		<SearchBar bind:value={query} on:search={(e) => runSearch(e.detail)} />
	</div>

	<div class="tab-bar">
		<button class="tab" class:active={activeTab === 'web'} on:click={() => selectTab('web')}>
			<Globe size={15} />
			Web
		</button>
		<button class="tab" class:active={activeTab === 'images'} on:click={() => selectTab('images')}>
			<ImageIcon size={15} />
			Images
		</button>
	</div>

	{#if activeTab === 'web'}
		{#if loading}
			<div class="loading">
				<GlassOrbLoader />
				<span>Consulting the crowd…</span>
			</div>
		{:else if errorMsg}
			<p class="error glass">{errorMsg}</p>
		{:else if results.length === 0}
			<p class="empty glass">No results :(</p>
		{:else}
			<div class="results">
				{#each results as result (result.url)}
					<ResultCard {result} />
				{/each}
			</div>
		{/if}
	{:else}
		{#if imagesLoading}
			<div class="loading">
				<GlassOrbLoader />
				<span>Rounding up images…</span>
			</div>
		{:else if imagesErrorMsg}
			<p class="error glass">{imagesErrorMsg}</p>
		{:else}
			<ImageResults {images} />
		{/if}
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
	.hero-footer {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-top: 0.4rem;
	}
	.hero-credit {
		font-size: 0.78rem;
		color: var(--ink-faint);
		letter-spacing: 0.01em;
	}
	.github-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.75rem;
		font-size: 0.8rem;
	}
	.results-search {
		margin: 1.5rem 0;
		max-width: 720px;
	}
	.tab-bar {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1rem;
		max-width: 780px;
	}
	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.9rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink-soft);
		background: transparent;
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}
	.tab:hover {
		background: rgba(255, 255, 255, 0.06);
	}
	.tab.active {
		color: #05131c;
		background: linear-gradient(180deg, #4fc3ff, var(--accent));
		border-color: rgba(255, 255, 255, 0.5);
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
