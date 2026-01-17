/**
 * Subscription Client for Centrifuge Real-Time Events
 * 
 * Provides WebSocket-based subscriptions to blockchain events
 * for use in n8n trigger nodes. Monitors pool events, investment
 * orders, loan activities, governance actions, and more.
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { EventRecord } from '@polkadot/types/interfaces';
import { EventEmitter } from 'events';
import { NETWORKS, NetworkConfig } from '../constants/networks';

// ============================================================================
// Types and Interfaces
// ============================================================================

export type EventCategory = 
	| 'pool'
	| 'investment'
	| 'loan'
	| 'asset'
	| 'account'
	| 'governance'
	| 'epoch'
	| 'document'
	| 'permissions'
	| 'bridge';

export type PoolEventType = 
	| 'PoolCreated'
	| 'PoolUpdated'
	| 'EpochClosed'
	| 'EpochExecuted'
	| 'NavUpdated'
	| 'PoolStateChanged';

export type InvestmentEventType =
	| 'InvestOrderSubmitted'
	| 'RedeemOrderSubmitted'
	| 'InvestmentCollected'
	| 'RedemptionCollected'
	| 'OrderCancelled';

export type LoanEventType =
	| 'LoanCreated'
	| 'LoanPriced'
	| 'LoanBorrowed'
	| 'LoanRepaid'
	| 'LoanClosed'
	| 'LoanWrittenOff'
	| 'InterestAccrued';

export type AssetEventType =
	| 'AssetCreated'
	| 'AssetUpdated'
	| 'AssetTransferred'
	| 'DocumentAnchored';

export type AccountEventType =
	| 'TransferReceived'
	| 'TransferSent'
	| 'BalanceChanged'
	| 'PermissionGranted'
	| 'PermissionRevoked';

export type GovernanceEventType =
	| 'ProposalCreated'
	| 'VoteCast'
	| 'ProposalPassed'
	| 'ProposalRejected'
	| 'ReferendumStarted';

export type EpochEventType =
	| 'EpochStarted'
	| 'OrdersSubmitted'
	| 'SolutionSubmitted'
	| 'EpochExecuted';

export type CentrifugeEventType = 
	| PoolEventType
	| InvestmentEventType
	| LoanEventType
	| AssetEventType
	| AccountEventType
	| GovernanceEventType
	| EpochEventType;

export interface CentrifugeEvent {
	id: string;
	type: CentrifugeEventType;
	category: EventCategory;
	blockNumber: number;
	blockHash: string;
	timestamp: Date;
	data: Record<string, unknown>;
	raw?: EventRecord;
}

export interface SubscriptionFilter {
	poolIds?: string[];
	trancheIds?: string[];
	accounts?: string[];
	loanIds?: string[];
	assetIds?: string[];
	minAmount?: string;
}

export interface SubscriptionOptions {
	eventTypes?: CentrifugeEventType[];
	filter?: SubscriptionFilter;
	includeRaw?: boolean;
}

// ============================================================================
// Event Pallet Mappings
// ============================================================================

/**
 * Mapping of Centrifuge events to their pallet and event names
 */
