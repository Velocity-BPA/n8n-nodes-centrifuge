/**
 * Centrifuge Substrate Pallets
 *
 * Centrifuge is built on Substrate and includes custom pallets for
 * Real World Asset (RWA) tokenization. These pallets handle:
 * - Pool management and investment lifecycle
 * - Loan origination and servicing
 * - Document anchoring and verification
 * - NFT-based asset representation
 * - Cross-chain bridging
 *
 * Pallet naming follows Substrate conventions:
 * - PascalCase for pallet names
 * - camelCase for method names
 */

/**
 * Core Substrate pallets available on Centrifuge
 */
export const CORE_PALLETS = {
	// System pallets
	system: 'system',
	timestamp: 'timestamp',
	balances: 'balances',
	transactionPayment: 'transactionPayment',

	// Governance
	democracy: 'democracy',
	council: 'council',
	technicalCommittee: 'technicalCommittee',
	treasury: 'treasury',
	elections: 'elections',

	// Identity and accounts
	identity: 'identity',
	proxy: 'proxy',
	multisig: 'multisig',
	utility: 'utility',

	// Tokens and assets
	tokens: 'tokens',
	ormlTokens: 'ormlTokens',
	currencies: 'currencies',
	assets: 'assets',
	uniques: 'uniques',

	// Parachain
	parachainSystem: 'parachainSystem',
	parachainInfo: 'parachainInfo',
	xcmpQueue: 'xcmpQueue',
	dmpQueue: 'dmpQueue',
	polkadotXcm: 'polkadotXcm',
};

/**
 * Centrifuge-specific pallets for RWA functionality
 */
export const CENTRIFUGE_PALLETS = {
	// Pool management
	poolSystem: 'poolSystem',
	poolRegistry: 'poolRegistry',
	poolFees: 'poolFees',

	// Investment lifecycle
	investments: 'investments',
	orderBook: 'orderBook',

	// Loan management
	loans: 'loans',
	interestAccrual: 'interestAccrual',

	// Permissions
	permissions: 'permissions',
	restrictedTokens: 'restrictedTokens',

	// Document anchoring
	anchors: 'anchors',

	// NFT for assets
	uniques: 'uniques',
	nfts: 'nfts',

	// Oracles
	oracleFeed: 'oracleFeed',
	oracleCollection: 'oracleCollection',

	// Rewards
	liquidityRewards: 'liquidityRewards',
	blockRewards: 'blockRewards',

	// Bridge
	bridge: 'bridge',
	ethereumBridge: 'ethereumBridge',
	chainBridge: 'chainBridge',
};

/**
 * Pool System pallet methods
 * Handles creation, configuration, and lifecycle of investment pools
 */
export const POOL_SYSTEM_METHODS = {
	// Queries
	pool: 'pool',
	poolCount: 'poolCount',
	accountCurrency: 'accountCurrency',
	epochExecution: 'epochExecution',
	notedChange: 'notedChange',
	scheduledUpdate: 'scheduledUpdate',

	// Transactions
	create: 'create',
	update: 'update',
	setMaxReserve: 'setMaxReserve',
	closeEpoch: 'closeEpoch',
	submitSolution: 'submitSolution',
	executeEpoch: 'executeEpoch',
};

/**
 * Pool Registry pallet methods
 * Handles pool metadata and configuration storage
 */
export const POOL_REGISTRY_METHODS = {
	// Queries
	poolMetadata: 'poolMetadata',
	trancheMetadata: 'trancheMetadata',

	// Transactions
	register: 'register',
	updatePoolMetadata: 'updatePoolMetadata',
	updateTrancheMetadata: 'updateTrancheMetadata',
	setMetadata: 'setMetadata',
};

/**
 * Investments pallet methods
 * Handles investment orders and position management
 */
export const INVESTMENTS_METHODS = {
	// Queries
	investOrders: 'investOrders',
	redeemOrders: 'redeemOrders',
	activeInvestOrders: 'activeInvestOrders',
	activeRedeemOrders: 'activeRedeemOrders',
	clearedInvestOrders: 'clearedInvestOrders',
	clearedRedeemOrders: 'clearedRedeemOrders',
	investmentInfo: 'investmentInfo',

	// Transactions
	updateInvestOrder: 'updateInvestOrder',
	updateRedeemOrder: 'updateRedeemOrder',
	collectInvestments: 'collectInvestments',
	collectRedemptions: 'collectRedemptions',
	collectInvestmentsFor: 'collectInvestmentsFor',
	collectRedemptionsFor: 'collectRedemptionsFor',
};

/**
 * Loans pallet methods
 * Handles loan origination, pricing, and lifecycle
 */
