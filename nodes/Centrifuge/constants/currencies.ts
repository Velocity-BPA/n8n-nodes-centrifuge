/**
 * Centrifuge Currency and Token Definitions
 *
 * Centrifuge supports multiple currency types:
 * - Native CFG token for governance and fees
 * - Pool currencies (usually stablecoins like USDC, DAI)
 * - Tranche tokens representing pool shares
 * - Asset NFTs representing real-world assets
 *
 * Decimal handling is critical:
 * - CFG: 18 decimals
 * - Most stablecoins: 6 decimals (USDC, USDT)
 * - DAI: 18 decimals
 * - Pool currencies vary by configuration
 */

/**
 * Currency type enum matching Centrifuge runtime
 */
export enum CurrencyType {
	Native = 'Native',
	Tranche = 'Tranche',
	AUSD = 'AUSD',
	ForeignAsset = 'ForeignAsset',
	Staking = 'Staking',
	LocalAsset = 'LocalAsset',
}

/**
 * Currency metadata interface
 */
export interface CurrencyMetadata {
	symbol: string;
	name: string;
	decimals: number;
	currencyId: CurrencyId;
	minBalance: string;
	existentialDeposit: string;
}

/**
 * Currency ID structure (matches Centrifuge runtime)
 */
export type CurrencyId =
	| { Native: null }
	| { Tranche: [string, string] } // [poolId, trancheId]
	| { AUSD: null }
	| { ForeignAsset: number }
	| { Staking: string }
	| { LocalAsset: number };

/**
 * Native CFG token configuration
 */
export const CFG_TOKEN: CurrencyMetadata = {
	symbol: 'CFG',
	name: 'Centrifuge',
	decimals: 18,
	currencyId: { Native: null },
	minBalance: '1000000000000', // 0.000001 CFG
	existentialDeposit: '1000000000000000', // 0.001 CFG
};

/**
 * AIR token (Altair/Kusama network)
 */
export const AIR_TOKEN: CurrencyMetadata = {
	symbol: 'AIR',
	name: 'Altair',
	decimals: 18,
	currencyId: { Native: null },
	minBalance: '1000000000000',
	existentialDeposit: '1000000000000000',
};

/**
 * Known foreign assets on Centrifuge
 * These are bridged from other chains
 */
export const FOREIGN_ASSETS: Record<number, CurrencyMetadata> = {
	// USDC (via Wormhole)
	1: {
		symbol: 'USDC',
		name: 'USD Coin',
		decimals: 6,
		currencyId: { ForeignAsset: 1 },
		minBalance: '1000',
		existentialDeposit: '10000',
	},
	// DAI (via Wormhole)
	2: {
		symbol: 'DAI',
		name: 'Dai Stablecoin',
		decimals: 18,
		currencyId: { ForeignAsset: 2 },
		minBalance: '1000000000000',
		existentialDeposit: '10000000000000000',
	},
	// Frax (via Wormhole)
	3: {
		symbol: 'FRAX',
		name: 'Frax',
		decimals: 18,
		currencyId: { ForeignAsset: 3 },
		minBalance: '1000000000000',
		existentialDeposit: '10000000000000000',
	},
	// USDT
	4: {
		symbol: 'USDT',
		name: 'Tether USD',
		decimals: 6,
		currencyId: { ForeignAsset: 4 },
		minBalance: '1000',
		existentialDeposit: '10000',
	},
	// wETH
	5: {
		symbol: 'wETH',
		name: 'Wrapped Ether',
		decimals: 18,
		currencyId: { ForeignAsset: 5 },
		minBalance: '1000000000000',
		existentialDeposit: '1000000000000000',
	},
	// GLMR (Moonbeam)
	6: {
		symbol: 'GLMR',
		name: 'Glimmer',
		decimals: 18,
		currencyId: { ForeignAsset: 6 },
		minBalance: '1000000000000',
		existentialDeposit: '1000000000000000',
	},
};

/**
 * Common decimal values
 */
