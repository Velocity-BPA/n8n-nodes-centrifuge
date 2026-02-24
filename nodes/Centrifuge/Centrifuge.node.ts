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
        default: 'pools',
      },
      // Operation dropdowns per resource
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
  description: 'Maximum number of loans to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoans'],
    },
  },
  default: 0,
  description: 'Number of loans to skip',
},
{
  displayName: 'Loan ID',
  name: 'loanId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoan', 'updateLoan', 'repayLoan', 'getLoanSchedule', 'getLoanPayments'],
    },
  },
  default: '',
  description: 'The ID of the loan',
},
{
  displayName: 'Principal',
  name: 'principal',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['createLoan'],
    },
  },
  default: '',
  description: 'The principal amount of the loan',
},
{
  displayName: 'Interest Rate',
  name: 'interestRate',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['createLoan', 'updateLoan'],
    },
  },
  default: '',
  description: 'The interest rate for the loan (as percentage)',
},
{
  displayName: 'Term',
  name: 'term',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['createLoan', 'updateLoan'],
    },
  },
  default: 12,
  description: 'The term of the loan in months',
},
{
  displayName: 'Collateral Asset ID',
  name: 'collateralAssetId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['createLoan'],
    },
  },
  default: '',
  description: 'The ID of the asset used as collateral',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['repayLoan'],
    },
  },
  default: '',
  description: 'The amount to repay',
},
{
  displayName: 'Repayment Type',
  name: 'repaymentType',
  type: 'options',
  options: [
    {
      name: 'Principal',
      value: 'principal',
    },
    {
      name: 'Interest',
      value: 'interest',
    },
    {
      name: 'Full',
      value: 'full',
    },
  ],
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['repayLoan'],
    },
  },
  default: 'principal',
  description: 'The type of repayment',
},
{
  displayName: 'From Date',
  name: 'fromDate',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoanPayments'],
    },
  },
  default: '',
  description: 'Start date for payment history filter',
},
{
  displayName: 'To Date',
  name: 'toDate',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['loans'],
      operation: ['getLoanPayments'],
    },
  },
  default: '',
  description: 'End date for payment history filter',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions', 'estimateTransactionFee'],
    },
  },
  default: '',
  description: 'The pool identifier',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: '',
  description: 'The wallet address to filter transactions',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  options: [
    { name: 'All', value: '' },
    { name: 'Invest', value: 'invest' },
    { name: 'Redeem', value: 'redeem' },
    { name: 'Transfer', value: 'transfer' },
    { name: 'Pool Management', value: 'pool_management' },
  ],
  default: '',
  description: 'The transaction type to filter by',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  options: [
    { name: 'All', value: '' },
    { name: 'Pending', value: 'pending' },
    { name: 'Confirmed', value: 'confirmed' },
    { name: 'Failed', value: 'failed' },
  ],
  default: '',
  description: 'The transaction status to filter by',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: 50,
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: 0,
  typeOptions: {
    minValue: 0,
  },
  description: 'Number of transactions to skip',
},
{
  displayName: 'Transaction Hash',
  name: 'txHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction', 'getTransactionStatus'],
    },
  },
  default: '',
  description: 'The transaction hash to look up',
},
{
  displayName: 'Operation Type',
  name: 'operationType',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['estimateTransactionFee'],
    },
  },
  options: [
    { name: 'Invest', value: 'invest' },
    { name: 'Redeem', value: 'redeem' },
    { name: 'Transfer', value: 'transfer' },
    { name: 'Pool Management', value: 'pool_management' },
  ],
  default: 'invest',
  description: 'The type of operation to estimate fees for',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['estimateTransactionFee'],
    },
  },
  default: '',
  description: 'The amount for the operation (optional for fee estimation)',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'pools':
        return [await executePoolsOperations.call(this, items)];
      case 'assets':
        return [await executeAssetsOperations.call(this, items)];
      case 'investments':
        return [await executeInvestmentsOperations.call(this, items)];
      case 'loans':
        return [await executeLoansOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executePoolsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('centrifugeApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getPools': {
          const status = this.getNodeParameter('status', i) as string;
          const assetClass = this.getNodeParameter('assetClass', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = {};
          if (status) queryParams.status = status;
          if (assetClass) queryParams.assetClass = assetClass;
          queryParams.limit = limit;
          queryParams.offset = offset;

          const queryString = new URLSearchParams(queryParams).toString();
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/pools?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPool': {
          const poolId = this.getNodeParameter('poolId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/pools/${poolId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createPool': {
          const name = this.getNodeParameter('name', i) as string;
          const assetClass = this.getNodeParameter('assetClass', i) as string;
          const currency = this.getNodeParameter('currency', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as string;

          let parsedMetadata: any = {};
          try {
            parsedMetadata = JSON.parse(metadata);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in metadata: ${error.message}`);
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/pools`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              name,
              assetClass,
              currency,
              metadata: parsedMetadata,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updatePool': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const name = this.getNodeParameter('name', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as string;
          const updateStatus = this.getNodeParameter('updateStatus', i) as string;

          let parsedMetadata: any = {};
          try {
            parsedMetadata = JSON.parse(metadata);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in metadata: ${error.message}`);
          }

          const updateBody: any = {};
          if (name) updateBody.name = name;
          if (updateStatus) updateBody.status = updateStatus;
          if (metadata && metadata !== '{}') updateBody.metadata = parsedMetadata;

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/pools/${poolId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: updateBody,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPoolTranches': {
          const poolId = this.getNodeParameter('poolId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/pools/${poolId}/tranches`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPoolNav': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const date = this.getNodeParameter('date', i) as string;

          let url = `${credentials.baseUrl}/pools/${poolId}/nav`;
          if (date) {
            const queryParams = new URLSearchParams({ date }).toString();
            url += `?${queryParams}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        } else {
          throw new NodeOperationError(this.getNode(), error.message);
        }
      }
    }
  }

  return returnData;
}

async function executeAssetsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('centrifugeApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAssets': {
          const poolId = this.getNodeParameter('poolId', i, '') as string;
          const status = this.getNodeParameter('status', i, '') as string;
          const assetType = this.getNodeParameter('assetType', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;

          const queryParams = new URLSearchParams();
          if (poolId) queryParams.append('poolId', poolId);
          if (status) queryParams.append('status', status);
          if (assetType) queryParams.append('assetType', assetType);
          queryParams.append('limit', limit.toString());
          queryParams.append('offset', offset.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${assetId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createAsset': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const assetType = this.getNodeParameter('assetType', i) as string;
          const value = this.getNodeParameter('value', i) as number;
          const metadata = this.getNodeParameter('metadata', i, '{}') as string;
          const documents = this.getNodeParameter('documents', i, '[]') as string;

          let parsedMetadata: any = {};
          let parsedDocuments: any = [];

          try {
            parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid metadata JSON: ${error.message}`);
          }

          try {
            parsedDocuments = typeof documents === 'string' ? JSON.parse(documents) : documents;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid documents JSON: ${error.message}`);
          }

          const body = {
            poolId,
            assetType,
            value,
            metadata: parsedMetadata,
            documents: parsedDocuments,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/assets`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const value = this.getNodeParameter('value', i) as number;
          const metadata = this.getNodeParameter('metadata', i, '{}') as string;
          const status = this.getNodeParameter('status', i, '') as string;

          let parsedMetadata: any = {};

          try {
            parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid metadata JSON: ${error.message}`);
          }

          const body: any = {
            value,
            metadata: parsedMetadata,
          };

          if (status) {
            body.status = status;
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/assets/${assetId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/assets/${assetId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetValuations': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const fromDate = this.getNodeParameter('fromDate', i, '') as string;
          const toDate = this.getNodeParameter('toDate', i, '') as string;

          const queryParams = new URLSearchParams();
          if (fromDate) queryParams.append('fromDate', fromDate);
          if (toDate) queryParams.append('toDate', toDate);

          const queryString = queryParams.toString();
          const url = queryString 
            ? `${credentials.baseUrl}/assets/${assetId}/valuations?${queryString}`
            : `${credentials.baseUrl}/assets/${assetId}/valuations`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createAssetValuation': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const value = this.getNodeParameter('value', i) as number;
          const date = this.getNodeParameter('date', i) as string;
          const appraiser = this.getNodeParameter('appraiser', i) as string;

          const body = {
            value,
            date,
            appraiser,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/assets/${assetId}/valuations`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: {
          item: i,
        },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: {
            error: error.message,
          },
          pairedItem: {
            item: i,
          },
        });
        continue;
      }
      
      if (error.httpCode) {
        throw new NodeApiError(this.getNode(), error);
      }
      
      throw new NodeOperationError(this.getNode(), error.message);
    }
  }

  return returnData;
}

async function executeInvestmentsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('centrifugeApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getInvestments': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const investorAddress = this.getNodeParameter('investorAddress', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = {};
          if (poolId) queryParams.poolId = poolId;
          if (investorAddress) queryParams.investorAddress = investorAddress;
          if (status) queryParams.status = status;
          if (limit) queryParams.limit = limit.toString();
          if (offset) queryParams.offset = offset.toString();

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/investments${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getInvestment': {
          const investmentId = this.getNodeParameter('investmentId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/investments/${investmentId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createDeposit': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const trancheId = this.getNodeParameter('trancheId', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const investorAddress = this.getNodeParameter('investorAddress', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/investments/deposit`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              poolId,
              trancheId,
              amount,
              investorAddress,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createWithdrawal': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const trancheId = this.getNodeParameter('trancheId', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const investorAddress = this.getNodeParameter('investorAddress', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/investments/withdraw`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              poolId,
              trancheId,
              amount,
              investorAddress,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getInvestmentReturns': {
          const investmentId = this.getNodeParameter('investmentId', i) as string;
          const period = this.getNodeParameter('period', i) as string;

          const queryParams: any = {};
          if (period) queryParams.period = period;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/investments/${investmentId}/returns${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getInvestmentOrders': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const investorAddress = this.getNodeParameter('investorAddress', i) as string;
          const status = this.getNodeParameter('status', i) as string;

          const queryParams: any = {};
          if (poolId) queryParams.poolId = poolId;
          if (investorAddress) queryParams.investorAddress = investorAddress;
          if (status) queryParams.status = status;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/investments/orders${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
            itemIndex: i,
          });
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
        continue;
      }
      
      if (error.httpCode) {
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
      
      throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
    }
  }

  return returnData;
}

async function executeLoansOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('centrifugeApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getLoans': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const borrowerAddress = this.getNodeParameter('borrowerAddress', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          
          const params = new URLSearchParams();
          if (poolId) params.append('poolId', poolId);
          if (borrowerAddress) params.append('borrowerAddress', borrowerAddress);
          if (status) params.append('status', status);
          if (limit) params.append('limit', limit.toString());
          if (offset) params.append('offset', offset.toString());
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/loans?${params.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getLoan': {
          const loanId = this.getNodeParameter('loanId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/loans/${loanId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'createLoan': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const borrowerAddress = this.getNodeParameter('borrowerAddress', i) as string;
          const principal = this.getNodeParameter('principal', i) as string;
          const interestRate = this.getNodeParameter('interestRate', i) as string;
          const term = this.getNodeParameter('term', i) as number;
          const collateralAssetId = this.getNodeParameter('collateralAssetId', i) as string;
          
          const body: any = {
            poolId,
            borrowerAddress,
            principal,
            interestRate,
            term,
            collateralAssetId,
          };
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/loans`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updateLoan': {
          const loanId = this.getNodeParameter('loanId', i) as string;
          const interestRate = this.getNodeParameter('interestRate', i) as string;
          const term = this.getNodeParameter('term', i) as number;
          const status = this.getNodeParameter('status', i) as string;
          
          const body: any = {};
          if (interestRate) body.interestRate = interestRate;
          if (term) body.term = term;
          if (status) body.status = status;
          
          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/loans/${loanId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'repayLoan': {
          const loanId = this.getNodeParameter('loanId', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const repaymentType = this.getNodeParameter('repaymentType', i) as string;
          
          const body: any = {
            amount,
            repaymentType,
          };
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/loans/${loanId}/repay`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getLoanSchedule': {
          const loanId = this.getNodeParameter('loanId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/loans/${loanId}/schedule`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getLoanPayments': {
          const loanId = this.getNodeParameter('loanId', i) as string;
          const fromDate = this.getNodeParameter('fromDate', i) as string;
          const toDate = this.getNodeParameter('toDate', i) as string;
          
          const params = new URLSearchParams();
          if (fromDate) params.append('fromDate', fromDate);
          if (toDate) params.append('toDate', toDate);
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/loans/${loanId}/payments?${params.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }
  
  return returnData;
}

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('centrifugeApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTransactions': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const type = this.getNodeParameter('type', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = {
            limit: limit,
            offset: offset,
          };

          if (poolId) queryParams.poolId = poolId;
          if (address) queryParams.address = address;
          if (type) queryParams.type = type;
          if (status) queryParams.status = status;

          const queryString = new URLSearchParams(queryParams).toString();

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransaction': {
          const txHash = this.getNodeParameter('txHash', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${txHash}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactionStatus': {
          const txHash = this.getNodeParameter('txHash', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${txHash}/status`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'estimateTransactionFee': {
          const operationType = this.getNodeParameter('operationType', i) as string;
          const poolId = this.getNodeParameter('poolId', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const body: any = {
            operation: operationType,
          };

          if (poolId) body.poolId = poolId;
          if (amount) body.amount = amount;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions/estimate`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
            { itemIndex: i },
          );
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
    }
  }

  return returnData;
}
