<script lang="ts">
	import '$lib/styles/global.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { initAuthListener } from '$lib/stores/auth';
	import { theme } from '$lib/stores/theme';
	import { supabase } from '$lib/supabaseClient';
	import { playClick } from '$lib/sfx';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ToastStack from '$lib/components/ToastStack.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	onMount(() => {
		initAuthListener(data.session);
		theme.init();
		
		const { data: sub } = supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});

		return () => sub.subscription.unsubscribe();
	});

	function onGlobalClick(e: MouseEvent) {
		if (!(e.target instanceof Element)) return;
		const trigger = e.target.closest('button, a.glass-btn, .nav-link');
		if (!trigger || trigger.hasAttribute('data-sfx-skip')) return;
		playClick();
	}
</script>

<svelte:window on:click|capture={onGlobalClick} />

<svelte:head>
	<title>Verdict — search the change</title>
</svelte:head>

<Sidebar />
<ToastStack />

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