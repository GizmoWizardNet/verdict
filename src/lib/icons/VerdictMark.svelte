<script lang="ts">
	export let size = 32;
</script>

<!--
	Custom brand mark — not available in lucide. A checkmark rendered as a
	gavel strike, inside a glass roundel, reading "verdict reached" at a glance.
-->
<svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="vm-glass" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
			<stop offset="45%" stop-color="#ffffff" stop-opacity="0.25" />
			<stop offset="100%" stop-color="#1da1f2" stop-opacity="0.35" />
		</linearGradient>
	</defs>
	<circle cx="24" cy="24" r="22" fill="url(#vm-glass)" stroke="#ffffff" stroke-opacity="0.6" />
	<path
		d="M14 24.5L20.5 31L34 16"
		stroke="#0a0a0a"
		stroke-width="4.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M14 24.5L20.5 31L34 16"
		stroke="#1da1f2"
		stroke-width="4.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-opacity="0.55"
		transform="translate(-0.6 -0.6)"
	/>
</svg>
