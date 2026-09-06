interface CacheEntry<T> {
	value: T;
	expires: number;
}

export class TTLCache<T> {
	private store = new Map<string, CacheEntry<T>>();

	constructor(private maxEntries = 500) {}

	get(key: string): T | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expires) {
			this.store.delete(key);
			return undefined;
		}
		return entry.value;
	}

	set(key: string, value: T, ttlMs: number): void {
		if (!this.store.has(key) && this.store.size >= this.maxEntries) {
			const oldestKey = this.store.keys().next().value;
			if (oldestKey !== undefined) this.store.delete(oldestKey);
		}
		this.store.set(key, { value, expires: Date.now() + ttlMs });
	}

	delete(key: string): void {
		this.store.delete(key);
	}
}

/* exports */
export const searxngOgCache = new TTLCache<unknown>(300);
export const imageSearchCache = new TTLCache<unknown>(300);
export const ogCache = new TTLCache<unknown>(3000);