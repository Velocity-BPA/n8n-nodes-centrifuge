/**
 * Centrifuge Pool Configurations
 *
 * Pools are the core investment vehicle in Centrifuge, enabling tokenization
 * of Real World Assets (RWAs). Each pool:
 * - Has one or more tranches (risk tiers)
 * - Uses a specific currency for investment/redemption
 * - Has an asset originator managing loans
 * - Operates in epochs (investment cycles)
 *
 * Pool Types:
 * - Open pools: Accept investments from whitelisted investors
 * - Revolving pools: Continuous investment/redemption
 * - Closed pools: Fixed term with specific maturity
 *
 * Asset Types:
 * - Trade receivables and invoices
 * - Real estate (mortgages, commercial)
 * - Consumer finance (auto loans, student loans)
 * - Revenue-based financing
 * - Carbon credits
 */

/**
 * Pool metadata structure
 */
export interface PoolMetadata {
	poolId: string;
	name: string;
	description: string;
	assetOriginator: string;
	assetType: string;
	currency: string;
	minInvestment: string;
	website?: string;
	status: PoolStatus;
}

/**
 * Pool status enum
 */
export enum PoolStatus {
	Active = 'Active',
	Closed = 'Closed',
	Frozen = 'Frozen',
	Deploying = 'Deploying',
}

/**
 * Tranche configuration
 */
export interface TrancheConfig {
	id: string;
	name: string;
	type: TrancheType;
	seniority: number; // 0 = most senior
	interestRatePerSec?: string;
	minRiskBuffer?: string; // Required subordination
}

/**
 * Tranche types
 */
export enum TrancheType {
	Senior = 'Senior',
	Mezzanine = 'Mezzanine',
	Junior = 'Junior',
}

/**
 * Known active pools on Centrifuge mainnet
 * Note: Pool IDs are 32-byte hex strings
 * These are example pools - actual pool IDs should be fetched from chain
 */
export const KNOWN_POOLS: Record<string, PoolMetadata> = {
	// New Silver Series 2 - US Real Estate Bridge Loans
	'1': {
		poolId: '1',
		name: 'New Silver Series 2',
		description: 'US real estate bridge loans for residential properties',
		assetOriginator: 'New Silver',
		assetType: 'Real Estate Bridge Loans',
		currency: 'USDC',
		minInvestment: '5000',
		website: 'https://newsilver.com',
		status: PoolStatus.Active,
	},
	// BlockTower Credit
	'2': {
		poolId: '2',
		name: 'BlockTower Credit',
		description: 'Institutional-grade structured credit products',
		assetOriginator: 'BlockTower Capital',
		assetType: 'Structured Credit',
		currency: 'DAI',
		minInvestment: '50000',
		website: 'https://blocktower.com',
		status: PoolStatus.Active,
	},
	// Harbor Trade Credit
	'3': {
		poolId: '3',
		name: 'Harbor Trade Credit',
		description: 'Trade receivables from emerging markets',
		assetOriginator: 'Harbor',
		assetType: 'Trade Receivables',
		currency: 'USDC',
		minInvestment: '10000',
		status: PoolStatus.Active,
	},
	// Fortunafi IF1
	'4': {
		poolId: '4',
		name: 'Fortunafi IF1',
		description: 'Revenue-based financing for tech companies',
		assetOriginator: 'Fortunafi',
		assetType: 'Revenue-Based Finance',
		currency: 'USDC',
		minInvestment: '50000',
		status: PoolStatus.Active,
	},
	// 1754 Factory
	'5': {
		poolId: '5',
		name: '1754 Factory',
		description: 'Consumer credit from emerging markets',
		assetOriginator: '1754 Factory',
		assetType: 'Consumer Credit',
		currency: 'USDC',
		minInvestment: '5000',
		status: PoolStatus.Active,
	},
};

/**
 * Pool epoch configuration defaults
 */
export const EPOCH_DEFAULTS = {
	minEpochTime: 24 * 60 * 60, // 24 hours in seconds
	challengeTime: 60 * 60, // 1 hour in seconds
	maxSolutions: 100,
};

/**
 * Pool fee types
 */
export enum PoolFeeType {
	Fixed = 'Fixed',
	ChargedUpTo = 'ChargedUpTo',
}

/**
 * Default pool fees structure
 */
export const DEFAULT_POOL_FEES = {
	serviceFee: '0.01', // 1% annual
	originationFee: '0.005', // 0.5% of loan amount
	performanceFee: '0', // Variable
};

/**
 * Investment restrictions
 */
export const INVESTMENT_RESTRICTIONS = {
	minInvestment: {
		USDC: '1000000', // 1 USDC (6 decimals)
		DAI: '1000000000000000000', // 1 DAI (18 decimals)
	},
	maxInvestment: undefined, // Usually no maximum
};

/**
 * Pool options for UI dropdowns
 */
export const POOL_OPTIONS = Object.entries(KNOWN_POOLS).map(([id, pool]) => ({
	name: `${pool.name} (${pool.currency})`,
	value: id,
	description: pool.description,
}));

/**
 * Tranche seniority options
 */
export const TRANCHE_SENIORITY_OPTIONS = [
	{ name: 'Senior (Lowest Risk)', value: 0 },
	{ name: 'Mezzanine (Medium Risk)', value: 1 },
	{ name: 'Junior (Highest Risk)', value: 2 },
];

/**
 * Pool status options
 */
export const POOL_STATUS_OPTIONS = [
	{ name: 'Active', value: PoolStatus.Active },
	{ name: 'Closed', value: PoolStatus.Closed },
	{ name: 'Frozen', value: PoolStatus.Frozen },
	{ name: 'Deploying', value: PoolStatus.Deploying },
];

/**
 * Asset class categories
 */
export const ASSET_CLASSES = [
	'Real Estate',
	'Trade Finance',
	'Consumer Credit',
	'Revenue-Based Finance',
	'Structured Credit',
	'Carbon Credits',
	'Inventory Finance',
	'Equipment Finance',
	'Invoice Factoring',
	'Other',
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

/**
 * Risk ratings for pools/tranches
 */
export const RISK_RATINGS = [
	'AAA',
	'AA',
	'A',
	'BBB',
	'BB',
	'B',
	'CCC',
	'CC',
	'C',
	'NR', // Not Rated
] as const;

export type RiskRating = (typeof RISK_RATINGS)[number];

/**
 * NAV calculation methods
 */
export enum NavMethod {
	Oracle = 'Oracle',
	DCF = 'DCF', // Discounted Cash Flow
	OutstandingDebt = 'OutstandingDebt',
}

/**
 * Pool reserve constraints
 */
export interface ReserveConstraints {
	maxReserve: string;
	minReserve: string;
	targetReserveRatio: number; // Percentage
}

/**
 * Default reserve constraints
 */
export const DEFAULT_RESERVE_CONSTRAINTS: ReserveConstraints = {
	maxReserve: '0', // No maximum by default
	minReserve: '0',
	targetReserveRatio: 0.05, // 5%
};
