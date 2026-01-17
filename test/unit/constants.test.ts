/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	MAINNET_CONFIG,
	ALTAIR_CONFIG,
	TESTNET_CONFIG,
	DEVELOPMENT_CONFIG,
	NETWORKS,
	getNetworkConfig,
} from '../../nodes/Centrifuge/constants/networks';

import {
	CFG_TOKEN,
	AIR_TOKEN,
	NATIVE_CURRENCY,
	SUPPORTED_CURRENCIES,
	DECIMALS,
} from '../../nodes/Centrifuge/constants/currencies';

describe('constants', () => {
	describe('networks', () => {
		it('should have Centrifuge mainnet configuration', () => {
			expect(MAINNET_CONFIG).toBeDefined();
			expect(MAINNET_CONFIG.name).toBe('Centrifuge Mainnet');
			expect(MAINNET_CONFIG.ss58Prefix).toBe(36);
			expect(MAINNET_CONFIG.wsEndpoint).toContain('wss://');
		});

		it('should have Altair network configuration', () => {
			expect(ALTAIR_CONFIG).toBeDefined();
			expect(ALTAIR_CONFIG.name).toBe('Altair');
			expect(ALTAIR_CONFIG.ss58Prefix).toBe(136);
		});

		it('should have testnet configuration', () => {
			expect(TESTNET_CONFIG).toBeDefined();
			expect(TESTNET_CONFIG.name).toContain('Testnet');
		});

		it('should have development network configuration', () => {
			expect(DEVELOPMENT_CONFIG).toBeDefined();
			expect(DEVELOPMENT_CONFIG.wsEndpoint).toContain('127.0.0.1');
		});

		it('should export NETWORKS mapping', () => {
			expect(NETWORKS).toBeDefined();
			expect(NETWORKS.mainnet).toBe(MAINNET_CONFIG);
			expect(NETWORKS.altair).toBe(ALTAIR_CONFIG);
		});

		it('should return correct config via getNetworkConfig', () => {
			expect(getNetworkConfig('mainnet')).toBe(MAINNET_CONFIG);
			expect(getNetworkConfig('altair')).toBe(ALTAIR_CONFIG);
		});
	});

	describe('currencies', () => {
		it('should have CFG token configuration', () => {
			expect(CFG_TOKEN).toBeDefined();
			expect(CFG_TOKEN.symbol).toBe('CFG');
			expect(CFG_TOKEN.decimals).toBe(18);
		});

		it('should have AIR token configuration', () => {
			expect(AIR_TOKEN).toBeDefined();
			expect(AIR_TOKEN.symbol).toBe('AIR');
			expect(AIR_TOKEN.decimals).toBe(18);
		});

		it('should have NATIVE_CURRENCY alias', () => {
			expect(NATIVE_CURRENCY).toBeDefined();
			expect(NATIVE_CURRENCY).toBe(CFG_TOKEN);
		});

		it('should have SUPPORTED_CURRENCIES array', () => {
			expect(SUPPORTED_CURRENCIES).toBeDefined();
			expect(Array.isArray(SUPPORTED_CURRENCIES)).toBe(true);
			expect(SUPPORTED_CURRENCIES.length).toBeGreaterThan(0);
		});

		it('should have DECIMALS constants', () => {
			expect(DECIMALS.CFG).toBe(18);
			expect(DECIMALS.USDC).toBe(6);
			expect(DECIMALS.DAI).toBe(18);
		});
	});
});
