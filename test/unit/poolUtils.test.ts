/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	validatePoolId,
	validateTrancheId,
	formatDuration,
	calculateReserveRatio,
	parsePoolTrancheId,
	formatPoolTrancheId,
} from '../../nodes/Centrifuge/utils/poolUtils';

describe('poolUtils', () => {
	describe('validatePoolId', () => {
		it('should validate numeric pool IDs', () => {
			expect(validatePoolId('1234567890').isValid).toBe(true);
			expect(validatePoolId('1').isValid).toBe(true);
			expect(validatePoolId('999999999999').isValid).toBe(true);
		});

		it('should reject invalid pool IDs', () => {
			expect(validatePoolId('abc').isValid).toBe(false);
		});

		it('should return normalized pool IDs', () => {
			const result = validatePoolId(123);
			expect(result.isValid).toBe(true);
			expect(result.normalized).toBe('123');
		});
	});

	describe('validateTrancheId', () => {
		it('should validate hex tranche IDs', () => {
			const validTrancheId = '0x' + '00'.repeat(16);
			expect(validateTrancheId(validTrancheId).isValid).toBe(true);
		});

		it('should reject invalid tranche IDs', () => {
			expect(validateTrancheId('invalid').isValid).toBe(false);
		});
	});

	describe('formatDuration', () => {
		it('should format seconds into readable durations', () => {
			expect(formatDuration(3600)).toBe('1h');
			expect(formatDuration(86400)).toBe('1d');
			expect(formatDuration(90061)).toBe('1d 1h 1m');
		});

		it('should handle zero', () => {
			expect(formatDuration(0)).toBe('0s');
		});
	});

	describe('calculateReserveRatio', () => {
		it('should calculate correct reserve ratio', () => {
			const ratio = calculateReserveRatio(BigInt(100), BigInt(1000));
			expect(ratio).toBe(0.1);
		});

		it('should handle zero NAV', () => {
			expect(calculateReserveRatio(BigInt(100), BigInt(0))).toBe(0);
		});
	});

	describe('parsePoolTrancheId', () => {
		it('should parse combined pool-tranche IDs', () => {
			const result = parsePoolTrancheId('123-0xabcdef');
			expect(result.poolId).toBe('123');
			expect(result.trancheId).toBe('0xabcdef');
		});

		it('should handle pool ID only', () => {
			const result = parsePoolTrancheId('123');
			expect(result.poolId).toBe('123');
			expect(result.trancheId).toBeUndefined();
		});
	});

	describe('formatPoolTrancheId', () => {
		it('should format pool and tranche IDs', () => {
			expect(formatPoolTrancheId('123', '0xabc')).toBe('123-0xabc');
			expect(formatPoolTrancheId('123')).toBe('123');
		});
	});
});
