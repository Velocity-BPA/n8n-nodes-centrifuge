/**
 * Substrate Client for Centrifuge Blockchain
 *
 * Handles low-level interaction with the Centrifuge Substrate node via:
 * - WebSocket connections for real-time data
 * - RPC calls for queries and transactions
 * - Transaction signing and submission
 *
 * Uses @polkadot/api for Substrate interaction.
 */

import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { getNetworkConfig, NetworkConfig, WS_OPTIONS } from '../constants/networks';
import { validateAddress } from '../utils/addressUtils';

/**
 * Client configuration interface
 */
export interface SubstrateClientConfig {
	network: string;
	wsEndpoint?: string;
	httpEndpoint?: string;
	seedPhrase?: string;
	privateKey?: string;
	keyType?: KeypairType;
	derivationPath?: string;
	timeout?: number;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
	tip?: string | BN;
	era?: number;
	nonce?: number;
	mortality?: number;
	signedExtensions?: Record<string, unknown>;
}

/**
 * Transaction result
 */
export interface TransactionResult {
	success: boolean;
	hash: string;
	blockHash?: string;
	blockNumber?: number;
	events: TransactionEvent[];
	error?: string;
}

/**
 * Transaction event
 */
export interface TransactionEvent {
	section: string;
	method: string;
	data: unknown[];
}

/**
 * Substrate Client Class
 */
export class SubstrateClient {
	private api: ApiPromise | null = null;
	private keyring: Keyring | null = null;
	private config: SubstrateClientConfig;
	private networkConfig: NetworkConfig;
	private connected: boolean = false;

	constructor(config: SubstrateClientConfig) {
		this.config = config;
		this.networkConfig = getNetworkConfig(config.network);
	}

	/**
	 * Connect to the Substrate node
	 */
	async connect(): Promise<void> {
		if (this.connected && this.api) {
			return;
		}

		const wsEndpoint = this.config.wsEndpoint || this.networkConfig.wsEndpoint;

		const provider = new WsProvider(wsEndpoint, WS_OPTIONS.reconnectDelay);

		this.api = await ApiPromise.create({
			provider,
			throwOnConnect: true,
		});

		await this.api.isReady;
		this.connected = true;

		// Initialize keyring if credentials provided
		if (this.config.seedPhrase || this.config.privateKey) {
			await this.initializeKeyring();
		}
	}

	/**
	 * Initialize the keyring for signing
	 */
	private async initializeKeyring(): Promise<void> {
		const keyType: KeypairType = this.config.keyType || 'sr25519';

		this.keyring = new Keyring({
			type: keyType,
			ss58Format: this.networkConfig.ss58Prefix,
		});

		if (this.config.seedPhrase) {
			const derivation = this.config.derivationPath || '';
			this.keyring.addFromUri(`${this.config.seedPhrase}${derivation}`);
		} else if (this.config.privateKey) {
			this.keyring.addFromUri(this.config.privateKey);
		}
	}

	/**
	 * Disconnect from the node
	 */
	async disconnect(): Promise<void> {
		if (this.api) {
			await this.api.disconnect();
			this.api = null;
			this.connected = false;
		}
	}

	/**
	 * Get the API instance (connects if needed)
	 */
	async getApi(): Promise<ApiPromise> {
		if (!this.api || !this.connected) {
			await this.connect();
		}
		return this.api!;
	}

	/**
	 * Get the signer account address
	 */
	getSignerAddress(): string | null {
		if (!this.keyring || this.keyring.getPairs().length === 0) {
			return null;
		}
		return this.keyring.getPairs()[0].address;
	}

	/**
	 * Query storage
	 */
	async queryStorage(
		pallet: string,
		method: string,
		...args: unknown[]
	): Promise<unknown> {
		const api = await this.getApi();
		const query = api.query[pallet]?.[method];

		if (!query) {
			throw new Error(`Storage query not found: ${pallet}.${method}`);
		}

		return args.length > 0 ? query(...args) : query();
	}