const EVENT_MAPPINGS: Record<CentrifugeEventType, { pallet: string; events: string[] }> = {
	// Pool Events
	PoolCreated: { pallet: 'poolRegistry', events: ['Created', 'Registered'] },
	PoolUpdated: { pallet: 'poolRegistry', events: ['Updated', 'MetadataSet'] },
	EpochClosed: { pallet: 'poolSystem', events: ['EpochClosed'] },
	EpochExecuted: { pallet: 'poolSystem', events: ['EpochExecuted', 'SolutionSubmitted'] },
	NavUpdated: { pallet: 'poolSystem', events: ['NavUpdated', 'PriceSet'] },
	PoolStateChanged: { pallet: 'poolSystem', events: ['StateChanged'] },

	// Investment Events
	InvestOrderSubmitted: { pallet: 'investments', events: ['InvestOrderUpdated', 'InvestOrdersCollected'] },
	RedeemOrderSubmitted: { pallet: 'investments', events: ['RedeemOrderUpdated', 'RedeemOrdersCollected'] },
	InvestmentCollected: { pallet: 'investments', events: ['InvestCollected', 'InvestOrdersCleared'] },
	RedemptionCollected: { pallet: 'investments', events: ['RedeemCollected', 'RedeemOrdersCleared'] },
	OrderCancelled: { pallet: 'investments', events: ['InvestOrderUpdated', 'RedeemOrderUpdated'] },

	// Loan Events
	LoanCreated: { pallet: 'loans', events: ['Created'] },
	LoanPriced: { pallet: 'loans', events: ['Priced'] },
	LoanBorrowed: { pallet: 'loans', events: ['Borrowed'] },
	LoanRepaid: { pallet: 'loans', events: ['Repaid'] },
	LoanClosed: { pallet: 'loans', events: ['Closed'] },
	LoanWrittenOff: { pallet: 'loans', events: ['WrittenOff'] },
	InterestAccrued: { pallet: 'loans', events: ['InterestAccrued'] },

	// Asset Events
	AssetCreated: { pallet: 'uniques', events: ['Created', 'Issued'] },
	AssetUpdated: { pallet: 'uniques', events: ['MetadataSet', 'AttributeSet'] },
	AssetTransferred: { pallet: 'uniques', events: ['Transferred'] },
	DocumentAnchored: { pallet: 'anchors', events: ['AnchorCommitted', 'AnchorEvicted'] },

	// Account Events
	TransferReceived: { pallet: 'balances', events: ['Transfer'] },
	TransferSent: { pallet: 'balances', events: ['Transfer'] },
	BalanceChanged: { pallet: 'balances', events: ['Deposit', 'Withdraw', 'Reserved', 'Unreserved'] },
	PermissionGranted: { pallet: 'permissions', events: ['Added'] },
	PermissionRevoked: { pallet: 'permissions', events: ['Removed'] },

	// Governance Events
	ProposalCreated: { pallet: 'democracy', events: ['Proposed', 'Submitted'] },
	VoteCast: { pallet: 'democracy', events: ['Voted'] },
	ProposalPassed: { pallet: 'democracy', events: ['Passed'] },
	ProposalRejected: { pallet: 'democracy', events: ['NotPassed', 'Cancelled'] },
	ReferendumStarted: { pallet: 'democracy', events: ['Started'] },

	// Epoch Events
	EpochStarted: { pallet: 'poolSystem', events: ['EpochClosed'] }, // New epoch starts when old one closes
	OrdersSubmitted: { pallet: 'poolSystem', events: ['SubmissionPeriodStarted'] },
	SolutionSubmitted: { pallet: 'poolSystem', events: ['SolutionSubmitted'] },
};

// ============================================================================
// Subscription Client Class
// ============================================================================

export class SubscriptionClient extends EventEmitter {
	private api: ApiPromise | null = null;
	private provider: WsProvider | null = null;
	private networkConfig: NetworkConfig;
	private subscriptions: Map<string, () => void> = new Map();
	private eventBuffer: CentrifugeEvent[] = [];
	private maxBufferSize: number = 1000;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 10;
	private reconnectDelay: number = 5000;
	private isConnected: boolean = false;

	constructor(network: string = 'mainnet') {
		super();
		this.networkConfig = NETWORKS[network] || NETWORKS.mainnet;
	}

	// ==========================================================================
	// Connection Management
	// ==========================================================================

