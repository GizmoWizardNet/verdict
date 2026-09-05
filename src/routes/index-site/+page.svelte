<script lang="ts">
	import { session, signInWith } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { PlusCircle } from 'lucide-svelte';

	let url = '';
	let loading = false;
	let errorMsg = '';
	let done = false;

	async function submit() {
		if (!$session) {
			await signInWith('google');
			return;
		}
		loading = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/index-site', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'Failed to index site');
			done = true;
			setTimeout(() => goto(`/site/${data.id}`), 900);
		} catch (e: any) {
			errorMsg = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Index a site — Verdict</title>
</svelte:head>

<div class="glass panel">
	<h1 class="display">INDEX A SITE</h1>
	<p class="sub">
		Add a site that isn't directly in SearXNG's index yet. Verdict will fetch it, index it, and make it searchable for everyone. and then boom boom skibidi uh
	</p>

	<form on:submit|preventDefault={submit}>
		<input type="url" placeholder="https://example.com" bind:value={url} required />
		<button class="glass-btn accent" type="submit" disabled={loading}>
			<PlusCircle size={16} />
			{loading ? 'Indexing…' : 'Index it'}
		</button>
	</form>

	{#if errorMsg}<p class="error">{errorMsg}</p>{/if}
	{#if done}<p class="success">Indexed! Taking you there…</p>{/if}
</div>

<style>
	.panel {
		max-width: 560px;
		margin: 3rem auto;
		padding: 2rem;
		border-radius: var(--radius-lg);
	}
	h1 {
		font-size: 1.7rem;
	}
	.sub {
		color: var(--ink-soft);
		margin: 0.8rem 0 1.5rem;
	}
	form {
		display: flex;
		gap: 0.6rem;
	}
	input {
		flex: 1;
		background: var(--glass-fill);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		padding: 0.7rem 0.9rem;
		color: var(--paper);
		font-family: var(--font-body);
		font-size: 0.95rem;
	}
	button {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		white-space: nowrap;
	}
	.error {
		color: #ff8080;
		margin-top: 1rem;
	}
	.success {
		color: var(--accent);
		margin-top: 1rem;
	}
</style>
