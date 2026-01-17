/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	toBaseUnits,
	fromBaseUnits,
	cfgToBaseUnits,
	baseUnitsToCfg,
	formatCurrency,
	formatAmount,
} from '../../nodes/Centrifuge/utils/unitConverter';

describe('unitConverter', () => {
	describe('toBaseUnits', () => {
		it('should convert human-readable amounts to base units', () => {
			// 1 CFG with 18 decimals = 1e18 base units
			expect(toBaseUnits('1', 18)).toBe(BigInt('1000000000000000000'));
			expect(toBaseUnits('0.5', 18)).toBe(BigInt('500000000000000000'));
			expect(toBaseUnits('100', 18)).toBe(BigInt('100000000000000000000'));
		});

		it('should handle different decimal places', () => {
			expect(toBaseUnits('1', 6)).toBe(BigInt('1000000'));
			expect(toBaseUnits('1.5', 6)).toBe(BigInt('1500000'));
		});

		it('should handle zero', () => {
			expect(toBaseUnits('0', 18)).toBe(BigInt('0'));
		});
	});

	describe('fromBaseUnits', () => {
		it('should convert base units to human-readable amounts', () => {
			expect(fromBaseUnits(BigInt('1000000000000000000'), 18)).toBe('1');
			expect(fromBaseUnits(BigInt('500000000000000000'), 18)).toBe('0.5');
		});

		it('should handle different decimal places', () => {
			expect(fromBaseUnits(BigInt('1000000'), 6)).toBe('1');
			expect(fromBaseUnits(BigInt('1500000'), 6)).toBe('1.5');
		});

		it('should handle zero', () => {
			expect(fromBaseUnits(BigInt('0'), 18)).toBe('0');
		});
	});

	describe('cfgToBaseUnits', () => {
		it('should convert CFG amounts to base units (18 decimals)', () => {
			expect(cfgToBaseUnits(1)).toBe(BigInt('1000000000000000000'));
			expect(cfgToBaseUnits(0.5)).toBe(BigInt('500000000000000000'));
		});
	});

	describe('baseUnitsToCfg', () => {
		it('should convert base units to CFG amounts', () => {
			expect(baseUnitsToCfg(BigInt('1000000000000000000'))).toBe('1');
			expect(baseUnitsToCfg(BigInt('500000000000000000'))).toBe('0.5');
		});
	});

	describe('formatCurrency', () => {
		it('should format currency with symbol', () => {
			const formatted = formatCurrency('1', 'CFG', 2);
			expect(formatted).toContain('1');
			expect(formatted).toContain('CFG');
		});
	});

	describe('formatAmount', () => {
		it('should format amounts with thousand separators', () => {
			const formatted = formatAmount(1000000, 2);
			expect(formatted).toBe('1,000,000');
		});
	});
});
