/**
 * Epoch Utilities for Centrifuge
 *
 * Epochs are investment cycles in Centrifuge pools. During an epoch:
 * 1. Investors submit invest/redeem orders
 * 2. Epoch closes after minimum duration
 * 3. Solution is computed to satisfy orders within constraints
 * 4. Orders are executed and tokens/funds distributed
 *
 * Key concepts:
 * - Epoch ID: Sequential identifier for each epoch
 * - Order submission: Investors queue invest/redeem requests
 * - Solution: Algorithm determines how to fulfill orders
 * - Execution: Tokens minted/burned, funds transferred
 */

import { EPOCH_DEFAULTS } from '../constants/pools';

/**
 * Epoch state enum
 */
export enum EpochState {
	Open = 'Open',
	InSubmission = 'InSubmission',
	InExecution = 'InExecution',
	Closed = 'Closed',
}

/**
 * Order type enum
 */
export enum OrderType {
	Invest = 'Invest',
	Redeem = 'Redeem',
}

/**
 * Investment order structure
 */
export interface InvestmentOrder {
	orderId: string;
	investorAddress: string;
	poolId: string;
	trancheId: string;
	orderType: OrderType;
	amount: string;
	epochId: number;
	timestamp: number;
	status: OrderStatus;
}

/**
 * Order status enum
 */
export enum OrderStatus {
	Pending = 'Pending',
	PartiallyFulfilled = 'PartiallyFulfilled',
	Fulfilled = 'Fulfilled',
	Cancelled = 'Cancelled',
}

/**
 * Epoch execution info
 */
export interface EpochExecutionInfo {
	epochId: number;
	poolId: string;
	state: EpochState;
	investOrders: OrderSummary;
	redeemOrders: OrderSummary;
	solution?: EpochSolution;
	executedAt?: number;
}

/**
 * Order summary for an epoch
 */
export interface OrderSummary {
	totalAmount: string;
	orderCount: number;
	fulfillmentRatio: number; // 0-1
}

/**
 * Epoch solution
 */
export interface EpochSolution {
	investFulfillment: TrancheAllocation[];
	redeemFulfillment: TrancheAllocation[];
	isFeasible: boolean;
	score: number;
}

/**
 * Tranche allocation in solution
 */
export interface TrancheAllocation {
	trancheId: string;
	investAmount: string;
	investFulfillmentRatio: number;
	redeemAmount: string;
	redeemFulfillmentRatio: number;
}

/**
 * Check if an epoch can be closed
 */
export function canCloseEpoch(
	epochStartTimestamp: number,
	minEpochDuration: number = EPOCH_DEFAULTS.minEpochTime,
): boolean {
	const now = Math.floor(Date.now() / 1000);
	return now >= epochStartTimestamp + minEpochDuration;
}

/**
 * Calculate time remaining until epoch can close
 */
export function getEpochCloseCountdown(
	epochStartTimestamp: number,
	minEpochDuration: number = EPOCH_DEFAULTS.minEpochTime,
): number {
	const now = Math.floor(Date.now() / 1000);
	const closeTime = epochStartTimestamp + minEpochDuration;
	return Math.max(0, closeTime - now);
}

/**
 * Format epoch countdown
 */
