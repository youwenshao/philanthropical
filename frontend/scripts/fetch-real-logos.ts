/**
 * Script to fetch real charity logos from multiple sources
 * Uses Clearbit Logo API, Wikipedia Commons, and direct URLs
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Map charity names to their domains for Clearbit API
const charityDomains: Record<string, string> = {
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

// Alternative sources - Wikipedia Commons direct URLs
const wikipediaLogos: Record<string, string> = {
  'UNICEF': 'https://upload.wikimedia.org/wikipedia/commons/8/89/UNICEF_Logo.svg',
  'World Food Programme': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/World_Food_Programme_logo.svg',
  'Doctors Without Borders': 'https://upload.wikimedia.org/wikipedia/commons/6/69/M%C3%A9decins_Sans_Fronti%C3%A8res_logo.svg',
  'Red Cross': 'https://upload.wikimedia.org/wikipedia/commons/7/70/International_Committee_of_the_Red_Cross_logo.svg',
  'Oxfam': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Oxfam_logo.svg',
  'World Vision': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/World_Vision_logo.svg',
  'Save the Children': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Save_the_Children_logo.svg',
};

// Map to output filenames
const outputFilenames: Record<string, string> = {
  'UNICEF': 'unicef.svg',
  'World Food Programme': 'world-food-programme.svg',
  'Doctors Without Borders': 'doctors-without-borders.svg',
  'Red Cross': 'red-cross.svg',
  'World Central Kitchen': 'world-central-kitchen.svg',
  'Oxfam': 'oxfam.svg',
  'World Vision': 'world-vision.svg',
  'Save the Children': 'save-the-children.svg',
  'Caritas Hong Kong': 'caritas-hong-kong.svg',
  'The Community Chest of Hong Kong': 'community-chest-hong-kong.svg',
  'Crossroads Foundation': 'crossroads-foundation.svg',
  "The Boys' and Girls' Clubs Association of Hong Kong": 'bgca-hong-kong.svg',
  'Feeding Hong Kong': 'feeding-hong-kong.svg',
  'SPCA Hong Kong': 'spca-hong-kong.svg',
  'Hong Kong Dog Rescue': 'hong-kong-dog-rescue.svg',
  'Support! International Foundation': 'support-international-foundation.svg',
};

async function downloadFromUrl(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`  Trying: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.log(`  Failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('svg') && !contentType.includes('image')) {
      console.log(`  Unexpected content type: ${contentType}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(outputPath);
    
    await pipeline(stream, writeStream);
    console.log(`  ✓ Saved to ${outputPath}`);
    return true;
  } catch (error: any) {
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function fetchLogo(charityName: string): Promise<boolean> {
  const filename = outputFilenames[charityName];
  if (!filename) {
    console.log(`No filename mapping for: ${charityName}`);
    return false;
  }
  
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  const outputPath = path.join(logosDir, filename);
  
  // Optionally skip if already exists - set to false to force re-download
  const skipExisting = false;
  if (skipExisting && fs.existsSync(outputPath)) {
    console.log(`Skipping ${charityName} (already exists)`);
    return true;
  }
  
  console.log(`\nFetching logo for: ${charityName}`);
  
  // Try Wikipedia first (most reliable for major charities)
  if (wikipediaLogos[charityName]) {
    const success = await downloadFromUrl(wikipediaLogos[charityName], outputPath);
    if (success) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Try Clearbit Logo API
  const domain = charityDomains[charityName];
  if (domain) {
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const success = await downloadFromUrl(clearbitUrl, outputPath);
    if (success) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`  ✗ Failed to fetch logo for ${charityName}`);
  return false;
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Fetching real charity logos from APIs...\n');
  
  const charities = Object.keys(outputFilenames);
  let successCount = 0;
  let failCount = 0;
  
  for (const charityName of charities) {
    const success = await fetchLogo(charityName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(50)}`);
  console.log('\nNote: Some logos may need manual download from official websites.');
}

main().catch(console.error);

