<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, X } from 'lucide-svelte';

	export let value = '';
	export let autofocus = false;

	const dispatch = createEventDispatcher<{ search: string }>();

	let suggestions: string[] = [];
	let showSuggestions = false;
	let highlighted = -1;
	let debounceTimer: ReturnType<typeof setTimeout>;

	function onInput() {
		clearTimeout(debounceTimer);
		highlighted = -1;
		if (!value.trim()) {
			suggestions = [];
			return;
		}
		debounceTimer = setTimeout(async () => {
			const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(value)}`);
			const data = await res.json();
			suggestions = data.suggestions ?? [];
			showSuggestions = suggestions.length > 0;
		}, 180);
	}

	function submit(query = value) {
		if (!query.trim()) return;
		value = query;
		showSuggestions = false;
		dispatch('search', query.trim());
	}

	function onKeydown(e: KeyboardEvent) {
		if (!showSuggestions) {
			if (e.key === 'Enter') submit();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlighted = Math.min(highlighted + 1, suggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlighted = Math.max(highlighted - 1, -1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			submit(highlighted >= 0 ? suggestions[highlighted] : value);
		} else if (e.key === 'Escape') {
			showSuggestions = false;
		}
	}
</script>

<div class="search-wrap">
	<div class="glass bar">
		<Search size={20} color="var(--ink-soft)" />
		<input
			type="text"
			bind:value
			placeholder="Search the change…"
			{autofocus}
			on:input={onInput}
			on:keydown={onKeydown}
			on:focus={() => (showSuggestions = suggestions.length > 0)}
			on:blur={() => setTimeout(() => (showSuggestions = false), 120)}
			aria-autocomplete="list"
			aria-expanded={showSuggestions}
		/>
		{#if value}
			<button class="clear" on:click={() => (value = '') } aria-label="Clear search">
				<X size={16} />
			</button>
		{/if}
		<button class="glass-btn accent go" on:click={() => submit()}>Seek</button>
	</div>

	{#if showSuggestions}
		<ul class="glass suggestions scrollbar-glass">
			{#each suggestions as s, i}
				<li>
					<button
						class:active={i === highlighted}
						on:mousedown|preventDefault={() => submit(s)}
					>
						{s}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search-wrap {
		position: relative;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.7rem 0.9rem;
		border-radius: 999px;
	}
	.bar::before {
		border-radius: 999px 999px 50% 50% / 999px 999px 100% 100%;
	}
	input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--paper);
		font-size: 1.05rem;
		min-width: 0;
	}
	input::placeholder {
		color: var(--ink-faint);
	}
	.clear {
		background: none;
		border: none;
		color: var(--ink-soft);
		cursor: pointer;
		display: flex;
	}
	.go {
		border-radius: 999px;
		padding: 0.55rem 1.3rem;
		white-space: nowrap;
	}
	.suggestions {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		list-style: none;
		margin: 0;
		padding: 0.4rem;
		max-height: 280px;
		overflow-y: auto;
		z-index: 25;
	}
	.suggestions button {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		color: var(--ink-soft);
		padding: 0.55rem 0.8rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.95rem;
	}
	.suggestions button:hover,
	.suggestions button.active {
		background: var(--glass-fill-strong);
		color: var(--paper);
	}
</style>
