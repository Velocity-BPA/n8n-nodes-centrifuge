import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Centrifuge Network Credentials
 *
 * Provides authentication for the Centrifuge blockchain network.
 * Centrifuge is built on Substrate/Polkadot and uses SS58 address encoding.
 *
 * Supported networks:
 * - Centrifuge Mainnet (Polkadot Parachain)
 * - Centrifuge Testnet (Rococo)
 * - Development (local node)
 * - Custom endpoint
 *
 * Security Note: Seed phrases and private keys are stored encrypted by n8n.
 * Never expose these credentials in logs or error messages.
 */
export class CentrifugeNetwork implements ICredentialType {
	name = 'centrifugeNetwork';
	displayName = 'Centrifuge Network';
	documentationUrl = 'https://docs.centrifuge.io/';
	// icon = 'file:centrifuge.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'mainnet',
			options: [
				{
					name: 'Centrifuge Mainnet',
					value: 'mainnet',
					description: 'Production network on Polkadot parachain',
				},
				{
					name: 'Centrifuge Testnet (Rococo)',
					value: 'testnet',
					description: 'Test network on Rococo parachain',
				},
				{
					name: 'Development',
					value: 'development',
					description: 'Local development node',
				},
				{
					name: 'Custom',
					value: 'custom',
					description: 'Custom endpoint configuration',
				},
			],
			description: 'The Centrifuge network to connect to',
		},
		{
			displayName: 'WebSocket Endpoint',
			name: 'wsEndpoint',
			type: 'string',
			default: '',
			placeholder: 'wss://fullnode.centrifuge.io',
			description: 'WebSocket endpoint URL for the Substrate node',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'HTTP Endpoint',
			name: 'httpEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://fullnode.centrifuge.io',
			description: 'Optional HTTP endpoint for RPC calls (some operations work better with HTTP)',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Authentication Type',
			name: 'authType',
			type: 'options',
			default: 'seedPhrase',
			options: [
				{
					name: 'Seed Phrase (Mnemonic)',
					value: 'seedPhrase',
					description: '12 or 24 word recovery phrase',
				},
				{
					name: 'Private Key',
					value: 'privateKey',
					description: 'Raw private key (hex encoded)',
				},
				{
					name: 'Read Only',
					value: 'readOnly',
					description: 'No signing capability - for queries only',
				},
			],
			description: 'How to authenticate for signing transactions',
		},
		{
			displayName: 'Seed Phrase',
			name: 'seedPhrase',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Enter your 12 or 24 word seed phrase',
			description: 'BIP39 mnemonic seed phrase. NEVER share this with anyone.',
			displayOptions: {
				show: {
					authType: ['seedPhrase'],
				},
			},
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: '0x...',
			description: 'Hex-encoded private key (with or without 0x prefix)',
			displayOptions: {
				show: {
					authType: ['privateKey'],
				},
			},
		},
		{
			displayName: 'Key Type',
			name: 'keyType',
			type: 'options',
			default: 'sr25519',
			options: [
				{
					name: 'SR25519 (Schnorrkel)',
					value: 'sr25519',
					description: 'Recommended for most use cases - Substrate default',
				},
				{
					name: 'ED25519',
					value: 'ed25519',
					description: 'Edwards curve - compatible with hardware wallets',
				},
			],
			description: 'Cryptographic key type for signing',
			displayOptions: {
				hide: {
					authType: ['readOnly'],
				},
			},
		},
		{
			displayName: 'Derivation Path',
			name: 'derivationPath',
			type: 'string',
			default: '',
			placeholder: '//hard/soft',
			description: 'Optional derivation path for hierarchical deterministic keys',
			displayOptions: {
				show: {
					authType: ['seedPhrase'],
				},
			},
		},
		{
			displayName: 'Use Proxy Account',
			name: 'useProxy',
			type: 'boolean',
			default: false,
			description: 'Whether to use a proxy account for transactions',
			displayOptions: {
				hide: {
					authType: ['readOnly'],
				},
			},
		},
		{
			displayName: 'Proxy Account Address',
			name: 'proxyAddress',
			type: 'string',
			default: '',
			placeholder: '4...',
			description: 'SS58 address of the account to proxy for',
			displayOptions: {
				show: {
					useProxy: [true],
				},
			},
		},
		{
			displayName: 'Proxy Type',
			name: 'proxyType',
			type: 'options',
			default: 'Any',
			options: [
				{
					name: 'Any',
					value: 'Any',
					description: 'Full access proxy',
				},
				{
					name: 'NonTransfer',
					value: 'NonTransfer',
					description: 'All except balance transfers',
				},
				{
					name: 'Governance',
					value: 'Governance',
					description: 'Only governance operations',
				},
				{
					name: 'Staking',
					value: 'Staking',
					description: 'Only staking operations',
				},
				{
					name: 'Transfer',
					value: 'Transfer',
					description: 'Only balance transfers',
				},
				{
					name: 'Borrow',
					value: 'Borrow',
					description: 'Only loan borrowing operations',
				},
				{
					name: 'Invest',
					value: 'Invest',
					description: 'Only investment operations',
				},
				{
					name: 'PoolAdmin',
					value: 'PoolAdmin',
					description: 'Pool administration operations',
				},
			],
			description: 'Type of proxy permissions',
			displayOptions: {
				show: {
					useProxy: [true],
				},
			},
		},
		{
			displayName: 'Connection Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
	];

	/**
	 * Note: Substrate/Polkadot APIs don't use traditional HTTP authentication.
	 * Connection testing is done at runtime when establishing WebSocket connection.
	 */
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.httpEndpoint || "https://fullnode.centrifuge.io"}}',
			url: '/health',
			method: 'GET',
			timeout: 5000,
		},
	};
}
