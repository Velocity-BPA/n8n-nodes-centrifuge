/**
 * Centrifuge Network Configurations
 *
 * Centrifuge operates as a Polkadot parachain, providing Real World Asset (RWA)
 * tokenization capabilities. The network uses the CFG native token for
 * governance, transaction fees, and staking.
 *
 * Network IDs:
 * - Polkadot Parachain ID: 2031
 * - Kusama Parachain ID (Altair): 2088
 */

export interface NetworkConfig {
	name: string;
	chainId: string;
	parachainId: number;
	wsEndpoint: string;
	httpEndpoint: string;
	explorerUrl: string;
	ss58Prefix: number;
	tokenSymbol: string;
	tokenDecimals: number;
	isTestnet: boolean;
}

/**
 * Centrifuge Mainnet Configuration
 * Production network running as Polkadot Parachain #2031
 */
export const MAINNET_CONFIG: NetworkConfig = {
	name: 'Centrifuge Mainnet',
	chainId: 'centrifuge',
	parachainId: 2031,
	wsEndpoint: 'wss://fullnode.centrifuge.io',
	httpEndpoint: 'https://fullnode.centrifuge.io',
	explorerUrl: 'https://centrifuge.subscan.io',
	ss58Prefix: 36,
	tokenSymbol: 'CFG',
	tokenDecimals: 18,
	isTestnet: false,
};

/**
 * Centrifuge Testnet (on Rococo) Configuration
 * Test network for development and testing
 */
export const TESTNET_CONFIG: NetworkConfig = {
	name: 'Centrifuge Testnet',
	chainId: 'centrifuge-testnet',
	parachainId: 2031,
	wsEndpoint: 'wss://fullnode.development.cntrfg.com',
	httpEndpoint: 'https://fullnode.development.cntrfg.com',
	explorerUrl: 'https://rococo.subscan.io/parachain/2031',
	ss58Prefix: 36,
	tokenDecimals: 18,
	tokenSymbol: 'DCFG',
	isTestnet: true,
};

/**
 * Development (Local) Configuration
 * For local development nodes
 */
export const DEVELOPMENT_CONFIG: NetworkConfig = {
	name: 'Development',
	chainId: 'development',
	parachainId: 0,
	wsEndpoint: 'ws://127.0.0.1:9944',
	httpEndpoint: 'http://127.0.0.1:9933',
	explorerUrl: '',
	ss58Prefix: 42,
	tokenSymbol: 'UNIT',
	tokenDecimals: 18,
	isTestnet: true,
};

/**
 * Altair Network Configuration (Kusama Parachain)
 * Centrifuge's canary network on Kusama
 */
export const ALTAIR_CONFIG: NetworkConfig = {
	name: 'Altair',
	chainId: 'altair',
	parachainId: 2088,
	wsEndpoint: 'wss://fullnode.altair.centrifuge.io',
	httpEndpoint: 'https://fullnode.altair.centrifuge.io',
	explorerUrl: 'https://altair.subscan.io',
	ss58Prefix: 136,
	tokenSymbol: 'AIR',
	tokenDecimals: 18,
	isTestnet: false,
};

/**
 * Get network configuration by network identifier
 */
export function getNetworkConfig(network: string): NetworkConfig {
	switch (network) {
		case 'mainnet':
			return MAINNET_CONFIG;
		case 'testnet':
			return TESTNET_CONFIG;
		case 'development':
			return DEVELOPMENT_CONFIG;
		case 'altair':
			return ALTAIR_CONFIG;
		default:
			return MAINNET_CONFIG;
	}
}

/**
 * Available network options for dropdowns
 */
export const NETWORK_OPTIONS = [
	{
		name: 'Centrifuge Mainnet',
		value: 'mainnet',
		description: 'Production Polkadot parachain',
	},
	{
		name: 'Centrifuge Testnet',
		value: 'testnet',
		description: 'Rococo testnet',
	},
	{
		name: 'Altair (Kusama)',
		value: 'altair',
		description: 'Kusama canary network',
	},
	{
		name: 'Development',
		value: 'development',
		description: 'Local development node',
	},
];

/**
 * WebSocket connection options
 */
export const WS_OPTIONS = {
	reconnect: true,
	reconnectDelay: 1000,
	maxReconnectAttempts: 10,
	timeout: 30000,
};

/**
 * API endpoints for off-chain services
 */
export const API_ENDPOINTS = {
	production: 'https://app.centrifuge.io/api',
	staging: 'https://staging.centrifuge.io/api',
	subquery: 'https://api.subquery.network/sq/centrifuge/centrifuge',
	pinata: 'https://api.pinata.cloud',
	pinataGateway: 'https://gateway.pinata.cloud/ipfs/',
};

/**
 * Block time in milliseconds (Centrifuge targets 12 second blocks)
 */
export const BLOCK_TIME_MS = 12000;

/**
 * Finality depth (number of blocks for practical finality)
 */
export const FINALITY_DEPTH = 2;

/**
 * Networks lookup object for quick access
 */
export const NETWORKS: Record<string, NetworkConfig> = {
	mainnet: MAINNET_CONFIG,
	testnet: TESTNET_CONFIG,
	development: DEVELOPMENT_CONFIG,
	altair: ALTAIR_CONFIG,
};
