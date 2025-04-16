/**
 * Build Assets Script
 * 
 * Parses HTML files in public/assets directory to generate assets.json metadata file
 * This allows content authors to add/modify HTML files without manually updating the assets array
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom'); // Using jsdom to parse HTML

const assetsDir = path.join(__dirname, 'public/assets');
const outputFile = path.join(__dirname, 'data/assets.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(outputFile))) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

// Get all HTML files in the assets directory
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.html'));
console.log(`Found ${files.length} HTML asset files`);

const assets = [];

// Process each HTML file to extract metadata
files.forEach((file, index) => {
  const id = `asset${(index + 1).toString().padStart(3, '0')}`;
  const filePath = path.join(assetsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Parse the HTML
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  // Extract metadata
  const title = document.querySelector('title')?.textContent || file.replace('.html', '');
  
  // Try to get description from meta tag, if not available look for specific elements or default to first paragraph
  let description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!description) {
    description = document.querySelector('.header p')?.textContent || 
                  document.querySelector('p')?.textContent || 
                  `Resource about ${title}`;
  }
  
  // Extract tags from meta keywords or try to infer from content
  let tags = [];
  const metaTags = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
  
  if (metaTags) {
    tags = metaTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  } else {
    // Infer tags from the title and file name
    const baseName = file.replace('.html', '');
    const nameWords = baseName.split('-');
    tags = [...new Set([
      ...nameWords,
      ...title.toLowerCase().split(' ').filter(word => word.length > 3)
    ])].filter(tag => !['about', 'with', 'this', 'that', 'what', 'when', 'where', 'how'].includes(tag));
    
    // Add additional tags based on content keywords (optional)
    const contentText = document.body.textContent.toLowerCase();
    const possibleTags = ['blockchain', 'crypto', 'ai', 'web3', 'defi', 'nft', 'ethereum', 'privacy', 'smart contract', 'development'];
    
    possibleTags.forEach(tag => {
      if (contentText.includes(tag)) {
        const processedTag = tag.replace(' ', '');
        if (!tags.includes(processedTag)) {
          tags.push(processedTag);
        }
      }
    });
  }
  
  // Determine the document type
  const type = "document"; // Default type
  
  // Create the asset object
  const asset = {
    id,
    title,
    description: description.trim(),
    tags,
    url: `/assets/${file}`,
    type
  };
  
  assets.push(asset);
  console.log(`Processed: ${file} -> ${title} (${tags.join(', ')})`);
});

// Write to assets.json
fs.writeFileSync(outputFile, JSON.stringify(assets, null, 2));
console.log(`Generated metadata for ${assets.length} assets in ${outputFile}`);

// Now let's inject the assets into the worker.js file
const workerPath = path.join(__dirname, 'src/worker.js');
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Replace the __ASSETS__ placeholder with the actual assets array
workerContent = workerContent.replace(
  'const assets = __ASSETS__;',
  `const assets = ${JSON.stringify(assets, null, 2)};`
);

// Write the updated worker.js file
fs.writeFileSync(workerPath, workerContent);
console.log(`Updated worker.js with generated assets`);