/**
 * Pool Utilities for Centrifuge
 *
 * Utilities for working with Centrifuge pools, including:
 * - Pool ID parsing and validation
 * - Tranche ID handling
 * - NAV calculations
 * - Epoch management
 */

import { blake2AsHex } from '@polkadot/util-crypto';
import { hexToU8a, u8aToHex, stringToU8a, isHex } from '@polkadot/util';
import { TrancheType, EPOCH_DEFAULTS } from '../constants/pools';

/**
 * Pool ID format on Centrifuge
 * Pool IDs are typically small integers represented as u64
 */
export type PoolId = string | number | bigint;

/**
 * Tranche ID format
 * Tranche IDs are 16-byte hex strings derived from pool ID and tranche index
 */
export type TrancheId = string;

/**
 * Validate a pool ID
 */
export function validatePoolId(poolId: PoolId): {
	isValid: boolean;
	normalized: string;
	error?: string;
} {
	try {
		// Pool IDs should be positive integers
		const normalized = poolId.toString();
		const num = BigInt(normalized);

		if (num < 0) {
			return { isValid: false, normalized, error: 'Pool ID must be positive' };
		}

		return { isValid: true, normalized };
	} catch (error) {
		return {
			isValid: false,
			normalized: poolId.toString(),
			error: 'Invalid pool ID format',
		};
	}
}

/**
 * Validate a tranche ID
 */
export function validateTrancheId(trancheId: TrancheId): {
	isValid: boolean;
	error?: string;
} {
	// Tranche IDs are 16-byte (32 hex characters) identifiers
	if (!isHex(trancheId)) {
		// Try adding 0x prefix
		if (isHex(`0x${trancheId}`)) {
			return { isValid: true };
		}
		return { isValid: false, error: 'Tranche ID must be a hex string' };
	}

	// Check length (0x + 32 hex chars = 34)
	const cleanHex = trancheId.startsWith('0x') ? trancheId : `0x${trancheId}`;
	if (cleanHex.length !== 34) {
		return { isValid: false, error: 'Tranche ID must be 16 bytes (32 hex characters)' };
	}

	return { isValid: true };
}

/**
 * Generate a tranche ID from pool ID and seniority
 * This is a deterministic derivation
 */
export function generateTrancheId(poolId: PoolId, seniority: number): TrancheId {
	const poolIdBytes = stringToU8a(poolId.toString().padStart(16, '0'));
	const seniorityBytes = new Uint8Array([seniority]);
	const combined = new Uint8Array([...poolIdBytes, ...seniorityBytes]);

	const hash = blake2AsHex(combined, 128); // 16 bytes = 128 bits
	return hash;
}

/**
 * Parse pool and tranche from a combined identifier
 * Format: "poolId-trancheId" or just "poolId"
 */
export function parsePoolTrancheId(identifier: string): {
	poolId: string;
	trancheId?: string;
} {
	if (identifier.includes('-')) {
		const [poolId, trancheId] = identifier.split('-');
		return { poolId, trancheId };
	}
	return { poolId: identifier };
}

/**
 * Format pool and tranche as a combined identifier
 */
export function formatPoolTrancheId(poolId: PoolId, trancheId?: TrancheId): string {
	if (trancheId) {
		return `${poolId}-${trancheId}`;
	}
	return poolId.toString();
}

/**
 * Calculate the reserve ratio
 * Reserve ratio = reserve / NAV
 */
export function calculateReserveRatio(
	reserve: bigint | string,
	nav: bigint | string,
): number {
	const reserveBigInt = BigInt(reserve.toString());
	const navBigInt = BigInt(nav.toString());

	if (navBigInt === BigInt(0)) {
		return 0;
	}

	// Calculate with precision
	const ratio = Number((reserveBigInt * BigInt(10000)) / navBigInt) / 10000;
	return ratio;
}

/**
 * Calculate the subordination ratio for senior tranches
 * Subordination = junior tranche value / total pool value
 */
export function calculateSubordination(
	juniorValue: bigint | string,
	totalValue: bigint | string,
): number {
	const junior = BigInt(juniorValue.toString());
	const total = BigInt(totalValue.toString());

	if (total === BigInt(0)) {
		return 0;
	}

	return Number((junior * BigInt(10000)) / total) / 10000;
}

/**
 * Determine tranche type from seniority index
 * 0 = Senior, 1+ = increasingly junior
 */
export function getTrancheType(seniority: number, totalTranches: number): TrancheType {
	if (seniority === 0) {
		return TrancheType.Senior;
	}
	if (seniority === totalTranches - 1) {
		return TrancheType.Junior;
	}
	return TrancheType.Mezzanine;
}

/**
 * Calculate expected yield for a tranche based on its interest rate
 */
