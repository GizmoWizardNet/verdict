<script lang="ts">
	import '$lib/styles/global.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { initAuthListener } from '$lib/stores/auth';
	import { theme } from '$lib/stores/theme';
	import { supabase } from '$lib/supabaseClient';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	onMount(() => {
		initAuthListener(data.session);
		theme.init();

		// The browser client updates its own (cookie-backed) session on sign-in/
		// sign-out/refresh. Re-run +layout.server.ts's `depends('supabase:auth')`
		// load so server-rendered pages (e.g. /stats) and API routes that read
		// locals.getSession() see the change without a full page reload.
		const { data: sub } = supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});

		return () => sub.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Verdict — search the change</title>
</svelte:head>

<Sidebar />

<main>
	<slot />
</main>

<style>
	main {
		position: relative;
		z-index: 1;
		box-sizing: border-box;
	}

	@media (min-width: 861px) {
		main {
			margin-left: calc(300px + 2rem);
			padding: 0 1.5rem 4rem;
		}
		main > :global(*) {
			max-width: 900px;
			margin-left: auto;
			margin-right: auto;
		}
	}

	@media (max-width: 860px) {
		main {
			padding: 0 1rem 4rem;
		}
	}
</style>