	/**
	 * Query storage entries (for maps)
	 */
	async queryStorageEntries(
		pallet: string,
		method: string,
		...args: unknown[]
	): Promise<Array<[unknown, unknown]>> {
		const api = await this.getApi();
		const query = api.query[pallet]?.[method];

		if (!query || !query.entries) {
			throw new Error(`Storage entries query not found: ${pallet}.${method}`);
		}

		const entries = await (args.length > 0 ? query.entries(...args) : query.entries());
		return entries.map(([key, value]: [unknown, unknown]) => [key, value]);
	}

	/**
	 * Make an RPC call
	 */
	async rpcCall(section: string, method: string, ...params: unknown[]): Promise<unknown> {
		const api = await this.getApi();
		const rpc = (api.rpc as unknown as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>)[
			section
		]?.[method];

		if (!rpc) {
			throw new Error(`RPC method not found: ${section}.${method}`);
		}

		return rpc(...params);
	}

	/**
	 * Get chain info
	 */
	async getChainInfo(): Promise<{
		chain: string;
		nodeName: string;
		nodeVersion: string;
		runtimeVersion: number;
		ss58Prefix: number;
	}> {
		const api = await this.getApi();

		const [chain, nodeName, nodeVersion] = await Promise.all([
			api.rpc.system.chain(),
			api.rpc.system.name(),
			api.rpc.system.version(),
		]);

		return {
			chain: chain.toString(),
			nodeName: nodeName.toString(),
			nodeVersion: nodeVersion.toString(),
			runtimeVersion: api.runtimeVersion.specVersion.toNumber(),
			ss58Prefix: api.registry.chainSS58 || this.networkConfig.ss58Prefix,
		};
	}

	/**
	 * Get account info
	 */
	async getAccountInfo(address: string): Promise<{
		nonce: number;
		free: string;
		reserved: string;
		frozen: string;
	}> {
		// Validate address
		const validation = validateAddress(address, this.config.network);
		if (!validation.isValid) {
			throw new Error(`Invalid address: ${validation.error}`);
		}

		const api = await this.getApi();
		const account = await api.query.system.account(address);
		const data = account.toJSON() as {
			nonce: number;
			data: { free: string; reserved: string; frozen: string };
		};

		return {
			nonce: data.nonce,
			free: data.data.free,
			reserved: data.data.reserved,
			frozen: data.data.frozen || '0',
		};
	}

	/**
	 * Submit a transaction
	 */
	async submitTransaction(
		pallet: string,
		method: string,
		args: unknown[],
		options?: TransactionOptions,
	): Promise<TransactionResult> {
		if (!this.keyring || this.keyring.getPairs().length === 0) {
			throw new Error('No signing key available');
		}

		const api = await this.getApi();
		const tx = api.tx[pallet]?.[method];

		if (!tx) {
			throw new Error(`Transaction method not found: ${pallet}.${method}`);
		}

		const signer = this.keyring.getPairs()[0];
		const extrinsic: SubmittableExtrinsic<'promise'> = tx(...args);

		// Sign and send
		const unsub = await new Promise<() => void>((resolve, reject) => {
			let txHash: string;

			extrinsic
				.signAndSend(signer, { tip: options?.tip, nonce: options?.nonce }, (result: ISubmittableResult) => {
					txHash = result.txHash.toHex();

					if (result.status.isInBlock || result.status.isFinalized) {
						const events: TransactionEvent[] = result.events.map((e) => ({
							section: e.event.section,
							method: e.event.method,
							data: e.event.data.toJSON() as unknown[],
						}));

						// Check for errors
						const failedEvent = result.events.find(
							(e) => e.event.section === 'system' && e.event.method === 'ExtrinsicFailed',
						);

						if (failedEvent) {
							const error = failedEvent.event.data[0];
							reject(
								new Error(
									`Transaction failed: ${error?.toString() || 'Unknown error'}`,
								),
							);
							return;
						}

						resolve(() => {});
					}
				})
				.catch(reject);
		});

		// Clean up subscription
		if (unsub) unsub();

		// Get final result
		const txHash = extrinsic.hash.toHex();

		return {
			success: true,
			hash: txHash,
			events: [],
		};
	}

