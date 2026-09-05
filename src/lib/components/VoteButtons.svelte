<script lang="ts">
	import { ChevronUp, ChevronDown } from 'lucide-svelte';
	import { session, signInWith } from '$lib/stores/auth';

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
	<button
		class="vote-btn"
		class:selected={myVote === 1}
		class:jelly-pop={jellyUp}
		on:click={() => vote(1)}
		aria-pressed={myVote === 1}
		aria-label="Upvote"
	>
		<ChevronUp size={20} />
	</button>
	<span class="count">{upvotes - downvotes}</span>
	<button
		class="vote-btn down"
		class:selected={myVote === -1}
		class:jelly-pop={jellyDown}
		on:click={() => vote(-1)}
		aria-pressed={myVote === -1}
		aria-label="Downvote"
	>
		<ChevronDown size={20} />
	</button>
</div>

<style>
	.votes {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		min-width: 44px;
	}
	.vote-btn {
		background: var(--glass-fill);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		color: var(--ink-soft);
		cursor: pointer;
		display: flex;
		padding: 0.2rem;
		transition: color 0.15s, background 0.15s;
	}
	.vote-btn:hover {
		background: var(--glass-fill-strong);
		color: var(--paper);
	}
	.vote-btn.selected {
		color: var(--accent);
		background: var(--accent-soft);
	}
	.vote-btn.down.selected {
		color: #ff6b6b;
		background: rgba(255, 107, 107, 0.18);
	}
	.count {
		font-weight: 700;
		font-size: 0.95rem;
	}
</style>