export const LOANS_METHODS = {
	// Queries
	activeLoan: 'activeLoan',
	loanCount: 'loanCount',
	createdLoan: 'createdLoan',
	closedLoan: 'closedLoan',
	portfolioValuation: 'portfolioValuation',
	writeOffPolicy: 'writeOffPolicy',

	// Transactions
	create: 'create',
	borrow: 'borrow',
	repay: 'repay',
	writeOff: 'writeOff',
	adminWriteOff: 'adminWriteOff',
	close: 'close',
	updatePortfolioValuation: 'updatePortfolioValuation',
	proposeTransferDebt: 'proposeTransferDebt',
	applyTransferDebt: 'applyTransferDebt',

	// Pricing operations
	priceLoan: 'priceLoan',
	updateLoanPricing: 'updateLoanPricing',
	applyLoanMutation: 'applyLoanMutation',
};

/**
 * Permissions pallet methods
 * Handles role-based access control for pools
 */
export const PERMISSIONS_METHODS = {
	// Queries
	permission: 'permission',
	permissionCount: 'permissionCount',

	// Transactions
	add: 'add',
	remove: 'remove',
	purge: 'purge',
	adminPurge: 'adminPurge',
};

/**
 * Anchors pallet methods
 * Handles document anchoring and verification
 */
export const ANCHORS_METHODS = {
	// Queries
	anchors: 'anchors',
	anchorEvictDates: 'anchorEvictDates',
	preAnchors: 'preAnchors',
	evictedAnchor: 'evictedAnchor',
	latestAnchorIndex: 'latestAnchorIndex',
	latestEvictedAnchorIndex: 'latestEvictedAnchorIndex',

	// Transactions
	preCommit: 'preCommit',
	commit: 'commit',
	evictAnchors: 'evictAnchors',
	evictPreCommits: 'evictPreCommits',
};

/**
 * Oracle pallet methods
 * Handles price feeds and external data
 */
export const ORACLE_METHODS = {
	// Queries
	values: 'values',
	rawValues: 'rawValues',
	keys: 'keys',
	members: 'members',

	// Transactions
	feed: 'feed',
	feedValues: 'feedValues',
	addMember: 'addMember',
	removeMember: 'removeMember',
	setMaxAge: 'setMaxAge',
};

/**
 * Bridge pallet methods
 * Handles cross-chain asset transfers
 */
export const BRIDGE_METHODS = {
	// Queries
	chainNonce: 'chainNonce',
	votes: 'votes',
	resourceId: 'resourceId',
	relayerVoteThreshold: 'relayerVoteThreshold',

	// Transactions
	transferAsset: 'transferAsset',
	transferNative: 'transferNative',
	acknowledgeProposal: 'acknowledgeProposal',
	addRelayer: 'addRelayer',
	removeRelayer: 'removeRelayer',
};

/**
 * Liquidity Rewards pallet methods
 * Handles LP token staking and rewards
 */
export const REWARDS_METHODS = {
	// Queries
	currencies: 'currencies',
	groups: 'groups',
	stakes: 'stakes',
	activeEpochData: 'activeEpochData',
	nextEpochChanges: 'nextEpochChanges',
	endOfEpoch: 'endOfEpoch',

	// Transactions
	stake: 'stake',
	unstake: 'unstake',
	claim: 'claim',
	setDistributedReward: 'setDistributedReward',
	setEpochDuration: 'setEpochDuration',
};

/**
 * Proxy types available on Centrifuge
 */
export const PROXY_TYPES = [
	'Any',
	'NonTransfer',
	'Governance',
	'Staking',
	'Transfer',
	'Borrow',
	'Invest',
	'PoolAdmin',
	'PodOperation',
	'PodAuth',
	'PermissionManagement',
] as const;

export type ProxyType = (typeof PROXY_TYPES)[number];

/**
 * Permission roles for pool access control
 */
export const PERMISSION_ROLES = {
	// Pool-level roles
	PoolAdmin: 'PoolAdmin',
	Borrower: 'Borrower',
	LiquidityAdmin: 'LiquidityAdmin',
	InvestorAdmin: 'InvestorAdmin',
	LoanAdmin: 'LoanAdmin',
	PODReadAccess: 'PODReadAccess',

	// Tranche-level roles
	TrancheInvestor: 'TrancheInvestor',

	// Currency roles
	CurrencyAdmin: 'CurrencyAdmin',
} as const;

export type PermissionRole = keyof typeof PERMISSION_ROLES;

/**
 * Loan pricing types
 */
export const LOAN_PRICING_TYPES = {
	Internal: 'Internal',
	External: 'External',
} as const;

/**
 * Loan valuation methods
 */
export const LOAN_VALUATION_METHODS = {
	OutstandingDebt: 'OutstandingDebt',
	DiscountedCashFlow: 'DiscountedCashFlow',
	Oracle: 'Oracle',
} as const;

/**
 * Interest accrual methods
 */
export const INTEREST_ACCRUAL = {
	Linear: 'Linear',
	Compounding: 'Compounding',
} as const;

/**
 * Pool epoch states
 */
export const EPOCH_STATES = {
	Open: 'Open',
	InExecution: 'InExecution',
	Closed: 'Closed',
} as const;

/**
 * Tranche seniority levels
 */
export const TRANCHE_SENIORITY = {
	Senior: 'Senior',
	Mezzanine: 'Mezzanine',
	Junior: 'Junior',
} as const;
