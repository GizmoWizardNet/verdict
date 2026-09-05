<script lang="ts">
	import { page } from "$app/stores";
	import VerdictMark from "$lib/icons/VerdictMark.svelte";
	import ProfileMenu from "$lib/components/ProfileMenu.svelte";
	import { House, PlusCircle, Menu, X } from "lucide-svelte";

	let mobileOpen = false;

	$: currentPath = $page.url.pathname;
</script>

<div class="glass mobile-bar">
	<a href="/" class="brand" on:click={() => (mobileOpen = false)}>
		<VerdictMark size={35} />
		<span class="wordmark display">VERDICT</span>
	</a>
	<button
		class="glass-btn icon-btn"
		on:click={() => (mobileOpen = !mobileOpen)}
		aria-label="Menu"
	>
		{#if mobileOpen}<X size={18} />{:else}<Menu size={18} />{/if}
	</button>
</div>

{#if mobileOpen}
	<button
		class="scrim"
		aria-label="Close menu"
		on:click={() => (mobileOpen = false)}
	/>
{/if}

<aside class="glass sidebar" class:open={mobileOpen}>
	<a href="/" class="brand" on:click={() => (mobileOpen = false)}>
		<VerdictMark size={35} />
	</a>

	<nav class="nav-links">
		<a
			href="/"
			class="nav-link"
			class:active={currentPath === "/"}
			on:click={() => (mobileOpen = false)}
		>
			<House size={20} />
			<span>Home</span>
		</a>
		<a
			href="/index-site"
			class="nav-link"
			class:active={currentPath === "/index-site"}
			on:click={() => (mobileOpen = false)}
		>
			<PlusCircle size={20} />
			<span>Index a site</span>
		</a>
	</nav>

	<div class="sidebar-footer">
		<ProfileMenu />
	</div>
</aside>

<style>
	/* ---- Desktop sidebar ------------------------------------------------ */
	.sidebar {
		position: fixed;
		top: 1rem;
		left: 1rem;
		bottom: 1rem;
		width: 300px;
		z-index: 30;
		display: flex;
		flex-direction: column;
		padding: 1.3rem 1.1rem;
		border-radius: var(--radius-lg);
		overflow: visible;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--paper);
		padding: 0.4rem 0.5rem 1.2rem;
	}
	.wordmark {
		font-size: 1.1rem;
		letter-spacing: 0.06em;
	}
	.nav-links {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.8rem 0.85rem;
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--ink-soft);
		font-weight: 600;
		font-size: 1rem;

		transition:
			background 0.16s var(--ease-aero),
			color 0.16s var(--ease-aero),
			transform 0.2s var(--ease-aero);
	}

	.nav-link:hover {
		background: var(--glass-fill);
		color: var(--paper);
		transform: rotate(3deg);
	}
	.nav-link.active {
		background: linear-gradient(
			180deg,
			var(--glass-fill-strong),
			var(--glass-fill)
		);
		color: var(--paper);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
	}
	.sidebar-footer {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--glass-border);
	}

	/* ---- Mobile top bar + drawer ----------------------------------------- */
	.mobile-bar {
		display: none;
	}
	.scrim {
		display: none;
	}
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.55rem;
	}

	@media (max-width: 860px) {
		.mobile-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			position: sticky;
			top: 0.75rem;
			z-index: 30;
			margin: 0.75rem;
			padding: 0.6rem 0.75rem 0.6rem 1rem;
			border-radius: var(--radius-lg);
		}
		.mobile-bar .brand {
			padding: 0;
		}
		.scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 39;
			background: rgba(0, 0, 0, 0.45);
			border: none;
			padding: 0;
			cursor: default;
		}
		.sidebar {
			top: 0;
			left: 0;
			bottom: 0;
			height: 100%;
			width: min(320px, 84vw);
			border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
			transform: translateX(-105%);
			transition: transform 0.24s var(--ease-aero);
			z-index: 40;
		}
		.sidebar.open {
			transform: translateX(0);
		}
		.sidebar .brand {
			display: none;
		}
	}
</style>
