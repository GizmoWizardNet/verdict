<script lang="ts">
	import '$lib/styles/global.css';
	import { onMount } from 'svelte';
	import { initAuthListener } from '$lib/stores/auth';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	onMount(() => {
		initAuthListener(data.session);
	});
</script>

<svelte:head>
	<title>Verdict — search the change</title>
</svelte:head>

<div class="aero-orbs" aria-hidden="true">
	<div class="aero-orb" style="width: 340px; height: 340px; top: -80px; left: -60px;" />
	<div class="aero-orb" style="width: 220px; height: 220px; top: 40%; right: -40px; animation-delay: -6s;" />
	<div class="aero-orb" style="width: 160px; height: 160px; bottom: -40px; left: 30%; animation-delay: -14s;" />
</div>

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