export function calculateExpectedYield(
	interestRatePerSec: bigint | string,
	duration: number = 365 * 24 * 60 * 60, // Default to 1 year
): string {
	const rate = BigInt(interestRatePerSec.toString());
	const RAY = BigInt(10) ** BigInt(27);

	// Simple interest approximation: (rate - RAY) * duration / RAY
	const yield_ = Number(((rate - RAY) * BigInt(duration)) / RAY);

	return (yield_ * 100).toFixed(2) + '%';
}

/**
 * Calculate time until epoch closes
 */
export function timeUntilEpochClose(
	epochStartTime: number,
	minEpochDuration: number = EPOCH_DEFAULTS.minEpochTime,
): {
	canClose: boolean;
	remainingSeconds: number;
	remainingFormatted: string;
} {
	const now = Math.floor(Date.now() / 1000);
	const epochEndTime = epochStartTime + minEpochDuration;
	const remainingSeconds = Math.max(0, epochEndTime - now);

	return {
		canClose: remainingSeconds === 0,
		remainingSeconds,
		remainingFormatted: formatDuration(remainingSeconds),
	};
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
	if (seconds <= 0) return '0s';

	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (secs > 0 && days === 0) parts.push(`${secs}s`);

	return parts.join(' ') || '0s';
}

/**
 * Calculate NAV from portfolio valuation and reserve
 */
export function calculateNav(
	portfolioValuation: bigint | string,
	reserve: bigint | string,
): bigint {
	return BigInt(portfolioValuation.toString()) + BigInt(reserve.toString());
}

/**
 * Calculate the value of a tranche position
 */
export function calculatePositionValue(
	tokens: bigint | string,
	tokenPrice: bigint | string,
	decimals: number = 18,
): bigint {
	const tokensBigInt = BigInt(tokens.toString());
	const priceBigInt = BigInt(tokenPrice.toString());
	const divisor = BigInt(10) ** BigInt(decimals);

	return (tokensBigInt * priceBigInt) / divisor;
}

/**
 * Calculate investment return
 */
export function calculateReturn(
	currentValue: bigint | string,
	investedValue: bigint | string,
): {
	absoluteReturn: bigint;
	percentageReturn: number;
} {
	const current = BigInt(currentValue.toString());
	const invested = BigInt(investedValue.toString());

	const absoluteReturn = current - invested;

	if (invested === BigInt(0)) {
		return { absoluteReturn, percentageReturn: 0 };
	}

	const percentageReturn = Number((absoluteReturn * BigInt(10000)) / invested) / 100;

	return { absoluteReturn, percentageReturn };
}

/**
 * Validate minimum investment amount
 */
export function validateMinInvestment(
	amount: bigint | string,
	minAmount: bigint | string,
): {
	isValid: boolean;
	error?: string;
} {
	const amountBigInt = BigInt(amount.toString());
	const minBigInt = BigInt(minAmount.toString());

	if (amountBigInt < minBigInt) {
		return {
			isValid: false,
			error: `Amount below minimum investment of ${minBigInt.toString()}`,
		};
	}

	return { isValid: true };
}

/**
 * Pool state summary interface
 */
export interface PoolStateSummary {
	poolId: string;
	nav: string;
	reserve: string;
	reserveRatio: number;
	totalDebt: string;
	numberOfLoans: number;
	epochId: number;
	isEpochOpen: boolean;
}

/**
 * Create a pool state summary from raw data
 */
export function createPoolStateSummary(
	poolId: string,
	poolData: {
		nav?: string | bigint;
		reserve?: string | bigint;
		totalDebt?: string | bigint;
		numberOfLoans?: number;
		epochId?: number;
		epochState?: string;
	},
): PoolStateSummary {
	const nav = poolData.nav?.toString() || '0';
	const reserve = poolData.reserve?.toString() || '0';
	const totalDebt = poolData.totalDebt?.toString() || '0';

	return {
		poolId,
		nav,
		reserve,
		reserveRatio: calculateReserveRatio(reserve, nav),
		totalDebt,
		numberOfLoans: poolData.numberOfLoans || 0,
		epochId: poolData.epochId || 0,
		isEpochOpen: poolData.epochState === 'Open',
	};
}

/**
 * Sort tranches by seniority (most senior first)
 */
export function sortTranchesBySeniority<T extends { seniority: number }>(tranches: T[]): T[] {
	return [...tranches].sort((a, b) => a.seniority - b.seniority);
}

/**
 * Get the senior tranche from a list
 */
export function getSeniorTranche<T extends { seniority: number }>(tranches: T[]): T | undefined {
	return tranches.find((t) => t.seniority === 0);
}

/**
 * Get the junior tranche from a list
 */
export function getJuniorTranche<T extends { seniority: number }>(tranches: T[]): T | undefined {
	const sorted = sortTranchesBySeniority(tranches);
	return sorted[sorted.length - 1];
}
