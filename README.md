# MCP for SafeIdea Tests

This is a project that tests how reliably we can get Claude to interact with a website with an MCP endpoint. Since they invented it we figure that they would be best at talking to MCP. It's pretty hit-or-miss right now.

# MCP Test Framework

A simple Cloudflare Workers framework to test Multimodal Communication Protocol (MCP) functionality with Claude or other LLMs. This application demonstrates:

1. Responding to Claude searches through an MCP endpoint
2. Retrieving digital assets based on tag lists
3. Returning formatted results with links that match the search criteria

## Features

- MCP-compatible search endpoint at `/api/mcp/search`
- Tag-based asset filtering at `/api/assets/tags`
- Simple web interface for testing both endpoints
- Collection of 10 static HTML resources about AI, blockchain, and encryption topics
- Self-contained Cloudflare Worker deployment with no external dependencies
- Complete browser and terminal-based integration options for Claude
- Enhanced CORS support for seamless AI integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- Cloudflare account (for deployment)

### Installation

1. Clone the repository or download the files
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Local Development

```bash
npm run dev
```

This will start a local development server using Cloudflare's Wrangler tool.

### Deployment to Cloudflare

```bash
npm run deploy
```

This will deploy the worker to your Cloudflare account. You'll need to be logged in to Wrangler CLI.

## API Endpoints

### 1. MCP Search Endpoint

```
POST /api/mcp/search
```

Request body:
```json
{
  "query": "show me resources about ai and blockchain"
}
```

### 2. Tag-based Search

```
POST /api/assets/tags
```

Request body:
```json
{
  "tags": ["ai", "blockchain", "defi"]
}
```

### 3. Get All Assets

```
GET /api/assets
```

### 4. MCP Integration Information

```
GET /api/mcp-info
```

Returns HTML or JSON guide based on Accept header.

## Integrating with Claude

### Browser Integration

When configuring Claude in a web browser, you can set up this server as an MCP endpoint:

1. Visit the deployed site and click "Claude MCP Integration Guide"
2. Copy the tool definition and paste it at the beginning of your prompt to Claude
3. Add your question after the tool definition
4. Claude will use the search_resources tool to find relevant information

Example prompt:
```
<tool_definitions>
[
  {
    "type": "function",
    "function": {
      "name": "search_resources",
      "description": "Search for resources about AI, blockchain, or encryption topics",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "The search query to find relevant resources"
          }
        },
        "required": ["query"]
      },
      "endpoint": "https://mcp.safeidea.net/api/mcp/search",
      "method": "POST"
    }
  }
]
</tool_definitions>

I'm interested in learning about zero-knowledge proofs and how they're used in blockchain technology. Could you find resources on this topic and explain the key concepts to me in simple terms?
```

### Terminal Integration

For users who prefer terminal-based interaction, a bash script is provided that:

1. Takes a search query as input
2. Creates a properly formatted request to Claude's API including the MCP tool definition
3. Processes Claude's response to extract the relevant content
4. Displays the results in the terminal

Usage:
```bash
./claude_mcp_search.sh "zero-knowledge proofs"
```

The script requires a valid Claude API key from Anthropic. See the Claude Integration Guide for the complete script.

## Available Resources

This project includes 10 static HTML resources on various topics:

1. **Introduction to AI Agents** - Overview of AI agent technology and applications
2. **Smart Contract Development** - Guide to building secure blockchain smart contracts
3. **Decentralized Finance Explained** - Comprehensive overview of DeFi protocols
4. **Web3 Development Tools** - Survey of tools for web3 development
5. **Cryptography Fundamentals** - Introduction to core cryptographic concepts
6. **AI for Content Creation** - How to use AI in content workflows
7. **NFT Market Analysis** - Current trends in the NFT marketplace
8. **Prompt Engineering Guide** - Best practices for crafting AI prompts
9. **ZK-Proofs Explained** - Developer introduction to Zero-Knowledge Proofs
10. **Digital Asset Regulation** - Regulatory landscape for digital assets

## Modifying Asset Data

To modify the list of assets, edit the `assets` array in the `src/worker.js` file. Each asset should follow this format:

```javascript
{
  "id": "unique-identifier",
  "title": "Asset Title",
  "description": "A description of the asset",
  "tags": ["tag1", "tag2", "tag3"],
  "url": "/assets/filename.html",
  "type": "document|image|video|etc"
}
```

To add new resources, place HTML files in the `/public/assets/` directory and update the assets array accordingly.

## Architecture

The MCP Test Framework is structured to be simple to deploy and extend:

- Main UI and application logic are embedded in a self-contained Cloudflare Worker
- Static HTML resources are stored in the `/public/assets/` directory
- Asset metadata is defined in the worker.js file
- Search functionality works with both natural language (MCP) and explicit tag queries
- No external database or storage dependencies
- The worker handles both the web interface and API endpoints
- Comprehensive browser and terminal-based Claude integration

This architecture makes it easy to deploy and use in any environment with minimal configuration, while still allowing for extension with new content.

## Testing the Endpoint

You can test the endpoint directly with this curl command:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query":"AI information"}' https://mcp.safeidea.net/api/mcp/search
```

## License

This project is provided under the ISC license.
