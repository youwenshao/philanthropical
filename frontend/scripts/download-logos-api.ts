/**
 * Download logos using Logo.dev API (free tier available)
 * Alternative: Uses multiple logo API services as fallbacks
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Charity domains for logo APIs
const charityDomains: Record<string, string> = {
  'unicef.svg': 'unicef.org',
  'world-food-programme.svg': 'wfp.org',
  'doctors-without-borders.svg': 'msf.org',
  'red-cross.svg': 'icrc.org',
  'world-central-kitchen.svg': 'wck.org',
  'oxfam.svg': 'oxfam.org',
  'world-vision.svg': 'worldvision.org',
  'save-the-children.svg': 'savethechildren.org',
};

async function downloadLogo(domain: string, outputPath: string, apiType: 'logo.dev' | 'clearbit' | 'favicon'): Promise<boolean> {
  let url = '';
  
  switch (apiType) {
    case 'logo.dev':
      url = `https://logo.clearbit.com/${domain}`;
      break;
    case 'clearbit':
      url = `https://logo.clearbit.com/${domain}`;
      break;
    case 'favicon':
      url = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      break;
  }
  
  try {
    console.log(`  Trying ${apiType}: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(outputPath);
    
    await pipeline(stream, writeStream);
    console.log(`  ✓ Saved to ${outputPath}`);
    return true;
  } catch (error) {
    return false;
  }
}

async function fetchCharityLogo(filename: string, domain: string): Promise<boolean> {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  const outputPath = path.join(logosDir, filename);
  
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100) {
    console.log(`Skipping ${filename} (already exists)`);
    return true;
  }
  
  console.log(`\nFetching ${filename}...`);
  
  // Try multiple APIs in order
  const apis: Array<'logo.dev' | 'clearbit' | 'favicon'> = ['clearbit', 'favicon'];
  
  for (const api of apis) {
    const success = await downloadLogo(domain, outputPath, api);
    if (success) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`  ✗ Failed to fetch ${filename}`);
  return false;
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Downloading charity logos from logo APIs...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [filename, domain] of Object.entries(charityDomains)) {
    const success = await fetchCharityLogo(filename, domain);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

