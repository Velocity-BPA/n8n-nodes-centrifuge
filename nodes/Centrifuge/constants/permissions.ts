/**
 * Centrifuge Permissions System
 *
 * Centrifuge uses a sophisticated permission system for pool access control.
 * Permissions are granted at different scopes:
 * - Pool level: Controls who can administer pools
 * - Tranche level: Controls who can invest in specific tranches
 * - Currency level: Controls token operations
 *
 * The permission system supports:
 * - Role-based access control (RBAC)
 * - Investor whitelisting per tranche
 * - Admin role separation
 * - Delegation and proxy support
 */

/**
 * Permission scope types
 */
export enum PermissionScope {
	Pool = 'Pool',
	Currency = 'Currency',
}

/**
 * Pool permission roles
 * These determine what actions an account can perform on a pool
 */
export enum PoolRole {
	/**
	 * Full administrative access to the pool
	 * Can: modify pool params, add/remove permissions, close epochs
	 */
	PoolAdmin = 'PoolAdmin',

	/**
	 * Can create and manage loans (borrow against assets)
	 * Can: create loans, borrow, repay, close loans
	 */
	Borrower = 'Borrower',

	/**
	 * Manages liquidity and reserve operations
	 * Can: set reserve limits, manage epoch execution
	 */
	LiquidityAdmin = 'LiquidityAdmin',

	/**
	 * Manages investor permissions
	 * Can: add/remove tranche investors, manage whitelist
	 */
	InvestorAdmin = 'InvestorAdmin',

	/**
	 * Manages loan portfolio
	 * Can: price loans, write off loans, update valuations
	 */
	LoanAdmin = 'LoanAdmin',

	/**
	 * Read access to pool data (POD = Private Off-chain Data)
	 * Can: view restricted pool documents and data
	 */
	PODReadAccess = 'PODReadAccess',
}

/**
 * Tranche permission roles
 */
export enum TrancheRole {
	/**
	 * Can invest in and redeem from this tranche
	 * Whitelisted investor status
	 */
	TrancheInvestor = 'TrancheInvestor',
}

/**
 * Currency permission roles
 */
export enum CurrencyRole {
	/**
	 * Can manage currency-level operations
	 */
	CurrencyAdmin = 'CurrencyAdmin',
}

/**
 * Permission structure matching runtime type
 */
export interface Permission {
	scope: PermissionScope;
	role: PoolRole | TrancheRole | CurrencyRole;
	poolId?: string;
	trancheId?: string;
	currencyId?: unknown;
}

/**
 * All available roles for dropdowns
 */
export const ROLE_OPTIONS = [
	{
		name: 'Pool Admin',
		value: PoolRole.PoolAdmin,
		description: 'Full administrative access to pool configuration',
	},
	{
		name: 'Borrower',
		value: PoolRole.Borrower,
		description: 'Can create and manage loans within the pool',
	},
	{
		name: 'Liquidity Admin',
		value: PoolRole.LiquidityAdmin,
		description: 'Manages liquidity and reserve operations',
	},
	{
		name: 'Investor Admin',
		value: PoolRole.InvestorAdmin,
		description: 'Manages investor whitelist and permissions',
	},
	{
		name: 'Loan Admin',
		value: PoolRole.LoanAdmin,
		description: 'Manages loan pricing and write-offs',
	},
	{
		name: 'POD Read Access',
		value: PoolRole.PODReadAccess,
		description: 'Can access private pool documents',
	},
	{
		name: 'Tranche Investor',
		value: TrancheRole.TrancheInvestor,
		description: 'Whitelisted to invest in specific tranche',
	},
	{
		name: 'Currency Admin',
		value: CurrencyRole.CurrencyAdmin,
		description: 'Manages currency-level operations',
	},
];

/**
 * Role descriptions for UI tooltips
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
	[PoolRole.PoolAdmin]:
		'Can modify pool parameters, manage permissions, close epochs, and perform all administrative functions.',
	[PoolRole.Borrower]:
		'Can create new loans, borrow against collateral, repay loans, and close loans. Typically the asset originator.',
	[PoolRole.LiquidityAdmin]:
		'Manages reserve limits, epoch execution, and liquidity-related parameters.',
	[PoolRole.InvestorAdmin]:
		'Can add or remove investors from tranche whitelists. Controls who can invest.',
	[PoolRole.LoanAdmin]:
		'Can price loans, update valuations, and perform write-offs. Critical for asset management.',
	[PoolRole.PODReadAccess]:
		'Read-only access to private off-chain data like loan documents and originator information.',
	[TrancheRole.TrancheInvestor]:
		'Whitelisted investor who can submit invest and redeem orders for a specific tranche.',
	[CurrencyRole.CurrencyAdmin]: 'Administrative control over currency-level operations and settings.',
};

/**
 * Permission operations
 */
export enum PermissionOperation {
	Add = 'add',
	Remove = 'remove',
	Check = 'check',
}

/**
 * Check if role is pool-scoped
 */
export function isPoolRole(role: string): boolean {
	return Object.values(PoolRole).includes(role as PoolRole);
}

/**
 * Check if role is tranche-scoped
 */
export function isTrancheRole(role: string): boolean {
	return Object.values(TrancheRole).includes(role as TrancheRole);
}

/**
 * Check if role is currency-scoped
 */
export function isCurrencyRole(role: string): boolean {
	return Object.values(CurrencyRole).includes(role as CurrencyRole);
}

/**
 * Get required scope for a role
 */
export function getRoleScope(role: string): PermissionScope {
	if (isPoolRole(role)) return PermissionScope.Pool;
	if (isTrancheRole(role)) return PermissionScope.Pool; // Tranche is under Pool scope
	if (isCurrencyRole(role)) return PermissionScope.Currency;
	throw new Error(`Unknown role: ${role}`);
}

/**
 * Default permission sets for common use cases
 */
export const PERMISSION_PRESETS = {
	/**
	 * Full pool administration
	 */
	fullAdmin: [PoolRole.PoolAdmin, PoolRole.LiquidityAdmin, PoolRole.InvestorAdmin, PoolRole.LoanAdmin],

	/**
	 * Asset originator (borrower)
	 */
	originator: [PoolRole.Borrower, PoolRole.PODReadAccess],

	/**
	 * Investor management only
	 */
	investorManager: [PoolRole.InvestorAdmin],

	/**
	 * Read-only access
	 */
	readOnly: [PoolRole.PODReadAccess],
};

/**
 * Permission expiry configuration
 */
export interface PermissionExpiry {
	enabled: boolean;
	expiryBlock?: number;
	expiryTimestamp?: number;
}

/**
 * Permission validation rules
 */
export const PERMISSION_RULES = {
	/**
	 * Maximum permissions per account per pool
	 */
	maxPermissionsPerAccount: 100,

	/**
	 * Roles that can grant other roles
	 */
	grantableBy: {
		[PoolRole.PoolAdmin]: Object.values(PoolRole),
		[PoolRole.InvestorAdmin]: [TrancheRole.TrancheInvestor],
	},
};

/**
 * Create a pool permission object
 */
export function createPoolPermission(poolId: string, role: PoolRole): Permission {
	return {
		scope: PermissionScope.Pool,
		role,
		poolId,
	};
}

/**
 * Create a tranche investor permission object
 */
export function createTranchePermission(
	poolId: string,
	trancheId: string,
	role: TrancheRole = TrancheRole.TrancheInvestor,
): Permission {
	return {
		scope: PermissionScope.Pool,
		role,
		poolId,
		trancheId,
	};
}
