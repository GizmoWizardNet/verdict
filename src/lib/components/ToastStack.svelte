<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import { badgeIcons, defaultBadgeIcon } from '$lib/badgeIcons';
	import { X } from 'lucide-svelte';
</script>

{#if $toasts.length > 0}
	<div class="toast-stack">
		{#each $toasts as t (t.id)}
			<div class="toast glass">
				<span class="toast-icon">
					<svelte:component this={t.icon ? (badgeIcons[t.icon] ?? defaultBadgeIcon) : defaultBadgeIcon} size={20} />
				</span>
				<div class="toast-text">
					<strong>{t.title}</strong>
					<span>{t.message}</span>
				</div>
				<button class="toast-close" on:click={() => toasts.dismiss(t.id)} aria-label="Dismiss notification">
					<X size={14} />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-stack {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		width: min(320px, calc(100vw - 2rem));
		pointer-events: none;
	}
	.toast {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.75rem 0.85rem;
		border-radius: var(--radius-md);
		pointer-events: auto;
		animation: toast-in 0.3s var(--ease-aero);
	}
	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		border-radius: 999px;
		background: linear-gradient(180deg, #4fc3ff, var(--accent));
		color: #05131c;
	}
	.toast-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		font-size: 0.85rem;
		color: var(--paper);
		min-width: 0;
	}
	.toast-text strong {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		color: var(--accent);
	}
	.toast-close {
		margin-left: auto;
		flex-shrink: 0;
		display: flex;
		background: none;
		border: none;
		color: var(--ink-faint);
		cursor: pointer;
		padding: 0.25rem;
	}
	.toast-close:hover {
		color: var(--paper);
	}
	@keyframes toast-in {
		from {
			transform: translateX(16px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
