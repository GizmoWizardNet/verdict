<script lang="ts">
	export let size = 18;
</script>

<!-- Custom badge for results promoted by community vote — a faceted "ranked" gem,
     distinct from any generic star/trophy so it reads as a Verdict-specific signal. -->
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path
		d="M12 2L20 8L17.5 20H6.5L4 8L12 2Z"
		fill="#1da1f2"
		fill-opacity="0.85"
		stroke="#ffffff"
		stroke-opacity="0.7"
		stroke-width="1.1"
		stroke-linejoin="round"
	/>
	<path d="M12 2L20 8L12 12L4 8L12 2Z" fill="#ffffff" fill-opacity="0.35" />
	<path d="M12 12L17.5 20H6.5L12 12Z" fill="#0a0a0a" fill-opacity="0.18" />
</svg>
