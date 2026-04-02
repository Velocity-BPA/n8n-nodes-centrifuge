# n8n-nodes-centrifuge

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node enables automation workflows with Centrifuge's decentralized finance protocol. The node provides 6 resources (Pool, Asset, Investment, Loan, Token, Governance) for managing real-world asset tokenization, liquidity pools, and on-chain governance operations directly from your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![DeFi](https://img.shields.io/badge/DeFi-Protocol-green)
![Tokenization](https://img.shields.io/badge/Asset-Tokenization-orange)
![Web3](https://img.shields.io/badge/Web3-Compatible-purple)

## Features

- **Pool Management** - Create, monitor, and manage liquidity pools for real-world assets
- **Asset Tokenization** - Mint, transfer, and track tokenized real-world assets on-chain
- **Investment Operations** - Handle investor deposits, withdrawals, and portfolio tracking
- **Loan Administration** - Originate, fund, and manage asset-backed loans
- **Token Operations** - Manage CFG tokens, rewards, and token transfers
- **Governance Integration** - Participate in protocol governance and proposal voting
- **Real-time Data** - Access live pool metrics, asset valuations, and transaction data
- **Multi-chain Support** - Works across Centrifuge Chain and Ethereum networks

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
| API Key | Your Centrifuge API key for protocol access | Yes |
| Network | Target network (Centrifuge Chain or Ethereum) | Yes |
| Wallet Address | Your wallet address for transaction signing | Yes |
| Environment | API environment (mainnet, testnet) | Yes |

## Resources & Operations

### 1. Pool

| Operation | Description |
|-----------|-------------|
| Create Pool | Create a new liquidity pool for asset tokenization |
| Get Pool Details | Retrieve detailed information about a specific pool |
| List Pools | Get all available pools with filtering options |
| Update Pool | Modify pool parameters and settings |
| Get Pool Performance | Retrieve performance metrics and analytics |
| Close Pool | Close a pool and handle final distributions |

### 2. Asset

| Operation | Description |
|-----------|-------------|
| Mint Asset | Create and mint new tokenized real-world assets |
| Transfer Asset | Transfer asset ownership between addresses |
| Get Asset Details | Retrieve comprehensive asset information |
| List Assets | Get all assets with filtering and pagination |
| Update Asset | Modify asset metadata and properties |
| Burn Asset | Remove assets from circulation |

### 3. Investment

| Operation | Description |
|-----------|-------------|
| Make Investment | Invest in a pool with specified amount |
| Redeem Investment | Withdraw investment and claim returns |
| Get Investment Status | Check current investment positions |
| List Investments | Get all investments for an investor |
| Calculate Returns | Compute expected returns and yields |
| Transfer Investment | Transfer investment positions |

### 4. Loan

| Operation | Description |
|-----------|-------------|
| Originate Loan | Create new asset-backed loans |
| Fund Loan | Provide funding to originated loans |
| Get Loan Details | Retrieve loan terms and current status |
| List Loans | Get all loans with filtering options |
| Make Payment | Process loan payments and interest |
| Default Loan | Handle loan defaults and recoveries |

### 5. Token

| Operation | Description |
|-----------|-------------|
| Transfer Tokens | Send CFG tokens between addresses |
| Get Balance | Check token balances for addresses |
| Get Token Info | Retrieve token metadata and properties |
| List Transactions | Get token transaction history |
| Stake Tokens | Stake CFG tokens for rewards |
| Unstake Tokens | Unstake tokens and claim rewards |

### 6. Governance

| Operation | Description |
|-----------|-------------|
| Create Proposal | Submit new governance proposals |
| Vote on Proposal | Cast votes on active proposals |
| Get Proposal | Retrieve proposal details and status |
| List Proposals | Get all governance proposals |
| Delegate Votes | Delegate voting power to others |
| Get Voting Power | Check current voting power |

## Usage Examples

```javascript
// Create a new liquidity pool
{
  "name": "Real Estate Pool Q4 2024",
  "asset_class": "real_estate",
  "min_investment": 1000,
  "target_size": 50000000,
  "currency": "USDC"
}
```

```javascript
// Mint a tokenized real estate asset
{
  "asset_name": "Commercial Property NYC",
  "asset_value": 2500000,
  "pool_id": "pool_12345",
  "metadata": {
    "location": "New York City",
    "property_type": "commercial",
    "square_feet": 10000
  }
}
```

```javascript
// Make an investment in a pool
{
  "pool_id": "pool_12345",
  "amount": 50000,
  "currency": "USDC",
  "investor_address": "0x742d35Cc6634C0532925a3b8D84F8b4c37d8e9B8"
}
```

```javascript
// Vote on a governance proposal
{
  "proposal_id": "prop_67890",
  "vote": "yes",
  "voting_power": 1000,
  "reason": "This proposal will improve protocol efficiency"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| INSUFFICIENT_BALANCE | Wallet lacks required token balance | Check balance and fund wallet accordingly |
| INVALID_POOL_ID | Pool identifier not found | Verify pool exists and ID is correct |
| UNAUTHORIZED_ACCESS | API key lacks required permissions | Check credentials and permission scopes |
| NETWORK_ERROR | Blockchain network connectivity issues | Retry request or check network status |
| INVALID_ASSET | Asset does not exist or is invalid | Verify asset ID and ownership |
| GOVERNANCE_PERIOD_ENDED | Voting period has closed | Check proposal timeline and deadlines |

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