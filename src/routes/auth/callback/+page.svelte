<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import GlassOrbLoader from '$lib/icons/GlassOrbLoader.svelte';

	onMount(async () => {
		await supabase.auth.getSession();
		goto('/');
	});
</script>

<div class="callback">
	<GlassOrbLoader size={56} />
	<p>Signing you in…</p>
</div>

<style>
	.callback {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--ink-soft);
	}
</style>
