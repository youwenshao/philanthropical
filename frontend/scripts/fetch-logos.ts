/**
 * Script to fetch charity logos using Clearbit Logo API
 * Run with: npx tsx scripts/fetch-logos.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Map charity names to their domain names for Clearbit API
const charityDomainMap: Record<string, string> = {
  'UNICEF': 'unicef.org',
  'World Food Programme': 'wfp.org',
  'Doctors Without Borders': 'msf.org',
  'Red Cross': 'icrc.org',
  'World Central Kitchen': 'wck.org',
  'Oxfam': 'oxfam.org',
  'World Vision': 'worldvision.org',
  'Save the Children': 'savethechildren.org',
  'Caritas Hong Kong': 'caritas.org.hk',
  'The Community Chest of Hong Kong': 'commchest.org',
  'Crossroads Foundation': 'crossroads.org.hk',
  "The Boys' and Girls' Clubs Association of Hong Kong": 'bgca.org.hk',
  'Feeding Hong Kong': 'feedinghk.org',
  'SPCA Hong Kong': 'spca.org.hk',
  'Hong Kong Dog Rescue': 'hongkongdogrescue.com',
  'Support! International Foundation': 'support.org.hk',
};

// Map to sanitized filenames
const charityFilenameMap: Record<string, string> = {
  'UNICEF': 'unicef.png',
  'World Food Programme': 'world-food-programme.png',
  'Doctors Without Borders': 'doctors-without-borders.png',
  'Red Cross': 'red-cross.png',
  'World Central Kitchen': 'world-central-kitchen.png',
  'Oxfam': 'oxfam.png',
  'World Vision': 'world-vision.png',
  'Save the Children': 'save-the-children.png',
  'Caritas Hong Kong': 'caritas-hong-kong.png',
  'The Community Chest of Hong Kong': 'community-chest-hong-kong.png',
  'Crossroads Foundation': 'crossroads-foundation.png',
  "The Boys' and Girls' Clubs Association of Hong Kong": 'bgca-hong-kong.png',
  'Feeding Hong Kong': 'feeding-hong-kong.png',
  'SPCA Hong Kong': 'spca-hong-kong.png',
  'Hong Kong Dog Rescue': 'hong-kong-dog-rescue.png',
  'Support! International Foundation': 'support-international-foundation.png',
};

async function fetchLogo(domain: string, outputPath: string): Promise<boolean> {
  try {
    const url = `https://logo.clearbit.com/${domain}`;
    console.log(`Fetching logo for ${domain}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to fetch logo for ${domain}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(outputPath);
    
    await pipeline(stream, writeStream);
    console.log(`✓ Saved logo to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error fetching logo for ${domain}:`, error);
    return false;
  }
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  // Ensure directory exists
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Fetching charity logos...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [charityName, domain] of Object.entries(charityDomainMap)) {
    const filename = charityFilenameMap[charityName];
    const outputPath = path.join(logosDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${charityName} (already exists)`);
      continue;
    }
    
    const success = await fetchLogo(domain, outputPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\nCompleted: ${successCount} successful, ${failCount} failed`);
}

main().catch(console.error);

