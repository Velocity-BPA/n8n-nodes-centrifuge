/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-centrifuge/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Centrifuge implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Centrifuge',
    name: 'centrifuge',
    icon: 'file:centrifuge.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Centrifuge API',
    defaults: {
      name: 'Centrifuge',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'centrifugeApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Pool',
            value: 'pool',
          },
          {
            name: 'Asset',
            value: 'asset',
          },
          {
            name: 'Investment',
            value: 'investment',
          },
          {
            name: 'Loan',
            value: 'loan',
          },
          {
            name: 'Token',
            value: 'token',
          },
          {
            name: 'Governance',
            value: 'governance',
          },
          {
            name: 'Pools',
            value: 'pools',
          },
          {
            name: 'Assets',
            value: 'assets',
          },
          {
            name: 'Investments',
            value: 'investments',
          },
          {
            name: 'Loans',
            value: 'loans',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          }
        ],
        default: 'pool',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['pool'] } },
  options: [
    { name: 'Get All Pools', value: 'getAllPools', description: 'Get all available pools', action: 'Get all pools' },
    { name: 'Get Pool', value: 'getPool', description: 'Get specific pool details', action: 'Get a pool' },
    { name: 'Create Pool', value: 'createPool', description: 'Create a new investment pool', action: 'Create a pool' },
    { name: 'Update Pool', value: 'updatePool', description: 'Update pool configuration', action: 'Update a pool' },
    { name: 'Delete Pool', value: 'deletePool', description: 'Delete a pool', action: 'Delete a pool' },
    { name: 'Get Pool Tranches', value: 'getPoolTranches', description: 'Get pool tranches information', action: 'Get pool tranches' },
    { name: 'Get Pool NAV', value: 'getPoolNav', description: 'Get pool net asset value', action: 'Get pool NAV' },
  ],
  default: 'getAllPools',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['asset'] } },
  options: [
    { name: 'Get All Assets', value: 'getAllAssets', description: 'Get all tokenized assets', action: 'Get all assets' },
    { name: 'Get Asset', value: 'getAsset', description: 'Get specific asset details', action: 'Get asset' },
    { name: 'Create Asset', value: 'createAsset', description: 'Tokenize a new real-world asset', action: 'Create asset' },
    { name: 'Update Asset', value: 'updateAsset', description: 'Update asset information', action: 'Update asset' },
    { name: 'Delete Asset', value: 'deleteAsset', description: 'Remove asset from pool', action: 'Delete asset' },
    { name: 'Get Asset Valuation', value: 'getAssetValuation', description: 'Get current asset valuation', action: 'Get asset valuation' },
    { name: 'Finance Asset', value: 'financeAsset', description: 'Create financing for asset', action: 'Finance asset' },
  ],
  default: 'getAllAssets',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['investment'] } },
  options: [
    { name: 'Get All Investments', value: 'getAllInvestments', description: 'Get all investments', action: 'Get all investments' },
    { name: 'Get Investment', value: 'getInvestment', description: 'Get specific investment details', action: 'Get an investment' },
    { name: 'Create Investment', value: 'createInvestment', description: 'Make new investment in pool', action: 'Create an investment' },
    { name: 'Update Investment', value: 'updateInvestment', description: 'Update investment parameters', action: 'Update an investment' },
    { name: 'Cancel Investment', value: 'cancelInvestment', description: 'Cancel pending investment', action: 'Cancel an investment' },
    { name: 'Redeem Investment', value: 'redeemInvestment', description: 'Redeem investment tokens', action: 'Redeem an investment' },
    { name: 'Get Investment Returns', value: 'getInvestmentReturns', description: 'Get investment performance data', action: 'Get investment returns' }
  ],
  default: 'getAllInvestments',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['loan'] } },
  options: [
    { name: 'Get All Loans', value: 'getAllLoans', description: 'Get all loans in the system', action: 'Get all loans' },
    { name: 'Get Loan', value: 'getLoan', description: 'Get specific loan details', action: 'Get loan' },
    { name: 'Create Loan', value: 'createLoan', description: 'Originate a new loan', action: 'Create loan' },
    { name: 'Update Loan', value: 'updateLoan', description: 'Update loan terms or status', action: 'Update loan' },
    { name: 'Delete Loan', value: 'deleteLoan', description: 'Cancel or remove loan', action: 'Delete loan' },
    { name: 'Repay Loan', value: 'repayLoan', description: 'Make loan repayment', action: 'Repay loan' },
    { name: 'Get Loan Schedule', value: 'getLoanSchedule', description: 'Get loan repayment schedule', action: 'Get loan schedule' }
  ],
  default: 'getAllLoans',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['token'] } },
  options: [
    { name: 'Get All Tokens', value: 'getAllTokens', description: 'Get all tokens', action: 'Get all tokens' },
    { name: 'Get Token', value: 'getToken', description: 'Get specific token information', action: 'Get a token' },
    { name: 'Mint Tokens', value: 'mintTokens', description: 'Mint new tokens', action: 'Mint tokens' },
    { name: 'Burn Tokens', value: 'burnTokens', description: 'Burn existing tokens', action: 'Burn tokens' },
    { name: 'Transfer Tokens', value: 'transferTokens', description: 'Transfer tokens between addresses', action: 'Transfer tokens' },
    { name: 'Get Token Balance', value: 'getTokenBalance', description: 'Get token balance for address', action: 'Get token balance' },
    { name: 'Get Token Price', value: 'getTokenPrice', description: 'Get current token price', action: 'Get token price' }
  ],
  default: 'getAllTokens',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['governance'] } },
	options: [
		{ name: 'Get All Proposals', value: 'getAllProposals', description: 'Get all governance proposals', action: 'Get all proposals' },
		{ name: 'Get Proposal', value: 'getProposal', description: 'Get specific proposal details', action: 'Get proposal' },
		{ name: 'Create Proposal', value: 'createProposal', description: 'Submit new governance proposal', action: 'Create proposal' },
		{ name: 'Update Proposal', value: 'updateProposal', description: 'Update proposal before voting starts', action: 'Update proposal' },
		{ name: 'Vote on Proposal', value: 'voteOnProposal', description: 'Cast vote on proposal', action: 'Vote on proposal' },
		{ name: 'Get Proposal Votes', value: 'getProposalVotes', description: 'Get voting results', action: 'Get proposal votes' },
		{ name: 'Get Voting Power', value: 'getVotingPower', description: 'Get voting power for address', action: 'Get voting power' },
	],
	default: 'getAllProposals',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['pools'],
    },
  },
  options: [
    {
      name: 'Get Pools',
      value: 'getPools',
      description: 'List all available pools',
      action: 'Get pools',
    },
    {
      name: 'Get Pool',
      value: 'getPool',
      description: 'Get specific pool details',
      action: 'Get pool',
    },
    {
      name: 'Create Pool',
      value: 'createPool',
      description: 'Create a new pool',
      action: 'Create pool',
    },
    {
      name: 'Update Pool',
      value: 'updatePool',
      description: 'Update pool configuration',
      action: 'Update pool',
    },
    {
      name: 'Get Pool Tranches',
      value: 'getPoolTranches',
      description: 'Get pool tranches',
      action: 'Get pool tranches',
    },
    {
      name: 'Get Pool NAV',
      value: 'getPoolNav',
      description: 'Get pool net asset value',
      action: 'Get pool NAV',
    },
  ],
  default: 'getPools',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['assets'],
    },
  },
  options: [
    {
      name: 'Get Assets',
      value: 'getAssets',
      description: 'List tokenized assets',
      action: 'Get assets',
    },
    {
      name: 'Get Asset',
      value: 'getAsset',
      description: 'Get specific asset details',
      action: 'Get asset',
    },
    {
      name: 'Create Asset',
      value: 'createAsset',
      description: 'Tokenize a new real-world asset',
      action: 'Create asset',
    },
    {
      name: 'Update Asset',
      value: 'updateAsset',
      description: 'Update asset information',
      action: 'Update asset',
    },
    {
      name: 'Delete Asset',
      value: 'deleteAsset',
      description: 'Remove asset from pool',
      action: 'Delete asset',
    },
    {
      name: 'Get Asset Valuations',
      value: 'getAssetValuations',
      description: 'Get asset valuation history',
      action: 'Get asset valuations',
    },
    {
      name: 'Create Asset Valuation',
      value: 'createAssetValuation',
      description: 'Add new asset valuation',
      action: 'Create asset valuation',
    },
  ],
  default: 'getAssets',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['investments'],
    },
  },
  options: [
    {
      name: 'Get Investments',
      value: 'getInvestments',
      description: 'List investor positions',
      action: 'Get investments',
    },
    {
      name: 'Get Investment',
      value: 'getInvestment',
      description: 'Get specific investment details',
      action: 'Get investment',
    },
    {
      name: 'Create Deposit',
      value: 'createDeposit',
      description: 'Process investment deposit',
      action: 'Create deposit',
    },
    {
      name: 'Create Withdrawal',
      value: 'createWithdrawal',
      description: 'Process investment withdrawal',
      action: 'Create withdrawal',
    },
    {
      name: 'Get Investment Returns',
      value: 'getInvestmentReturns',
      description: 'Get investment performance',
      action: 'Get investment returns',
    },
    {
      name: 'Get Investment Orders',
      value: 'getInvestmentOrders',
      description: 'Get pending orders',
      action: 'Get investment orders',
    },
  ],
  default: 'getInvestments',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['loans'],
    },
  },
  options: [
    {
      name: 'Get Loans',
      value: 'getLoans',
      description: 'List all loans',
      action: 'Get loans',
    },
    {
      name: 'Get Loan',
      value: 'getLoan',
      description: 'Get specific loan details',
      action: 'Get loan',
    },
    {
      name: 'Create Loan',
      value: 'createLoan',
      description: 'Originate a new loan',
      action: 'Create loan',
    },
    {
      name: 'Update Loan',
      value: 'updateLoan',
      description: 'Update loan terms',
      action: 'Update loan',
    },
    {
      name: 'Repay Loan',
      value: 'repayLoan',
      description: 'Process loan repayment',
      action: 'Repay loan',
    },
    {
      name: 'Get Loan Schedule',
      value: 'getLoanSchedule',
      description: 'Get repayment schedule',
      action: 'Get loan schedule',
    },
    {
      name: 'Get Loan Payments',
      value: 'getLoanPayments',
      description: 'Get payment history',
      action: 'Get loan payments',
    },
  ],
  default: 'getLoans',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'List transaction history',
      action: 'Get transactions',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get specific transaction details',
      action: 'Get transaction',
    },
    {
      name: 'Get Transaction Status',
      value: 'getTransactionStatus',
      description: 'Check transaction confirmation status',
      action: 'Get transaction status',
    },
    {
      name: 'Estimate Transaction Fee',
      value: 'estimateTransactionFee',
      description: 'Estimate gas fees for operations',
      action: 'Estimate transaction fee',
    },
  ],
  default: 'getTransactions',
},
      // Parameter definitions
{
  displayName: 'Chain ID',
  name: 'chainId',
  type: 'options',
  displayOptions: { show: { resource: ['pool'], operation: ['getAllPools', 'getPool'] } },
  options: [
    { name: 'Centrifuge Chain', value: 'centrifuge' },
    { name: 'Ethereum', value: 'ethereum' },
  ],
  default: 'centrifuge',
  description: 'The blockchain network to query',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: { show: { resource: ['pool'], operation: ['getAllPools'] } },
  options: [
    { name: 'All', value: '' },
    { name: 'Active', value: 'active' },
    { name: 'Closed', value: 'closed' },
    { name: 'Upcoming', value: 'upcoming' },
  ],
  default: '',
  description: 'Filter pools by status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['pool'], operation: ['getAllPools'] } },
  default: 50,
  description: 'Maximum number of pools to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: { show: { resource: ['pool'], operation: ['getAllPools'] } },
  default: 0,
  description: 'Number of pools to skip',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['pool'], operation: ['getPool', 'updatePool', 'deletePool', 'getPoolTranches', 'getPoolNav'] } },
  default: '',
  description: 'The unique identifier of the pool',
},
{
  displayName: 'Chain ID',
  name: 'chainId',
  type: 'options',
  displayOptions: { show: { resource: ['pool'], operation: ['getPool'] } },
  options: [
    { name: 'Centrifuge Chain', value: 'centrifuge' },
    { name: 'Ethereum', value: 'ethereum' },
  ],
  default: 'centrifuge',
  description: 'The blockchain network to query',
},
{
  displayName: 'Pool Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['pool'], operation: ['createPool', 'updatePool'] } },
  default: '',
  description: 'The name of the pool',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  displayOptions: { show: { resource: ['pool'], operation: ['createPool', 'updatePool'] } },
  default: '',
  description: 'Description of the pool',
},
{
  displayName: 'Asset Class',
  name: 'assetClass',
  type: 'options',
  required: true,
  displayOptions: { show: { resource: ['pool'], operation: ['createPool'] } },
  options: [
    { name: 'Real Estate', value: 'real_estate' },
    { name: 'Trade Finance', value: 'trade_finance' },
    { name: 'Consumer Finance', value: 'consumer_finance' },
    { name: 'Carbon Credits', value: 'carbon_credits' },
    { name: 'Other', value: 'other' },
  ],
  default: 'real_estate',
  description: 'The asset class of the pool',
},
{
  displayName: 'Max Reserve',
  name: 'maxReserve',
  type: 'number',
  displayOptions: { show: { resource: ['pool'], operation: ['createPool', 'updatePool'] } },
  default: 0,
  description: 'Maximum reserve amount for the pool',
},
{
  displayName: 'Date',
  name: 'date',
  type: 'dateTime',
  displayOptions: { show: { resource: ['pool'], operation: ['getPoolNav'] } },
  default: '',
  description: 'Date for NAV calculation (optional, defaults to latest)',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['getAllAssets', 'createAsset'] } },
  default: '',
  description: 'The pool identifier',
},
{
  displayName: 'Asset Type',
  name: 'assetType',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['getAllAssets', 'createAsset'] } },
  default: '',
  description: 'Filter by asset type or specify asset type for creation',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['getAllAssets'] } },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['getAllAssets'] } },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['getAsset', 'updateAsset', 'deleteAsset', 'getAssetValuation', 'financeAsset'] } },
  default: '',
  description: 'The asset identifier',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'number',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset'] } },
  default: 0,
  description: 'Asset value in base currency',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'number',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['updateAsset'] } },
  default: 0,
  description: 'Updated asset value in base currency',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset', 'updateAsset'] } },
  default: '{}',
  description: 'Additional metadata for the asset as JSON object',
},
{
  displayName: 'Date',
  name: 'date',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['getAssetValuation'] } },
  default: '',
  description: 'Specific date for valuation (YYYY-MM-DD format)',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['financeAsset'] } },
  default: 0,
  description: 'Financing amount',
},
{
  displayName: 'Terms',
  name: 'terms',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['asset'], operation: ['financeAsset'] } },
  default: '{}',
  description: 'Financing terms as JSON object',
},
{
  displayName: 'Chain ID',
  name: 'chainId',
  type: 'options',
  required: true,
  displayOptions: { show: { resource: ['asset'] } },
  options: [
    { name: 'Centrifuge Chain', value: 'centrifuge', description: 'Centrifuge native chain' },
    { name: 'Ethereum', value: 'ethereum', description: 'Ethereum mainnet' },
  ],
  default: 'centrifuge',
  description: 'Blockchain network to interact with',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  default: '',
  description: 'ID of the pool to get investments for',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getAllInvestments', 'createInvestment']
    }
  }
},
{
  displayName: 'Investor ID',
  name: 'investorId',
  type: 'string',
  default: '',
  description: 'ID of the investor to filter by',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getAllInvestments']
    }
  }
},
{
  displayName: 'Tranche',
  name: 'tranche',
  type: 'string',
  default: '',
  description: 'Tranche to filter or invest in',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getAllInvestments', 'createInvestment']
    }
  }
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  default: 50,
  description: 'Number of results to return',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getAllInvestments']
    }
  }
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  default: 0,
  description: 'Number of results to skip',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getAllInvestments']
    }
  }
},
{
  displayName: 'Investment ID',
  name: 'investmentId',
  type: 'string',
  required: true,
  default: '',
  description: 'ID of the investment',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getInvestment', 'updateInvestment', 'cancelInvestment', 'redeemInvestment', 'getInvestmentReturns']
    }
  }
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  default: '',
  description: 'Investment amount',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['createInvestment', 'updateInvestment', 'redeemInvestment']
    }
  }
},
{
  displayName: 'Currency',
  name: 'currency',
  type: 'string',
  default: 'USD',
  description: 'Currency for the investment',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['createInvestment']
    }
  }
},
{
  displayName: 'Period',
  name: 'period',
  type: 'options',
  options: [
    { name: '1 Day', value: '1d' },
    { name: '1 Week', value: '1w' },
    { name: '1 Month', value: '1m' },
    { name: '3 Months', value: '3m' },
    { name: '6 Months', value: '6m' },
    { name: '1 Year', value: '1y' },
    { name: 'All Time', value: 'all' }
  ],
  default: '1m',
  description: 'Time period for returns data',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getInvestmentReturns']
    }
  }
},
{
  displayName: 'Chain ID',
  name: 'chainId',
  type: 'options',
  options: [
    { name: 'Centrifuge Chain', value: 'centrifuge' },
    { name: 'Ethereum', value: 'ethereum' }
  ],
  default: 'centrifuge',
  description: 'Blockchain network to operate on',
  displayOptions: {
    show: {
      resource: ['investment'],
      operation: ['getAllInvestments', 'getInvestment', 'createInvestment', 'updateInvestment', 'cancelInvestment', 'redeemInvestment', 'getInvestmentReturns']
    }
  }
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  displayOptions: { show: { resource: ['loan'], operation: ['getAllLoans'] } },
  default: '',
  description: 'Filter loans by pool ID',
},
{
  displayName: 'Borrower ID',
  name: 'borrowerId',
  type: 'string',
  displayOptions: { show: { resource: ['loan'], operation: ['getAllLoans', 'createLoan'] } },
  default: '',
  description: 'Filter loans by borrower ID or specify borrower for new loan',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: { show: { resource: ['loan'], operation: ['getAllLoans', 'updateLoan'] } },
  options: [
    { name: 'Active', value: 'active' },
    { name: 'Pending', value: 'pending' },
    { name: 'Paid Off', value: 'paid_off' },
    { name: 'Defaulted', value: 'defaulted' },
    { name: 'Cancelled', value: 'cancelled' }
  ],
  default: 'active',
  description: 'Loan status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['loan'], operation: ['getAllLoans'] } },
  typeOptions: { minValue: 1, maxValue: 100 },
  default: 50,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: { show: { resource: ['loan'], operation: ['getAllLoans'] } },
  typeOptions: { minValue: 0 },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Loan ID',
  name: 'loanId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['loan'], operation: ['getLoan', 'updateLoan', 'deleteLoan', 'repayLoan', 'getLoanSchedule'] } },
  default: '',
  description: 'The ID of the loan',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['loan'], operation: ['createLoan'] } },
  default: '',
  description: 'The ID of the asset to be financed',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['loan'], operation: ['createLoan', 'repayLoan'] } },
  default: '',
  description: 'Loan amount or repayment amount',
},
{
  displayName: 'Interest Rate',
  name: 'interestRate',
  type: 'number',
  displayOptions: { show: { resource: ['loan'], operation: ['createLoan', 'updateLoan'] } },
  typeOptions: { numberPrecision: 4, minValue: 0, maxValue: 100 },
  default: 0,
  description: 'Interest rate as a percentage',
},
{
  displayName: 'Term',
  name: 'term',
  type: 'number',
  required: true,
  displayOptions: { show: { resource: ['loan'], operation: ['createLoan'] } },
  typeOptions: { minValue: 1 },
  default: 12,
  description: 'Loan term in months',
},
{
  displayName: 'Payment Type',
  name: 'paymentType',
  type: 'options',
  displayOptions: { show: { resource: ['loan'], operation: ['repayLoan'] } },
  options: [
    { name: 'Principal', value: 'principal' },
    { name: 'Interest', value: 'interest' },
    { name: 'Full Payment', value: 'full' }
  ],
  default: 'principal',
  description: 'Type of payment being made',
},
{
  displayName: 'Chain ID',
  name: 'chainId',
  type: 'options',
  displayOptions: { show: { resource: ['loan'] } },
  options: [
    { name: 'Centrifuge Chain', value: 'centrifuge' },
    { name: 'Ethereum', value: 'ethereum' }
  ],
  default: 'centrifuge',
  description: 'Blockchain network to use',
},
{
  displayName: 'Token Type',
  name: 'tokenType',
  type: 'options',
  displayOptions: { show: { resource: ['token'], operation: ['getAllTokens'] } },
  options: [
    { name: 'CFG', value: 'cfg' },
    { name: 'Tranche Token', value: 'tranche' },
    { name: 'All', value: 'all' }
  ],
  default: 'all',
  description: 'Type of token to filter by',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['getAllTokens', 'mintTokens'] } },
  default: '',
  description: 'Pool ID to filter tokens by',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['token'], operation: ['getAllTokens'] } },
  default: 10,
  description: 'Number of tokens to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: { show: { resource: ['token'], operation: ['getAllTokens'] } },
  default: 0,
  description: 'Number of tokens to skip',
},
{
  displayName: 'Token ID',
  name: 'tokenId',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['getToken', 'burnTokens', 'transferTokens', 'getTokenBalance', 'getTokenPrice'] } },
  default: '',
  required: true,
  description: 'The ID of the token',
},
{
  displayName: 'Token Type',
  name: 'tokenType',
  type: 'options',
  displayOptions: { show: { resource: ['token'], operation: ['mintTokens'] } },
  options: [
    { name: 'CFG', value: 'cfg' },
    { name: 'Tranche Token', value: 'tranche' }
  ],
  default: 'cfg',
  required: true,
  description: 'Type of token to mint',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['mintTokens', 'burnTokens', 'transferTokens'] } },
  default: '',
  required: true,
  description: 'Amount of tokens to mint, burn, or transfer',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['mintTokens'] } },
  default: '',
  required: true,
  description: 'Address to receive the minted tokens',
},
{
  displayName: 'From Address',
  name: 'from',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['transferTokens'] } },
  default: '',
  required: true,
  description: 'Address to transfer tokens from',
},
{
  displayName: 'To Address',
  name: 'to',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['transferTokens'] } },
  default: '',
  required: true,
  description: 'Address to transfer tokens to',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  displayOptions: { show: { resource: ['token'], operation: ['getTokenBalance'] } },
  default: '',
  required: true,
  description: 'Address to check token balance for',
},
{
  displayName: 'Chain ID',
  name: 'chainId',
  type: 'options',
  displayOptions: { show: { resource: ['token'], operation: ['getAllTokens', 'getToken', 'mintTokens', 'burnTokens', 'transferTokens', 'getTokenBalance', 'getTokenPrice'] } },
  options: [
    { name: 'Centrifuge Chain', value: 'centrifuge' },
    { name: 'Ethereum', value: 'ethereum' }
  ],
  default: 'centrifuge',
  description: 'Blockchain network to use',
},
{
	displayName: 'Status',
	name: 'status',
	type: 'options',
	options: [
		{ name: 'Active', value: 'active' },
		{ name: 'Pending', value: 'pending' },
		{ name: 'Executed', value: 'executed' },
		{ name: 'Failed', value: 'failed' },
		{ name: 'All', value: '' },
	],
	default: '',
	description: 'Filter proposals by status',
	displayOptions: { show: { resource: ['governance'], operation: ['getAllProposals'] } },
},
{
	displayName: 'Type',
	name: 'type',
	type: 'options',
	options: [
		{ name: 'Treasury', value: 'treasury' },
		{ name: 'Runtime Upgrade', value: 'runtime_upgrade' },
		{ name: 'Parameter Change', value: 'parameter_change' },
		{ name: 'Council Motion', value: 'council_motion' },
		{ name: 'All', value: '' },
	],
	default: '',
	description: 'Filter proposals by type',
	displayOptions: { show: { resource: ['governance'], operation: ['getAllProposals'] } },
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 50,
	description: 'Maximum number of proposals to return',
	displayOptions: { show: { resource: ['governance'], operation: ['getAllProposals'] } },
},
{
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	default: 0,
	description: 'Number of proposals to skip',
	displayOptions: { show: { resource: ['governance'], operation: ['getAllProposals'] } },
},
{
	displayName: 'Proposal ID',
	name: 'proposalId',
	type: 'string',
	required: true,
	default: '',
	description: 'ID of the proposal',
	displayOptions: { show: { resource: ['governance'], operation: ['getProposal', 'updateProposal', 'voteOnProposal', 'getProposalVotes'] } },
},
{
	displayName: 'Title',
	name: 'title',
	type: 'string',
	required: true,
	default: '',
	description: 'Title of the proposal',
	displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
},
{
	displayName: 'Description',
	name: 'description',
	type: 'string',
	required: true,
	typeOptions: { rows: 4 },
	default: '',
	description: 'Description of the proposal',
	displayOptions: { show: { resource: ['governance'], operation: ['createProposal', 'updateProposal'] } },
},
{
	displayName: 'Proposal Type',
	name: 'proposalType',
	type: 'options',
	required: true,
	options: [
		{ name: 'Treasury', value: 'treasury' },
		{ name: 'Runtime Upgrade', value: 'runtime_upgrade' },
		{ name: 'Parameter Change', value: 'parameter_change' },
		{ name: 'Council Motion', value: 'council_motion' },
	],
	default: 'treasury',
	description: 'Type of the proposal',
	displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
},
{
	displayName: 'Actions',
	name: 'actions',
	type: 'json',
	required: true,
	default: '[]',
	description: 'Proposal actions as JSON array',
	displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
},
{
	displayName: 'Vote',
	name: 'vote',
	type: 'options',
	required: true,
	options: [
		{ name: 'Aye', value: 'aye' },
		{ name: 'Nay', value: 'nay' },
		{ name: 'Abstain', value: 'abstain' },
	],
	default: 'aye',
	description: 'Vote choice',
	displayOptions: { show: { resource: ['governance'], operation: ['voteOnProposal'] } },
},
{
	displayName: 'Voting Power',
	name: 'votingPower',
	type: 'number',
	default: 1,
	description: 'Amount of voting power to use',
	displayOptions: { show: { resource: ['governance'], operation: ['voteOnProposal'] } },
},
{
	displayName: 'Address',
	name: 'address',
	type: 'string',
	required: true,
	default: '',
	description: 'Address to check voting power for',
	displayOptions: { show: { resource: ['governance'], operation: ['getVotingPower'] } },
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPools'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Closed',
      value: 'closed',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: '',
  description: 'Filter pools by status',
},
{
  displayName: 'Asset Class',
  name: 'assetClass',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPools'],
    },
  },
  default: '',
  description: 'Filter pools by asset class',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPools'],
    },
  },
  default: 50,
  description: 'Number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPools'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPool'],
    },
  },
  default: '',
  description: 'The unique identifier of the pool',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['updatePool'],
    },
  },
  default: '',
  description: 'The unique identifier of the pool to update',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPoolTranches'],
    },
  },
  default: '',
  description: 'The unique identifier of the pool',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPoolNav'],
    },
  },
  default: '',
  description: 'The unique identifier of the pool',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['createPool'],
    },
  },
  default: '',
  description: 'The name of the pool',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['updatePool'],
    },
  },
  default: '',
  description: 'The updated name of the pool',
},
{
  displayName: 'Asset Class',
  name: 'assetClass',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['createPool'],
    },
  },
  default: '',
  description: 'The asset class for the pool',
},
{
  displayName: 'Currency',
  name: 'currency',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['createPool'],
    },
  },
  default: 'USD',
  description: 'The base currency for the pool',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['createPool'],
    },
  },
  default: '{}',
  description: 'Additional metadata for the pool',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['updatePool'],
    },
  },
  default: '{}',
  description: 'Updated metadata for the pool',
},
{
  displayName: 'Status',
  name: 'updateStatus',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['updatePool'],
    },
  },
  options: [
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Closed',
      value: 'closed',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'active',
  description: 'The updated status of the pool',
},
{
  displayName: 'Date',
  name: 'date',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['pools'],
      operation: ['getPoolNav'],
    },
  },
  default: '',
  description: 'Specific date for NAV calculation (optional)',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'createAsset'],
    },
  },
  default: '',
  description: 'ID of the pool to filter assets',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'updateAsset'],
    },
  },
  options: [
    { name: 'Active', value: 'active' },
    { name: 'Pending', value: 'pending' },
    { name: 'Inactive', value: 'inactive' },
  ],
  default: 'active',
  description: 'Status of the asset',
},
{
  displayName: 'Asset Type',
  name: 'assetType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'createAsset'],
    },
  },
  options: [
    { name: 'Real Estate', value: 'real_estate' },
    { name: 'Invoice', value: 'invoice' },
    { name: 'Equipment', value: 'equipment' },
    { name: 'Art', value: 'art' },
    { name: 'Other', value: 'other' },
  ],
  default: 'real_estate',
  description: 'Type of the asset',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  typeOptions: {
    minValue: 1,
    maxValue: 1000,
  },
  default: 50,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  typeOptions: {
    minValue: 0,
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAsset', 'updateAsset', 'deleteAsset', 'getAssetValuations', 'createAssetValuation'],
    },
  },
  default: '',
  description: 'Unique identifier of the asset',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['createAsset', 'updateAsset', 'createAssetValuation'],
    },
  },
  typeOptions: {
    minValue: 0,
  },
  default: 0,
  description: 'Asset value in base currency',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['createAsset', 'updateAsset'],
    },
  },
  default: '{}',
  description: 'Additional metadata for the asset',
},
{
  displayName: 'Documents',
  name: 'documents',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['createAsset'],
    },
  },
  default: '[]',
  description: 'Array of document URLs or references',
},
{
  displayName: 'From Date',
  name: 'fromDate',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetValuations'],
    },
  },
  default: '',
  description: 'Start date for valuation history',
},
{
  displayName: 'To Date',
  name: 'toDate',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetValuations'],
    },
  },
  default: '',
  description: 'End date for valuation history',
},
{
  displayName: 'Date',
  name: 'date',
  type: 'dateTime',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['createAssetValuation'],
    },
  },
  default: '',
  description: 'Date of the valuation',
},
{
  displayName: 'Appraiser',
  name: 'appraiser',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['createAssetValuation'],
    },
  },
  default: '',
  description: 'Name or ID of the appraiser',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestments', 'createDeposit', 'createWithdrawal', 'getInvestmentOrders'],
    },
  },
  default: '',
  description: 'Filter by pool ID',
},
{
  displayName: 'Investor Address',
  name: 'investorAddress',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestments', 'getInvestmentOrders'],
    },
  },
  default: '',
  description: 'Filter by investor address',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    { name: 'Active', value: 'active' },
    { name: 'Pending', value: 'pending' },
    { name: 'Completed', value: 'completed' },
    { name: 'Cancelled', value: 'cancelled' },
  ],
  required: false,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestments', 'getInvestmentOrders'],
    },
  },
  default: '',
  description: 'Filter by investment status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestments'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestments'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Investment ID',
  name: 'investmentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestment', 'getInvestmentReturns'],
    },
  },
  default: '',
  description: 'The unique identifier of the investment',
},
{
  displayName: 'Tranche ID',
  name: 'trancheId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['createDeposit', 'createWithdrawal'],
    },
  },
  default: '',
  description: 'The tranche ID for the investment',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['createDeposit', 'createWithdrawal'],
    },
  },
  default: '',
  description: 'The amount to deposit or withdraw',
},
{
  displayName: 'Investor Address',
  name: 'investorAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['createDeposit', 'createWithdrawal'],
    },
  },
  default: '',
  description: 'The wallet address of the investor',
},
{
  displayName: 'Period',
  name: 'period',
  type: 'options',
  options: [
    { name: 'Daily', value: 'daily' },
    { name: 'Weekly', value: 'weekly' },
    { name: 'Monthly', value: 'monthly' },
    { name: 'Quarterly', value: 'quarterly' },
    { name: 'Yearly', value: 'yearly' },
  ],
  required: false,
  displayOptions: {
    show: {
      resource: ['investments'],
      operation: ['getInvestmentReturns'],
    },
  },
  default: 'monthly',
  description: 'Time period for returns calculation',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoans', 'createLoan'],
    },
  },
  default: '',
  description: 'The ID of the pool to filter loans or create loan in',
},
{
  displayName: 'Borrower Address',
  name: 'borrowerAddress',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoans', 'createLoan'],
    },
  },
  default: '',
  description: 'The wallet address of the borrower',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Paid',
      value: 'paid',
    },
    {
      name: 'Default',
      value: 'default',
    },
  ],
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoans', 'updateLoan'],
    },
  },
  default: '',
  description: 'Filter loans by status or update loan status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoans'],
    },
  },
  default: 100,
  description: '