<script lang="ts">
	import '$lib/styles/global.css';
	import { onMount } from 'svelte';
	import { initAuthListener } from '$lib/stores/auth';
	import { theme } from '$lib/stores/theme';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	onMount(() => {
		initAuthListener(data.session);
		theme.init();
	});
</script>

<svelte:head>
	<title>Verdict — search the change</title>
</svelte:head>

<Navbar />

<main>
	<slot />
</main>

<style>
	main {
		position: relative;
		z-index: 1;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1rem 4rem;
	}
</style>