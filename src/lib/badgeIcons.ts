import { Gavel, Layers, Trophy, Crown, Flame, CalendarCheck, Scale, PlusCircle, Award } from 'lucide-svelte';
import type { ComponentType } from 'svelte';

export const badgeIcons: Record<string, ComponentType> = {
	'first-verdict': Gavel,
	'ten-verdicts': Layers,
	'fifty-verdicts': Trophy,
	'hundred-verdicts': Crown,
	'streak-3': Flame,
	'streak-7': CalendarCheck,
	'sharp-juror': Scale,
	'first-index': PlusCircle
};

/** Fallback used if an unknown badge id ever shows up. */
export const defaultBadgeIcon: ComponentType = Award;
