import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key: string) => event.cookies.get(key),
			set: (key: string, value: string, options: CookieSerializeOptions) => {
				event.cookies.set(key, value, { ...options, path: '/' });
			},
			remove: (key: string, options: CookieSerializeOptions) => {
				event.cookies.delete(key, { ...options, path: '/' });
			}
		}
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
