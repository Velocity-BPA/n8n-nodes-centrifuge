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
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Centrifuge API key from the developer portal',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.centrifuge.io',
			required: true,
			description: 'Base URL for the Centrifuge API',
		},
	];
}