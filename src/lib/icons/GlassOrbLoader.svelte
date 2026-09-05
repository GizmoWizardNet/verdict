<script lang="ts">
	export let size = 40;
</script>

<!-- Custom loading indicator — an Aero glass orb with an orbiting highlight,
     matching the .aero-orb background motif instead of a generic spinner ring. -->
<svg
	width={size}
	height={size}
	viewBox="0 0 40 40"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="orb-spin"
>
	<circle cx="20" cy="20" r="17" fill="#1da1f2" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.4" />
	<circle cx="20" cy="8" r="3.2" fill="#ffffff" />
</svg>

<style>
	.orb-spin {
		animation: orb-rotate 1.1s linear infinite;
		transform-origin: 50% 50%;
	}
	@keyframes orb-rotate {
		to {
			transform: rotate(360deg);
		}
	}
</style>