	/**
	 * Connect to the Centrifuge network
	 */
	async connect(): Promise<void> {
		if (this.isConnected && this.api) {
			return;
		}

		try {
			this.provider = new WsProvider(this.networkConfig.wsEndpoint);
			
			// Handle provider events
			this.provider.on('connected', () => {
				this.reconnectAttempts = 0;
				this.emit('connected');
			});

			this.provider.on('disconnected', () => {
				this.isConnected = false;
				this.emit('disconnected');
				this.handleReconnect();
			});

			this.provider.on('error', (error) => {
				this.emit('error', error);
			});

			this.api = await ApiPromise.create({ provider: this.provider });
			this.isConnected = true;
			
			console.log(`Connected to ${this.networkConfig.name}`);
		} catch (error) {
			this.isConnected = false;
			throw new Error(`Failed to connect to ${this.networkConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Disconnect from the network
	 */
	async disconnect(): Promise<void> {
		// Unsubscribe from all active subscriptions
		for (const [id, unsubscribe] of this.subscriptions) {
			try {
				unsubscribe();
			} catch {
				// Ignore errors during cleanup
			}
		}
		this.subscriptions.clear();

		if (this.api) {
			await this.api.disconnect();
			this.api = null;
		}

		if (this.provider) {
			await this.provider.disconnect();
			this.provider = null;
		}

		this.isConnected = false;
		this.emit('disconnected');
	}

	/**
	 * Handle reconnection attempts
	 */
	private async handleReconnect(): Promise<void> {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			this.emit('maxReconnectAttemptsReached');
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
		
		console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
		
		await new Promise(resolve => setTimeout(resolve, delay));
		
		try {
			await this.connect();
			// Re-establish subscriptions
			await this.resubscribeAll();
		} catch (error) {
			this.handleReconnect();
		}
	}

	/**
	 * Re-establish all active subscriptions after reconnect
	 */
	private async resubscribeAll(): Promise<void> {
		// Implementation would store subscription configs and recreate them
		// For now, emit event for external handling
		this.emit('reconnected');
	}

	// ==========================================================================
	// Event Subscriptions
	// ==========================================================================

	/**
	 * Subscribe to specific event types
	 */
	async subscribe(
		options: SubscriptionOptions,
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		if (!this.api || !this.isConnected) {
			await this.connect();
		}

		const subscriptionId = this.generateSubscriptionId();
		const { eventTypes, filter, includeRaw } = options;

		// Subscribe to system events
		const unsubscribe = await this.api!.query.system.events((events: EventRecord[]) => {
			this.processEvents(events, eventTypes, filter, includeRaw, callback);
		});

		this.subscriptions.set(subscriptionId, unsubscribe as unknown as () => void);
		return subscriptionId;
	}

	/**
	 * Subscribe to all events of a category
	 */
	async subscribeToCategory(
		category: EventCategory,
		filter: SubscriptionFilter | undefined,
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		const eventTypes = this.getEventTypesForCategory(category);
		return this.subscribe({ eventTypes, filter }, callback);
	}

	/**
	 * Unsubscribe from events
	 */
	unsubscribe(subscriptionId: string): boolean {
		const unsubscribe = this.subscriptions.get(subscriptionId);
		if (unsubscribe) {
			try {
				unsubscribe();
			} catch {
				// Ignore errors during unsubscribe
			}
			this.subscriptions.delete(subscriptionId);
			return true;
		}
		return false;
	}

	/**
	 * Get all active subscription IDs
	 */
	getActiveSubscriptions(): string[] {
		return Array.from(this.subscriptions.keys());
	}

	// ==========================================================================
	// Event Processing
	// ==========================================================================

	/**
	 * Process blockchain events and filter based on subscription options
	 */
	private processEvents(
		events: EventRecord[],
		eventTypes: CentrifugeEventType[] | undefined,
		filter: SubscriptionFilter | undefined,
		includeRaw: boolean | undefined,
		callback: (event: CentrifugeEvent) => void
	): void {
		events.forEach((record, index) => {
			const { event, phase } = record;
			const pallet = event.section;
			const method = event.method;

			// Find matching event type
			const matchedEventType = this.matchEventType(pallet, method, eventTypes);
			if (!matchedEventType) {
				return;
			}

			// Parse event data
			const eventData = this.parseEventData(event);

			// Apply filters
			if (filter && !this.matchesFilter(eventData, filter)) {
				return;
			}

			// Create event object
			const centrifugeEvent: CentrifugeEvent = {
				id: `${pallet}-${method}-${Date.now()}-${index}`,
				type: matchedEventType,
				category: this.getEventCategory(matchedEventType),
				blockNumber: 0, // Will be set when block info is available
				blockHash: '',
				timestamp: new Date(),
				data: eventData,
				...(includeRaw && { raw: record }),
			};

			// Get block info if available
			if (phase.isApplyExtrinsic) {
				this.enrichWithBlockInfo(centrifugeEvent);
			}

			// Add to buffer
			this.addToBuffer(centrifugeEvent);

			// Invoke callback
			callback(centrifugeEvent);
		});
	}

	/**
	 * Match event to event type
	 */
	private matchEventType(
		pallet: string,
		method: string,
		eventTypes?: CentrifugeEventType[]
	): CentrifugeEventType | null {
		for (const [eventType, mapping] of Object.entries(EVENT_MAPPINGS)) {
			if (mapping.pallet === pallet && mapping.events.includes(method)) {
				// If specific event types are requested, check if this one matches
				if (eventTypes && !eventTypes.includes(eventType as CentrifugeEventType)) {
					continue;
				}
				return eventType as CentrifugeEventType;
			}
		}
		return null;
	}

	/**
	 * Parse event data into readable format
	 */
	private parseEventData(event: any): Record<string, unknown> {
		const data: Record<string, unknown> = {
			section: event.section,
			method: event.method,
		};

		// Parse event data based on event type
		try {
			const eventData = event.data.toJSON();
			if (Array.isArray(eventData)) {
				eventData.forEach((item, index) => {
					data[`param${index}`] = item;
				});
			} else {
				Object.assign(data, eventData);
			}
		} catch {
			data.rawData = event.data.toString();
		}

		return data;
	}

	/**
	 * Check if event data matches filter criteria
	 */
	private matchesFilter(
		eventData: Record<string, unknown>,
		filter: SubscriptionFilter
	): boolean {
		// Pool ID filter
		if (filter.poolIds && filter.poolIds.length > 0) {
			const poolId = this.extractValue(eventData, ['poolId', 'pool_id', 'param0']);
			if (!poolId || !filter.poolIds.includes(String(poolId))) {
				return false;
			}
		}

		// Account filter
		if (filter.accounts && filter.accounts.length > 0) {
			const account = this.extractValue(eventData, ['who', 'from', 'to', 'account', 'param0']);
			if (!account || !filter.accounts.includes(String(account))) {
				return false;
			}
		}

		// Loan ID filter
		if (filter.loanIds && filter.loanIds.length > 0) {
			const loanId = this.extractValue(eventData, ['loanId', 'loan_id', 'param1']);
			if (!loanId || !filter.loanIds.includes(String(loanId))) {
				return false;
			}
		}

		// Tranche ID filter
		if (filter.trancheIds && filter.trancheIds.length > 0) {
			const trancheId = this.extractValue(eventData, ['trancheId', 'tranche_id']);
			if (!trancheId || !filter.trancheIds.includes(String(trancheId))) {
				return false;
			}
		}

		// Minimum amount filter
		if (filter.minAmount) {
			const amount = this.extractValue(eventData, ['amount', 'value', 'param2']);
			if (amount && BigInt(String(amount)) < BigInt(filter.minAmount)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Extract value from event data by possible key names
	 */
	private extractValue(data: Record<string, unknown>, keys: string[]): unknown {
		for (const key of keys) {
			if (key in data) {
				return data[key];
			}
		}
		return undefined;
	}

	/**
	 * Get category for event type
	 */
	private getEventCategory(eventType: CentrifugeEventType): EventCategory {
		const categoryMap: Record<string, EventCategory> = {
			PoolCreated: 'pool',
			PoolUpdated: 'pool',
			EpochClosed: 'pool',
			EpochExecuted: 'pool',
			NavUpdated: 'pool',
			PoolStateChanged: 'pool',
			InvestOrderSubmitted: 'investment',
			RedeemOrderSubmitted: 'investment',
			InvestmentCollected: 'investment',
			RedemptionCollected: 'investment',
			OrderCancelled: 'investment',
			LoanCreated: 'loan',
			LoanPriced: 'loan',
			LoanBorrowed: 'loan',
			LoanRepaid: 'loan',
			LoanClosed: 'loan',
			LoanWrittenOff: 'loan',
			InterestAccrued: 'loan',
			AssetCreated: 'asset',
			AssetUpdated: 'asset',
			AssetTransferred: 'asset',
			DocumentAnchored: 'document',
			TransferReceived: 'account',
			TransferSent: 'account',
			BalanceChanged: 'account',
			PermissionGranted: 'permissions',
			PermissionRevoked: 'permissions',
			ProposalCreated: 'governance',
			VoteCast: 'governance',
			ProposalPassed: 'governance',
			ProposalRejected: 'governance',
			ReferendumStarted: 'governance',
			EpochStarted: 'epoch',
			OrdersSubmitted: 'epoch',
			SolutionSubmitted: 'epoch',
		};

		return categoryMap[eventType] || 'pool';
	}

	/**
	 * Get event types for a category
	 */
	private getEventTypesForCategory(category: EventCategory): CentrifugeEventType[] {
		const categoryEvents: Record<EventCategory, CentrifugeEventType[]> = {
			pool: ['PoolCreated', 'PoolUpdated', 'EpochClosed', 'EpochExecuted', 'NavUpdated', 'PoolStateChanged'],
			investment: ['InvestOrderSubmitted', 'RedeemOrderSubmitted', 'InvestmentCollected', 'RedemptionCollected', 'OrderCancelled'],
			loan: ['LoanCreated', 'LoanPriced', 'LoanBorrowed', 'LoanRepaid', 'LoanClosed', 'LoanWrittenOff', 'InterestAccrued'],
			asset: ['AssetCreated', 'AssetUpdated', 'AssetTransferred', 'DocumentAnchored'],
			account: ['TransferReceived', 'TransferSent', 'BalanceChanged', 'PermissionGranted', 'PermissionRevoked'],
			governance: ['ProposalCreated', 'VoteCast', 'ProposalPassed', 'ProposalRejected', 'ReferendumStarted'],
			epoch: ['EpochStarted', 'OrdersSubmitted', 'SolutionSubmitted', 'EpochExecuted'],
			document: ['DocumentAnchored'],
			permissions: ['PermissionGranted', 'PermissionRevoked'],
			bridge: [], // Bridge events would be added when bridge pallet is identified
		};

		return categoryEvents[category] || [];
	}

	/**
	 * Enrich event with block information
	 */
	private async enrichWithBlockInfo(event: CentrifugeEvent): Promise<void> {
		if (!this.api) return;

		try {
			const header = await this.api.rpc.chain.getHeader();
			event.blockNumber = header.number.toNumber();
			event.blockHash = header.hash.toHex();
		} catch {
			// Block info unavailable
		}
	}

	// ==========================================================================
	// Event Buffer Management
	// ==========================================================================

	/**
	 * Add event to buffer
	 */
	private addToBuffer(event: CentrifugeEvent): void {
		this.eventBuffer.push(event);
		if (this.eventBuffer.length > this.maxBufferSize) {
			this.eventBuffer.shift();
		}
	}

	/**
	 * Get recent events from buffer
	 */
	getRecentEvents(count: number = 100): CentrifugeEvent[] {
		return this.eventBuffer.slice(-count);
	}

	/**
	 * Get events by type from buffer
	 */
	getEventsByType(eventType: CentrifugeEventType, count: number = 100): CentrifugeEvent[] {
		return this.eventBuffer
			.filter(e => e.type === eventType)
			.slice(-count);
	}

	/**
	 * Get events by category from buffer
	 */
	getEventsByCategory(category: EventCategory, count: number = 100): CentrifugeEvent[] {
		return this.eventBuffer
			.filter(e => e.category === category)
			.slice(-count);
	}

	/**
	 * Clear event buffer
	 */
	clearBuffer(): void {
		this.eventBuffer = [];
	}

	// ==========================================================================
	// Specialized Subscriptions
	// ==========================================================================

	/**
	 * Subscribe to pool events for specific pool(s)
	 */
	async subscribeToPool(
		poolIds: string[],
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		return this.subscribeToCategory('pool', { poolIds }, callback);
	}

	/**
	 * Subscribe to investment events for specific account(s)
	 */
	async subscribeToInvestments(
		accounts: string[],
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		return this.subscribeToCategory('investment', { accounts }, callback);
	}

	/**
	 * Subscribe to loan events for specific pool
	 */
	async subscribeToLoans(
		poolIds: string[],
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		return this.subscribeToCategory('loan', { poolIds }, callback);
	}

	/**
	 * Subscribe to account balance changes
	 */
	async subscribeToAccount(
		accounts: string[],
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		return this.subscribeToCategory('account', { accounts }, callback);
	}

	/**
	 * Subscribe to governance events
	 */
	async subscribeToGovernance(
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		return this.subscribeToCategory('governance', undefined, callback);
	}

	/**
	 * Subscribe to epoch events for specific pool(s)
	 */
	async subscribeToEpochs(
		poolIds: string[],
		callback: (event: CentrifugeEvent) => void
	): Promise<string> {
		return this.subscribeToCategory('epoch', { poolIds }, callback);
	}

	// ==========================================================================
	// Block Subscriptions
	// ==========================================================================

	/**
	 * Subscribe to new blocks
	 */
	async subscribeToNewBlocks(
		callback: (blockNumber: number, blockHash: string) => void
	): Promise<string> {
		if (!this.api || !this.isConnected) {
			await this.connect();
		}

		const subscriptionId = this.generateSubscriptionId();

		const unsubscribe = await this.api!.rpc.chain.subscribeNewHeads((header) => {
			callback(header.number.toNumber(), header.hash.toHex());
		});

		this.subscriptions.set(subscriptionId, unsubscribe as unknown as () => void);
		return subscriptionId;
	}

	/**
	 * Subscribe to finalized blocks
	 */
	async subscribeToFinalizedBlocks(
		callback: (blockNumber: number, blockHash: string) => void
	): Promise<string> {
		if (!this.api || !this.isConnected) {
			await this.connect();
		}

		const subscriptionId = this.generateSubscriptionId();

		const unsubscribe = await this.api!.rpc.chain.subscribeFinalizedHeads((header) => {
			callback(header.number.toNumber(), header.hash.toHex());
		});

		this.subscriptions.set(subscriptionId, unsubscribe as unknown as () => void);
		return subscriptionId;
	}

	// ==========================================================================
	// Storage Subscriptions
	// ==========================================================================

	/**
	 * Subscribe to storage changes
	 */
	async subscribeToStorage(
		pallet: string,
		storageItem: string,
		args: unknown[],
		callback: (value: unknown) => void
	): Promise<string> {
		if (!this.api || !this.isConnected) {
			await this.connect();
		}

		const subscriptionId = this.generateSubscriptionId();

		const query = (this.api!.query as any)[pallet]?.[storageItem];
		if (!query) {
			throw new Error(`Storage item not found: ${pallet}.${storageItem}`);
		}

		const unsubscribe = await query(...args, (value: any) => {
			callback(value.toJSON());
		});

		this.subscriptions.set(subscriptionId, unsubscribe as unknown as () => void);
		return subscriptionId;
	}

	// ==========================================================================
	// Utility Methods
	// ==========================================================================

	/**
	 * Generate unique subscription ID
	 */
	private generateSubscriptionId(): string {
		return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Check connection status
	 */
	isConnectionActive(): boolean {
		return this.isConnected && this.api !== null;
	}

	/**
	 * Get network information
	 */
	getNetworkInfo(): NetworkConfig {
		return this.networkConfig;
	}

	/**
	 * Get subscription count
	 */
	getSubscriptionCount(): number {
		return this.subscriptions.size;
	}

	/**
	 * Set network configuration
	 */
	setNetwork(network: string): void {
		if (this.isConnected) {
			throw new Error('Cannot change network while connected. Disconnect first.');
		}
		this.networkConfig = NETWORKS[network] || NETWORKS.mainnet;
	}

	/**
	 * Set custom WebSocket endpoint
	 */
	setCustomEndpoint(wsEndpoint: string): void {
		if (this.isConnected) {
			throw new Error('Cannot change endpoint while connected. Disconnect first.');
		}
		this.networkConfig = {
			...this.networkConfig,
			name: 'Custom',
			wsEndpoint,
		};
	}
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create subscription client from n8n credentials
 */
export function createSubscriptionClientFromCredentials(credentials: {
	network: string;
	wsEndpoint?: string;
}): SubscriptionClient {
	const client = new SubscriptionClient(credentials.network);
	
	if (credentials.wsEndpoint && credentials.network === 'custom') {
		client.setCustomEndpoint(credentials.wsEndpoint);
	}

	return client;
}

/**
 * Create a one-time event listener
 */
export async function waitForEvent(
	client: SubscriptionClient,
	eventType: CentrifugeEventType,
	filter?: SubscriptionFilter,
	timeout: number = 60000
): Promise<CentrifugeEvent> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			client.unsubscribe(subscriptionId);
			reject(new Error(`Timeout waiting for event: ${eventType}`));
		}, timeout);

		let subscriptionId: string;

		client.subscribe(
			{ eventTypes: [eventType], filter },
			(event) => {
				clearTimeout(timer);
				client.unsubscribe(subscriptionId);
				resolve(event);
			}
		).then(id => {
			subscriptionId = id;
		}).catch(reject);
	});
}
