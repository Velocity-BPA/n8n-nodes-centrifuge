import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * IPFS Storage Credentials
 *
 * Provides authentication for IPFS/Pinata services used for
 * document storage in Centrifuge's document anchoring system.
 *
 * Centrifuge uses IPFS for storing:
 * - Asset metadata
 * - Document files
 * - NFT metadata
 * - Pool configuration documents
 *
 * The document hash (CID) is then anchored on-chain for verification.
 */
export class IpfsStorage implements ICredentialType {
	name = 'ipfsStorage';
	displayName = 'IPFS/Pinata Storage';
	documentationUrl = 'https://docs.pinata.cloud/';
	// icon = 'file:ipfs.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Storage Provider',
			name: 'provider',
			type: 'options',
			default: 'pinata',
			options: [
				{
					name: 'Pinata',
					value: 'pinata',
					description: 'Pinata IPFS pinning service',
				},
				{
					name: 'Infura IPFS',
					value: 'infura',
					description: 'Infura IPFS gateway',
				},
				{
					name: 'Web3.Storage',
					value: 'web3storage',
					description: 'Web3.Storage by Protocol Labs',
				},
				{
					name: 'Custom IPFS Node',
					value: 'custom',
					description: 'Self-hosted or custom IPFS node',
				},
			],
			description: 'IPFS storage/pinning provider',
		},
		{
			displayName: 'Pinata API Key',
			name: 'pinataApiKey',
			type: 'string',
			default: '',
			description: 'Pinata API Key for authentication',
			displayOptions: {
				show: {
					provider: ['pinata'],
				},
			},
		},
		{
			displayName: 'Pinata Secret Key',
			name: 'pinataSecretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Pinata Secret API Key',
			displayOptions: {
				show: {
					provider: ['pinata'],
				},
			},
		},
		{
			displayName: 'Pinata JWT',
			name: 'pinataJwt',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional: Pinata JWT token (alternative to API Key + Secret)',
			displayOptions: {
				show: {
					provider: ['pinata'],
				},
			},
		},
		{
			displayName: 'Infura Project ID',
			name: 'infuraProjectId',
			type: 'string',
			default: '',
			description: 'Infura IPFS Project ID',
			displayOptions: {
				show: {
					provider: ['infura'],
				},
			},
		},
		{
			displayName: 'Infura Project Secret',
			name: 'infuraProjectSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Infura IPFS Project Secret',
			displayOptions: {
				show: {
					provider: ['infura'],
				},
			},
		},
		{
			displayName: 'Web3.Storage API Token',
			name: 'web3StorageToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Web3.Storage API token',
			displayOptions: {
				show: {
					provider: ['web3storage'],
				},
			},
		},
		{
			displayName: 'IPFS API URL',
			name: 'ipfsApiUrl',
			type: 'string',
			default: '',
			placeholder: 'http://localhost:5001/api/v0',
			description: 'URL for custom IPFS node API',
			displayOptions: {
				show: {
					provider: ['custom'],
				},
			},
		},
		{
			displayName: 'IPFS Gateway URL',
			name: 'ipfsGatewayUrl',
			type: 'string',
			default: 'https://gateway.pinata.cloud/ipfs/',
			placeholder: 'https://ipfs.io/ipfs/',
			description: 'IPFS gateway URL for retrieving content',
		},
		{
			displayName: 'Custom Gateway Auth',
			name: 'gatewayAuth',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional authentication for dedicated gateways',
		},
		{
			displayName: 'Pin Content',
			name: 'pinContent',
			type: 'boolean',
			default: true,
			description: 'Whether to pin uploaded content (keeps it available)',
		},
		{
			displayName: 'CIDv1 Format',
			name: 'useCidV1',
			type: 'boolean',
			default: true,
			description: 'Whether to use CIDv1 format (recommended) vs legacy CIDv0',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'pinata_api_key': '={{$credentials.pinataApiKey}}',
				'pinata_secret_api_key': '={{$credentials.pinataSecretKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.pinata.cloud',
			url: '/data/testAuthentication',
			method: 'GET',
			headers: {
				'pinata_api_key': '={{$credentials.pinataApiKey}}',
				'pinata_secret_api_key': '={{$credentials.pinataSecretKey}}',
			},
		},
	};
}
