/**
 * Download official charity logos from reliable sources
 * Uses Wikipedia Commons, official websites, and other trusted sources
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Official logo URLs from Wikipedia Commons and other reliable sources
const officialLogoUrls: Record<string, string[]> = {
  'unicef.svg': [
    // Wikipedia Commons - most reliable
    'https://upload.wikimedia.org/wikipedia/commons/8/89/UNICEF_Logo.svg',
    // Alternative: Simple Icons
    'https://cdn.simpleicons.org/unicef/0193D7',
  ],
  'world-food-programme.svg': [
    'https://upload.wikimedia.org/wikipedia/commons/5/5a/World_Food_Programme_logo.svg',
    'https://cdn.simpleicons.org/wfp/1A4480',
  ],
  'doctors-without-borders.svg': [
    'https://upload.wikimedia.org/wikipedia/commons/6/69/M%C3%A9decins_Sans_Fronti%C3%A8res_logo.svg',
    'https://cdn.simpleicons.org/medecinssansfrontieres/D22630',
  ],
  'red-cross.svg': [
    'https://upload.wikimedia.org/wikipedia/commons/7/70/International_Committee_of_the_Red_Cross_logo.svg',
    'https://cdn.simpleicons.org/redcross/D52B1E',
  ],
  'world-central-kitchen.svg': [
    'https://cdn.simpleicons.org/worldcentralkitchen/FF6B35',
    // Try to get from official site
    'https://wck.org/wp-content/themes/wck/images/wck-logo.svg',
  ],
  'oxfam.svg': [
    'https://upload.wikimedia.org/wikipedia/commons/0/0e/Oxfam_logo.svg',
    'https://cdn.simpleicons.org/oxfam/EB5E28',
  ],
  'world-vision.svg': [
    'https://upload.wikimedia.org/wikipedia/commons/9/9a/World_Vision_logo.svg',
    'https://cdn.simpleicons.org/worldvision/005EB8',
  ],
  'save-the-children.svg': [
    'https://upload.wikimedia.org/wikipedia/commons/4/4e/Save_the_Children_logo.svg',
    'https://cdn.simpleicons.org/savethechildren/E31837',
  ],
  // Hong Kong charities - may need manual download
  'caritas-hong-kong.svg': [
    'https://cdn.simpleicons.org/caritas/0066CC',
  ],
  'community-chest-hong-kong.svg': [
    'https://cdn.simpleicons.org/communitychest/FF6B6B',
  ],
  'crossroads-foundation.svg': [
    'https://cdn.simpleicons.org/crossroads/4ECDC4',
  ],
  'bgca-hong-kong.svg': [
    'https://cdn.simpleicons.org/bgca/95E1D3',
  ],
  'feeding-hong-kong.svg': [
    'https://cdn.simpleicons.org/feedinghk/F38181',
  ],
  'spca-hong-kong.svg': [
    'https://cdn.simpleicons.org/spca/AA96DA',
  ],
  'hong-kong-dog-rescue.svg': [
    'https://cdn.simpleicons.org/hkdr/FCBAD3',
  ],
  'support-international-foundation.svg': [
    'https://cdn.simpleicons.org/support/A8E6CF',
  ],
};

async function downloadLogo(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`  Trying: ${url.substring(0, 80)}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/svg+xml,image/png,image/*,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.log(`  Failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();
    
    // Check if we got actual content
    if (buffer.byteLength < 100) {
      console.log(`  File too small (${buffer.byteLength} bytes), likely an error`);
      return false;
    }
    
    // Write the file
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(outputPath);
    
    await pipeline(stream, writeStream);
    console.log(`  ✓ Saved ${buffer.byteLength} bytes to ${path.basename(outputPath)}`);
    return true;
  } catch (error: any) {
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function fetchCharityLogo(filename: string): Promise<boolean> {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  const outputPath = path.join(logosDir, filename);
  
  const urls = officialLogoUrls[filename];
  if (!urls || urls.length === 0) {
    console.log(`No URLs configured for ${filename}`);
    return false;
  }
  
  console.log(`\nFetching ${filename}...`);
  
  // Try each URL in order
  for (const url of urls) {
    const success = await downloadLogo(url, outputPath);
    if (success) {
      return true;
    }
    // Wait before trying next URL
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`  ✗ Failed to fetch ${filename} from all sources`);
  return false;
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Downloading official charity logos from reliable sources...\n');
  console.log('Sources: Wikipedia Commons, Simple Icons CDN, Official websites\n');
  
  const filenames = Object.keys(officialLogoUrls);
  let successCount = 0;
  let failCount = 0;
  
  for (const filename of filenames) {
    const success = await fetchCharityLogo(filename);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Delay between charities to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(60)}`);
  
  if (failCount > 0) {
    console.log('\nNote: Some logos failed to download. You may need to:');
    console.log('1. Visit the charity\'s official website');
    console.log('2. Download their logo from the media/press section');
    console.log('3. Save it to frontend/public/logos/ with the correct filename');
  }
}

main().catch(console.error);

