/**
 * Address Utilities for Centrifuge/Substrate
 *
 * Substrate uses SS58 address encoding, which includes:
 * - A network prefix (identifies the chain)
 * - The public key
 * - A checksum
 *
 * Centrifuge mainnet uses prefix 36
 * Altair uses prefix 136
 * Generic Substrate uses prefix 42
 */

import { decodeAddress, encodeAddress, isAddress, blake2AsHex } from '@polkadot/util-crypto';
import { hexToU8a, u8aToHex, isHex } from '@polkadot/util';
import { MAINNET_CONFIG, TESTNET_CONFIG, ALTAIR_CONFIG, DEVELOPMENT_CONFIG } from '../constants/networks';

/**
 * SS58 prefixes for different networks
 */
export const SS58_PREFIXES = {
	centrifuge: 36,
	altair: 136,
	generic: 42,
	polkadot: 0,
	kusama: 2,
} as const;

/**
 * Get SS58 prefix for a network
 */
export function getSS58Prefix(network: string): number {
	switch (network) {
		case 'mainnet':
			return MAINNET_CONFIG.ss58Prefix;
		case 'altair':
			return ALTAIR_CONFIG.ss58Prefix;
		case 'testnet':
			return TESTNET_CONFIG.ss58Prefix;
		case 'development':
			return DEVELOPMENT_CONFIG.ss58Prefix;
		default:
			return SS58_PREFIXES.generic;
	}
}

/**
 * Validate an SS58 address
 * @param address - The address to validate
 * @param network - Optional network to validate against specific prefix
 * @returns Object with validity and details
 */
export function validateAddress(
	address: string,
	network?: string,
): {
	isValid: boolean;
	error?: string;
	publicKey?: string;
	prefix?: number;
} {
	try {
		if (!address || typeof address !== 'string') {
			return { isValid: false, error: 'Address must be a non-empty string' };
		}

		// Basic format check
		if (!isAddress(address)) {
			return { isValid: false, error: 'Invalid SS58 address format' };
		}

		// Decode to get public key and check integrity
		const decoded = decodeAddress(address);
		const publicKey = u8aToHex(decoded);

		// If network specified, check prefix matches
		if (network) {
			const expectedPrefix = getSS58Prefix(network);
			const reEncoded = encodeAddress(decoded, expectedPrefix);

			// Try to detect the original prefix by re-encoding with different prefixes
			let detectedPrefix: number | undefined;
			for (const [, prefix] of Object.entries(SS58_PREFIXES)) {
				if (encodeAddress(decoded, prefix) === address) {
					detectedPrefix = prefix;
					break;
				}
			}

			if (detectedPrefix !== undefined && detectedPrefix !== expectedPrefix) {
				return {
					isValid: false,
					error: `Address has prefix ${detectedPrefix}, expected ${expectedPrefix} for ${network}`,
					publicKey,
					prefix: detectedPrefix,
				};
			}
		}

		return { isValid: true, publicKey };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Invalid address',
		};
	}
}

/**
 * Convert address between networks (re-encode with different prefix)
 * @param address - Source address
 * @param targetNetwork - Target network for encoding
 * @returns Converted address
 */
export function convertAddress(address: string, targetNetwork: string): string {
	const decoded = decodeAddress(address);
	const targetPrefix = getSS58Prefix(targetNetwork);
	return encodeAddress(decoded, targetPrefix);
}

/**
 * Get the public key from an address
 * @param address - SS58 encoded address
 * @returns Hex-encoded public key
 */
export function getPublicKey(address: string): string {
	const decoded = decodeAddress(address);
	return u8aToHex(decoded);
}

/**
 * Create an address from a public key
 * @param publicKey - Hex-encoded public key (with or without 0x prefix)
 * @param network - Network for SS58 prefix
 * @returns SS58 encoded address
 */
export function publicKeyToAddress(publicKey: string, network: string = 'mainnet'): string {
	const prefix = getSS58Prefix(network);
	const publicKeyBytes = isHex(publicKey) ? hexToU8a(publicKey) : hexToU8a(`0x${publicKey}`);
	return encodeAddress(publicKeyBytes, prefix);
}

/**
 * Check if two addresses are the same account (same public key)
 * Works across different network encodings
 */
export function isSameAccount(address1: string, address2: string): boolean {
	try {
		const pk1 = getPublicKey(address1);
		const pk2 = getPublicKey(address2);
		return pk1.toLowerCase() === pk2.toLowerCase();
	} catch {
		return false;
	}
}

/**
 * Format address for display (truncate middle)
 * @param address - Full address
 * @param startChars - Characters to show at start
 * @param endChars - Characters to show at end
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
	if (!address || address.length <= startChars + endChars) {
		return address;
	}
	return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Generate a deterministic account ID from pool and tranche
 * Used for derived accounts
 */
export function deriveAccountId(poolId: string, trancheId: string): string {
	const combined = `${poolId}${trancheId}`;
	return blake2AsHex(combined, 256);
}

/**
 * Check if address is a system/special account
 */
export function isSystemAccount(address: string): boolean {
	try {
		const publicKey = getPublicKey(address);
		// System accounts often have all zeros or specific patterns
		return publicKey === '0x' + '00'.repeat(32);
	} catch {
		return false;
	}
}

/**
 * Parse an account identifier (can be address or public key)
 */
export function parseAccountId(accountId: string, network: string = 'mainnet'): {
	address: string;
	publicKey: string;
} {
	// If it's a hex string, treat as public key
	if (isHex(accountId) && accountId.length === 66) {
		// 0x + 64 hex chars
		const address = publicKeyToAddress(accountId, network);
		return { address, publicKey: accountId };
	}

	// Otherwise treat as address
	const publicKey = getPublicKey(accountId);
	return { address: accountId, publicKey };
}

/**
 * Batch validate multiple addresses
 */
export function validateAddresses(addresses: string[], network?: string): {
	valid: string[];
	invalid: Array<{ address: string; error: string }>;
} {
	const valid: string[] = [];
	const invalid: Array<{ address: string; error: string }> = [];

	for (const address of addresses) {
		const result = validateAddress(address, network);
		if (result.isValid) {
			valid.push(address);
		} else {
			invalid.push({ address, error: result.error || 'Invalid address' });
		}
	}

	return { valid, invalid };
}

/**
 * Address format detection
 */
export function detectAddressFormat(address: string): {
	format: 'ss58' | 'hex' | 'unknown';
	network?: string;
} {
	// Check if it's a hex public key
	if (isHex(address) && address.length === 66) {
		return { format: 'hex' };
	}

	// Try to decode as SS58
	try {
		const decoded = decodeAddress(address);
		const publicKey = u8aToHex(decoded);

		// Detect network from prefix
		for (const [networkName, prefix] of Object.entries(SS58_PREFIXES)) {
			if (encodeAddress(decoded, prefix) === address) {
				return { format: 'ss58', network: networkName };
			}
		}

		return { format: 'ss58' };
	} catch {
		return { format: 'unknown' };
	}
}

/**
 * Alias for formatAddress for display purposes
 */
export const formatAddressForDisplay = formatAddress;
