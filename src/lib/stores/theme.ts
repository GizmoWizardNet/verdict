import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (!browser) return 'dark';
	const attr = document.documentElement.getAttribute('data-theme');
	if (attr === 'light' || attr === 'dark') return attr;
	const stored = localStorage.getItem('verdict-theme');
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function createThemeStore() {
	const { subscribe, set } = writable<Theme>(getInitialTheme());

	function apply(theme: Theme) {
		if (browser) {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('verdict-theme', theme);
		}
		set(theme);
	}

	return {
		subscribe,
		set: apply,
		toggle: () => {
			const current = getInitialTheme();
			apply(current === 'dark' ? 'light' : 'dark');
		},
		init: () => {
			set(getInitialTheme());
		}
	};
}

export const theme = createThemeStore();