<script lang="ts">
	import VerdictMark from '$lib/icons/VerdictMark.svelte';
	import AuthPanel from '$lib/components/AuthPanel.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { BarChart3, PlusCircle } from 'lucide-svelte';
</script>

<nav class="glass navbar">
	<a href="/" class="brand">
		<VerdictMark size={30} />
		<span class="wordmark display">VERDICT</span>
	</a>

	<div class="links">
		<a href="/stats" class="glass-btn"><BarChart3 size={16} /> Stats</a>
		<a href="/index-site" class="glass-btn"><PlusCircle size={16} /> Index a site</a>
		<ThemeToggle />
		<AuthPanel />
	</div>
</nav>

<style>
	.navbar {
		position: sticky;
		top: 1rem;
		z-index: 30;
		margin: 1rem auto;
		max-width: 1100px;
		width: calc(100% - 2rem);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		border-radius: var(--radius-lg);
		/* .glass sets overflow: hidden to clip its shine pseudo-element, but that
		   also clips the absolutely-positioned sign-in dropdown rendered inside
		   this nav. Override it here so the dropdown isn't cut off/hidden. */
		overflow: visible;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--paper);
	}
	.wordmark {
		font-size: 1.1rem;
		letter-spacing: 0.06em;
	}
	.links {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.links a.glass-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		text-decoration: none;
		font-size: 0.9rem;
	}
	@media (max-width: 640px) {
		.links a.glass-btn span {
			display: none;
		}
	}
</style>