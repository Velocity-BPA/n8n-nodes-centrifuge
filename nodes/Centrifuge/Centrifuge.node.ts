/**
 * Centrifuge Node for n8n
 * 
 * n8n node for interacting with Centrifuge blockchain - RWA tokenization platform.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

import { createClientFromCredentials, SubstrateClient } from './transport/substrateClient';
import { createApiClientFromCredentials, CentrifugeApiClient } from './transport/centrifugeApi';
import { createIpfsClientFromCredentials, IpfsClient } from './transport/ipfsClient';
import { validateAddress, convertAddress, formatAddress } from './utils/addressUtils';
import { cfgToBaseUnits, fromBaseUnits, formatAmount } from './utils/unitConverter';
import { validatePoolId, validateTrancheId } from './utils/poolUtils';
import { CFG_TOKEN } from './constants/currencies';

export class Centrifuge implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Centrifuge',
		name: 'centrifuge',
		icon: 'file:centrifuge.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Centrifuge blockchain for Real World Asset tokenization',
		defaults: { name: 'Centrifuge' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{ name: 'centrifugeNetwork', required: true },
			{ name: 'centrifugeApi', required: false },
			{ name: 'ipfsStorage', required: false },
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Pool', value: 'pool' },
					{ name: 'Tranche', value: 'tranche' },
					{ name: 'Investment', value: 'investment' },
					{ name: 'Loan', value: 'loan' },
					{ name: 'Document', value: 'document' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'account',
			},
			// Account Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', action: 'Get account balance' },
					{ name: 'Transfer', value: 'transfer', action: 'Transfer CFG tokens' },
				],
				default: 'getBalance',
			},
			// Pool Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['pool'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all pools' },
					{ name: 'Get Pool', value: 'getPool', action: 'Get pool details' },
				],
				default: 'getAll',
			},
			// Tranche Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['tranche'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all tranches' },
				],
				default: 'getAll',
			},
			// Investment Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['investment'] } },
				options: [
					{ name: 'Get Orders', value: 'getOrders', action: 'Get orders' },
					{ name: 'Get Positions', value: 'getPositions', action: 'Get positions' },
				],
				default: 'getOrders',
			},
			// Loan Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['loan'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all loans' },
					{ name: 'Get Loan', value: 'getLoan', action: 'Get loan details' },
				],
				default: 'getAll',
			},
			// Document Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['document'] } },
				options: [
					{ name: 'Upload to IPFS', value: 'uploadToIpfs', action: 'Upload to IPFS' },
					{ name: 'Get from IPFS', value: 'getFromIpfs', action: 'Get from IPFS' },
				],
				default: 'uploadToIpfs',
			},
			// Utility Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['utility'] } },
				options: [
					{ name: 'Get Chain Info', value: 'getChainInfo', action: 'Get chain info' },
					{ name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
					{ name: 'Convert Address', value: 'convertAddress', action: 'Convert address' },
				],
				default: 'getChainInfo',
			},
			// Parameters
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['account'], operation: ['getBalance'] } },
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['utility'], operation: ['validateAddress', 'convertAddress'] } },
			},
			{
				displayName: 'Recipient Address',
				name: 'recipientAddress',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['account'], operation: ['transfer'] } },
			},
			{
				displayName: 'Amount (CFG)',
				name: 'amount',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: { show: { resource: ['account'], operation: ['transfer'] } },
			},
			{
				displayName: 'Pool ID',
				name: 'poolId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['pool'], operation: ['getPool'] } },
			},
			{
				displayName: 'Pool ID',
				name: 'poolId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['tranche'] } },
			},
			{
				displayName: 'Pool ID',
				name: 'poolId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['investment'], operation: ['getOrders'] } },
			},
			{
				displayName: 'Pool ID',
				name: 'poolId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['loan'] } },
			},
			{
				displayName: 'Tranche ID',
				name: 'trancheId',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['investment'], operation: ['getOrders'] } },
			},
			{
				displayName: 'Loan ID',
				name: 'loanId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['loan'], operation: ['getLoan'] } },
			},
			{
				displayName: 'Account Address',
				name: 'accountAddress',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['investment'], operation: ['getPositions'] } },
			},
			{
				displayName: 'Document Content',
				name: 'documentContent',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['document'], operation: ['uploadToIpfs'] } },
			},
			{
				displayName: 'Document Name',
				name: 'documentName',
				type: 'string',
				default: 'document',
				displayOptions: { show: { resource: ['document'], operation: ['uploadToIpfs'] } },
			},
			{
				displayName: 'IPFS CID',
				name: 'ipfsCid',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['document'], operation: ['getFromIpfs'] } },
			},
			{
				displayName: 'Target Network',
				name: 'targetNetwork',
				type: 'options',
				options: [
					{ name: 'Centrifuge Mainnet', value: 'mainnet' },
					{ name: 'Altair', value: 'altair' },
					{ name: 'Polkadot', value: 'polkadot' },
				],
				default: 'mainnet',
				displayOptions: { show: { resource: ['utility'], operation: ['convertAddress'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const networkCredentials = await this.getCredentials('centrifugeNetwork');
		let apiCredentials: Record<string, unknown> | undefined;
		let ipfsCredentials: Record<string, unknown> | undefined;

		try { apiCredentials = await this.getCredentials('centrifugeApi') as Record<string, unknown>; } catch { /* optional */ }
		try { ipfsCredentials = await this.getCredentials('ipfsStorage') as Record<string, unknown>; } catch { /* optional */ }

		let substrateClient: SubstrateClient | null = null;
		let apiClient: CentrifugeApiClient | null = null;
		let ipfsClient: IpfsClient | null = null;

		try {
			if (['account', 'utility'].includes(resource)) {
				substrateClient = createClientFromCredentials(networkCredentials as Record<string, unknown>);
				await substrateClient.connect();
			}
			if (apiCredentials && ['pool', 'tranche', 'loan', 'investment'].includes(resource)) {
				apiClient = createApiClientFromCredentials(apiCredentials);
			}
			if (ipfsCredentials && resource === 'document') {
				ipfsClient = createIpfsClientFromCredentials(ipfsCredentials);
			}

			for (let i = 0; i < items.length; i++) {
				try {
					let result: IDataObject = {};

					if (resource === 'account') {
						if (operation === 'getBalance') {
							const address = this.getNodeParameter('address', i) as string;
							if (!validateAddress(address)) throw new NodeOperationError(this.getNode(), 'Invalid address', { itemIndex: i });
							const info = await substrateClient!.getAccountInfo(address);
							result = {
								address,
								free: fromBaseUnits(info.free, CFG_TOKEN.decimals),
								reserved: fromBaseUnits(info.reserved, CFG_TOKEN.decimals),
								nonce: info.nonce,
							};
						} else if (operation === 'transfer') {
							const recipient = this.getNodeParameter('recipientAddress', i) as string;
							const amount = this.getNodeParameter('amount', i) as number;
							if (!validateAddress(recipient)) throw new NodeOperationError(this.getNode(), 'Invalid recipient', { itemIndex: i });
							const tx = await substrateClient!.submitTransaction('balances', 'transferKeepAlive', [recipient, cfgToBaseUnits(amount)]);
							result = { success: tx.success, hash: tx.hash, blockHash: tx.blockHash, recipient, amount };
						}
					}

					else if (resource === 'pool') {
						if (operation === 'getAll') {
							result = apiClient ? { pools: await apiClient.getPools() } : { pools: [] };
						} else if (operation === 'getPool') {
							const poolId = this.getNodeParameter('poolId', i) as string;
							if (!validatePoolId(poolId)) throw new NodeOperationError(this.getNode(), 'Invalid pool ID', { itemIndex: i });
							result = apiClient ? (await apiClient.getPool(poolId) as unknown) as IDataObject : { poolId };
						}
					}

					else if (resource === 'tranche') {
						const poolId = this.getNodeParameter('poolId', i) as string;
						if (!validatePoolId(poolId)) throw new NodeOperationError(this.getNode(), 'Invalid pool ID', { itemIndex: i });
						result = apiClient ? { poolId, tranches: await apiClient.getPoolTranches(poolId) } : { poolId, tranches: [] };
					}

					else if (resource === 'investment') {
						if (operation === 'getOrders') {
							const poolId = this.getNodeParameter('poolId', i) as string;
							const trancheId = this.getNodeParameter('trancheId', i) as string;
							result = { poolId, trancheId, orders: [] };
						} else if (operation === 'getPositions') {
							const accountAddress = this.getNodeParameter('accountAddress', i) as string;
							result = apiClient && accountAddress 
								? { account: accountAddress, positions: await apiClient.getInvestorPositions(accountAddress) }
								: { account: accountAddress, positions: [] };
						}
					}

					else if (resource === 'loan') {
						const poolId = this.getNodeParameter('poolId', i) as string;
						if (!validatePoolId(poolId)) throw new NodeOperationError(this.getNode(), 'Invalid pool ID', { itemIndex: i });
						if (operation === 'getAll') {
							result = apiClient ? { poolId, loans: await apiClient.getPoolLoans(poolId) } : { poolId, loans: [] };
						} else if (operation === 'getLoan') {
							const loanId = this.getNodeParameter('loanId', i) as string;
							result = apiClient ? (await apiClient.getLoan(poolId, loanId) as unknown as IDataObject) : { poolId, loanId };
						}
					}

					else if (resource === 'document') {
						if (!ipfsClient) throw new NodeOperationError(this.getNode(), 'IPFS credentials required', { itemIndex: i });
						if (operation === 'uploadToIpfs') {
							const content = this.getNodeParameter('documentContent', i) as string;
							const name = this.getNodeParameter('documentName', i) as string;
							const upload = await ipfsClient.uploadDocument(Buffer.from(content), { name, documentType: 'generic' });
							result = { cid: upload.cid, hash: upload.hash, size: upload.size, name, gatewayUrl: ipfsClient.getGatewayUrl(upload.cid) };
						} else if (operation === 'getFromIpfs') {
							const cid = this.getNodeParameter('ipfsCid', i) as string;
							const content = await ipfsClient.get(cid);
							result = { cid, content: content.data.toString(), contentType: content.contentType, size: content.size };
						}
					}

					else if (resource === 'utility') {
						if (operation === 'getChainInfo') {
							const info = await substrateClient!.getChainInfo();
							const block = await substrateClient!.getCurrentBlockNumber();
							result = { ...info, currentBlock: block };
						} else if (operation === 'validateAddress') {
							const address = this.getNodeParameter('address', i) as string;
							result = { address, valid: validateAddress(address), display: formatAddress(address) };
						} else if (operation === 'convertAddress') {
							const address = this.getNodeParameter('address', i) as string;
							const target = this.getNodeParameter('targetNetwork', i) as string;
							if (!validateAddress(address)) throw new NodeOperationError(this.getNode(), 'Invalid address', { itemIndex: i });
							result = { original: address, converted: convertAddress(address, target), targetNetwork: target };
						}
					}

					returnData.push({ json: result });
				} catch (error) {
					if (this.continueOnFail()) {
						returnData.push({ json: { error: error instanceof Error ? error.message : 'Unknown error' } });
						continue;
					}
					throw error;
				}
			}
		} finally {
			if (substrateClient) await substrateClient.disconnect();
		}

		return [returnData];
	}
}
