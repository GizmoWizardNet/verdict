<script lang="ts">
	import { session, signInWith, signOut } from '$lib/stores/auth';
	import { theme } from '$lib/stores/theme';
	import { LogOut, BarChart3, Moon, Sun, ChevronRight, Check } from 'lucide-svelte';
	import GoogleMark from '$lib/icons/GoogleMark.svelte';
	import DiscordMark from '$lib/icons/DiscordMark.svelte';

	let open = false;
	let themeExpanded = false;

	function closeAll() {
		open = false;
		themeExpanded = false;
	}
</script>

<svelte:window on:click|capture={(e) => {
	if (!(e.target instanceof Element) || !e.target.closest('.profile-wrap')) closeAll();
}} />

<div class="profile-wrap">
	{#if $session}
		<button class="glass-btn user-chip" on:click={() => (open = !open)}>
			<img
				src={$session.user.user_metadata?.avatar_url}
				alt=""
				referrerpolicy="no-referrer"
				class="avatar"
			/>
			<span class="user-name">{$session.user.user_metadata?.full_name ?? $session.user.email}</span>
		</button>
		{#if open}
			<div class="glass dropdown">
				<a href="/stats" class="glass-btn menu-item" on:click={closeAll}>
					<BarChart3 size={16} /> Stats
				</a>

				<button class="glass-btn menu-item" on:click={() => (themeExpanded = !themeExpanded)}>
					{#if $theme === 'dark'}<Moon size={16} />{:else}<Sun size={16} />{/if}
					Theme
					<span class="chevron" class:rotated={themeExpanded}><ChevronRight size={14} /></span>
				</button>
				{#if themeExpanded}
					<div class="theme-options">
						<button class="glass-btn menu-item sub" on:click={() => theme.set('light')}>
							<Sun size={16} /> Light
							{#if $theme === 'light'}<span class="check"><Check size={14} /></span>{/if}
						</button>
						<button class="glass-btn menu-item sub" on:click={() => theme.set('dark')}>
							<Moon size={16} /> Dark
							{#if $theme === 'dark'}<span class="check"><Check size={14} /></span>{/if}
						</button>
					</div>
				{/if}

				<div class="divider" />

				<button class="glass-btn menu-item danger" on:click={() => { signOut(); closeAll(); }}>
					<LogOut size={16} /> Sign out
				</button>
			</div>
		{/if}
	{:else}
		<button class="glass-btn accent" on:click={() => (open = !open)}>Sign in</button>
		{#if open}
			<div class="glass dropdown">
				<button class="glass-btn menu-item" on:click={() => { signInWith('google'); closeAll(); }}>
					<GoogleMark size={16} /> Continue with Google
				</button>
				<button class="glass-btn menu-item" on:click={() => { signInWith('discord'); closeAll(); }}>
					<DiscordMark size={16} /> Continue with Discord
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.profile-wrap {
		position: relative;
		width: 100%;
	}
	.user-chip {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		text-align: left;
	}
	.avatar {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		border-radius: 50%;
		border: 1px solid var(--glass-border);
	}
	.user-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.accent {
		width: 100%;
	}

	/* Anchored above the button (bottom-of-sidebar placement), like Smolish's
	   profile menu. */
	.dropdown {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.6rem;
		min-width: 230px;
		z-index: 20;
	}
	.menu-item {
		justify-content: flex-start;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		text-decoration: none;
		border: none;
		background: transparent;
		box-shadow: none;
		backdrop-filter: none;
		padding: 0.6rem 0.6rem;
	}
	.menu-item:hover {
		background: var(--glass-fill);
		transform: none;
		box-shadow: none;
	}
	.menu-item .chevron {
		margin-left: auto;
		display: inline-flex;
		transition: transform 0.16s var(--ease-aero);
	}
	.menu-item .chevron.rotated {
		transform: rotate(90deg);
	}
	.theme-options {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding-left: 0.6rem;
		border-left: 2px solid var(--glass-border);
		margin-left: 0.9rem;
	}
	.menu-item.sub {
		padding-left: 0.6rem;
	}
	.menu-item .check {
		margin-left: auto;
		display: inline-flex;
		color: var(--accent);
	}
	.divider {
		height: 1px;
		background: var(--glass-border);
		margin: 0.3rem 0;
	}
	.menu-item.danger {
		color: #ff6b6b;
	}
	.menu-item.danger:hover {
		background: rgba(255, 107, 107, 0.14);
	}
</style>