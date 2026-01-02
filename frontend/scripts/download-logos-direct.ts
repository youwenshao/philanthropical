/**
 * Download logos directly from known good sources using curl
 * This script uses direct URLs from official sources and logo CDNs
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Direct logo URLs from reliable sources
const logoUrls: Record<string, string[]> = {
  'unicef.svg': [
    'https://www.unicef.org/sites/default/files/2019-04/UNICEF_Logo_Blue_RGB.png',
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/unicef.svg',
  ],
  'world-food-programme.svg': [
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/wfp.svg',
  ],
  'doctors-without-borders.svg': [
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/medecinssansfrontieres.svg',
  ],
  'red-cross.svg': [
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/redcross.svg',
  ],
  'oxfam.svg': [
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/oxfam.svg',
  ],
  'world-vision.svg': [
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/worldvision.svg',
  ],
  'save-the-children.svg': [
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/savethechildren.svg',
  ],
};

// For charities not in Simple Icons, we'll use a logo API service
const logoApiUrls: Record<string, string> = {
  'world-central-kitchen.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=WCK&backgroundColor=ff6b35',
  'caritas-hong-kong.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=Caritas&backgroundColor=0066cc',
  'community-chest-hong-kong.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=CommChest&backgroundColor=ff6b6b',
  'crossroads-foundation.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=Crossroads&backgroundColor=4ecdc4',
  'bgca-hong-kong.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=BGCA&backgroundColor=95e1d3',
  'feeding-hong-kong.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=FeedingHK&backgroundColor=f38181',
  'spca-hong-kong.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=SPCA&backgroundColor=aa96da',
  'hong-kong-dog-rescue.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=HKDR&backgroundColor=fcbad3',
  'support-international-foundation.svg': 'https://api.dicebear.com/7.x/shapes/svg?seed=Support&backgroundColor=a8e6cf',
};

async function downloadWithCurl(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`  Downloading: ${url}`);
    execSync(`curl -L -f -s -o "${outputPath}" "${url}"`, { stdio: 'inherit' });
    
    // Check if file was created and has content
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
      console.log(`  ✓ Saved to ${outputPath}`);
      return true;
    } else {
      console.log(`  ✗ File is empty or doesn't exist`);
      return false;
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error}`);
    return false;
  }
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Downloading charity logos from CDN and APIs...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // Download from Simple Icons CDN (most reliable)
  for (const [filename, urls] of Object.entries(logoUrls)) {
    const outputPath = path.join(logosDir, filename);
    let success = false;
    
    for (const url of urls) {
      success = await downloadWithCurl(url, outputPath);
      if (success) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Download placeholder-style logos for HK charities from DiceBear API
  for (const [filename, url] of Object.entries(logoApiUrls)) {
    const outputPath = path.join(logosDir, filename);
    const success = await downloadWithCurl(url, outputPath);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(50)}`);
  console.log('\nNote: Downloaded logos from Simple Icons CDN and DiceBear API.');
  console.log('For production, consider downloading official logos from charity websites.');
}

main().catch(console.error);

