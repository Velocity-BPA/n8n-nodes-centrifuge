/**
 * Transport Layer Exports
 * 
 * Provides unified access to all transport clients for
 * Centrifuge blockchain and off-chain service communication.
 */

// Substrate/Polkadot blockchain client
export * from './substrateClient';
export { SubstrateClient, createClientFromCredentials as createSubstrateClient } from './substrateClient';

// Centrifuge off-chain API client
export * from './centrifugeApi';
export { CentrifugeApiClient, createApiClientFromCredentials as createCentrifugeApiClient } from './centrifugeApi';

// IPFS document storage client
export * from './ipfsClient';
export { IpfsClient, createIpfsClientFromCredentials as createIpfsClient } from './ipfsClient';

// Real-time event subscription client
export * from './subscriptionClient';
export { 
	SubscriptionClient, 
	createSubscriptionClientFromCredentials as createSubscriptionClient,
	waitForEvent,
} from './subscriptionClient';
