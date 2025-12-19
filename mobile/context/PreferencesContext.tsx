import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UnitsSystem = 'metric' | 'imperial';

interface PreferencesContextShape {
	units: UnitsSystem;
	setUnits: (u: UnitsSystem) => void;
	// Converters always return display units based on current units
	formatWeight: (kgValue: number) => string; // e.g., '70 kg' or '154 lb'
	formatHeight: (cmValue: number) => string; // e.g., '180 cm' or 5'11"
	toKg: (value: number) => number;
	toCm: (value: number) => number;
}

const PreferencesContext = createContext<PreferencesContextShape | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [units, setUnitsState] = useState<UnitsSystem>('metric');

	useEffect(() => {
		try {
			const stored = (global as any)?.localStorage?.getItem?.('app_units');
			if (stored === 'metric' || stored === 'imperial') {
				setUnitsState(stored);
			}
		} catch (_e) {}
	}, []);

	const setUnits = (u: UnitsSystem) => {
		setUnitsState(u);
		try {
			(global as any)?.localStorage?.setItem?.('app_units', u);
		} catch (_e) {}
	};

	function formatNumberMax3(value: number) {
		// at most 3 decimals, trim trailing zeros
		const fixed = value.toFixed(3);
		return fixed.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
	}

	const formatWeight = (kgValue: number) => {
		if (!kgValue || kgValue <= 0) return 'Not set';
		if (units === 'imperial') {
			const lb = kgValue * 2.2046226218;
			return `${formatNumberMax3(lb)} lb`;
		}
		return `${formatNumberMax3(kgValue)} kg`;
	};

	const formatHeight = (cmValue: number) => {
		if (!cmValue || cmValue <= 0) return 'Not set';
		if (units === 'imperial') {
			const totalInches = Math.round(cmValue / 2.54);
			const feet = Math.floor(totalInches / 12);
			const inches = totalInches % 12;
			return `${feet}'${inches}\"`;
		}
		return `${formatNumberMax3(cmValue)} cm`;
	};

	const toKg = (value: number) => (units === 'imperial' ? value / 2.2046226218 : value);
	const toCm = (value: number) => (units === 'imperial' ? value * 2.54 : value);

	const value = useMemo(
		() => ({ units, setUnits, formatWeight, formatHeight, toKg, toCm }),
		[units]
	);

	return (
		<PreferencesContext.Provider value={value}>
			{children}
		</PreferencesContext.Provider>
	);
};

export function usePreferences() {
	const ctx = useContext(PreferencesContext);
	if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
	return ctx;
}


