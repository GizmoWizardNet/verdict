import { browser } from '$app/environment';

function playOneShot(src: string) {
	if (!browser) return;
	const audio = new Audio(src);
	audio.play().catch(() => {});
}

export function playSearch() {
	playOneShot('/sfx/search.wav');
}

export function playVerdictDeliver() {
	playOneShot('/sfx/verdict_deliver.wav');
}

export function playClick() {
	playOneShot('/sfx/click.wav');
}

let typingAudio: HTMLAudioElement | null = null;
let typingStopTimer: ReturnType<typeof setTimeout> | undefined;

function getTypingAudio(): HTMLAudioElement | null {
	if (!browser) return null;
	if (!typingAudio) {
		typingAudio = new Audio('/sfx/typing.mp3');
		typingAudio.loop = true;
	}
	return typingAudio;
}

export function startTyping() {
	const audio = getTypingAudio();
	if (!audio) return;
	clearTimeout(typingStopTimer);
	if (audio.paused) {
		audio.currentTime = 0;
		audio.play().catch(() => {});
	}
	typingStopTimer = setTimeout(stopTyping, 500);
}

export function stopTyping() {
	clearTimeout(typingStopTimer);
	if (!typingAudio || typingAudio.paused) return;
	typingAudio.pause();
}