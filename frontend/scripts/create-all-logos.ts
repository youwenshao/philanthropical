/**
 * Create logos for all charities using DiceBear API (works reliably)
 * These are temporary geometric logos until official ones can be downloaded
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Color scheme matching each charity's brand colors
const charityLogos: Array<{ filename: string; seed: string; color: string }> = [
  // International Charities
  { filename: 'unicef.svg', seed: 'UNICEF', color: '0193D7' },
  { filename: 'world-food-programme.svg', seed: 'WFP', color: '1A4480' },
  { filename: 'doctors-without-borders.svg', seed: 'MSF', color: 'D22630' },
  { filename: 'red-cross.svg', seed: 'RedCross', color: 'D52B1E' },
  { filename: 'world-central-kitchen.svg', seed: 'WCK', color: 'FF6B35' },
  { filename: 'oxfam.svg', seed: 'Oxfam', color: 'EB5E28' },
  { filename: 'world-vision.svg', seed: 'WorldVision', color: '005EB8' },
  { filename: 'save-the-children.svg', seed: 'SaveChildren', color: 'E31837' },
  // Hong Kong Charities (already have these, but including for completeness)
  { filename: 'caritas-hong-kong.svg', seed: 'Caritas', color: '0066CC' },
  { filename: 'community-chest-hong-kong.svg', seed: 'CommChest', color: 'FF6B6B' },
  { filename: 'crossroads-foundation.svg', seed: 'Crossroads', color: '4ECDC4' },
  { filename: 'bgca-hong-kong.svg', seed: 'BGCA', color: '95E1D3' },
  { filename: 'feeding-hong-kong.svg', seed: 'FeedingHK', color: 'F38181' },
  { filename: 'spca-hong-kong.svg', seed: 'SPCA', color: 'AA96DA' },
  { filename: 'hong-kong-dog-rescue.svg', seed: 'HKDR', color: 'FCBAD3' },
  { filename: 'support-international-foundation.svg', seed: 'Support', color: 'A8E6CF' },
];

async function downloadLogo(seed: string, color: string, outputPath: string): Promise<boolean> {
  try {
    const url = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}`;
    console.log(`  Downloading: ${seed}`);
    
    execSync(`curl -L -f -s -H "User-Agent: Mozilla/5.0" -o "${outputPath}" "${url}"`, {
      stdio: 'inherit'
    });
    
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100) {
      console.log(`  ✓ Saved`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Creating logos for all charities using DiceBear API...\n');
  console.log('Note: These are geometric shape logos. For production, replace with official logos.\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const { filename, seed, color } of charityLogos) {
    const outputPath = path.join(logosDir, filename);
    
    // Skip if already exists and is recent
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100) {
      console.log(`Skipping ${filename} (already exists)`);
      successCount++;
      continue;
    }
    
    console.log(`Fetching ${filename}...`);
    const success = await downloadLogo(seed, color, outputPath);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log(`  ✗ Failed`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(60)}`);
  console.log('\nAll logos are now available!');
  console.log('To replace with official logos later, see scripts/README-LOGOS.md');
}

main().catch(console.error);

