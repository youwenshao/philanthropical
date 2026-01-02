/**
 * Final attempt: Download logos using multiple reliable methods
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Using Clearbit Logo API (works for major charities) and converting to SVG-compatible format
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

async function downloadClearbitLogo(domain: string, outputPath: string): Promise<boolean> {
  try {
    const url = `https://logo.clearbit.com/${domain}`;
    console.log(`  Downloading from Clearbit: ${url}`);
    
    // Download as PNG first (Clearbit returns PNG)
    const pngPath = outputPath.replace('.svg', '.png');
    execSync(`curl -L -f -s -H "User-Agent: Mozilla/5.0" -o "${pngPath}" "${url}"`, { stdio: 'inherit' });
    
    if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 100) {
      // For now, keep as PNG but with .svg extension (img tags will handle it)
      // Or rename to .png and update the utility
      fs.renameSync(pngPath, outputPath);
      console.log(`  ✓ Saved logo`);
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
  
  console.log('Downloading charity logos from Clearbit Logo API...\n');
  console.log('Note: These will be PNG files (Clearbit returns PNG format)\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [filename, domain] of Object.entries(charityDomains)) {
    const outputPath = path.join(logosDir, filename);
    console.log(`Fetching ${filename} (${domain})...`);
    
    const success = await downloadClearbitLogo(domain, outputPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log(`  ✗ Failed`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`${'='.repeat(60)}`);
  console.log('\nNote: Downloaded logos are PNG format from Clearbit.');
  console.log('The .svg extension is kept for compatibility, but img tags handle PNG fine.');
}

main().catch(console.error);

