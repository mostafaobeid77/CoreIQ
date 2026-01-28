import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

function resolveLanUrl(): string | null {
	try {
		const hostUri = (Constants as any)?.expoConfig?.hostUri
			|| (Constants as any)?.manifest?.debuggerHost
			|| (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost
			|| (Constants as any)?.expoConfig?.extra?.expoGo?.debuggerHost;

		if (typeof hostUri === 'string' && hostUri.length > 0) {
			const host = hostUri.split(':')[0];
			if (host && host !== 'localhost' && host !== '127.0.0.1') {
				return `http://${host}:5000`;
			}
		}
	} catch (_err) {
		// swallow; we'll use fallbacks below
	}

	const sourceCode = (NativeModules as any)?.SourceCode;
	if (typeof sourceCode?.scriptURL === 'string') {
		const hostMatch = sourceCode.scriptURL.match(/https?:\/\/([^:]+):/);
		const host = hostMatch?.[1];
		if (host && host !== 'localhost' && host !== '127.0.0.1') {
			return `http://${host}:5000`;
		}
	}

	return null;
}

const fromEnv = (process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || '').trim();

// Toggle between development and production
const IS_DEVELOPMENT = false; // Set to false to use production backend

export const API_URLS: string[] = [
	// PRODUCTION
	'https://coreiq-backend.onrender.com',
	// LOCAL DEVELOPMENT (Physical Device) fallback
	'http://192.168.1.100:5000',
];

export function buildApiUrl(path: string): string[] {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return API_URLS.map((base) => `${base}${normalized}`);
}
