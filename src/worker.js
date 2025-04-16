// Self-contained MCP test framework for Claude integration
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Test Framework for SafeIdea</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
        }
        .loader {
            border-top-color: #3498db;
            animation: spinner 0.8s linear infinite;
        }
        @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <header class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">MCP Test Framework for SafeIdea</h1>
            <p class="text-gray-600">Search for digital assets that match specific tags</p>
            <div class="mt-4">
                <a href="/api/mcp-info" target="_blank" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Claude MCP Integration Guide
                </a>
            </div>
        </header>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Search Assets</h2>
            
            <div class="mb-6">
                <label for="search-query" class="block mb-2 text-sm font-medium text-gray-700">
                    Enter Search Query (Claude MCP Compatible)
                </label>
                <div class="flex">
                    <input
                        type="text"
                        id="search-query"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., show me ai resources about blockchain"
                    >
                    <button 
                        id="search-button"
                        class="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div class="mb-6">
                <label for="tag-search" class="block mb-2 text-sm font-medium text-gray-700">
                    Or Search By Specific Tags (comma separated)
                </label>
                <div class="flex">
                    <input
                        type="text"
                        id="tag-search"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ai, blockchain, defi"
                    >
                    <button 
                        id="tag-search-button"
                        class="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Find by Tags
                    </button>
                </div>
            </div>
        </div>

        <!-- Search Results -->
        <div id="loading" class="hidden flex justify-center my-8">
            <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
        
        <div id="results-container" class="hidden bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Search Results</h2>
                <span id="result-count" class="text-sm text-gray-600">0 results</span>
            </div>
            
            <div id="result-tags" class="mb-4 flex flex-wrap gap-2">
                <!-- Tags will be inserted here -->
            </div>
            
            <div id="results" class="space-y-4">
                <!-- Results will be inserted here -->
            </div>
        </div>

        <!-- No Results -->
        <div id="no-results" class="hidden bg-white rounded-lg shadow-md p-6 text-center">
            <p class="text-gray-700">No matching assets found. Try different search terms.</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const searchQuery = document.getElementById('search-query');
            const searchButton = document.getElementById('search-button');
            const tagSearch = document.getElementById('tag-search');
            const tagSearchButton = document.getElementById('tag-search-button');
            const resultsContainer = document.getElementById('results-container');
            const results = document.getElementById('results');
            const resultCount = document.getElementById('result-count');
            const resultTags = document.getElementById('result-tags');
            const noResults = document.getElementById('no-results');
            const loading = document.getElementById('loading');

            // MCP search endpoint
            searchButton.addEventListener('click', async () => {
                const query = searchQuery.value.trim();
                if (!query) return;
                
                showLoading();
                
                try {
                    const response = await fetch('/api/mcp/search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query })
                    });
                    
                    const data = await response.json();
                    displayResults(data);
                } catch (error) {
                    console.error('Error searching:', error);
                    hideLoading();
                    alert('An error occurred while searching. Please try again.');
                }
            });

            // Tag search endpoint
            tagSearchButton.addEventListener('click', async () => {
                const tags = tagSearch.value.trim();
                if (!tags) return;
                
                showLoading();
                
                try {
                    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    
                    const response = await fetch('/api/assets/tags', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tags: tagArray })
                    });
                    
                    const data = await response.json();
                    displayResults({
                        results: data.results,
                        query: { tags: tagArray },
                        meta: data.meta
                    });
                } catch (error) {
                    console.error('Error searching by tags:', error);
                    hideLoading();
                    alert('An error occurred while searching. Please try again.');
                }
            });

            // Enter key functionality
            searchQuery.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchButton.click();
                }
            });

            tagSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    tagSearchButton.click();
                }
            });

            function showLoading() {
                loading.classList.remove('hidden');
                resultsContainer.classList.add('hidden');
                noResults.classList.add('hidden');
            }

            function hideLoading() {
                loading.classList.add('hidden');
            }

            function displayResults(data) {
                hideLoading();
                results.innerHTML = '';
                resultTags.innerHTML = '';
                
                const assetResults = data.results || [];
                
                if (assetResults.length === 0) {
                    noResults.classList.remove('hidden');
                    resultsContainer.classList.add('hidden');
                    return;
                }
                
                resultCount.textContent = \`\${assetResults.length} result\${assetResults.length !== 1 ? 's' : ''}\`;
                
                // Display search tags
                if (data.query && data.query.tags) {
                    data.query.tags.forEach(tag => {
                        const tagEl = document.createElement('span');
                        tagEl.className = 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full';
                        tagEl.textContent = tag;
                        resultTags.appendChild(tagEl);
                    });
                }
                
                // Display results
                assetResults.forEach(asset => {
                    const assetElement = document.createElement('div');
                    assetElement.className = 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50';
                    
                    assetElement.innerHTML = \`
                        <div class="flex justify-between">
                            <h3 class="text-lg font-medium text-gray-900">\${asset.title}</h3>
                            <div class="text-xs text-gray-500">\${asset.type}</div>
                        </div>
                        <p class="mt-1 text-gray-600">\${asset.description}</p>
                        <div class="mt-3 flex items-center justify-between">
                            <div class="flex flex-wrap gap-1">
                                \${asset.tags.map(tag => \`
                                    <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">\${tag}</span>
                                \`).join('')}
                            </div>
                            <a href="\${asset.url}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Resource →
                            </a>
                        </div>
                    \`;
                    
                    results.appendChild(assetElement);
                });
                
                resultsContainer.classList.remove('hidden');
                noResults.classList.add('hidden');
            }
        });
    </script>
</body>
</html>`;

// Asset data
// Note: During build process, this data is generated from HTML files in public/assets/
// See build-assets.js for the generation logic
// The build script will add the generated assets here during the build process
const assets = [
  {
    "id": "asset001",
    "title": "Introduction to AI Agents and Assistants",
    "description": "A comprehensive guide to modern AI agents, assistants, and their real-world applications",
    "tags": [
      "ai",
      "agents",
      "assistants",
      "llm",
      "claude",
      "gpt",
      "automation"
    ],
    "url": "/assets/ai-agents-intro.html",
    "type": "document"
  },
  {
    "id": "asset002",
    "title": "AI for Content Creation",
    "description": "How to use AI tools to enhance content creation workflows",
    "tags": [
      "ai",
      "content",
      "creation"
    ],
    "url": "/assets/ai-content-creation.html",
    "type": "document"
  },
  {
    "id": "asset003",
    "title": "Cryptography Fundamentals",
    "description": "Learn the basics of cryptography that power secure digital systems",
    "tags": [
      "crypto",
      "fundamentals",
      "cryptography",
      "blockchain",
      "ai"
    ],
    "url": "/assets/crypto-fundamentals.html",
    "type": "document"
  },
  {
    "id": "asset004",
    "title": "Decentralized Finance Explained",
    "description": "A detailed explanation of DeFi protocols and applications",
    "tags": [
      "defi",
      "explained",
      "decentralized",
      "finance",
      "blockchain",
      "crypto",
      "ai",
      "smartcontract"
    ],
    "url": "/assets/defi-explained.html",
    "type": "document"
  },
  {
    "id": "asset005",
    "title": "Digital Asset Regulation",
    "description": "Current regulatory landscape for digital assets across major jurisdictions",
    "tags": [
      "digital",
      "asset",
      "regulation",
      "blockchain",
      "crypto",
      "ai",
      "defi",
      "nft",
      "ethereum",
      "privacy",
      "development"
    ],
    "url": "/assets/digital-asset-regulation.html",
    "type": "document"
  },
  {
    "id": "asset006",
    "title": "NFT Market Analysis",
    "description": "Current trends and future prospects in the NFT marketplace",
    "tags": [
      "nft",
      "market",
      "analysis",
      "blockchain",
      "ai",
      "ethereum"
    ],
    "url": "/assets/nft-market-analysis.html",
    "type": "document"
  },
  {
    "id": "asset007",
    "title": "Prompt Engineering Guide",
    "description": "Master the art of crafting effective prompts for AI models",
    "tags": [
      "prompt",
      "engineering",
      "guide",
      "blockchain",
      "crypto",
      "ai"
    ],
    "url": "/assets/prompt-engineering.html",
    "type": "document"
  },
  {
    "id": "asset008",
    "title": "Smart Contract Development",
    "description": "Learn how to build secure smart contracts for blockchain applications",
    "tags": [
      "smart",
      "contracts",
      "development",
      "contract",
      "blockchain",
      "ai",
      "defi",
      "nft",
      "ethereum",
      "smartcontract"
    ],
    "url": "/assets/smart-contracts-development.html",
    "type": "document"
  },
  {
    "id": "asset009",
    "title": "Web3 Development Tools",
    "description": "Overview of the most popular Web3 development tools and frameworks",
    "tags": [
      "web3",
      "tools",
      "development",
      "blockchain",
      "ai",
      "ethereum",
      "smartcontract"
    ],
    "url": "/assets/web3-tools.html",
    "type": "document"
  },
  {
    "id": "asset010",
    "title": "ZK-Proofs Explained",
    "description": "A developer-friendly introduction to Zero-Knowledge Proofs",
    "tags": [
      "zk",
      "proofs",
      "explained",
      "zk-proofs",
      "blockchain",
      "crypto",
      "ai",
      "ethereum",
      "privacy",
      "development"
    ],
    "url": "/assets/zk-proofs-explained.html",
    "type": "document"
  }
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    console.log(`Processing ${request.method} request to ${url.pathname}`);
    
    // Handle API requests
    if (url.pathname.startsWith('/api')) {
      
      // MCP search endpoint for Claude
      if (url.pathname === '/api/mcp/search' && request.method === 'POST') {
        try {
          const data = await request.json();
          const { query } = data;
          
          console.log(`Received MCP search query: ${query}`);
          
          if (!query) {
            console.log('Error: No query provided');
            return new Response(JSON.stringify({ 
              error: 'No query provided',
              message: 'Please provide a search query'
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          
          // Log that we've received an MCP search request
          console.log(`MCP Search Request: ${new Date().toISOString()}`);
          console.log(`Query: ${query}`);
          
          // Process the query to extract tags
          // For simplicity, we'll just split by spaces and commas and use as tags
          const searchTags = query.toLowerCase()
            .replace(/[^\w\s,]/g, '')
            .split(/[\s,]+/)
            .filter(tag => tag.length > 1); // Filter out single-letter tags
          
          console.log('Extracted search tags:', searchTags.join(', '));
          
          // Search for assets matching the tags
          let results = [];
          
          if (searchTags.length > 0) {
            results = assets.filter(asset => {
              // Check if at least one tag matches
              return asset.tags.some(tag => 
                searchTags.some(searchTag => tag.includes(searchTag))
              );
            });
            
            // Sort by relevance (number of matching tags)
            results.sort((a, b) => {
              const aMatches = a.tags.filter(tag => 
                searchTags.some(searchTag => tag.includes(searchTag))
              ).length;
              
              const bMatches = b.tags.filter(tag => 
                searchTags.some(searchTag => tag.includes(searchTag))
              ).length;
              
              return bMatches - aMatches;
            });
          }
          
          console.log(`Found ${results.length} matching results`);
          
          // Return results in a format Claude can understand
          const responseData = {
            results: results.map(asset => ({
              id: asset.id,
              title: asset.title,
              description: asset.description,
              url: asset.url,
              tags: asset.tags,
              type: asset.type
            })),
            query: {
              original: query,
              tags: searchTags
            },
            meta: {
              total: results.length,
              timestamp: new Date().toISOString(),
              source: 'MCP Test Framework',
              request_id: Date.now().toString(36) + Math.random().toString(36).substr(2)
            }
          };
          
          console.log('Sending response:', JSON.stringify(responseData));
          
          return new Response(JSON.stringify(responseData), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-API-KEY, Claude-API-Key',
              'X-MCP-Request-ID': responseData.meta.request_id
            }
          });
        } catch (error) {
          console.error('Error processing search:', error);
          return new Response(JSON.stringify({ 
            error: 'Internal server error',
            message: 'An error occurred while processing your search'
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // Endpoint to get assets by explicit tag list
      if (url.pathname === '/api/assets/tags' && request.method === 'POST') {
        try {
          const data = await request.json();
          const { tags } = data;
          
          if (!tags || !Array.isArray(tags)) {
            return new Response(JSON.stringify({ 
              error: 'Invalid tags',
              message: 'Please provide an array of tags to search'
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          
          console.log(`Searching assets by tags: ${tags.join(', ')}`);
          
          // Filter assets by tags
          const searchTags = tags.map(tag => tag.toLowerCase());
          
          const results = assets.filter(asset => {
            return asset.tags.some(tag => 
              searchTags.some(searchTag => tag.includes(searchTag))
            );
          });
          
          // Sort by relevance (number of matching tags)
          results.sort((a, b) => {
            const aMatches = a.tags.filter(tag => 
              searchTags.some(searchTag => tag.includes(searchTag))
            ).length;
            
            const bMatches = b.tags.filter(tag => 
              searchTags.some(searchTag => tag.includes(searchTag))
            ).length;
            
            return bMatches - aMatches;
          });
          
          return new Response(JSON.stringify({
            results,
            meta: {
              total: results.length,
              tags: searchTags,
              timestamp: new Date().toISOString()
            }
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (error) {
          console.error('Error processing tag search:', error);
          return new Response(JSON.stringify({ 
            error: 'Internal server error',
            message: 'An error occurred while processing your tag search'
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // Simple endpoint to get all assets
      if (url.pathname === '/api/assets' && request.method === 'GET') {
        return new Response(JSON.stringify({
          results: assets,
          meta: {
            total: assets.length,
            timestamp: new Date().toISOString()
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Endpoint for MCP info (JSON format for API clients)
      if (url.pathname === '/api/mcp-info' && request.method === 'GET') {
        // Check if client accepts HTML (browser) or prefers JSON (API client)
        const acceptHeader = request.headers.get('Accept') || '';
        
        if (acceptHeader.includes('text/html')) {
          // Return HTML version for browsers
          const mcpInfoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude MCP Integration Guide for SafeIdea</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            line-height: 1.6;
        }
        pre {
            background-color: #f1f5f9;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .copy-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container mx-auto px-4 py-8 max-w-3xl">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Claude MCP Integration Guide for SafeIdea</h1>
            <p class="text-gray-600">How to use the MCP Test Framework with Claude in browser or terminal</p>
            <div class="mt-4">
                <a href="/" class="text-blue-600 hover:text-blue-800">← Back to Home</a>
            </div>
        </header>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Overview</h2>
            <p class="mb-4">
                This guide shows how to use Claude with the MCP Test Framework to search for resources on AI, blockchain, and encryption topics.
            </p>
            <p class="mb-4">
                The MCP Test Framework endpoint is: <code class="bg-gray-100 px-2 py-1 rounded">https://mcp.safeidea.net/api/mcp/search</code>
            </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Step 1: Define the Tool</h2>
            <p class="mb-4">
                Copy the following tool definition and include it at the beginning of your prompt to Claude:
            </p>
            <div class="relative">
                <button id="copy-tool-def" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>&lt;tool_definitions&gt;
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
&lt;/tool_definitions&gt;</code></pre>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Step 2: Add Your Question</h2>
            <p class="mb-4">
                After the tool definition, add your question or prompt. For example:
            </p>
            <div class="relative">
                <button id="copy-prompt" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>Please search for resources about zero-knowledge proofs and explain the key concepts to me.</code></pre>
            </div>
            <p class="mt-4 text-sm text-gray-600">
                Claude should then use the search_resources tool to find relevant information and provide a response based on the resources it finds.
            </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Alternative Format</h2>
            <p class="mb-4">
                If the standard format doesn't work, some versions of Claude might accept this alternative format:
            </p>
            <div class="relative">
                <button id="copy-alt" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>&lt;tools&gt;
[
  {
    "name": "search_resources",
    "description": "Search for resources about AI, blockchain, or encryption topics",
    "input_schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string", 
          "description": "The search query to find relevant resources"
        }
      },
      "required": ["query"]
    },
    "api_details": {
      "endpoint": "https://mcp.safeidea.net/api/mcp/search",
      "method": "POST"
    }
  }
]
&lt;/tools&gt;</code></pre>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Complete Example</h2>
            <p class="mb-4">
                Here's a complete prompt example you can copy and use directly with Claude:
            </p>
            <div class="relative">
                <button id="copy-example" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>&lt;tool_definitions&gt;
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
&lt;/tool_definitions&gt;

I'm interested in learning about zero-knowledge proofs and how they're used in blockchain technology. Could you find resources on this topic and explain the key concepts to me in simple terms?</code></pre>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Testing The Endpoint</h2>
            <p class="mb-4">
                You can test the endpoint directly with this curl command:
            </p>
            <div class="relative">
                <button id="copy-curl" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>curl -X POST -H "Content-Type: application/json" -d '{"query":"AI information"}' https://mcp.safeidea.net/api/mcp/search</code></pre>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Terminal Integration with Claude API</h2>
            <p class="mb-4">
                If you prefer using Claude from the terminal instead of a browser, you can use this bash script to query Claude with MCP integration:
            </p>
            <div class="relative">
                <button id="copy-script" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>#!/bin/bash
# Claude MCP Query Script for Terminal Users

# API key (replace with your actual Claude API key)
CLAUDE_API_KEY="YOUR_CLAUDE_API_KEY_HERE"

# Check if a search query was provided
if [ $# -eq 0 ]; then
  echo "Error: Please provide a search query."
  echo "Usage: $0 \"your search query\""
  exit 1
fi

# Capture the search query from command line arguments
SEARCH_QUERY="$*"

# Create the Claude prompt with MCP tool definition
read -r -d '' CLAUDE_PROMPT << EOM
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

Please search for resources about "${SEARCH_QUERY}" and provide me with a summary of what you find. Include titles and brief descriptions of the most relevant resources.
EOM

# Display information
echo "=== Claude MCP Search ==="
echo "Query: \"${SEARCH_QUERY}\""
echo "========================="

# Call Claude API
response=$(curl -s https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${CLAUDE_API_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"claude-3-opus-20240229\",
    \"max_tokens\": 1024,
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"$CLAUDE_PROMPT\"
      }
    ],
    \"tools\": [{
      \"name\": \"search_resources\",
      \"description\": \"Search for resources about AI, blockchain, or encryption topics\",
      \"input_schema\": {
        \"type\": \"object\",
        \"properties\": {
          \"query\": {
            \"type\": \"string\",
            \"description\": \"The search query to find relevant resources\"
          }
        },
        \"required\": [\"query\"]
      }
    }]
  }")

# Extract and display Claude's response
echo "$response" | grep -o '"content":"[^"]*"' | sed 's/"content":"//g' | sed 's/"$//g'

echo "========================="
echo "Search complete!"</code></pre>
            </div>
            <div class="mt-4 bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 class="text-lg font-medium text-amber-700 mb-2">Important Instructions</h3>
                <ol class="list-decimal list-inside space-y-2 text-amber-800">
                    <li>Save the script above as <code>claude_mcp_search.sh</code> on your system</li>
                    <li>Make the script executable: <code>chmod +x claude_mcp_search.sh</code></li>
                    <li>Replace <code>YOUR_CLAUDE_API_KEY_HERE</code> with your actual Claude API key from Anthropic</li>
                    <li>Run the script with your search query: <code>./claude_mcp_search.sh "zero-knowledge proofs"</code></li>
                </ol>
                <p class="mt-2 text-amber-700 text-sm">
                    <strong>Note:</strong> You need a valid Claude API key to use this script. Get one by signing up at 
                    <a href="https://console.anthropic.com/" target="_blank" class="underline">Anthropic's Console</a>.
                </p>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Alternative: Terminal Script (If Browser Integration Fails)</h2>
            <p class="mb-4">
                If you're having trouble getting Claude to work with the MCP endpoint in the browser, you can use this shell script to test and demonstrate the functionality:
            </p>
            <div class="relative">
                <button id="copy-script" class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Copy
                </button>
                <pre><code>#!/bin/bash
# MCP Test Script - Terminal alternative to browser integration

# This is a complete demonstration of using the MCP search endpoint

# First, define the tool (this is what you would include at the beginning of your Claude prompt)
cat <<EOF > mcp_tool_definition.json
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
EOF

# Now, here's how you would directly test the endpoint the way Claude would use it
# This simulates what happens when Claude processes a search request

# 1. Search query - Claude would extract this from your question
SEARCH_QUERY="zero-knowledge proofs"

# 2. Create the payload in the format Claude would use
PAYLOAD="{\"query\":\"$SEARCH_QUERY\"}"

# 3. Make the request to the endpoint
echo "Searching for: $SEARCH_QUERY"
echo "-------------------------------------"
curl -s -X POST \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: Claude/1.0" \\
  -d "$PAYLOAD" \\
  https://mcp.safeidea.net/api/mcp/search

# 4. To see it in a more readable format, try this version (requires jq)
# curl -s -X POST \\
#   -H "Content-Type: application/json" \\
#   -H "User-Agent: Claude/1.0" \\
#   -d "$PAYLOAD" \\
#   https://mcp.safeidea.net/api/mcp/search | jq

# Note: The above simulates what Claude does behind the scenes when you provide
# the tool definition and ask a question about zero-knowledge proofs.
</code></pre>
            </div>
            <p class="mt-4 text-sm text-gray-600">
                Save this as a shell script (e.g., <code>test_mcp.sh</code>), make it executable with <code>chmod +x test_mcp.sh</code>, and then run it.
                This script demonstrates the complete process that Claude would perform when using the MCP endpoint.
            </p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const copyButtons = document.querySelectorAll('.copy-button');
            // Make sure all copy buttons are detected
            console.log('Found ' + copyButtons.length + ' copy buttons');
            
            copyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const codeElement = button.nextElementSibling.querySelector('code');
                    const textToCopy = codeElement.textContent;
                    
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            button.textContent = 'Copied!';
                            setTimeout(() => {
                                button.textContent = 'Copy';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                            button.textContent = 'Failed';
                            setTimeout(() => {
                                button.textContent = 'Copy';
                            }, 2000);
                        });
                });
            });
        });
    </script>
</body>
</html>`;
          
          return new Response(mcpInfoHtml, {
            headers: { 
              'Content-Type': 'text/html',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          // Return JSON for API clients
          return new Response(JSON.stringify({
            endpoint: 'https://mcp.safeidea.net/api/mcp/search',
            method: 'POST',
            description: 'Search for resources about AI, blockchain, or encryption topics',
            parameters: {
              query: 'The search query to find relevant resources'
            },
            example_request: {
              query: 'blockchain privacy technology'
            },
            usage_with_claude: {
              tool_definition: `<tool_definitions>
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
</tool_definitions>`,
              example_prompt: 'Please search for resources about zero-knowledge proofs and explain what they are.'
            },
            available_topics: ['ai', 'blockchain', 'smart contracts', 'defi', 'web3', 'cryptography', 'nft', 'prompt engineering', 'zkp', 'regulation']
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // Handle preflight requests for CORS - expanded for Claude compatibility
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-API-KEY, Claude-API-Key',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true'
          }
        });
      }
      
      // If no valid API endpoint is matched
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve index.html for the main route
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(indexHtml, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Add an explicit route for the Claude guide
    if (url.pathname === '/claude-guide' || url.pathname === '/claude-guide.html') {
      // Return the MCP info HTML directly
      return new Response(mcpInfoHtml, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Serve static asset HTML files
    if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.html')) {
      const filename = url.pathname.split('/').pop();
      
      // Find the asset by matching the filename
      const matchingAsset = assets.find(asset => {
        const assetFilename = asset.url.split('/').pop();
        return assetFilename === filename;
      });
      
      if (matchingAsset) {
        // For now, just redirect to the main page
        return Response.redirect(`https://mcp.safeidea.net/`, 302);
      }
    }
    
    // 404 for any other paths
    return new Response('Not Found', { status: 404 });
  }
};