/**
 * Centrifuge API Client
 *
 * Handles interaction with the Centrifuge off-chain API services:
 * - Pool analytics and metrics
 * - Historical data queries
 * - Aggregated investor information
 * - SubQuery/GraphQL integration
 *
 * These APIs provide data that would be expensive or impractical
 * to query directly from the blockchain.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '../constants/networks';

/**
 * API client configuration
 */
export interface CentrifugeApiConfig {
	environment: 'production' | 'staging' | 'custom';
	apiEndpoint?: string;
	apiKey?: string;
	subqueryEndpoint?: string;
	rateLimit?: number;
	timeout?: number;
}

/**
 * Pool data from API
 */
export interface ApiPoolData {
	id: string;
	metadata?: {
		name?: string;
		description?: string;
		website?: string;
		assetClass?: string;
	};
	state?: {
		nav: string;
		reserve: string;
		totalDebt: string;
		portfolioValuation: string;
	};
	tranches?: ApiTrancheData[];
	epochId?: number;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Tranche data from API
 */
export interface ApiTrancheData {
	id: string;
	poolId: string;
	seniority: number;
	tokenPrice: string;
	tokenSupply: string;
	minRiskBuffer?: string;
	interestRate?: string;
	yield?: string;
}

/**
 * Investment data from API
 */
export interface ApiInvestmentData {
	investorAddress: string;
	poolId: string;
	trancheId: string;
	tokenBalance: string;
	pendingInvest: string;
	pendingRedeem: string;
	claimableInvest: string;
	claimableRedeem: string;
}

/**
 * Historical NAV data point
 */
export interface NavDataPoint {
	timestamp: number;
	nav: string;
	reserve: string;
	portfolioValuation: string;
}

/**
 * Loan data from API
 */
export interface ApiLoanData {
	id: string;
	poolId: string;
	status: string;
	outstandingDebt: string;
	principalDebt: string;
	interestRate: string;
	collateralNftId?: string;
	originationDate?: string;
	maturityDate?: string;
}

/**
 * GraphQL query result
 */
export interface GraphQLResult<T> {
	data?: T;
	errors?: Array<{ message: string }>;
}

/**
 * Centrifuge API Client Class
 */
export class CentrifugeApiClient {
	private httpClient: AxiosInstance;
	private subqueryClient: AxiosInstance | null = null;
	private config: CentrifugeApiConfig;
	private lastRequestTime: number = 0;
	private requestCount: number = 0;

