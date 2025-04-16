const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Load assets data
const assetsPath = path.join(__dirname, 'data', 'assets.json');
let assets = [];

try {
  const data = fs.readFileSync(assetsPath, 'utf8');
  assets = JSON.parse(data);
  console.log(`Loaded ${assets.length} assets from data file`);
} catch (error) {
  console.error('Error loading assets:', error);
}

// MCP Endpoint for Claude searches
app.post('/api/mcp/search', (req, res) => {
  try {
    // Extract the query from the request body
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'No query provided',
        message: 'Please provide a search query'
      });
    }
    
    console.log(`Received MCP search query: ${query}`);
    
    // Process the query to extract tags
    // For simplicity, we'll just split by spaces and commas and use as tags
    const searchTags = query.toLowerCase()
      .replace(/[^\w\s,]/g, '')
      .split(/[\s,]+/)
      .filter(tag => tag.length > 1); // Filter out single-letter tags
    
    console.log('Extracted search tags:', searchTags);
    
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
    
    // Return results in a format Claude can understand
    return res.json({
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
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing search:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while processing your search'
    });
  }
});

// Endpoint to get assets by explicit tag list
app.post('/api/assets/tags', (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ 
        error: 'Invalid tags',
        message: 'Please provide an array of tags to search'
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
    
    return res.json({
      results,
      meta: {
        total: results.length,
        tags: searchTags,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing tag search:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while processing your tag search'
    });
  }
});

// Simple endpoint to get all assets
app.get('/api/assets', (req, res) => {
  return res.json({
    results: assets,
    meta: {
      total: assets.length,
      timestamp: new Date().toISOString()
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP test server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- POST /api/mcp/search - MCP endpoint for Claude searches`);
  console.log(`- POST /api/assets/tags - Get assets by explicit tag list`);
  console.log(`- GET /api/assets - Get all assets`);
});