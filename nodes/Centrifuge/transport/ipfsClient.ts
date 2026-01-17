/**
 * IPFS Client for Centrifuge Document Storage
 * 
 * Handles document upload, retrieval, and pinning operations
 * for Real World Asset (RWA) documentation in Centrifuge.
 * 
 * Supports multiple IPFS providers:
 * - Pinata (primary production provider)
 * - Infura IPFS
 * - Web3.Storage
 * - Custom IPFS nodes
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { createHash } from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface IpfsCredentials {
	provider: 'pinata' | 'infura' | 'web3storage' | 'custom';
	gatewayUrl: string;
	apiKey?: string;
	apiSecret?: string;
	projectId?: string;
	projectSecret?: string;
	web3StorageToken?: string;
	customApiUrl?: string;
	customHeaders?: Record<string, string>;
}

export interface IpfsUploadResult {
	cid: string;
	size: number;
	name?: string;
	timestamp: Date;
	pinned: boolean;
}

export interface IpfsFile {
	cid: string;
	name?: string;
	size: number;
	type: string;
	created?: Date;
	pinned: boolean;
}

export interface IpfsPin {
	cid: string;
	name?: string;
	status: 'pinned' | 'pinning' | 'queued' | 'failed';
	created: Date;
	size?: number;
	metadata?: Record<string, string>;
}

export interface IpfsContent {
	data: Buffer | string;
	contentType: string;
	size: number;
}

export interface PinataMetadata {
	name?: string;
	keyvalues?: Record<string, string | number | boolean>;
}

export interface PinataOptions {
	cidVersion?: 0 | 1;
	wrapWithDirectory?: boolean;
	pinataMetadata?: PinataMetadata;
}

export interface IpfsPinListOptions {
	status?: 'pinned' | 'pinning' | 'all';
	pageLimit?: number;
	pageOffset?: number;
	nameContains?: string;
	cidContains?: string;
	metadata?: Record<string, string>;
}

// ============================================================================
// IPFS Client Class
// ============================================================================

export class IpfsClient {
	private credentials: IpfsCredentials;
	private httpClient: AxiosInstance;

	constructor(credentials: IpfsCredentials) {
		this.credentials = credentials;
		this.httpClient = this.createHttpClient();
	}

	/**
	 * Create HTTP client based on provider type
	 */
	private createHttpClient(): AxiosInstance {
		const { provider, apiKey, apiSecret, projectId, projectSecret, web3StorageToken, customApiUrl, customHeaders } = this.credentials;

		let baseURL: string;
		let headers: Record<string, string> = {};

		switch (provider) {
			case 'pinata':
				baseURL = 'https://api.pinata.cloud';
				if (apiKey && apiSecret) {
					headers['pinata_api_key'] = apiKey;
					headers['pinata_secret_api_key'] = apiSecret;
				}
				break;

			case 'infura':
				baseURL = 'https://ipfs.infura.io:5001/api/v0';
				if (projectId && projectSecret) {
					const auth = Buffer.from(`${projectId}:${projectSecret}`).toString('base64');
					headers['Authorization'] = `Basic ${auth}`;
				}
				break;

			case 'web3storage':
				baseURL = 'https://api.web3.storage';
				if (web3StorageToken) {
					headers['Authorization'] = `Bearer ${web3StorageToken}`;
				}
				break;

			case 'custom':
				baseURL = customApiUrl || 'http://localhost:5001/api/v0';
				if (customHeaders) {
					headers = { ...headers, ...customHeaders };
				}
				break;

			default:
				throw new Error(`Unsupported IPFS provider: ${provider}`);
		}

		return axios.create({
			baseURL,
			headers,
			timeout: 120000, // 2 minute timeout for large files
		});
	}

	// ==========================================================================
	// Upload Operations
	// ==========================================================================

	/**
	 * Upload content to IPFS
	 */
	async upload(
		content: Buffer | string,
		options?: {
			name?: string;
			contentType?: string;
			pin?: boolean;
			metadata?: Record<string, string>;
		}
	): Promise<IpfsUploadResult> {
		const { provider } = this.credentials;
		const { name, contentType = 'application/octet-stream', pin = true, metadata } = options || {};

		const data = typeof content === 'string' ? Buffer.from(content) : content;

		switch (provider) {
			case 'pinata':
				return this.uploadToPinata(data, { name, contentType, pin, metadata });
			case 'infura':
				return this.uploadToInfura(data, { name, pin });
			case 'web3storage':
				return this.uploadToWeb3Storage(data, { name });
			case 'custom':
				return this.uploadToCustomNode(data, { name, pin });
			default:
				throw new Error(`Upload not supported for provider: ${provider}`);
		}
	}

	/**
	 * Upload JSON data to IPFS
	 */
	async uploadJson(
		data: Record<string, unknown>,
		options?: {
			name?: string;
			pin?: boolean;
			metadata?: Record<string, string>;
		}
	): Promise<IpfsUploadResult> {
		const jsonString = JSON.stringify(data, null, 2);
		return this.upload(jsonString, {
			...options,
			contentType: 'application/json',
		});
	}

	/**
	 * Upload to Pinata
	 */
	private async uploadToPinata(
		data: Buffer,
		options: {
			name?: string;
			contentType?: string;
			pin?: boolean;
			metadata?: Record<string, string>;
		}
	): Promise<IpfsUploadResult> {
		const FormData = (await import('form-data')).default;
		const formData = new FormData();
		formData.append('file', data, {
			filename: options.name || 'file',
			contentType: options.contentType,
		});

		// Add pinata options
		const pinataOptions: PinataOptions = {
			cidVersion: 1,
			pinataMetadata: {
				name: options.name,
				keyvalues: options.metadata,
			},
		};
		formData.append('pinataOptions', JSON.stringify(pinataOptions));
		formData.append('pinataMetadata', JSON.stringify(pinataOptions.pinataMetadata));

		const response = await this.httpClient.post('/pinning/pinFileToIPFS', formData, {
			headers: formData.getHeaders(),
			maxBodyLength: Infinity,
		});

		return {
			cid: response.data.IpfsHash,
			size: response.data.PinSize,
			name: options.name,
			timestamp: new Date(response.data.Timestamp),
			pinned: true,
		};
	}

	/**
	 * Upload to Infura IPFS
	 */
	private async uploadToInfura(
		data: Buffer,
		options: { name?: string; pin?: boolean }
	): Promise<IpfsUploadResult> {
		const FormData = (await import('form-data')).default;
		const formData = new FormData();
		formData.append('file', data, { filename: options.name || 'file' });

		const response = await this.httpClient.post('/add', formData, {
			headers: formData.getHeaders(),
			params: { pin: options.pin !== false },
		});

		return {
			cid: response.data.Hash,
			size: parseInt(response.data.Size, 10),
			name: response.data.Name,
			timestamp: new Date(),
			pinned: options.pin !== false,
		};
	}

	/**
	 * Upload to Web3.Storage
	 */
	private async uploadToWeb3Storage(
		data: Buffer,
		options: { name?: string }
	): Promise<IpfsUploadResult> {
		const response = await this.httpClient.post('/upload', data, {
			headers: {
				'Content-Type': 'application/octet-stream',
				'X-Name': options.name || 'file',
			},
		});

		return {
			cid: response.data.cid,
			size: data.length,
			name: options.name,
			timestamp: new Date(),
			pinned: true, // Web3.Storage always pins
		};
	}

	/**
	 * Upload to custom IPFS node
	 */
	private async uploadToCustomNode(
		data: Buffer,
		options: { name?: string; pin?: boolean }
	): Promise<IpfsUploadResult> {
		const FormData = (await import('form-data')).default;
		const formData = new FormData();
		formData.append('file', data, { filename: options.name || 'file' });

		const response = await this.httpClient.post('/add', formData, {
			headers: formData.getHeaders(),
			params: { pin: options.pin !== false },
		});

		return {
			cid: response.data.Hash,
			size: parseInt(response.data.Size, 10),
			name: response.data.Name,
			timestamp: new Date(),
			pinned: options.pin !== false,
		};
	}

	// ==========================================================================
	// Retrieval Operations
	// ==========================================================================

	/**
	 * Get content from IPFS by CID
	 */
	async get(cid: string): Promise<IpfsContent> {
		const { gatewayUrl } = this.credentials;
		const url = `${gatewayUrl}/ipfs/${cid}`;

		const response = await axios.get(url, {
			responseType: 'arraybuffer',
			timeout: 60000,
		});

		return {
			data: Buffer.from(response.data),
			contentType: response.headers['content-type'] || 'application/octet-stream',
			size: parseInt(response.headers['content-length'] || '0', 10),
		};
	}

	/**
	 * Get JSON content from IPFS
	 */
	async getJson<T = unknown>(cid: string): Promise<T> {
		const content = await this.get(cid);
		const jsonString = content.data.toString('utf-8');
		return JSON.parse(jsonString) as T;
	}

	/**
	 * Check if content exists on IPFS
	 */
	async exists(cid: string): Promise<boolean> {
		try {
			const { gatewayUrl } = this.credentials;
			const url = `${gatewayUrl}/ipfs/${cid}`;
			
			const response = await axios.head(url, { timeout: 10000 });
			return response.status === 200;
		} catch {
			return false;
		}
	}

	/**
	 * Get content size without downloading
	 */
	async getSize(cid: string): Promise<number | null> {
		try {
			const { gatewayUrl } = this.credentials;
			const url = `${gatewayUrl}/ipfs/${cid}`;
			
			const response = await axios.head(url, { timeout: 10000 });
			const contentLength = response.headers['content-length'];
			return contentLength ? parseInt(contentLength, 10) : null;
		} catch {
			return null;
		}
	}

	// ==========================================================================
	// Pinning Operations
	// ==========================================================================

	/**
	 * Pin content by CID
	 */
	async pin(cid: string, name?: string, metadata?: Record<string, string>): Promise<IpfsPin> {
		const { provider } = this.credentials;

		switch (provider) {
			case 'pinata':
				return this.pinWithPinata(cid, name, metadata);
			case 'infura':
				return this.pinWithInfura(cid);
			case 'custom':
				return this.pinWithCustomNode(cid);
			default:
				throw new Error(`Pinning not supported for provider: ${provider}`);
		}
	}

	/**
	 * Pin with Pinata
	 */
	private async pinWithPinata(
		cid: string,
		name?: string,
		metadata?: Record<string, string>
	): Promise<IpfsPin> {
		const response = await this.httpClient.post('/pinning/pinByHash', {
			hashToPin: cid,
			pinataMetadata: {
				name,
				keyvalues: metadata,
			},
		});

		return {
			cid,
			name,
			status: 'pinned',
			created: new Date(),
			metadata,
		};
	}

	/**
	 * Pin with Infura
	 */
	private async pinWithInfura(cid: string): Promise<IpfsPin> {
		await this.httpClient.post('/pin/add', null, {
			params: { arg: cid },
		});

		return {
			cid,
			status: 'pinned',
			created: new Date(),
		};
	}

	/**
	 * Pin with custom node
	 */
	private async pinWithCustomNode(cid: string): Promise<IpfsPin> {
		await this.httpClient.post('/pin/add', null, {
			params: { arg: cid },
		});

		return {
			cid,
			status: 'pinned',
			created: new Date(),
		};
	}

	/**
	 * Unpin content by CID
	 */
	async unpin(cid: string): Promise<boolean> {
		const { provider } = this.credentials;

		try {
			switch (provider) {
				case 'pinata':
					await this.httpClient.delete(`/pinning/unpin/${cid}`);
					break;
				case 'infura':
				case 'custom':
					await this.httpClient.post('/pin/rm', null, {
						params: { arg: cid },
					});
					break;
				default:
					throw new Error(`Unpinning not supported for provider: ${provider}`);
			}
			return true;
		} catch (error) {
			if (error instanceof AxiosError && error.response?.status === 404) {
				return false; // Content was not pinned
			}
			throw error;
		}
	}

	/**
	 * List pinned content
	 */
	async listPins(options?: IpfsPinListOptions): Promise<IpfsPin[]> {
		const { provider } = this.credentials;

		switch (provider) {
			case 'pinata':
				return this.listPinsPinata(options);
			case 'infura':
			case 'custom':
				return this.listPinsNode();
			default:
				throw new Error(`Pin listing not supported for provider: ${provider}`);
		}
	}

	/**
	 * List pins from Pinata
	 */
	private async listPinsPinata(options?: IpfsPinListOptions): Promise<IpfsPin[]> {
		const params: Record<string, unknown> = {};

		if (options?.status) {
			params.status = options.status;
		}
		if (options?.pageLimit) {
			params.pageLimit = options.pageLimit;
		}
		if (options?.pageOffset) {
			params.pageOffset = options.pageOffset;
		}
		if (options?.nameContains) {
			params['metadata[name]'] = options.nameContains;
		}

		const response = await this.httpClient.get('/data/pinList', { params });

		return response.data.rows.map((row: any) => ({
			cid: row.ipfs_pin_hash,
			name: row.metadata?.name,
			status: 'pinned' as const,
			created: new Date(row.date_pinned),
			size: row.size,
			metadata: row.metadata?.keyvalues,
		}));
	}

	/**
	 * List pins from IPFS node
	 */
	private async listPinsNode(): Promise<IpfsPin[]> {
		const response = await this.httpClient.post('/pin/ls', null, {
			params: { type: 'recursive' },
		});

		const keys = response.data.Keys || {};
		return Object.entries(keys).map(([cid, info]: [string, any]) => ({
			cid,
			status: 'pinned' as const,
			created: new Date(),
		}));
	}

	/**
	 * Get pin status for a CID
	 */
	async getPinStatus(cid: string): Promise<IpfsPin | null> {
		const { provider } = this.credentials;

		try {
			switch (provider) {
				case 'pinata': {
					const response = await this.httpClient.get('/data/pinList', {
						params: { hashContains: cid, pageLimit: 1 },
					});
					const pins = response.data.rows;
					if (pins.length === 0) return null;
					return {
						cid: pins[0].ipfs_pin_hash,
						name: pins[0].metadata?.name,
						status: 'pinned',
						created: new Date(pins[0].date_pinned),
						size: pins[0].size,
						metadata: pins[0].metadata?.keyvalues,
					};
				}
				case 'infura':
				case 'custom': {
					const response = await this.httpClient.post('/pin/ls', null, {
						params: { arg: cid },
					});
					return {
						cid,
						status: 'pinned',
						created: new Date(),
					};
				}
				default:
					return null;
			}
		} catch {
			return null;
		}
	}

	// ==========================================================================
	// Document Operations for Centrifuge
	// ==========================================================================

	/**
	 * Upload a document and return CID and hash for anchoring
	 */
	async uploadDocument(
		document: Buffer | string,
		options: {
			name: string;
			documentType: 'invoice' | 'purchase_order' | 'loan_agreement' | 'asset_document' | 'kyc' | 'generic';
			poolId?: string;
			assetId?: string;
			metadata?: Record<string, string>;
		}
	): Promise<{
		cid: string;
		hash: string;
		size: number;
		uploadTimestamp: Date;
	}> {
		const data = typeof document === 'string' ? Buffer.from(document) : document;
		
		// Calculate document hash (Blake2-256 compatible format)
		const hash = this.calculateDocumentHash(data);

		// Prepare metadata for Centrifuge
		const centrifugeMetadata: Record<string, string> = {
			documentType: options.documentType,
			...(options.poolId && { poolId: options.poolId }),
			...(options.assetId && { assetId: options.assetId }),
			...options.metadata,
		};

		const result = await this.upload(data, {
			name: options.name,
			pin: true,
			metadata: centrifugeMetadata,
		});

		return {
			cid: result.cid,
			hash,
			size: result.size,
			uploadTimestamp: result.timestamp,
		};
	}

	/**
	 * Upload document metadata as JSON
	 */
	async uploadDocumentMetadata(metadata: {
		name: string;
		description?: string;
		documentType: string;
		documentCid: string;
		documentHash: string;
		createdAt: Date;
		attributes?: Record<string, unknown>;
	}): Promise<IpfsUploadResult> {
		return this.uploadJson(metadata, {
			name: `${metadata.name}-metadata.json`,
			pin: true,
		});
	}

	/**
	 * Calculate document hash compatible with Centrifuge anchoring
	 */
	calculateDocumentHash(data: Buffer): string {
		// Use SHA-256 for compatibility
		const hash = createHash('sha256').update(data).digest();
		return '0x' + hash.toString('hex');
	}

	/**
	 * Generate anchor ID from document hash
	 */
	generateAnchorId(documentHash: string): string {
		// The anchor ID is typically the first 32 bytes of the hash
		const cleanHash = documentHash.startsWith('0x') ? documentHash.slice(2) : documentHash;
		return '0x' + cleanHash.slice(0, 64).padEnd(64, '0');
	}

	/**
	 * Verify document hash matches content
	 */
	async verifyDocument(cid: string, expectedHash: string): Promise<{
		valid: boolean;
		actualHash: string;
		message: string;
	}> {
		try {
			const content = await this.get(cid);
			const actualHash = this.calculateDocumentHash(content.data as Buffer);
			
			const valid = actualHash.toLowerCase() === expectedHash.toLowerCase();
			
			return {
				valid,
				actualHash,
				message: valid 
					? 'Document hash matches expected hash' 
					: 'Document hash does not match expected hash',
			};
		} catch (error) {
			return {
				valid: false,
				actualHash: '',
				message: `Failed to retrieve document: ${error instanceof Error ? error.message : 'Unknown error'}`,
			};
		}
	}

	// ==========================================================================
	// Utility Methods
	// ==========================================================================

	/**
	 * Convert CID v0 to v1 format
	 */
	cidV0toV1(cidV0: string): string {
		// Basic validation - CIDv0 starts with 'Qm'
		if (!cidV0.startsWith('Qm')) {
			return cidV0; // Already v1 or invalid
		}
		// Note: Full conversion requires the multiformats library
		// For now, return as-is with a note
		console.warn('CID v0 to v1 conversion requires multiformats library');
		return cidV0;
	}

	/**
	 * Validate CID format
	 */
	isValidCid(cid: string): boolean {
		// CIDv0 starts with 'Qm' and is 46 characters
		if (cid.startsWith('Qm') && cid.length === 46) {
			return true;
		}
		// CIDv1 starts with 'b' (base32) or 'z' (base58) or 'f' (base16)
		if (/^[bzf][a-zA-Z0-9]+$/.test(cid)) {
			return true;
		}
		return false;
	}

	/**
	 * Generate gateway URL for CID
	 */
	getGatewayUrl(cid: string): string {
		const { gatewayUrl } = this.credentials;
		return `${gatewayUrl}/ipfs/${cid}`;
	}

	/**
	 * Get provider info
	 */
	getProviderInfo(): {
		provider: string;
		gatewayUrl: string;
		supportsPin: boolean;
		supportsUnpin: boolean;
	} {
		return {
			provider: this.credentials.provider,
			gatewayUrl: this.credentials.gatewayUrl,
			supportsPin: true,
			supportsUnpin: this.credentials.provider !== 'web3storage',
		};
	}

	/**
	 * Test connection to IPFS provider
	 */
	async testConnection(): Promise<{
		connected: boolean;
		provider: string;
		message: string;
	}> {
		try {
			const { provider } = this.credentials;

			switch (provider) {
				case 'pinata': {
					const response = await this.httpClient.get('/data/testAuthentication');
					return {
						connected: true,
						provider,
						message: `Connected as ${response.data.message || 'authenticated user'}`,
					};
				}
				case 'infura':
				case 'custom': {
					const response = await this.httpClient.post('/version');
					return {
						connected: true,
						provider,
						message: `IPFS version: ${response.data.Version}`,
					};
				}
				case 'web3storage': {
					const response = await this.httpClient.get('/user/uploads', {
						params: { size: 1 },
					});
					return {
						connected: true,
						provider,
						message: 'Connected to Web3.Storage',
					};
				}
				default:
					return {
						connected: false,
						provider,
						message: `Unknown provider: ${provider}`,
					};
			}
		} catch (error) {
			return {
				connected: false,
				provider: this.credentials.provider,
				message: error instanceof Error ? error.message : 'Connection failed',
			};
		}
	}
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create IPFS client from n8n credentials
 */
export function createIpfsClientFromCredentials(credentials: Record<string, unknown>): IpfsClient {
	const config: IpfsCredentials = {
		provider: credentials.provider as IpfsCredentials['provider'],
		gatewayUrl: credentials.gatewayUrl as string,
	};

	switch (credentials.provider) {
		case 'pinata':
			config.apiKey = credentials.pinataApiKey as string | undefined;
			config.apiSecret = credentials.pinataApiSecret as string | undefined;
			break;
		case 'infura':
			config.projectId = credentials.infuraProjectId as string | undefined;
			config.projectSecret = credentials.infuraProjectSecret as string | undefined;
			break;
		case 'web3storage':
			config.web3StorageToken = credentials.web3StorageToken as string | undefined;
			break;
		case 'custom':
			config.customApiUrl = credentials.customApiUrl as string | undefined;
			if (credentials.customHeaders) {
				try {
					config.customHeaders = JSON.parse(credentials.customHeaders as string);
				} catch {
					// Invalid JSON, ignore
				}
			}
			break;
	}

	return new IpfsClient(config);
}
