import { writable } from 'svelte/store';

export interface ToastItem {
	id: number;
	title: string;
	message: string;
	/** Badge id, used to look up an icon in $lib/badgeIcons. */
	icon?: string;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);
	let counter = 0;

	function push(title: string, message: string, icon?: string) {
		const id = ++counter;
		update((items) => [...items, { id, title, message, icon }]);
		if (typeof window !== 'undefined') {
			setTimeout(() => dismiss(id), 5000);
		}
	}

	function dismiss(id: number) {
		update((items) => items.filter((item) => item.id !== id));
	}

	return { subscribe, push, dismiss };
}

export const toasts = createToastStore();

const SEEN_BADGES_KEY = 'verdict:earnedBadges';

/**
 * Takes the full list of badges the server says are currently earned and
 * toasts any the user hasn't been shown before (tracked in localStorage,
 * since badge state isn't otherwise cached on the client).
 */
export function announceNewBadges(earned: { id: string; label: string }[]) {
	if (typeof localStorage === 'undefined' || earned.length === 0) return;

	let seen: string[] = [];
	try {
		seen = JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) ?? '[]');
	} catch {
		seen = [];
	}
	const seenSet = new Set(seen);

	const newlyEarned = earned.filter((b) => !seenSet.has(b.id));
	if (newlyEarned.length === 0) return;

	for (const badge of newlyEarned) {
		toasts.push('Achievement unlocked', badge.label, badge.id);
		seenSet.add(badge.id);
	}
	localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify([...seenSet]));
}