export const DECIMALS = {
	CFG: 18,
	USDC: 6,
	USDT: 6,
	DAI: 18,
	ETH: 18,
	BTC: 8,
} as const;

/**
 * Decimal multipliers for common decimal places
 */
export const DECIMAL_MULTIPLIERS = {
	6: BigInt('1000000'),
	8: BigInt('100000000'),
	12: BigInt('1000000000000'),
	18: BigInt('1000000000000000000'),
} as const;

/**
 * Get currency by symbol
 */
export function getCurrencyBySymbol(symbol: string): CurrencyMetadata | undefined {
	if (symbol === 'CFG') return CFG_TOKEN;
	if (symbol === 'AIR') return AIR_TOKEN;

	const normalizedSymbol = symbol.toUpperCase();
	for (const [, currency] of Object.entries(FOREIGN_ASSETS)) {
		if (currency.symbol === normalizedSymbol) {
			return currency;
		}
	}
	return undefined;
}

/**
 * Get currency by foreign asset ID
 */
export function getForeignAsset(assetId: number): CurrencyMetadata | undefined {
	return FOREIGN_ASSETS[assetId];
}

/**
 * Create a tranche currency ID
 */
export function createTrancheCurrencyId(poolId: string, trancheId: string): CurrencyId {
	return { Tranche: [poolId, trancheId] };
}

/**
 * Check if currency ID is a tranche token
 */
export function isTrancheToken(currencyId: CurrencyId): boolean {
	return 'Tranche' in currencyId;
}

/**
 * Check if currency ID is native token
 */
export function isNativeToken(currencyId: CurrencyId): boolean {
	return 'Native' in currencyId;
}

/**
 * Format currency ID to string for display
 */
export function formatCurrencyId(currencyId: CurrencyId): string {
	if ('Native' in currencyId) return 'CFG';
	if ('AUSD' in currencyId) return 'AUSD';
	if ('Tranche' in currencyId) {
		const [poolId, trancheId] = currencyId.Tranche;
		return `Tranche(${poolId.slice(0, 8)}..., ${trancheId.slice(0, 8)}...)`;
	}
	if ('ForeignAsset' in currencyId) {
		const asset = FOREIGN_ASSETS[currencyId.ForeignAsset];
		return asset?.symbol || `ForeignAsset(${currencyId.ForeignAsset})`;
	}
	if ('LocalAsset' in currencyId) return `LocalAsset(${currencyId.LocalAsset})`;
	if ('Staking' in currencyId) return `Staking(${currencyId.Staking})`;
	return 'Unknown';
}

/**
 * Currency options for dropdowns
 */
export const CURRENCY_OPTIONS = [
	{ name: 'CFG (Native)', value: 'native' },
	{ name: 'USDC', value: 'usdc' },
	{ name: 'DAI', value: 'dai' },
	{ name: 'USDT', value: 'usdt' },
	{ name: 'FRAX', value: 'frax' },
	{ name: 'wETH', value: 'weth' },
	{ name: 'Custom Foreign Asset', value: 'foreignAsset' },
	{ name: 'Tranche Token', value: 'tranche' },
];

/**
 * Stablecoin presets for pool currencies
 */
export const STABLECOIN_PRESETS = {
	USDC: { symbol: 'USDC', decimals: 6, foreignAssetId: 1 },
	DAI: { symbol: 'DAI', decimals: 18, foreignAssetId: 2 },
	FRAX: { symbol: 'FRAX', decimals: 18, foreignAssetId: 3 },
	USDT: { symbol: 'USDT', decimals: 6, foreignAssetId: 4 },
};

/**
 * Native currency (alias for CFG_TOKEN for convenience)
 */
export const NATIVE_CURRENCY = CFG_TOKEN;

/**
 * All supported currencies including foreign assets
 */
export const SUPPORTED_CURRENCIES: CurrencyMetadata[] = [
	CFG_TOKEN,
	AIR_TOKEN,
	...Object.values(FOREIGN_ASSETS),
];