	constructor(config: CentrifugeApiConfig) {
		this.config = config;

		// Determine base URL
		let baseURL: string;
		switch (config.environment) {
			case 'production':
				baseURL = API_ENDPOINTS.production;
				break;
			case 'staging':
				baseURL = API_ENDPOINTS.staging;
				break;
			case 'custom':
				baseURL = config.apiEndpoint || API_ENDPOINTS.production;
				break;
			default:
				baseURL = API_ENDPOINTS.production;
		}

		// Create HTTP client
		this.httpClient = axios.create({
			baseURL,
			timeout: config.timeout || 30000,
			headers: {
				'Content-Type': 'application/json',
				...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
			},
		});

		// Create SubQuery client if endpoint provided
		if (config.subqueryEndpoint) {
			this.subqueryClient = axios.create({
				baseURL: config.subqueryEndpoint,
				timeout: config.timeout || 30000,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	}

	/**
	 * Rate limiting helper
	 */
	private async checkRateLimit(): Promise<void> {
		const rateLimit = this.config.rateLimit || 60;
		const now = Date.now();
		const minute = 60 * 1000;

		if (now - this.lastRequestTime > minute) {
			this.requestCount = 0;
			this.lastRequestTime = now;
		}

		if (this.requestCount >= rateLimit) {
			const waitTime = minute - (now - this.lastRequestTime);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
			this.requestCount = 0;
			this.lastRequestTime = Date.now();
		}

		this.requestCount++;
	}

	/**
	 * Make an HTTP request with rate limiting
	 */
	private async request<T>(config: AxiosRequestConfig): Promise<T> {
		await this.checkRateLimit();

		try {
			const response = await this.httpClient.request<T>(config);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.message || error.message;
				throw new Error(`API request failed: ${message}`);
			}
			throw error;
		}
	}

	/**
	 * Execute a GraphQL query
	 */
	async graphqlQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
		if (!this.subqueryClient) {
			throw new Error('SubQuery endpoint not configured');
		}

		await this.checkRateLimit();

		try {
			const response = await this.subqueryClient.post<GraphQLResult<T>>('', {
				query,
				variables,
			});

			if (response.data.errors && response.data.errors.length > 0) {
				throw new Error(`GraphQL errors: ${response.data.errors.map((e) => e.message).join(', ')}`);
			}

			return response.data.data as T;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(`GraphQL query failed: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Get all pools
	 */
	async getPools(): Promise<ApiPoolData[]> {
		return this.request<ApiPoolData[]>({
			method: 'GET',
			url: '/pools',
		});
	}

	/**
	 * Get pool by ID
	 */
	async getPool(poolId: string): Promise<ApiPoolData> {
		return this.request<ApiPoolData>({
			method: 'GET',
			url: `/pools/${poolId}`,
		});
	}

	/**
	 * Get pool metadata
	 */
	async getPoolMetadata(poolId: string): Promise<ApiPoolData['metadata']> {
		const pool = await this.getPool(poolId);
		return pool.metadata;
	}

	/**
	 * Get pool tranches
	 */
	async getPoolTranches(poolId: string): Promise<ApiTrancheData[]> {
		return this.request<ApiTrancheData[]>({
			method: 'GET',
			url: `/pools/${poolId}/tranches`,
		});
	}

	/**
	 * Get tranche by ID
	 */
	async getTranche(poolId: string, trancheId: string): Promise<ApiTrancheData> {
		return this.request<ApiTrancheData>({
			method: 'GET',
			url: `/pools/${poolId}/tranches/${trancheId}`,
		});
	}

	/**
	 * Get historical NAV data
	 */
	async getHistoricalNav(
		poolId: string,
		options?: {
			startDate?: Date;
			endDate?: Date;
			granularity?: 'hourly' | 'daily' | 'weekly';
		},
	): Promise<NavDataPoint[]> {
		const params: Record<string, string> = {};

		if (options?.startDate) {
			params.startDate = options.startDate.toISOString();
		}
		if (options?.endDate) {
			params.endDate = options.endDate.toISOString();
		}
		if (options?.granularity) {
			params.granularity = options.granularity;
		}

		return this.request<NavDataPoint[]>({
			method: 'GET',
			url: `/pools/${poolId}/nav/history`,
			params,
		});
	}

	/**
	 * Get pool investors
	 */
	async getPoolInvestors(
		poolId: string,
		options?: {
			trancheId?: string;
			limit?: number;
			offset?: number;
		},
	): Promise<ApiInvestmentData[]> {
		const params: Record<string, string | number> = {};

		if (options?.trancheId) {
			params.trancheId = options.trancheId;
		}
		if (options?.limit) {
			params.limit = options.limit;
		}
		if (options?.offset) {
			params.offset = options.offset;
		}

		return this.request<ApiInvestmentData[]>({
			method: 'GET',
			url: `/pools/${poolId}/investors`,
			params,
		});
	}

	/**
	 * Get investor positions
	 */
	async getInvestorPositions(address: string): Promise<ApiInvestmentData[]> {
		return this.request<ApiInvestmentData[]>({
			method: 'GET',
			url: `/investors/${address}/positions`,
		});
	}

	/**
	 * Get pool loans
	 */
	async getPoolLoans(
		poolId: string,
		options?: {
			status?: 'active' | 'closed' | 'all';
			limit?: number;
			offset?: number;
		},
	): Promise<ApiLoanData[]> {
		const params: Record<string, string | number> = {};

		if (options?.status) {
			params.status = options.status;
		}
		if (options?.limit) {
			params.limit = options.limit;
		}
		if (options?.offset) {
			params.offset = options.offset;
		}

		return this.request<ApiLoanData[]>({
			method: 'GET',
			url: `/pools/${poolId}/loans`,
			params,
		});
	}

	/**
	 * Get loan by ID
	 */
	async getLoan(poolId: string, loanId: string): Promise<ApiLoanData> {
		return this.request<ApiLoanData>({
			method: 'GET',
			url: `/pools/${poolId}/loans/${loanId}`,
		});
	}

	/**
	 * Get pool analytics
	 */
	async getPoolAnalytics(poolId: string): Promise<{
		tvl: string;
		volume24h: string;
		activeLoans: number;
		totalBorrowed: string;
		totalRepaid: string;
		defaultRate: number;
	}> {
		return this.request({
			method: 'GET',
			url: `/pools/${poolId}/analytics`,
		});
	}

	/**
	 * Search pools
	 */
	async searchPools(query: {
		assetClass?: string;
		currency?: string;
		minNav?: string;
		maxNav?: string;
		status?: string;
	}): Promise<ApiPoolData[]> {
		return this.request<ApiPoolData[]>({
			method: 'GET',
			url: '/pools/search',
			params: query,
		});
	}

	/**
	 * Get pool epoch history
	 */
	async getEpochHistory(
		poolId: string,
		options?: { limit?: number; offset?: number },
	): Promise<
		Array<{
			epochId: number;
			closedAt: string;
			investOrders: string;
			redeemOrders: string;
			executedInvest: string;
			executedRedeem: string;
		}>
	> {
		return this.request({
			method: 'GET',
			url: `/pools/${poolId}/epochs`,
			params: options,
		});
	}

	/**
	 * GraphQL: Get pools with SubQuery
	 */
	async graphqlGetPools(): Promise<ApiPoolData[]> {
		const query = `
      query GetPools {
        pools {
          nodes {
            id
            metadata
            sumDebt
            sumPrincipalRepaid
            sumInterestRepaid
            currentEpochId
            createdAt
          }
        }
      }
    `;

		const result = await this.graphqlQuery<{ pools: { nodes: ApiPoolData[] } }>(query);
		return result.pools.nodes;
	}

	/**
	 * GraphQL: Get pool detail
	 */
	async graphqlGetPoolDetail(poolId: string): Promise<ApiPoolData> {
		const query = `
      query GetPool($poolId: String!) {
        pool(id: $poolId) {
          id
          metadata
          currency {
            id
            decimals
            symbol
          }
          tranches {
            nodes {
              id
              seniority
              tokenPrice
              tokenSupply
            }
          }
          sumDebt
          sumPrincipalRepaid
          currentEpochId
        }
      }
    `;

		const result = await this.graphqlQuery<{ pool: ApiPoolData }>(query, { poolId });
		return result.pool;
	}

	/**
	 * GraphQL: Get account investments
	 */
	async graphqlGetAccountInvestments(address: string): Promise<ApiInvestmentData[]> {
		const query = `
      query GetInvestments($address: String!) {
        investorTransactions(filter: { accountId: { equalTo: $address } }) {
          nodes {
            poolId
            trancheId
            tokenAmount
            currencyAmount
            type
            timestamp
          }
        }
      }
    `;

		const result = await this.graphqlQuery<{
			investorTransactions: { nodes: ApiInvestmentData[] };
		}>(query, { address });
		return result.investorTransactions.nodes;
	}

	/**
	 * Check API health
	 */
	async checkHealth(): Promise<boolean> {
		try {
			await this.request({ method: 'GET', url: '/health' });
			return true;
		} catch {
			return false;
		}
	}
}

/**
 * Create API client from n8n credentials
 */
export function createApiClientFromCredentials(credentials: Record<string, unknown>): CentrifugeApiClient {
	return new CentrifugeApiClient({
		environment: (credentials.environment as string || 'production') as 'production' | 'staging' | 'custom',
		apiEndpoint: credentials.apiEndpoint as string | undefined,
		apiKey: credentials.apiKey as string | undefined,
		subqueryEndpoint: credentials.subqueryEndpoint as string | undefined,
		rateLimit: (credentials.rateLimit as number) || 60,
	});
}
