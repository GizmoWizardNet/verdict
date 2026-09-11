<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import ImageResults from '$lib/components/ImageResults.svelte';
	import GlassOrbLoader from '$lib/icons/GlassOrbLoader.svelte';
	import VerdictMark from '$lib/icons/VerdictMark.svelte';
	import { Github, Globe, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { ImageResult } from '$lib/types/image';

	let query = '';
	let results: any[] = [];
	let loading = false;
	let searched = false;
	let errorMsg = '';
	let resultsPage = 1;
	let resultsHasMore = false;

	type Tab = 'web' | 'images';
	let activeTab: Tab = 'web';

	let images: ImageResult[] = [];
	let imagesLoading = false;
	let imagesErrorMsg = '';
	let imagesPage = 1;
	let imagesHasMore = false;

	let imagesForQuery: string | null = null;
	const webCache = new Map<string, { results: any[]; hasMore: boolean }>();
	const imageCache = new Map<string, { results: ImageResult[]; hasMore: boolean }>();
	const cacheKey = (q: string, p: number) => `${q.toLowerCase()}::${p}`;
	let lastUrlQuery: string | null = null;

	async function runSearch(q: string, pageno = 1) {
		query = q;
		resultsPage = pageno;
		errorMsg = '';
		searched = true;
		activeTab = 'web';
		if (browser) {
			const params = new URLSearchParams({ q });
			if (pageno > 1) params.set('page', String(pageno));
			goto(`/?${params}`, { replaceState: true, keepFocus: true, noScroll: true });
		}

		const key = cacheKey(q, pageno);
		const cached = webCache.get(key);
		if (cached) {
			results = cached.results;
			resultsHasMore = cached.hasMore;
			return;
		}

		loading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pageno}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			results = data.results;
			resultsHasMore = Boolean(data.hasMore);
			webCache.set(key, { results, hasMore: resultsHasMore });
		} catch (e) {
			errorMsg = 'Search failed — check that SearXNG is reachable.';
			results = [];
			resultsHasMore = false;
		} finally {
			loading = false;
		}
	}

	async function runImageSearch(q: string, pageno = 1) {
		imagesPage = pageno;
		imagesErrorMsg = '';

		const key = cacheKey(q, pageno);
		const cached = imageCache.get(key);
		if (cached) {
			images = cached.results;
			imagesHasMore = cached.hasMore;
			imagesForQuery = q;
			return;
		}

		imagesLoading = true;
		try {
			const res = await fetch(`/api/search/images?q=${encodeURIComponent(q)}&page=${pageno}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			images = data.results;
			imagesHasMore = Boolean(data.hasMore);
			imagesForQuery = q;
			imageCache.set(key, { results: images, hasMore: imagesHasMore });
		} catch (e) {
			imagesErrorMsg = 'Image search failed — check that SearXNG is reachable.';
			images = [];
			imagesHasMore = false;
		} finally {
			imagesLoading = false;
		}
	}

	function selectTab(tab: Tab) {
		activeTab = tab;
		if (tab === 'images' && (imagesForQuery !== query || imagesPage !== 1)) {
			runImageSearch(query, 1);
		}
	}

	function nextResultsPage() {
		if (resultsHasMore) runSearch(query, resultsPage + 1);
	}
	function prevResultsPage() {
		if (resultsPage > 1) runSearch(query, resultsPage - 1);
	}
	function nextImagesPage() {
		if (imagesHasMore) runImageSearch(query, imagesPage + 1);
	}
	function prevImagesPage() {
		if (imagesPage > 1) runImageSearch(query, imagesPage - 1);
	}

	$: {
		const q = $page.url.searchParams.get('q') ?? '';
		const urlPage = Number($page.url.searchParams.get('page') ?? '1') || 1;
		if (q !== lastUrlQuery) {
			lastUrlQuery = q;
			if (q) {
				if (q !== query || urlPage !== resultsPage) runSearch(q, urlPage);
			} else {
				query = '';
				searched = false;
				results = [];
				errorMsg = '';
				resultsPage = 1;
				resultsHasMore = false;
				activeTab = 'web';
				images = [];
				imagesForQuery = null;
				imagesErrorMsg = '';
				imagesPage = 1;
				imagesHasMore = false;
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
			<div class="pagination">
				<button class="glass-btn" disabled={resultsPage <= 1} on:click={prevResultsPage}>
					<ChevronLeft size={16} />
					Prev
				</button>
				<span class="page-indicator">Page {resultsPage}</span>
				<button class="glass-btn" disabled={!resultsHasMore} on:click={nextResultsPage}>
					Next
					<ChevronRight size={16} />
				</button>
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
			{#if images.length > 0}
				<div class="pagination">
					<button class="glass-btn" disabled={imagesPage <= 1} on:click={prevImagesPage}>
						<ChevronLeft size={16} />
						Prev
					</button>
					<span class="page-indicator">Page {imagesPage}</span>
					<button class="glass-btn" disabled={!imagesHasMore} on:click={nextImagesPage}>
						Next
						<ChevronRight size={16} />
					</button>
				</div>
			{/if}
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
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin: 1.5rem 0;
		max-width: 780px;
	}
	.pagination .glass-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.5rem 0.9rem;
		font-size: 0.85rem;
	}
	.pagination .glass-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.page-indicator {
		font-size: 0.82rem;
		color: var(--ink-faint);
		font-weight: 600;
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