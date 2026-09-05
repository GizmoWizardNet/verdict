<script lang="ts">
	import { ChevronUp, ChevronDown, Gavel } from 'lucide-svelte';
	import { session, signInWith } from '$lib/stores/auth';
	import { playVerdictDeliver, playClick } from '$lib/sfx';
	import { announceNewBadges } from '$lib/stores/toast';

	export let url: string;
	export let title: string;
	export let description: string;
	export let image: string | null;
	export let upvotes: number;
	export let downvotes: number;

	let myVote: 1 | -1 | 0 = 0;
	let pending = false;
	let jellyUp = false;
	let jellyDown = false;
	let strike = false;
	let strikeLabel = '';
	let shockUp = false;
	let shockDown = false;

	async function vote(value: 1 | -1) {
		if (!$session) {
			await signInWith('google');
			return;
		}
		if (pending) return;
		pending = true;

		const next = myVote === value ? 0 : value;
		const prevVote = myVote;
		const prevUp = upvotes;
		const prevDown = downvotes;
		const wasUnrated = prevUp + prevDown === 0;

		// optimistic update
		if (prevVote === 1) upvotes--;
		if (prevVote === -1) downvotes--;
		if (next === 1) upvotes++;
		if (next === -1) downvotes++;
		myVote = next;

		if (value === 1) {
			jellyUp = true;
			setTimeout(() => (jellyUp = false), 500);
		} else {
			jellyDown = true;
			setTimeout(() => (jellyDown = false), 500);
		}

		if (next !== 0) {
			playVerdictDeliver();
			strikeLabel = wasUnrated ? 'FIRST VERDICT' : 'VERDICT DELIVERED';
			strike = true;
			setTimeout(() => (strike = false), 650);
			if (value === 1) {
				shockUp = true;
				setTimeout(() => (shockUp = false), 550);
			} else {
				shockDown = true;
				setTimeout(() => (shockDown = false), 550);
			}
		} else {
			playClick();
		}

		try {
			const res = await fetch('/api/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url, title, description, image, value: next })
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			upvotes = data.upvotes;
			downvotes = data.downvotes;
			if (data.earnedBadges) announceNewBadges(data.earnedBadges);
		} catch {
			// revert on failure
			upvotes = prevUp;
			downvotes = prevDown;
			myVote = prevVote;
		} finally {
			pending = false;
		}
	}
</script>

<div class="votes">
	{#if strike}
		<div class="strike-label" class:down={myVote === -1}>
			<Gavel size={13} />
			{strikeLabel}
		</div>
	{/if}

	<button
		class="vote-btn"
		class:selected={myVote === 1}
		class:jelly-pop={jellyUp}
		data-sfx-skip
		on:click={() => vote(1)}
		aria-pressed={myVote === 1}
		aria-label="Upvote"
	>
		{#if shockUp}<span class="shockwave up" />{/if}
		<ChevronUp size={22} />
	</button>
	<span class="count" class:pulse={strike}>{upvotes - downvotes}</span>
	<button
		class="vote-btn down"
		class:selected={myVote === -1}
		class:jelly-pop={jellyDown}
		data-sfx-skip
		on:click={() => vote(-1)}
		aria-pressed={myVote === -1}
		aria-label="Downvote"
	>
		{#if shockDown}<span class="shockwave down" />{/if}
		<ChevronDown size={22} />
	</button>
</div>

<style>
	.votes {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		min-width: 50px;
	}
	.vote-btn {
		position: relative;
		background: var(--glass-fill);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		color: var(--ink-soft);
		cursor: pointer;
		display: flex;
		padding: 0.3rem;
		transition: color 0.15s, background 0.15s, transform 0.15s var(--ease-aero);
		overflow: visible;
	}
	.vote-btn:hover {
		background: var(--glass-fill-strong);
		color: var(--paper);
		transform: scale(1.06);
	}
	.vote-btn.selected {
		color: var(--accent);
		background: var(--accent-soft);
		box-shadow: 0 0 0 1px var(--accent-soft), 0 0 18px -4px var(--accent-glow);
	}
	.vote-btn.down.selected {
		color: #ff6b6b;
		background: rgba(255, 107, 107, 0.18);
		box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.35), 0 0 18px -4px rgba(255, 107, 107, 0.55);
	}
	.count {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.05rem;
		transition: transform 0.2s var(--ease-aero), color 0.2s;
	}
	.count.pulse {
		animation: count-pulse 0.5s var(--ease-aero);
	}
	@keyframes count-pulse {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.45);
			color: var(--accent);
		}
		100% {
			transform: scale(1);
		}
	}
	.shockwave {
		position: absolute;
		inset: 0;
		border-radius: var(--radius-sm);
		pointer-events: none;
		border: 2px solid var(--accent);
		animation: shock 0.55s var(--ease-aero) forwards;
	}
	.shockwave.down {
		border-color: #ff6b6b;
	}
	@keyframes shock {
		0% {
			transform: scale(1);
			opacity: 0.9;
		}
		100% {
			transform: scale(2.2);
			opacity: 0;
		}
	}

	/* Floating "VERDICT DELIVERED" callout above the vote stack. */
	.strike-label {
		position: absolute;
		top: -1.9rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.3rem;
		white-space: nowrap;
		font-family: var(--font-display);
		font-size: 0.62rem;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		color: #05131c;
		background: linear-gradient(180deg, #4fc3ff, var(--accent));
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 8px 18px -6px var(--accent-glow);
		animation: label-pop 0.65s var(--ease-aero) forwards;
		z-index: 5;
	}
	.strike-label.down {
		background: linear-gradient(180deg, #ff9d9d, #ff6b6b);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 8px 18px -6px rgba(255, 107, 107, 0.55);
	}
	@keyframes label-pop {
		0% {
			transform: translate(-50%, 4px) scale(0.7);
			opacity: 0;
		}
		25% {
			transform: translate(-50%, 0) scale(1.08);
			opacity: 1;
		}
		75% {
			transform: translate(-50%, 0) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -6px) scale(0.95);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shockwave,
		.strike-label,
		.count.pulse {
			animation: none;
		}
	}
</style>