/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Centrifuge } from '../nodes/Centrifuge/Centrifuge.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Centrifuge Node', () => {
  let node: Centrifuge;

  beforeAll(() => {
    node = new Centrifuge();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Centrifuge');
      expect(node.description.name).toBe('centrifuge');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Pool Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.centrifuge.io'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getAllPools operation', () => {
    it('should get all pools successfully', async () => {
      const mockResponse = { pools: [{ id: 'pool1', name: 'Test Pool' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllPools')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('active')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(0);

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/pools?chainId=centrifuge&status=active&limit=50&offset=0',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting all pools', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllPools');

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getPool operation', () => {
    it('should get a specific pool successfully', async () => {
      const mockResponse = { id: 'pool1', name: 'Test Pool' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPool')
        .mockReturnValueOnce('pool1')
        .mockReturnValueOnce('centrifuge');

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('createPool operation', () => {
    it('should create a pool successfully', async () => {
      const mockResponse = { id: 'pool1', name: 'New Pool' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createPool')
        .mockReturnValueOnce('New Pool')
        .mockReturnValueOnce('Test Description')
        .mockReturnValueOnce('real_estate')
        .mockReturnValueOnce(1000000);

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updatePool operation', () => {
    it('should update a pool successfully', async () => {
      const mockResponse = { id: 'pool1', name: 'Updated Pool' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updatePool')
        .mockReturnValueOnce('pool1')
        .mockReturnValueOnce('Updated Pool')
        .mockReturnValueOnce('Updated Description')
        .mockReturnValueOnce(2000000);

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deletePool operation', () => {
    it('should delete a pool successfully', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deletePool')
        .mockReturnValueOnce('pool1');

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getPoolTranches operation', () => {
    it('should get pool tranches successfully', async () => {
      const mockResponse = { tranches: [{ id: 'tranche1', name: 'Senior' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPoolTranches')
        .mockReturnValueOnce('pool1');

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getPoolNav operation', () => {
    it('should get pool NAV successfully', async () => {
      const mockResponse = { nav: 1000000, date: '2023-12-01' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPoolNav')
        .mockReturnValueOnce('pool1')
        .mockReturnValueOnce('2023-12-01');

      const result = await executePoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Asset Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://api.centrifuge.io' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllAssets operation', () => {
    it('should get all assets successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllAssets')
        .mockReturnValueOnce('pool-123')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce('centrifuge');

      const mockResponse = { 
        data: [{ id: 'asset-1', poolId: 'pool-123', value: 10000 }],
        total: 1 
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/assets?poolId=pool-123&limit=100&offset=0&chainId=centrifuge',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting all assets', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllAssets');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAsset operation', () => {
    it('should get asset successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAsset')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('asset-123');

      const mockResponse = { id: 'asset-123', value: 10000, metadata: {} };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('createAsset operation', () => {
    it('should create asset successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createAsset')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('pool-123')
        .mockReturnValueOnce('real-estate')
        .mockReturnValueOnce(10000)
        .mockReturnValueOnce('{"description":"Test asset"}');

      const mockResponse = { id: 'asset-456', poolId: 'pool-123', value: 10000 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('financeAsset operation', () => {
    it('should finance asset successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('financeAsset')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('asset-123')
        .mockReturnValueOnce(5000)
        .mockReturnValueOnce('{"duration":"12m","rate":"5.5"}');

      const mockResponse = { financeId: 'finance-789', assetId: 'asset-123', amount: 5000 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Investment Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.centrifuge.io' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllInvestments', () => {
    it('should get all investments successfully', async () => {
      const mockResponse = { investments: [], total: 0, page: 1 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllInvestments')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('pool-123')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(0);

      const result = await executeInvestmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/investments'),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'X-Chain-ID': 'centrifuge'
        }),
        json: true,
      });
    });

    it('should handle errors when getting investments fails', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllInvestments')
        .mockReturnValueOnce('centrifuge');

      const result = await executeInvestmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('createInvestment', () => {
    it('should create investment successfully', async () => {
      const mockResponse = { id: 'inv-123', status: 'pending' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createInvestment')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('pool-123')
        .mockReturnValueOnce('senior')
        .mockReturnValueOnce('1000')
        .mockReturnValueOnce('USD');

      const result = await executeInvestmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/investments',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'X-Chain-ID': 'centrifuge'
        }),
        body: {
          poolId: 'pool-123',
          tranche: 'senior',
          amount: '1000',
          currency: 'USD'
        },
        json: true,
      });
    });
  });

  describe('redeemInvestment', () => {
    it('should redeem investment successfully', async () => {
      const mockResponse = { transactionId: 'tx-123', status: 'processing' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('redeemInvestment')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('inv-123')
        .mockReturnValueOnce('500');

      const result = await executeInvestmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/investments/inv-123/redeem',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'X-Chain-ID': 'centrifuge'
        }),
        body: {
          amount: '500'
        },
        json: true,
      });
    });
  });
});

describe('Loan Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.centrifuge.io' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getAllLoans operation', () => {
    it('should get all loans successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllLoans')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('pool123')
        .mockReturnValueOnce('borrower456')
        .mockReturnValueOnce('active')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(0);

      const mockResponse = { loans: [], total: 0 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoanOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/loans?poolId=pool123&borrowerId=borrower456&status=active&limit=50&offset=0',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
          'X-Chain-ID': 'centrifuge',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle getAllLoans error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllLoans');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeLoanOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getLoan operation', () => {
    it('should get specific loan successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getLoan')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('loan123');

      const mockResponse = { id: 'loan123', amount: '10000' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoanOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/loans/loan123',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
          'X-Chain-ID': 'centrifuge',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('createLoan operation', () => {
    it('should create loan successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createLoan')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('asset123')
        .mockReturnValueOnce('10000')
        .mockReturnValueOnce(5.5)
        .mockReturnValueOnce(12)
        .mockReturnValueOnce('borrower456');

      const mockResponse = { id: 'loan123', status: 'created' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoanOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/loans',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
          'X-Chain-ID': 'centrifuge',
        },
        body: {
          assetId: 'asset123',
          amount: '10000',
          interestRate: 5.5,
          term: 12,
          borrowerId: 'borrower456',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('repayLoan operation', () => {
    it('should process loan repayment successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('repayLoan')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('loan123')
        .mockReturnValueOnce('1000')
        .mockReturnValueOnce('principal');

      const mockResponse = { success: true, remainingBalance: '9000' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoanOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/loans/loan123/repay',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
          'X-Chain-ID': 'centrifuge',
        },
        body: {
          amount: '1000',
          paymentType: 'principal',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Token Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.centrifuge.io' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllTokens operation', () => {
    it('should get all tokens successfully', async () => {
      const mockResponse = { tokens: [{ id: 'token1', type: 'cfg' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllTokens')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('all')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(0);

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle getAllTokens error', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllTokens');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getToken operation', () => {
    it('should get token successfully', async () => {
      const mockResponse = { id: 'token1', type: 'cfg' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getToken')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('token1');

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('mintTokens operation', () => {
    it('should mint tokens successfully', async () => {
      const mockResponse = { transactionHash: '0x123', success: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('mintTokens')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('cfg')
        .mockReturnValueOnce('1000')
        .mockReturnValueOnce('0xrecipient')
        .mockReturnValueOnce('pool1');

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('burnTokens operation', () => {
    it('should burn tokens successfully', async () => {
      const mockResponse = { transactionHash: '0x456', success: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('burnTokens')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('token1')
        .mockReturnValueOnce('500');

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('transferTokens operation', () => {
    it('should transfer tokens successfully', async () => {
      const mockResponse = { transactionHash: '0x789', success: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('transferTokens')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('token1')
        .mockReturnValueOnce('0xfrom')
        .mockReturnValueOnce('0xto')
        .mockReturnValueOnce('250');

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTokenBalance operation', () => {
    it('should get token balance successfully', async () => {
      const mockResponse = { balance: '1500', address: '0xtest' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTokenBalance')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('token1')
        .mockReturnValueOnce('0xtest');

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTokenPrice operation', () => {
    it('should get token price successfully', async () => {
      const mockResponse = { price: '1.25', currency: 'USD' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTokenPrice')
        .mockReturnValueOnce('centrifuge')
        .mockReturnValueOnce('token1');

      const result = await executeTokenOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Governance Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				apiKey: 'test-key',
				baseUrl: 'https://api.centrifuge.io'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getAllProposals', () => {
		it('should get all proposals successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'getAllProposals';
					case 'status': return 'active';
					case 'type': return 'treasury';
					case 'limit': return 10;
					case 'offset': return 0;
					default: return undefined;
				}
			});

			const mockResponse = { proposals: [{ id: '1', title: 'Test Proposal' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('/governance/proposals'),
				})
			);
		});

		it('should handle errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllProposals');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects.toThrow('API Error');
		});
	});

	describe('createProposal', () => {
		it('should create proposal successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'createProposal';
					case 'title': return 'Test Proposal';
					case 'description': return 'Test Description';
					case 'proposalType': return 'treasury';
					case 'actions': return '[]';
					default: return undefined;
				}
			});

			const mockResponse = { id: '123', status: 'created' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: expect.stringContaining('/governance/proposals'),
					body: expect.objectContaining({
						title: 'Test Proposal',
						description: 'Test Description',
						type: 'treasury',
					}),
				})
			);
		});
	});

	describe('voteOnProposal', () => {
		it('should vote on proposal successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'voteOnProposal';
					case 'proposalId': return '123';
					case 'vote': return 'aye';
					case 'votingPower': return 100;
					default: return undefined;
				}
			});

			const mockResponse = { success: true, voteId: 'vote123' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: expect.stringContaining('/governance/proposals/123/vote'),
					body: {
						vote: 'aye',
						votingPower: 100,
					},
				})
			);
		});
	});
});
});
