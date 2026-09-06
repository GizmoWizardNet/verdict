<script lang="ts">
	import { Magnifier } from 'svelte-magnifier';
	import { Download, X, ExternalLink } from 'lucide-svelte';
	import type { ImageResult } from '$lib/types/image';

	export let images: ImageResult[] = [];

	let active: ImageResult | null = null;
	let broken = new Set<string>();

	function openLightbox(img: ImageResult) {
		active = img;
	}

	function closeLightbox() {
		active = null;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeLightbox();
	}

	function markBroken(src: string) {
		broken = new Set(broken).add(src);
	}

	function downloadHref(img: ImageResult) {
		return `/api/image-download?url=${encodeURIComponent(img.img_src)}`;
	}
</script>

<svelte:window on:keydown={active ? onKeydown : undefined} />

{#if images.length === 0}
	<p class="empty glass">No images found.</p>
{:else}
	<div class="image-grid">
		{#each images as img (img.img_src)}
			{#if !broken.has(img.thumbnail_src)}
				<button class="image-tile glass" on:click={() => openLightbox(img)} title={img.title}>
					<img
						src={img.thumbnail_src}
						alt={img.title}
						loading="lazy"
						on:error={() => markBroken(img.thumbnail_src)}
					/>
					<span class="image-source">{img.source}</span>
				</button>
			{/if}
		{/each}
	</div>
{/if}

{#if active}
	<div class="lightbox-backdrop" on:click={closeLightbox}>
		<div class="lightbox glass" on:click|stopPropagation>
			<div class="lightbox-header">
				<div class="lightbox-meta">
					<strong>{active.title || 'Untitled image'}</strong>
					<span>{active.source}</span>
				</div>
				<div class="lightbox-actions">
					<a
						class="icon-btn"
						href={downloadHref(active)}
						download
						title="Download image"
						aria-label="Download image"
					>
						<Download size={18} />
					</a>
					<a
						class="icon-btn"
						href={active.url}
						target="_blank"
						rel="noopener noreferrer"
						title="Open source page"
						aria-label="Open source page"
					>
						<ExternalLink size={18} />
					</a>
					<button class="icon-btn" on:click={closeLightbox} title="Close" aria-label="Close">
						<X size={18} />
					</button>
				</div>
			</div>
			<div class="lightbox-image">
				<Magnifier src={active.img_src} alt={active.title} width="100%" height="auto" mgShape="square" />
			</div>
		</div>
	</div>
{/if}

<style>
	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.8rem;
	}
	.image-tile {
		position: relative;
		display: block;
		padding: 0;
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: zoom-in;
		aspect-ratio: 1 / 1;
		background: var(--glass-fill);
		transition: transform 0.16s var(--ease-aero), box-shadow 0.16s var(--ease-aero);
	}
	.image-tile:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 22px -10px var(--accent-glow);
	}
	.image-tile img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.image-source {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.3rem 0.5rem;
		font-size: 0.68rem;
		color: var(--paper);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.65), transparent);
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.empty {
		padding: 1.2rem 1.4rem;
		border-radius: var(--radius-md);
		color: var(--ink-soft);
		max-width: 620px;
	}

	.lightbox-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.72);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		padding: 2rem;
	}
	.lightbox {
		width: min(720px, 100%);
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.lightbox-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid var(--glass-border);
	}
	.lightbox-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.lightbox-meta strong {
		font-size: 0.9rem;
		color: var(--paper);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.lightbox-meta span {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}
	.lightbox-actions {
		display: flex;
		gap: 0.4rem;
		flex-shrink: 0;
	}
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-border);
		background: rgba(255, 255, 255, 0.06);
		color: var(--paper);
		cursor: pointer;
		transition: background 0.15s;
	}
	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.16);
	}
	.lightbox-image {
		padding: 1rem;
		overflow: auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.lightbox-image :global(.magnifier) {
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
</style>
