/**
 * Unit Converter Utilities for Centrifuge
 *
 * Handles conversion between human-readable amounts and on-chain values.
 * Different tokens have different decimal places:
 * - CFG: 18 decimals
 * - USDC/USDT: 6 decimals
 * - DAI: 18 decimals
 *
 * On-chain values are always stored as integers (fixed-point representation).
 */

import { BN } from '@polkadot/util';
import { DECIMALS, DECIMAL_MULTIPLIERS } from '../constants/currencies';

/**
 * Supported decimal configurations
 */
export type SupportedDecimals = 6 | 8 | 12 | 18;

/**
 * Convert human-readable amount to on-chain value (base units)
 *
 * @param amount - Human readable amount (e.g., "100.5")
 * @param decimals - Number of decimal places
 * @returns BigInt representing the on-chain value
 *
 * @example
 * toBaseUnits("100.5", 18) => 100500000000000000000n
 * toBaseUnits("100", 6) => 100000000n
 */
export function toBaseUnits(amount: string | number, decimals: number): bigint {
	const amountStr = amount.toString();

	// Handle scientific notation
	if (amountStr.includes('e') || amountStr.includes('E')) {
		const num = Number(amountStr);
		return toBaseUnits(num.toFixed(decimals), decimals);
	}

	const [whole, fraction = ''] = amountStr.split('.');

	// Pad or truncate fraction to match decimals
	const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);

	// Combine whole and fraction
	const combined = `${whole}${paddedFraction}`;

	// Remove leading zeros and parse
	return BigInt(combined.replace(/^0+/, '') || '0');
}

/**
 * Convert on-chain value (base units) to human-readable amount
 *
 * @param value - On-chain value as BigInt or string
 * @param decimals - Number of decimal places
 * @returns Human readable amount string
 *
 * @example
 * fromBaseUnits(100500000000000000000n, 18) => "100.5"
 * fromBaseUnits(100000000n, 6) => "100"
 */
export function fromBaseUnits(value: bigint | string | number, decimals: number): string {
	const valueBigInt = BigInt(value.toString());
	const divisor = BigInt(10) ** BigInt(decimals);

	const whole = valueBigInt / divisor;
	const fraction = valueBigInt % divisor;

	if (fraction === BigInt(0)) {
		return whole.toString();
	}

	// Pad fraction with leading zeros if needed
	const fractionStr = fraction.toString().padStart(decimals, '0');

	// Remove trailing zeros
	const trimmedFraction = fractionStr.replace(/0+$/, '');

	return `${whole}.${trimmedFraction}`;
}

/**
 * Format amount for display with thousand separators
 *
 * @param amount - Amount to format
 * @param decimals - Decimal places to show
 * @returns Formatted string
 */
export function formatAmount(amount: string | number, displayDecimals: number = 2): string {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount;

	if (isNaN(num)) {
		return '0';
	}

	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: displayDecimals,
	}).format(num);
}

/**
 * Format currency with symbol
 */
export function formatCurrency(
	amount: string | number,
	symbol: string,
	displayDecimals: number = 2,
): string {
	return `${formatAmount(amount, displayDecimals)} ${symbol}`;
}

/**
 * Convert between different decimal representations
 *
 * @param value - Value in source decimals
 * @param sourceDecimals - Source decimal places
 * @param targetDecimals - Target decimal places
 * @returns Value in target decimals
 */
export function convertDecimals(
	value: bigint | string,
	sourceDecimals: number,
	targetDecimals: number,
): bigint {
	const valueBigInt = BigInt(value.toString());

	if (sourceDecimals === targetDecimals) {
		return valueBigInt;
	}

	if (targetDecimals > sourceDecimals) {
		const multiplier = BigInt(10) ** BigInt(targetDecimals - sourceDecimals);
		return valueBigInt * multiplier;
	} else {
		const divisor = BigInt(10) ** BigInt(sourceDecimals - targetDecimals);
		return valueBigInt / divisor;
	}
}

/**
 * Convert CFG to base units (18 decimals)
 */
export function cfgToBaseUnits(amount: string | number): bigint {
	return toBaseUnits(amount, DECIMALS.CFG);
}

/**
 * Convert base units to CFG (18 decimals)
 */
export function baseUnitsToCfg(value: bigint | string): string {
	return fromBaseUnits(value, DECIMALS.CFG);
}

/**
 * Convert USDC to base units (6 decimals)
 */
export function usdcToBaseUnits(amount: string | number): bigint {
	return toBaseUnits(amount, DECIMALS.USDC);
}

/**
 * Convert base units to USDC (6 decimals)
 */
export function baseUnitsToUsdc(value: bigint | string): string {
	return fromBaseUnits(value, DECIMALS.USDC);
}

