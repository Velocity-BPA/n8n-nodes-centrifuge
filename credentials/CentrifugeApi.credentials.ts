import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Centrifuge Pools API Credentials
 *
 * Provides authentication for the Centrifuge off-chain API services.
 * These APIs provide aggregated data, historical information, and
 * enhanced querying capabilities beyond on-chain data.
 *
 * The Centrifuge API (app.centrifuge.io) provides:
 * - Pool analytics and metrics
 * - Historical NAV data
 * - Investor information
 * - Transaction history aggregation
 * - Portfolio analytics
 */
export class CentrifugeApi implements ICredentialType {
	name = 'centrifugeApi';
	displayName = 'Centrifuge Pools API';
	documentationUrl = 'https://docs.centrifuge.io/';
	// icon = 'file:centrifuge.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			default: 'production',
			options: [
				{
					name: 'Production',
					value: 'production',
					description: 'Production API (app.centrifuge.io)',
				},
				{
					name: 'Staging',
					value: 'staging',
					description: 'Staging environment for testing',
				},
				{
					name: 'Custom',
					value: 'custom',
					description: 'Custom API endpoint',
				},
			],
			description: 'API environment to use',
		},
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://api.centrifuge.io',
			description: 'Custom API endpoint URL',
			displayOptions: {
				show: {
					environment: ['custom'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authenticated requests (if required)',
		},
		{
			displayName: 'SubQuery Endpoint',
			name: 'subqueryEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://api.subquery.network/sq/centrifuge/centrifuge',
			description: 'Optional SubQuery GraphQL endpoint for indexed blockchain data',
		},
		{
			displayName: 'Rate Limit (requests/minute)',
			name: 'rateLimit',
			type: 'number',
			default: 60,
			description: 'Maximum requests per minute to avoid rate limiting',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://app.centrifuge.io/api" : $credentials.environment === "staging" ? "https://staging.centrifuge.io/api" : $credentials.apiEndpoint}}',
			url: '/health',
			method: 'GET',
		},
	};
}
