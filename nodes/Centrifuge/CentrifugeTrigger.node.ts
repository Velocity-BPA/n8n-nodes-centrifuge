/**
 * Centrifuge Trigger Node for n8n
 * 
 * Trigger node for real-time Centrifuge blockchain events.
 * Monitors pools, investments, loans, and governance activities.
 */

import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
} from 'n8n-workflow';

import {
	createSubscriptionClientFromCredentials,
	SubscriptionClient,
	CentrifugeEvent,
	CentrifugeEventType,
	EventCategory,
} from './transport/subscriptionClient';

export class CentrifugeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Centrifuge Trigger',
		name: 'centrifugeTrigger',
		icon: 'file:centrifuge.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventCategory"]}}',
		description: 'Trigger workflows on Centrifuge blockchain events',
		defaults: {
			name: 'Centrifuge Trigger',
		},
		inputs: [],
		outputs: ['main'] as const,
		credentials: [
			{
				name: 'centrifugeNetwork',
				required: true,
			},
		],
		properties: [
			// Event Category
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				options: [
					{ name: 'Pool Events', value: 'pool', description: 'Pool creation, updates, NAV changes' },
					{ name: 'Investment Events', value: 'investment', description: 'Invest/redeem orders, collections' },
					{ name: 'Loan Events', value: 'loan', description: 'Loan creation, borrowing, repayment' },
					{ name: 'Account Events', value: 'account', description: 'Balance changes, transfers' },
					{ name: 'Epoch Events', value: 'epoch', description: 'Epoch lifecycle events' },
					{ name: 'Governance Events', value: 'governance', description: 'Proposals, voting, referendums' },
					{ name: 'Document Events', value: 'document', description: 'Document anchoring' },
					{ name: 'All Events', value: 'all', description: 'All Centrifuge events' },
				],
				default: 'pool',
				description: 'Category of events to listen for',
			},

			// Specific Event Types
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventCategory: ['pool'],
					},
				},
				options: [
					{ name: 'Pool Created', value: 'PoolCreated' },
					{ name: 'Pool Updated', value: 'PoolUpdated' },
					{ name: 'Epoch Closed', value: 'EpochClosed' },
					{ name: 'Epoch Executed', value: 'EpochExecuted' },
					{ name: 'NAV Updated', value: 'NavUpdated' },
					{ name: 'Pool State Changed', value: 'PoolStateChanged' },
				],
				default: ['PoolCreated', 'EpochExecuted'],
				description: 'Specific pool events to listen for',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventCategory: ['investment'],
					},
				},
				options: [
					{ name: 'Invest Order Submitted', value: 'InvestOrderSubmitted' },
					{ name: 'Redeem Order Submitted', value: 'RedeemOrderSubmitted' },
					{ name: 'Investment Collected', value: 'InvestmentCollected' },
					{ name: 'Redemption Collected', value: 'RedemptionCollected' },
					{ name: 'Order Cancelled', value: 'OrderCancelled' },
				],
				default: ['InvestOrderSubmitted', 'InvestmentCollected'],
				description: 'Specific investment events to listen for',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventCategory: ['loan'],
					},
				},
				options: [
					{ name: 'Loan Created', value: 'LoanCreated' },
					{ name: 'Loan Priced', value: 'LoanPriced' },
					{ name: 'Loan Borrowed', value: 'LoanBorrowed' },
					{ name: 'Loan Repaid', value: 'LoanRepaid' },
					{ name: 'Loan Closed', value: 'LoanClosed' },
					{ name: 'Loan Written Off', value: 'LoanWrittenOff' },
					{ name: 'Interest Accrued', value: 'InterestAccrued' },
				],
				default: ['LoanCreated', 'LoanBorrowed', 'LoanRepaid'],
				description: 'Specific loan events to listen for',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventCategory: ['account'],
					},
				},
				options: [
					{ name: 'Transfer Received', value: 'TransferReceived' },
					{ name: 'Transfer Sent', value: 'TransferSent' },
					{ name: 'Balance Changed', value: 'BalanceChanged' },
					{ name: 'Permission Granted', value: 'PermissionGranted' },
					{ name: 'Permission Revoked', value: 'PermissionRevoked' },
				],
				default: ['TransferReceived', 'TransferSent'],
				description: 'Specific account events to listen for',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventCategory: ['epoch'],
					},
				},
				options: [
					{ name: 'Epoch Started', value: 'EpochStarted' },
					{ name: 'Orders Submitted', value: 'OrdersSubmitted' },
					{ name: 'Solution Submitted', value: 'SolutionSubmitted' },
					{ name: 'Epoch Executed', value: 'EpochExecuted' },
				],
				default: ['EpochStarted', 'EpochExecuted'],
				description: 'Specific epoch events to listen for',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventCategory: ['governance'],
					},
				},
				options: [
					{ name: 'Proposal Created', value: 'ProposalCreated' },
					{ name: 'Vote Cast', value: 'VoteCast' },
					{ name: 'Proposal Passed', value: 'ProposalPassed' },
					{ name: 'Proposal Rejected', value: 'ProposalRejected' },
					{ name: 'Referendum Started', value: 'ReferendumStarted' },
				],
				default: ['ProposalCreated', 'ProposalPassed'],
				description: 'Specific governance events to listen for',
			},

			// Filter Options
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Pool IDs',
						name: 'poolIds',
						type: 'string',
						default: '',
						description: 'Comma-separated pool IDs to filter events',
					},
					{
						displayName: 'Account Addresses',
						name: 'accounts',
						type: 'string',
						default: '',
						description: 'Comma-separated account addresses to filter events',
					},
					{
						displayName: 'Tranche IDs',
						name: 'trancheIds',
						type: 'string',
						default: '',
						description: 'Comma-separated tranche IDs to filter events',
					},
					{
						displayName: 'Minimum Amount',
						name: 'minAmount',
						type: 'string',
						default: '',
						description: 'Minimum amount to trigger (in base units)',
					},
				],
			},

			// Options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Raw Event Data',
						name: 'includeRaw',
						type: 'boolean',
						default: false,
						description: 'Whether to include raw blockchain event data',
					},
					{
						displayName: 'Reconnect on Disconnect',
						name: 'autoReconnect',
						type: 'boolean',
						default: true,
						description: 'Whether to automatically reconnect if disconnected',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const eventTypes = this.getNodeParameter('eventTypes', []) as string[];
		const filters = this.getNodeParameter('filters', {}) as {
			poolIds?: string;
			accounts?: string;
			trancheIds?: string;
			minAmount?: string;
		};
		const options = this.getNodeParameter('options', {}) as {
			includeRaw?: boolean;
			autoReconnect?: boolean;
		};

		// Get credentials
		const credentials = await this.getCredentials('centrifugeNetwork');
		
		// Create subscription client
		const subscriptionClient = createSubscriptionClientFromCredentials({
			network: credentials.network as string,
			wsEndpoint: credentials.wsEndpoint as string | undefined,
		});

		// Parse filters
		const subscriptionFilter = {
			poolIds: filters.poolIds ? filters.poolIds.split(',').map(s => s.trim()) : undefined,
			accounts: filters.accounts ? filters.accounts.split(',').map(s => s.trim()) : undefined,
			trancheIds: filters.trancheIds ? filters.trancheIds.split(',').map(s => s.trim()) : undefined,
			minAmount: filters.minAmount || undefined,
		};

		// Event handler
		const handleEvent = (event: CentrifugeEvent) => {
			const outputData: IDataObject = {
				eventId: event.id,
				eventType: event.type,
				category: event.category,
				blockNumber: event.blockNumber,
				blockHash: event.blockHash,
				timestamp: event.timestamp.toISOString(),
				data: event.data as IDataObject,
			};

			if (options.includeRaw && event.raw) {
				outputData.raw = event.raw as unknown as IDataObject;
			}

			this.emit([this.helpers.returnJsonArray([outputData])]);
		};

		// Connect and subscribe
		await subscriptionClient.connect();

		let subscriptionId: string;

		if (eventCategory === 'all') {
			// Subscribe to all events
			subscriptionId = await subscriptionClient.subscribe(
				{ filter: subscriptionFilter, includeRaw: options.includeRaw },
				handleEvent
			);
		} else {
			// Subscribe to specific category
			const typedEventTypes = eventTypes.length > 0 
				? eventTypes as CentrifugeEventType[]
				: undefined;
			
			subscriptionId = await subscriptionClient.subscribeToCategory(
				eventCategory as EventCategory,
				subscriptionFilter,
				handleEvent
			);
		}

		// Handle connection events
		subscriptionClient.on('disconnected', () => {
			console.log('Centrifuge trigger disconnected');
			if (options.autoReconnect) {
				console.log('Will attempt to reconnect...');
			}
		});

		subscriptionClient.on('error', (error) => {
			console.error('Centrifuge trigger error:', error);
		});

		// Return cleanup function
		const closeFunction = async () => {
			try {
				subscriptionClient.unsubscribe(subscriptionId);
				await subscriptionClient.disconnect();
			} catch (error) {
				console.error('Error closing Centrifuge trigger:', error);
			}
		};

		return {
			closeFunction,
		};
	}
}
