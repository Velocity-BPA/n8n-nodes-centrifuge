import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CentrifugeApi implements ICredentialType {
	name = 'centrifugeApi';
	displayName = 'Centrifuge API';
	documentationUrl = 'https://docs.centrifuge.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'API key for Centrifuge API authentication',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.centrifuge.io/v1',
			required: true,
			description: 'Base URL for the Centrifuge API',
		},
	];
}