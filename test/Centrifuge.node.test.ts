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

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
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
describe('Pools Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.centrifuge.io/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getPools operation', () => {
    it('should successfully get pools with filters', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'getPools',
          'status': 'active',
          'assetClass': 'real-estate',
          'limit': 10,
          'offset': 0,
        };
        return params[param];
      });

      const mockResponse = {
        data: [
          { id: 'pool1', name: 'Test Pool 1', status: 'active' },
          { id: 'pool2', name: 'Test Pool 2', status: 'active' },
        ],
        total: 2,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/pools?status=active&assetClass=real-estate&limit=10&offset=0',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getPool operation', () => {
    it('should successfully get a specific pool', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'getPool',
          'poolId': 'pool123',
        };
        return params[param];
      });

      const mockResponse = {
        id: 'pool123',
        name: 'Test Pool',
        status: 'active',
        assetClass: 'real-estate',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/pools/pool123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('createPool operation', () => {
    it('should successfully create a new pool', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'createPool',
          'name': 'New Test Pool',
          'assetClass': 'real-estate',
          'currency': 'USD',
          'metadata': '{"description":"Test pool description"}',
        };
        return params[param];
      });

      const mockResponse = {
        id: 'pool456',
        name: 'New Test Pool',
        assetClass: 'real-estate',
        currency: 'USD',
        status: 'pending',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/v1/pools',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          name: 'New Test Pool',
          assetClass: 'real-estate',
          currency: 'USD',
          metadata: { description: 'Test pool description' },
        },
        json: true,
      });
    });

    it('should handle invalid JSON in metadata', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'createPool',
          'name': 'New Test Pool',
          'assetClass': 'real-estate',
          'currency': 'USD',
          'metadata': 'invalid json',
        };
        return params[param];
      });

      const items = [{ json: {} }];
      
      await expect(executePoolsOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Invalid JSON in metadata');
    });
  });

  describe('updatePool operation', () => {
    it('should successfully update a pool', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'updatePool',
          'poolId': 'pool123',
          'name': 'Updated Pool Name',
          'metadata': '{"updated":"true"}',
          'updateStatus': 'active',
        };
        return params[param];
      });

      const mockResponse = {
        id: 'pool123',
        name: 'Updated Pool Name',
        status: 'active',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://api.centrifuge.io/v1/pools/pool123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          name: 'Updated Pool Name',
          status: 'active',
          metadata: { updated: 'true' },
        },
        json: true,
      });
    });
  });

  describe('getPoolTranches operation', () => {
    it('should successfully get pool tranches', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'getPoolTranches',
          'poolId': 'pool123',
        };
        return params[param];
      });

      const mockResponse = {
        tranches: [
          { id: 'tranche1', name: 'Senior', yield: 0.06 },
          { id: 'tranche2', name: 'Junior', yield: 0.12 },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/pools/pool123/tranches',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getPoolNav operation', () => {
    it('should successfully get pool NAV with date', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        const params: any = {
          'operation': 'getPoolNav',
          'poolId': 'pool123',
          'date': '2024-01-01',
        };
        return params[param];
      });

      const mockResponse = {
        poolId: 'pool123',
        nav: 1000000,
        date: '2024-01-01',
        currency: 'USD',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/pools/pool123/nav?date=2024-01-01',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors when continueOnFail is true', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getPools');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      const result = await executePoolsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'API Error' });
    });

    it('should throw error when continueOnFail is false', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getPools');
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      
      await expect(executePoolsOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
    });

    it('should throw error for unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

      const items = [{ json: {} }];
      
      await expect(executePoolsOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Unknown operation: unknownOperation');
    });
  });
});