	/**
	 * Batch multiple transactions
	 */
	async submitBatch(
		transactions: Array<{ pallet: string; method: string; args: unknown[] }>,
		options?: TransactionOptions,
	): Promise<TransactionResult> {
		if (!this.keyring || this.keyring.getPairs().length === 0) {
			throw new Error('No signing key available');
		}

		const api = await this.getApi();
		const calls = transactions.map(({ pallet, method, args }) => {
			const tx = api.tx[pallet]?.[method];
			if (!tx) {
				throw new Error(`Transaction method not found: ${pallet}.${method}`);
			}
			return tx(...args);
		});

		const batch = api.tx.utility.batch(calls);

		return this.submitExtrinsic(batch, options);
	}

	/**
	 * Submit a pre-built extrinsic
	 */
	private async submitExtrinsic(
		extrinsic: SubmittableExtrinsic<'promise'>,
		options?: TransactionOptions,
	): Promise<TransactionResult> {
		if (!this.keyring || this.keyring.getPairs().length === 0) {
			throw new Error('No signing key available');
		}

		const signer = this.keyring.getPairs()[0];

		return new Promise((resolve, reject) => {
			const events: TransactionEvent[] = [];
			let blockHash: string | undefined;
			let blockNumber: number | undefined;

			extrinsic
				.signAndSend(signer, { tip: options?.tip, nonce: options?.nonce }, (result: ISubmittableResult) => {
					if (result.status.isInBlock) {
						blockHash = result.status.asInBlock.toHex();
					}

					if (result.status.isFinalized) {
						blockHash = result.status.asFinalized.toHex();

						result.events.forEach((e) => {
							events.push({
								section: e.event.section,
								method: e.event.method,
								data: e.event.data.toJSON() as unknown[],
							});
						});

						// Check for failure
						const failed = result.events.find(
							(e) => e.event.section === 'system' && e.event.method === 'ExtrinsicFailed',
						);

						if (failed) {
							resolve({
								success: false,
								hash: result.txHash.toHex(),
								blockHash,
								events,
								error: 'Transaction failed',
							});
						} else {
							resolve({
								success: true,
								hash: result.txHash.toHex(),
								blockHash,
								blockNumber,
								events,
							});
						}
					}
				})
				.catch((error) => {
					reject(new Error(`Transaction submission failed: ${error.message}`));
				});
		});
	}

	/**
	 * Subscribe to storage changes
	 */
	async subscribeStorage(
		pallet: string,
		method: string,
		args: unknown[],
		callback: (value: unknown) => void,
	): Promise<() => void> {
		const api = await this.getApi();
		const query = api.query[pallet]?.[method];

		if (!query) {
			throw new Error(`Storage query not found: ${pallet}.${method}`);
		}

		const unsubscribe = await query(...args, (value: unknown) => {
			callback(value);
		});

		return unsubscribe as unknown as () => void;
	}

	/**
	 * Get current block number
	 */
	async getCurrentBlockNumber(): Promise<number> {
		const api = await this.getApi();
		const header = await api.rpc.chain.getHeader();
		return header.number.toNumber();
	}

	/**
	 * Get block hash by number
	 */
	async getBlockHash(blockNumber: number): Promise<string> {
		const api = await this.getApi();
		const hash = await api.rpc.chain.getBlockHash(blockNumber);
		return hash.toHex();
	}

	/**
	 * Check if connected
	 */
	isConnected(): boolean {
		return this.connected && this.api !== null;
	}
}

/**
 * Create a Substrate client from n8n credentials
 */
export function createClientFromCredentials(credentials: Record<string, unknown>): SubstrateClient {
	const config: SubstrateClientConfig = {
		network: credentials.network as string,
		wsEndpoint: credentials.wsEndpoint as string | undefined,
		httpEndpoint: credentials.httpEndpoint as string | undefined,
		timeout: (credentials.timeout as number) || 30000,
	};

	if (credentials.authType === 'seedPhrase' && credentials.seedPhrase) {
		config.seedPhrase = credentials.seedPhrase as string;
		config.derivationPath = credentials.derivationPath as string | undefined;
	} else if (credentials.authType === 'privateKey' && credentials.privateKey) {
		config.privateKey = credentials.privateKey as string;
	}

	if (credentials.keyType) {
		config.keyType = credentials.keyType as KeypairType;
	}

	return new SubstrateClient(config);
}