export function formatEpochCountdown(seconds: number): string {
	if (seconds <= 0) return 'Ready to close';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${secs}s`;
	}
	return `${secs}s`;
}

/**
 * Calculate fulfillment ratio for orders
 * Based on available liquidity and order constraints
 */
export function calculateFulfillmentRatio(
	totalOrders: bigint | string,
	availableLiquidity: bigint | string,
): number {
	const orders = BigInt(totalOrders.toString());
	const liquidity = BigInt(availableLiquidity.toString());

	if (orders === BigInt(0)) {
		return 1;
	}

	if (liquidity >= orders) {
		return 1;
	}

	return Number((liquidity * BigInt(10000)) / orders) / 10000;
}

/**
 * Calculate tokens to receive from investment
 */
export function calculateInvestTokens(
	investAmount: bigint | string,
	tokenPrice: bigint | string,
	decimals: number = 18,
): bigint {
	const amount = BigInt(investAmount.toString());
	const price = BigInt(tokenPrice.toString());
	const multiplier = BigInt(10) ** BigInt(decimals);

	if (price === BigInt(0)) {
		return BigInt(0);
	}

	return (amount * multiplier) / price;
}

/**
 * Calculate currency to receive from redemption
 */
export function calculateRedeemCurrency(
	redeemTokens: bigint | string,
	tokenPrice: bigint | string,
	decimals: number = 18,
): bigint {
	const tokens = BigInt(redeemTokens.toString());
	const price = BigInt(tokenPrice.toString());
	const divisor = BigInt(10) ** BigInt(decimals);

	return (tokens * price) / divisor;
}

/**
 * Validate order constraints
 */
export function validateOrder(
	orderType: OrderType,
	amount: bigint | string,
	constraints: {
		minInvestment?: bigint | string;
		maxInvestment?: bigint | string;
		availableBalance?: bigint | string;
	},
): {
	isValid: boolean;
	error?: string;
} {
	const amountBigInt = BigInt(amount.toString());

	if (amountBigInt <= BigInt(0)) {
		return { isValid: false, error: 'Amount must be greater than zero' };
	}

	if (orderType === OrderType.Invest) {
		if (constraints.minInvestment) {
			const min = BigInt(constraints.minInvestment.toString());
			if (amountBigInt < min) {
				return { isValid: false, error: `Amount below minimum investment` };
			}
		}

		if (constraints.maxInvestment) {
			const max = BigInt(constraints.maxInvestment.toString());
			if (amountBigInt > max) {
				return { isValid: false, error: `Amount exceeds maximum investment` };
			}
		}
	}

	if (orderType === OrderType.Redeem) {
		if (constraints.availableBalance) {
			const balance = BigInt(constraints.availableBalance.toString());
			if (amountBigInt > balance) {
				return { isValid: false, error: `Amount exceeds available balance` };
			}
		}
	}

	return { isValid: true };
}

/**
 * Calculate pro-rata share for partial fulfillment
 */
export function calculateProRataShare(
	orderAmount: bigint | string,
	totalOrders: bigint | string,
	availableAmount: bigint | string,
): bigint {
	const order = BigInt(orderAmount.toString());
	const total = BigInt(totalOrders.toString());
	const available = BigInt(availableAmount.toString());

	if (total === BigInt(0)) {
		return BigInt(0);
	}

	return (order * available) / total;
}

/**
 * Epoch solution constraints
 */
export interface SolutionConstraints {
	maxReserve: bigint;
	minSubordinationRatio: number; // For senior tranches
	maxNavDecrease: number; // Percentage
}

/**
 * Check if a solution satisfies constraints
 */
export function validateSolution(
	solution: EpochSolution,
	constraints: SolutionConstraints,
	currentState: {
		reserve: bigint;
		seniorValue: bigint;
		juniorValue: bigint;
		nav: bigint;
	},
): {
	isValid: boolean;
	violations: string[];
} {
	const violations: string[] = [];

	// Check reserve constraint
	let projectedReserve = currentState.reserve;
	for (const allocation of solution.investFulfillment) {
		projectedReserve += BigInt(allocation.investAmount);
	}
	for (const allocation of solution.redeemFulfillment) {
		projectedReserve -= BigInt(allocation.redeemAmount);
	}

	if (projectedReserve > constraints.maxReserve) {
		violations.push('Exceeds maximum reserve');
	}

	if (projectedReserve < BigInt(0)) {
		violations.push('Insufficient reserve for redemptions');
	}

	// Check subordination ratio
	const projectedTotal = currentState.seniorValue + currentState.juniorValue;
	if (projectedTotal > BigInt(0)) {
		const subordinationRatio =
			Number((currentState.juniorValue * BigInt(10000)) / projectedTotal) / 10000;
		if (subordinationRatio < constraints.minSubordinationRatio) {
			violations.push('Below minimum subordination ratio');
		}
	}

	return {
		isValid: violations.length === 0,
		violations,
	};
}

/**
 * Get epoch state description
 */
export function getEpochStateDescription(state: EpochState): string {
	switch (state) {
		case EpochState.Open:
			return 'Accepting investment and redemption orders';
		case EpochState.InSubmission:
			return 'Collecting final orders before solution';
		case EpochState.InExecution:
			return 'Executing the epoch solution';
		case EpochState.Closed:
			return 'Epoch completed, new epoch pending';
		default:
			return 'Unknown state';
	}
}

/**
 * Estimate next epoch execution time
 */
export function estimateNextEpochExecution(
	currentEpochStart: number,
	minEpochDuration: number = EPOCH_DEFAULTS.minEpochTime,
	challengePeriod: number = EPOCH_DEFAULTS.challengeTime,
): Date {
	const closeTime = currentEpochStart + minEpochDuration;
	const executionTime = closeTime + challengePeriod;
	return new Date(executionTime * 1000);
}

/**
 * Create empty order summary
 */
export function createEmptyOrderSummary(): OrderSummary {
	return {
		totalAmount: '0',
		orderCount: 0,
		fulfillmentRatio: 0,
	};
}

/**
 * Aggregate orders into summary
 */
export function aggregateOrders(orders: InvestmentOrder[]): OrderSummary {
	if (orders.length === 0) {
		return createEmptyOrderSummary();
	}

	let totalAmount = BigInt(0);
	let fulfilledCount = 0;

	for (const order of orders) {
		totalAmount += BigInt(order.amount);
		if (order.status === OrderStatus.Fulfilled) {
			fulfilledCount++;
		}
	}

	return {
		totalAmount: totalAmount.toString(),
		orderCount: orders.length,
		fulfillmentRatio: orders.length > 0 ? fulfilledCount / orders.length : 0,
	};
}

/**
 * Parse epoch ID from various formats
 */
export function parseEpochId(epochId: string | number): number {
	const parsed = typeof epochId === 'string' ? parseInt(epochId, 10) : epochId;

	if (isNaN(parsed) || parsed < 0) {
		throw new Error(`Invalid epoch ID: ${epochId}`);
	}

	return parsed;
}