describe('Assets Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.centrifuge.io/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('getAssets should list tokenized assets', async () => {
    const mockResponse = {
      data: [
        {
          id: 'asset-1',
          poolId: 'pool-1',
          assetType: 'real_estate',
          value: 100000,
          status: 'active',
        },
      ],
      total: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number, defaultValue?: any) => {
      const params: any = {
        operation: 'getAssets',
        poolId: 'pool-1',
        status: 'active',
        assetType: 'real_estate',
        limit: 50,
        offset: 0,
      };
      return params[key] !== undefined ? params[key] : defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.centrifuge.io/v1/assets?poolId=pool-1&status=active&assetType=real_estate&limit=50&offset=0',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getAsset should get specific asset details', async () => {
    const mockResponse = {
      id: 'asset-1',
      poolId: 'pool-1',
      assetType: 'real_estate',
      value: 100000,
      status: 'active',
      metadata: {},
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string) => {
      const params: any = {
        operation: 'getAsset',
        assetId: 'asset-1',
      };
      return params[key];
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.centrifuge.io/v1/assets/asset-1',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('createAsset should tokenize a new real-world asset', async () => {
    const mockResponse = {
      id: 'asset-new',
      poolId: 'pool-1',
      assetType: 'real_estate',
      value: 100000,
      status: 'pending',
      transactionId: 'tx-123',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number, defaultValue?: any) => {
      const params: any = {
        operation: 'createAsset',
        poolId: 'pool-1',
        assetType: 'real_estate',
        value: 100000,
        metadata: '{"property": "house"}',
        documents: '["doc1.pdf", "doc2.pdf"]',
      };
      return params[key] !== undefined ? params[key] : defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.centrifuge.io/v1/assets',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        poolId: 'pool-1',
        assetType: 'real_estate',
        value: 100000,
        metadata: { property: 'house' },
        documents: ['doc1.pdf', 'doc2.pdf'],
      },
      json: true,
    });
  });

  test('updateAsset should update asset information', async () => {
    const mockResponse = {
      id: 'asset-1',
      poolId: 'pool-1',
      assetType: 'real_estate',
      value: 150000,
      status: 'active',
      metadata: { updated: true },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number, defaultValue?: any) => {
      const params: any = {
        operation: 'updateAsset',
        assetId: 'asset-1',
        value: 150000,
        metadata: '{"updated": true}',
        status: 'active',
      };
      return params[key] !== undefined ? params[key] : defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://api.centrifuge.io/v1/assets/asset-1',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        value: 150000,
        metadata: { updated: true },
        status: 'active',
      },
      json: true,
    });
  });

  test('deleteAsset should remove asset from pool', async () => {
    const mockResponse = {
      message: 'Asset deleted successfully',
      transactionId: 'tx-456',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string) => {
      const params: any = {
        operation: 'deleteAsset',
        assetId: 'asset-1',
      };
      return params[key];
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      url: 'https://api.centrifuge.io/v1/assets/asset-1',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getAssetValuations should get asset valuation history', async () => {
    const mockResponse = {
      data: [
        {
          id: 'valuation-1',
          assetId: 'asset-1',
          value: 100000,
          date: '2023-01-01T00:00:00Z',
          appraiser: 'Appraiser A',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string, index: number, defaultValue?: any) => {
      const params: any = {
        operation: 'getAssetValuations',
        assetId: 'asset-1',
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
      };
      return params[key] !== undefined ? params[key] : defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.centrifuge.io/v1/assets/asset-1/valuations?fromDate=2023-01-01&toDate=2023-12-31',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('createAssetValuation should add new asset valuation', async () => {
    const mockResponse = {
      id: 'valuation-new',
      assetId: 'asset-1',
      value: 110000,
      date: '2023-06-01T00:00:00Z',
      appraiser: 'Appraiser B',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string) => {
      const params: any = {
        operation: 'createAssetValuation',
        assetId: 'asset-1',
        value: 110000,
        date: '2023-06-01T00:00:00Z',
        appraiser: 'Appraiser B',
      };
      return params[key];
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.centrifuge.io/v1/assets/asset-1/valuations',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        value: 110000,
        date: '2023-06-01T00:00:00Z',
        appraiser: 'Appraiser B',
      },
      json: true,
    });
  });

  test('should handle API errors properly', async () => {
    const mockError = {
      httpCode: 404,
      message: 'Asset not found',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string) => {
      const params: any = {
        operation: 'getAsset',
        assetId: 'nonexistent',
      };
      return params[key];
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
  });

  test('should continue on fail when enabled', async () => {
    const mockError = new Error('API Error');

    mockExecuteFunctions.getNodeParameter.mockImplementation((key: string) => {
      const params: any = {
        operation: 'getAsset',
        assetId: 'error-asset',
      };
      return params[key];
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Investments Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.centrifuge.io/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getInvestments', () => {
    it('should list investor positions successfully', async () => {
      const mockResponse = {
        investments: [
          {
            id: 'inv-1',
            poolId: 'pool-1',
            investorAddress: '0x123',
            amount: '1000',
            status: 'active',
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getInvestments';
          case 'poolId': return 'pool-1';
          case 'investorAddress': return '0x123';
          case 'status': return 'active';
          case 'limit': return 100;
          case 'offset': return 0;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/investments?poolId=pool-1&investorAddress=0x123&status=active&limit=100&offset=0',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle API error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getInvestments';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('API Error'),
      );

      await expect(
        executeInvestmentsOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('API Error');
    });
  });

  describe('getInvestment', () => {
    it('should get specific investment details successfully', async () => {
      const mockResponse = {
        id: 'inv-1',
        poolId: 'pool-1',
        investorAddress: '0x123',
        amount: '1000',
        status: 'active',
        trancheId: 'tranche-1',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getInvestment';
          case 'investmentId': return 'inv-1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/investments/inv-1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('createDeposit', () => {
    it('should process investment deposit successfully', async () => {
      const mockResponse = {
        id: 'deposit-1',
        transactionHash: '0xabc123',
        status: 'pending',
        amount: '1000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createDeposit';
          case 'poolId': return 'pool-1';
          case 'trancheId': return 'tranche-1';
          case 'amount': return '1000';
          case 'investorAddress': return '0x123';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/v1/investments/deposit',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          poolId: 'pool-1',
          trancheId: 'tranche-1',
          amount: '1000',
          investorAddress: '0x123',
        },
        json: true,
      });
    });
  });

  describe('createWithdrawal', () => {
    it('should process investment withdrawal successfully', async () => {
      const mockResponse = {
        id: 'withdrawal-1',
        transactionHash: '0xdef456',
        status: 'pending',
        amount: '500',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createWithdrawal';
          case 'poolId': return 'pool-1';
          case 'trancheId': return 'tranche-1';
          case 'amount': return '500';
          case 'investorAddress': return '0x123';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getInvestmentReturns', () => {
    it('should get investment performance successfully', async () => {
      const mockResponse = {
        investmentId: 'inv-1',
        period: 'monthly',
        returns: [
          { date: '2023-01-01', value: '1050', return: '5%' },
          { date: '2023-02-01', value: '1100', return: '10%' },
        ],
        totalReturn: '10%',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getInvestmentReturns';
          case 'investmentId': return 'inv-1';
          case 'period': return 'monthly';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getInvestmentOrders', () => {
    it('should get pending orders successfully', async () => {
      const mockResponse = {
        orders: [
          {
            id: 'order-1',
            poolId: 'pool-1',
            investorAddress: '0x123',
            type: 'deposit',
            amount: '1000',
            status: 'pending',
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getInvestmentOrders';
          case 'poolId': return 'pool-1';
          case 'investorAddress': return '0x123';
          case 'status': return 'pending';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

      await expect(
        executeInvestmentsOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });

    it('should continue on fail when enabled', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getInvestments');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await executeInvestmentsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'Network error' });
    });
  });
});

describe('Loans Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.centrifuge.io/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getLoans', () => {
    it('should successfully get loans list', async () => {
      const mockResponse = {
        loans: [
          {
            id: 'loan-1',
            poolId: 'pool-1',
            borrowerAddress: '0x123',
            principal: '10000',
            status: 'active',
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getLoans';
          case 'poolId': return 'pool-1';
          case 'limit': return 100;
          case 'offset': return 0;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoansOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/loans?poolId=pool-1&limit=100&offset=0',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getLoan', () => {
    it('should successfully get a specific loan', async () => {
      const mockResponse = {
        id: 'loan-1',
        poolId: 'pool-1',
        borrowerAddress: '0x123',
        principal: '10000',
        status: 'active',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getLoan';
          case 'loanId': return 'loan-1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoansOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/loans/loan-1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('createLoan', () => {
    it('should successfully create a new loan', async () => {
      const mockResponse = {
        id: 'loan-new',
        poolId: 'pool-1',
        borrowerAddress: '0x123',
        principal: '5000',
        status: 'pending',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'createLoan';
          case 'poolId': return 'pool-1';
          case 'borrowerAddress': return '0x123';
          case 'principal': return '5000';
          case 'interestRate': return '5.5';
          case 'term': return 12;
          case 'collateralAssetId': return 'asset-1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoansOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/v1/loans',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          poolId: 'pool-1',
          borrowerAddress: '0x123',
          principal: '5000',
          interestRate: '5.5',
          term: 12,
          collateralAssetId: 'asset-1',
        },
        json: true,
      });
    });
  });

  describe('repayLoan', () => {
    it('should successfully process loan repayment', async () => {
      const mockResponse = {
        transactionId: 'tx-123',
        loanId: 'loan-1',
        amount: '1000',
        repaymentType: 'principal',
        status: 'confirmed',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'repayLoan';
          case 'loanId': return 'loan-1';
          case 'amount': return '1000';
          case 'repaymentType': return 'principal';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeLoansOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/v1/loans/loan-1/repay',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          amount: '1000',
          repaymentType: 'principal',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors when continueOnFail is true', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getLoan';
        if (name === 'loanId') return 'invalid-loan';
        return '';
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Loan not found'));

      const result = await executeLoansOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Loan not found' }, pairedItem: { item: 0 } }]);
    });

    it('should throw error when continueOnFail is false', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getLoan';
        if (name === 'loanId') return 'invalid-loan';
        return '';
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Loan not found'));

      await expect(executeLoansOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
    });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.centrifuge.io/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getTransactions', () => {
    it('should successfully retrieve transaction history', async () => {
      const mockResponse = {
        data: [
          {
            hash: '0x123',
            poolId: 'pool-1',
            type: 'invest',
            status: 'confirmed',
            amount: '1000.00',
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTransactions';
          case 'poolId': return 'pool-1';
          case 'address': return '0xaddress123';
          case 'type': return 'invest';
          case 'status': return 'confirmed';
          case 'limit': return 50;
          case 'offset': return 0;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/transactions?'),
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getTransactions error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTransactions';
          case 'limit': return 50;
          case 'offset': return 0;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];

      await expect(executeTransactionsOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('API Error');
    });
  });

  describe('getTransaction', () => {
    it('should successfully retrieve specific transaction', async () => {
      const mockResponse = {
        hash: '0x123',
        poolId: 'pool-1',
        type: 'invest',
        status: 'confirmed',
        amount: '1000.00',
        confirmations: 12,
        gasUsed: '21000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTransaction';
          case 'txHash': return '0x123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/transactions/0x123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getTransactionStatus', () => {
    it('should successfully retrieve transaction status', async () => {
      const mockResponse = {
        hash: '0x123',
        status: 'confirmed',
        confirmations: 12,
        blockNumber: 18500000,
        blockHash: '0xblock123',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTransactionStatus';
          case 'txHash': return '0x123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.centrifuge.io/v1/transactions/0x123/status',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('estimateTransactionFee', () => {
    it('should successfully estimate transaction fees', async () => {
      const mockResponse = {
        estimatedGas: '21000',
        gasPriceGwei: '20',
        estimatedFeeEth: '0.00042',
        estimatedFeeUsd: '1.05',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'estimateTransactionFee';
          case 'operationType': return 'invest';
          case 'poolId': return 'pool-1';
          case 'amount': return '1000.00';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.centrifuge.io/v1/transactions/estimate',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          operation: 'invest',
          poolId: 'pool-1',
          amount: '1000.00',
        },
        json: true,
      });
    });
  });
});
});