/**
 * Get decimals for a known currency symbol
 */
export function getDecimals(symbol: string): number {
	const upperSymbol = symbol.toUpperCase();
	if (upperSymbol in DECIMALS) {
		return DECIMALS[upperSymbol as keyof typeof DECIMALS];
	}
	// Default to 18 (most common in crypto)
	return 18;
}

/**
 * Calculate percentage
 *
 * @param part - The part value
 * @param total - The total value
 * @param precision - Decimal precision for result
 * @returns Percentage as string
 */
export function calculatePercentage(
	part: bigint | string,
	total: bigint | string,
	precision: number = 2,
): string {
	const partBigInt = BigInt(part.toString());
	const totalBigInt = BigInt(total.toString());

	if (totalBigInt === BigInt(0)) {
		return '0';
	}

	// Multiply by 10000 for 2 decimal precision, then divide
	const percentage = (partBigInt * BigInt(10000)) / totalBigInt;
	const result = Number(percentage) / 100;

	return result.toFixed(precision);
}

/**
 * Calculate interest rate from per-second rate
 * Centrifuge stores interest rates as per-second rates with 27 decimals
 *
 * @param ratePerSec - Rate per second (27 decimals)
 * @returns Annual percentage rate
 */
export function perSecRateToAPR(ratePerSec: bigint | string): string {
	const rate = BigInt(ratePerSec.toString());
	const RAY = BigInt(10) ** BigInt(27); // 1e27
	const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);

	// Convert to annual rate: ((rate / RAY) ^ SECONDS_PER_YEAR - 1) * 100
	// Simplified approximation: ((rate - RAY) * SECONDS_PER_YEAR) / RAY * 100
	const annualRate = ((rate - RAY) * SECONDS_PER_YEAR * BigInt(10000)) / RAY;

	return (Number(annualRate) / 100).toFixed(2);
}

/**
 * Convert APR to per-second rate (inverse of above)
 *
 * @param apr - Annual percentage rate (e.g., "5" for 5%)
 * @returns Per-second rate with 27 decimals
 */
export function aprToPerSecRate(apr: string | number): bigint {
	const aprNum = typeof apr === 'string' ? parseFloat(apr) : apr;
	const RAY = BigInt(10) ** BigInt(27);
	const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);

	// Simplified: RAY + (apr / 100 * RAY / SECONDS_PER_YEAR)
	const rateIncrease = BigInt(Math.floor((aprNum / 100) * 1e27)) / SECONDS_PER_YEAR;

	return RAY + rateIncrease;
}

/**
 * Parse BN (Polkadot's BigNumber) to BigInt
 */
export function bnToBigInt(bn: BN | string | number): bigint {
	if (bn instanceof BN) {
		return BigInt(bn.toString());
	}
	return BigInt(bn.toString());
}

/**
 * Convert BigInt to BN for Polkadot API calls
 */
export function bigIntToBn(value: bigint): BN {
	return new BN(value.toString());
}

/**
 * Check if value exceeds maximum safe integer
 */
export function exceedsMaxSafeInteger(value: bigint): boolean {
	return value > BigInt(Number.MAX_SAFE_INTEGER);
}

/**
 * Safely convert to number if within safe range
 */
export function safeToNumber(value: bigint): number | null {
	if (exceedsMaxSafeInteger(value)) {
		return null;
	}
	return Number(value);
}

/**
 * Format large numbers with abbreviations (K, M, B, T)
 */
export function formatLargeNumber(value: string | number): string {
	const num = typeof value === 'string' ? parseFloat(value) : value;

	if (isNaN(num)) return '0';

	const abbreviations = [
		{ threshold: 1e12, suffix: 'T' },
		{ threshold: 1e9, suffix: 'B' },
		{ threshold: 1e6, suffix: 'M' },
		{ threshold: 1e3, suffix: 'K' },
	];

	for (const { threshold, suffix } of abbreviations) {
		if (Math.abs(num) >= threshold) {
			return (num / threshold).toFixed(2) + suffix;
		}
	}

	return num.toFixed(2);
}

/**
 * Calculate NAV per share
 */
export function calculateNavPerShare(
	totalNav: bigint | string,
	totalShares: bigint | string,
	decimals: number = 18,
): string {
	const nav = BigInt(totalNav.toString());
	const shares = BigInt(totalShares.toString());

	if (shares === BigInt(0)) {
		return '0';
	}

	// Multiply NAV by 10^decimals before dividing for precision
	const multiplier = BigInt(10) ** BigInt(decimals);
	const navPerShare = (nav * multiplier) / shares;

	return fromBaseUnits(navPerShare, decimals);
}
