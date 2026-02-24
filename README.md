# n8n-nodes-centrifuge

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides seamless integration with Centrifuge, the decentralized protocol for real-world asset financing. With 5 comprehensive resources (Pools, Assets, Investments, Loans, Transactions), it enables automated workflows for DeFi asset management, pool monitoring, and investment tracking.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Centrifuge](https://img.shields.io/badge/Centrifuge-Protocol-orange)
![DeFi](https://img.shields.io/badge/DeFi-Ready-green)
![RWA](https://img.shields.io/badge/Real%20World%20Assets-supported-purple)

## Features

- **Pool Management** - Create, monitor, and analyze Centrifuge asset pools with comprehensive metrics
- **Asset Operations** - Track real-world assets, their tokenization status, and valuation data
- **Investment Tracking** - Monitor investment positions, returns, and portfolio performance across pools
- **Loan Processing** - Manage loan origination, repayment schedules, and default monitoring
- **Transaction Analysis** - Query and analyze on-chain transactions with detailed filtering options
- **Automated Workflows** - Build sophisticated DeFi automation with real-world asset backing
- **Multi-Chain Support** - Compatible with Ethereum mainnet and Centrifuge parachain operations
- **Real-time Data** - Access live protocol data for immediate decision making

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-centrifuge`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-centrifuge
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-centrifuge.git
cd n8n-nodes-centrifuge
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-centrifuge
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Centrifuge API key for authenticated requests | Yes |
| Environment | Select production or sandbox environment | Yes |
| Network | Choose Ethereum mainnet or Centrifuge parachain | Yes |

## Resources & Operations

### 1. Pools

| Operation | Description |
|-----------|-------------|
| Get Pool | Retrieve detailed information about a specific pool |
| List Pools | Get all available pools with filtering options |
| Get Pool Metrics | Fetch performance metrics and analytics for a pool |
| Get Pool Assets | List all assets within a specific pool |
| Monitor Pool | Set up monitoring for pool status changes |

### 2. Assets

| Operation | Description |
|-----------|-------------|
| Get Asset | Retrieve detailed asset information and metadata |
| List Assets | Get all assets with filtering by type, status, or pool |
| Create Asset | Tokenize a new real-world asset on Centrifuge |
| Update Asset | Modify asset metadata or valuation |
| Get Asset Valuation | Retrieve current and historical asset valuations |
| Get Asset History | Fetch complete transaction history for an asset |

### 3. Investments

| Operation | Description |
|-----------|-------------|
| Get Investment | Retrieve specific investment details and performance |
| List Investments | Get all investments with portfolio filtering |
| Create Investment | Make a new investment in a Centrifuge pool |
| Redeem Investment | Withdraw investment from a pool |
| Get Investment Returns | Calculate and retrieve investment performance metrics |
| Track Portfolio | Monitor overall portfolio performance across pools |

### 4. Loans

| Operation | Description |
|-----------|-------------|
| Get Loan | Retrieve detailed loan information and terms |
| List Loans | Get all loans with status and pool filtering |
| Originate Loan | Create a new loan backed by real-world assets |
| Update Loan Status | Modify loan status and repayment information |
| Get Repayment Schedule | Retrieve loan repayment timeline and amounts |
| Monitor Defaults | Track loan default status and recovery processes |

### 5. Transactions

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve specific transaction details |
| List Transactions | Get transactions with filtering by type, pool, or date |
| Get Transaction History | Fetch complete transaction history for an entity |
| Analyze Transaction Patterns | Generate insights from transaction data |
| Monitor Pending Transactions | Track transaction status and confirmations |

## Usage Examples

```javascript
// Monitor high-value pool metrics
{
  "poolId": "0x1234567890abcdef",
  "metricsType": "performance",
  "timeframe": "30d"
}
```

```javascript
// Track real estate asset portfolio
{
  "assetType": "real_estate",
  "location": "US",
  "minValue": 1000000,
  "status": "active"
}
```

```javascript
// Automate investment rebalancing
{
  "portfolioId": "portfolio_001",
  "rebalanceThreshold": 0.05,
  "targetAllocation": {
    "real_estate": 0.6,
    "trade_finance": 0.4
  }
}
```

```javascript
// Monitor loan defaults across pools
{
  "loanStatus": "overdue",
  "daysPastDue": "> 30",
  "poolIds": ["pool_1", "pool_2", "pool_3"]
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key in Centrifuge credentials settings |
| Pool Not Found | Requested pool ID does not exist | Check pool ID format and existence on Centrifuge |
| Insufficient Balance | Not enough tokens for investment or transaction | Verify wallet balance and available liquidity |
| Network Timeout | Request timed out due to network issues | Retry operation or check Centrifuge network status |
| Invalid Asset | Asset does not meet tokenization requirements | Review asset metadata and Centrifuge asset standards |
| Rate Limit Exceeded | Too many API requests in time window | Implement request throttling or upgrade API plan |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-centrifuge/issues)
- **Centrifuge Documentation**: [docs.centrifuge.io](https://docs.centrifuge.io)
- **Centrifuge Community**: [gov.centrifuge.io](https://gov.centrifuge.io)