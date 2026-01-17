# n8n-nodes-centrifuge

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Centrifuge blockchain, providing Real World Asset (RWA) tokenization capabilities with 7 resource categories and 15+ operations for pool management, investments, loans, and document handling.

[![npm version](https://badge.fury.io/js/n8n-nodes-centrifuge.svg)](https://badge.fury.io/js/n8n-nodes-centrifuge)
[![License: BSL 1.1](https://img.shields.io/badge/license-BSL--1.1-blue)](./LICENSE)

## Features

### Centrifuge Node (Action Node)
- **Account Operations**: Get balance, transfer CFG tokens
- **Pool Operations**: Query all pools, get pool details and metadata
- **Tranche Operations**: Get tranches, token prices
- **Investment Operations**: Get orders, positions
- **Loan Operations**: Query loans, get loan details
- **Document Operations**: Upload to IPFS, retrieve from IPFS
- **Utility Operations**: Chain info, validate address, convert address formats

### Centrifuge Trigger Node
Real-time blockchain event monitoring via WebSocket:
- Pool events (creation, updates, NAV changes, epochs)
- Investment events (orders, collections)
- Loan events (creation, borrowing, repayment)
- Account events (transfers, balance changes)
- Epoch lifecycle events
- Governance events (proposals, voting)

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-centrifuge`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom extensions folder
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-centrifuge

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-centrifuge.git
cd n8n-nodes-centrifuge

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-centrifuge

# Restart n8n
n8n start
```

## Credentials Setup

### Centrifuge Network Credentials

Required for all blockchain operations:

| Field | Description |
|-------|-------------|
| Network | Select network (Mainnet, Testnet, Altair, Development, Custom) |
| Authentication Type | Seed Phrase, Private Key, or Read-only |
| Seed Phrase | 12 or 24 word mnemonic (for Seed Phrase auth) |
| Private Key | Hex-encoded private key (for Private Key auth) |
| Key Type | SR25519 (default) or ED25519 |

### Centrifuge API Credentials (Optional)

For off-chain data access:

| Field | Description |
|-------|-------------|
| Environment | Production, Staging, or Custom |
| API Key | Your Centrifuge API key |
| SubQuery Endpoint | GraphQL endpoint for advanced queries |

### IPFS Storage Credentials (Optional)

For document operations:

| Field | Description |
|-------|-------------|
| Provider | Pinata, Infura, Web3.Storage, or Custom |
| Gateway URL | IPFS gateway for retrieval |
| API Key/Token | Provider-specific authentication |

## Resources & Operations

### Account Resource
| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve CFG token balance for an address |
| Transfer | Send CFG tokens to another address |

### Pool Resource
| Operation | Description |
|-----------|-------------|
| Get All | List all pools on the network |
| Get Pool | Get detailed information about a specific pool |

### Tranche Resource
| Operation | Description |
|-----------|-------------|
| Get All | List all tranches for a pool |

### Investment Resource
| Operation | Description |
|-----------|-------------|
| Get Orders | Get investment orders for a pool |
| Get Positions | Get investment positions |

### Loan Resource
| Operation | Description |
|-----------|-------------|
| Get All | List all loans in a pool |
| Get Loan | Get detailed loan information |

### Document Resource
| Operation | Description |
|-----------|-------------|
| Upload to IPFS | Upload document content to IPFS |
| Get from IPFS | Retrieve document from IPFS by CID |

### Utility Resource
| Operation | Description |
|-----------|-------------|
| Get Chain Info | Get blockchain information |
| Validate Address | Check if an address is valid |
| Convert Address | Convert address between formats |

## Trigger Node

The Centrifuge Trigger node monitors blockchain events in real-time.

### Event Categories
- **Pool**: Pool creation, updates, epoch execution
- **Investment**: Order submissions, collections
- **Loan**: Creation, borrowing, repayment events
- **Account**: Balance changes, transfers
- **Epoch**: Epoch lifecycle events
- **Governance**: Proposals, voting
- **Document**: Document anchoring events
- **All**: Monitor all event types

### Filters
- Pool IDs: Filter events for specific pools
- Accounts: Filter events for specific accounts
- Tranche IDs: Filter by tranche
- Min Amount: Filter by minimum transaction amount

## Usage Examples

### Get Account Balance

```json
{
  "resource": "account",
  "operation": "getBalance",
  "address": "4dTeMxuPJCK7zQGhFcgCivSJqBs9Hp2xrUPKuD9gy3X4FNQU"
}
```

### Query All Pools

```json
{
  "resource": "pool",
  "operation": "getAll"
}
```

### Upload Document to IPFS

```json
{
  "resource": "document",
  "operation": "uploadToIpfs",
  "documentContent": "{\"title\": \"Invoice #123\", \"amount\": 5000}",
  "documentName": "invoice-123.json"
}
```

## Centrifuge Concepts

### Pools
Pools are the core primitive in Centrifuge, representing a collection of real-world assets that have been tokenized. Each pool has tranches with different risk/return profiles.

### Tranches
Tranches represent different risk layers within a pool. Senior tranches have priority for returns but lower yields, while junior tranches take more risk for higher potential returns.

### Epochs
Epochs are time periods during which investment orders are collected and then executed at the end of the epoch. This ensures fair pricing for all participants.

### NAV (Net Asset Value)
The NAV represents the total value of assets in a pool minus liabilities. It's calculated on-chain and used for tranche token pricing.

## Networks

| Network | Chain ID | SS58 Prefix | Native Token |
|---------|----------|-------------|--------------|
| Centrifuge Mainnet | Polkadot Parachain #2031 | 36 | CFG |
| Altair | Kusama Parachain #2088 | 136 | AIR |
| Testnet | Rococo | 36 | CFG |
| Development | Local | 42 | CFG |

## Error Handling

The node includes comprehensive error handling:

- **Connection Errors**: Automatic retry with exponential backoff
- **Transaction Failures**: Detailed error messages with failure reasons
- **Validation Errors**: Input validation before blockchain operations
- **Rate Limiting**: Respects API rate limits

## Security Best Practices

1. **Seed Phrases**: Never share or expose seed phrases. Use environment variables in production.
2. **Private Keys**: Store securely using n8n's credential encryption.
3. **Read-Only Access**: Use read-only mode when possible for queries.
4. **Proxy Accounts**: Consider using proxy accounts for limited permissions.
5. **Network Selection**: Always verify you're connected to the intended network.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code passes linting and tests before submitting.

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-centrifuge/issues)
- **Centrifuge**: [Discord](https://discord.gg/centrifuge) | [Documentation](https://docs.centrifuge.io/)
- **n8n**: [Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Centrifuge](https://centrifuge.io/) - Real World Asset tokenization platform
- [n8n](https://n8n.io/) - Workflow automation platform
- [Polkadot](https://polkadot.network/) - Substrate blockchain framework
