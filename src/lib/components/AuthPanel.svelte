<script lang="ts">
	import { session, signInWith, signOut } from '$lib/stores/auth';
	import { LogOut } from 'lucide-svelte';
	import GoogleMark from '$lib/icons/GoogleMark.svelte';
	import DiscordMark from '$lib/icons/DiscordMark.svelte';

	let open = false;
</script>

<div class="auth-wrap">
	{#if $session}
		<button class="glass-btn user-chip" on:click={() => (open = !open)}>
			<img
				src={$session.user.user_metadata?.avatar_url}
				alt=""
				referrerpolicy="no-referrer"
				class="avatar"
			/>
			<span>{$session.user.user_metadata?.full_name ?? $session.user.email}</span>
		</button>
		{#if open}
			<div class="glass dropdown">
				<button class="glass-btn danger" on:click={signOut}><LogOut size={16} /> Sign out</button>
			</div>
		{/if}
	{:else}
		<button class="glass-btn accent" on:click={() => (open = !open)}>Sign in</button>
		{#if open}
			<div class="glass dropdown">
				<button class="glass-btn" on:click={() => signInWith('google')}>
					<GoogleMark size={16} /> Continue with Google
				</button>
				<button class="glass-btn" on:click={() => signInWith('discord')}>
					<DiscordMark size={16} /> Continue with Discord
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.auth-wrap {
		position: relative;
	}
	.user-chip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.avatar {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1px solid var(--glass-border);
	}
	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		min-width: 220px;
		z-index: 20;
	}
	.dropdown .glass-btn {
		justify-content: flex-start;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.dropdown .glass-btn.danger {
		color: #ff6b6b;
		border-color: rgba(255, 107, 107, 0.35);
	}
	.dropdown .glass-btn.danger:hover {
		background: linear-gradient(180deg, rgba(255, 107, 107, 0.25), rgba(255, 107, 107, 0.08));
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.3) inset, 0 10px 22px -8px rgba(255, 107, 107, 0.45);
	}
</style>