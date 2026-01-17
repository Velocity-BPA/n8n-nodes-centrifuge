/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	validateAddress,
	formatAddress,
	getSS58Prefix,
	SS58_PREFIXES,
} from '../../nodes/Centrifuge/utils/addressUtils';

describe('addressUtils', () => {
	describe('validateAddress', () => {
		it('should return object with isValid property', () => {
			// Test that the function returns the expected shape
			const result = validateAddress('anystring');
			expect(result).toHaveProperty('isValid');
			expect(typeof result.isValid).toBe('boolean');
		});

		it('should return isValid false for empty string', () => {
			const result = validateAddress('');
			expect(result.isValid).toBe(false);
		});

		it('should return isValid false for invalid addresses', () => {
			expect(validateAddress('invalid').isValid).toBe(false);
			expect(validateAddress('0x123').isValid).toBe(false);
		});
	});

	describe('formatAddress', () => {
		it('should truncate long addresses', () => {
			const address = '4dpEcgqJNczMMQNYgWv35MuDZfNVwjRMKE9B6F8Kk1RqMXJm';
			const formatted = formatAddress(address, 8, 4);
			expect(formatted).toMatch(/^4dpEcgqJ\.\.\..*$/);
			expect(formatted.length).toBeLessThan(address.length);
		});

		it('should return short addresses unchanged', () => {
			const shortAddress = '4dpE';
			expect(formatAddress(shortAddress, 10, 10)).toBe(shortAddress);
		});
	});

	describe('getSS58Prefix', () => {
		it('should return correct prefix for mainnet', () => {
			expect(getSS58Prefix('mainnet')).toBe(36);
		});

		it('should return correct prefix for altair', () => {
			expect(getSS58Prefix('altair')).toBe(136);
		});

		it('should return generic prefix for unknown networks', () => {
			expect(getSS58Prefix('unknown')).toBe(SS58_PREFIXES.generic);
		});
	});

	describe('SS58_PREFIXES', () => {
		it('should have correct prefix values', () => {
			expect(SS58_PREFIXES.centrifuge).toBe(36);
			expect(SS58_PREFIXES.altair).toBe(136);
			expect(SS58_PREFIXES.generic).toBe(42);
		});
	});
});
