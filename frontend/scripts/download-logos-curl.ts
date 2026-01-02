/**
 * Download logos using curl (more reliable for complex URLs and redirects)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Direct download URLs - using curl which handles redirects better
const logoDownloads: Array<{ filename: string; urls: string[] }> = [
  {
    filename: 'unicef.svg',
    urls: [
      'https://simpleicons.org/icons/unicef.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/unicef.svg',
    ],
  },
  {
    filename: 'world-food-programme.svg',
    urls: [
      'https://simpleicons.org/icons/wfp.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/wfp.svg',
    ],
  },
  {
    filename: 'doctors-without-borders.svg',
    urls: [
      'https://simpleicons.org/icons/medecinssansfrontieres.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/medecinssansfrontieres.svg',
    ],
  },
  {
    filename: 'red-cross.svg',
    urls: [
      'https://simpleicons.org/icons/redcross.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/redcross.svg',
    ],
  },
  {
    filename: 'oxfam.svg',
    urls: [
      'https://simpleicons.org/icons/oxfam.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/oxfam.svg',
    ],
  },
  {
    filename: 'world-vision.svg',
    urls: [
      'https://simpleicons.org/icons/worldvision.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/worldvision.svg',
    ],
  },
  {
    filename: 'save-the-children.svg',
    urls: [
      'https://simpleicons.org/icons/savethechildren.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/savethechildren.svg',
    ],
  },
  {
    filename: 'world-central-kitchen.svg',
    urls: [
      'https://simpleicons.org/icons/worldcentralkitchen.svg',
      'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/worldcentralkitchen.svg',
    ],
  },
];

async function downloadWithCurl(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`  Downloading: ${url}`);
    execSync(
      `curl -L -f -s -H "User-Agent: Mozilla/5.0" -o "${outputPath}" "${url}"`,
      { stdio: 'inherit' }
    );
    
    // Check if file exists and has content
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 100) {
        console.log(`  ✓ Saved ${stats.size} bytes`);
        return true;
      } else {
        console.log(`  ✗ File too small (${stats.size} bytes)`);
        fs.unlinkSync(outputPath);
        return false;
      }
    }
    return false;
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    return false;
  }
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Downloading charity logos from Simple Icons...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const { filename, urls } of logoDownloads) {
    const outputPath = path.join(logosDir, filename);
    console.log(`\nFetching ${filename}...`);
    
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
      console.log(`  ✗ Failed to download ${filename}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // For HK charities, use DiceBear API (we know this works)
  console.log('\nDownloading Hong Kong charity logos from DiceBear API...\n');
  const hkCharities = [
    { filename: 'caritas-hong-kong.svg', seed: 'Caritas', color: '0066cc' },
    { filename: 'community-chest-hong-kong.svg', seed: 'CommChest', color: 'ff6b6b' },
    { filename: 'crossroads-foundation.svg', seed: 'Crossroads', color: '4ecdc4' },
    { filename: 'bgca-hong-kong.svg', seed: 'BGCA', color: '95e1d3' },
    { filename: 'feeding-hong-kong.svg', seed: 'FeedingHK', color: 'f38181' },
    { filename: 'spca-hong-kong.svg', seed: 'SPCA', color: 'aa96da' },
    { filename: 'hong-kong-dog-rescue.svg', seed: 'HKDR', color: 'fcbad3' },
    { filename: 'support-international-foundation.svg', seed: 'Support', color: 'a8e6cf' },
  ];
  
  for (const { filename, seed, color } of hkCharities) {
    const outputPath = path.join(logosDir, filename);
    const url = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}`;
    console.log(`Fetching ${filename}...`);
    
    const success = await downloadWithCurl(url, outputPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);

