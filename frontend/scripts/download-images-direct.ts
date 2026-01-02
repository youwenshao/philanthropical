/**
 * Script to download images using direct URLs from Unsplash/Pexels
 * Uses specific curated image URLs
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Direct image URLs - using Unsplash direct image links
// These are example URLs - in production, you'd want to use specific photo IDs
const caseStudyImageUrls: Record<string, string> = {
  'clean-water-kenya.jpg': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop',
  'education-technology.jpg': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop',
  'medical-supplies.jpg': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop',
  'sustainable-agriculture.jpg': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop',
  'women-entrepreneurship.jpg': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop',
  'reforestation-amazon.jpg': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
};

// Logo URLs - using smaller thumbnails to avoid rate limiting, or alternative sources
const charityLogoUrls: Record<string, string> = {
  'unicef.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/UNICEF_Logo.svg/200px-UNICEF_Logo.svg.png',
  'world-food-programme.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/World_Food_Programme_logo.svg/200px-World_Food_Programme_logo.svg.png',
  'doctors-without-borders.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/M%C3%A9decins_Sans_Fronti%C3%A8res_logo.svg/200px-M%C3%A9decins_Sans_Fronti%C3%A8res_logo.svg.png',
  'red-cross.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/International_Committee_of_the_Red_Cross_logo.svg/200px-International_Committee_of_the_Red_Cross_logo.svg.png',
  'oxfam.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Oxfam_logo.svg/200px-Oxfam_logo.svg.png',
  'world-vision.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/World_Vision_logo.svg/200px-World_Vision_logo.svg.png',
  'save-the-children.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Save_the_Children_logo.svg/200px-Save_the_Children_logo.svg.png',
  'world-central-kitchen.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/World_Central_Kitchen_logo.svg/200px-World_Central_Kitchen_logo.svg.png',
  // HK charities - will create placeholders or find alternative sources
  'caritas-hong-kong.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Caritas_logo.svg/200px-Caritas_logo.svg.png',
  'community-chest-hong-kong.png': '', // Placeholder - will need manual download
  'crossroads-foundation.png': '', // Placeholder
  'bgca-hong-kong.png': '', // Placeholder
  'feeding-hong-kong.png': '', // Placeholder
  'spca-hong-kong.png': '', // Placeholder
  'hong-kong-dog-rescue.png': '', // Placeholder
  'support-international-foundation.png': '', // Placeholder
};

async function downloadImage(url: string, outputPath: string, description: string): Promise<boolean> {
  try {
    console.log(`Downloading ${description}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.warn(`  Failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn(`  Invalid content type: ${contentType}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(outputPath);
    
    await pipeline(stream, writeStream);
    console.log(`  ✓ Saved to ${outputPath}`);
    return true;
  } catch (error: any) {
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function downloadCaseStudyImages() {
  const caseStudiesDir = path.join(process.cwd(), 'public', 'case-studies');
  
  if (!fs.existsSync(caseStudiesDir)) {
    fs.mkdirSync(caseStudiesDir, { recursive: true });
  }
  
  console.log('Downloading case study images...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [filename, url] of Object.entries(caseStudyImageUrls)) {
    const outputPath = path.join(caseStudiesDir, filename);
    
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }
    
    const success = await downloadImage(url, outputPath, filename);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nCase studies: ${successCount} successful, ${failCount} failed\n`);
  return { successCount, failCount };
}

async function downloadCharityLogos() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Downloading charity logos...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [filename, url] of Object.entries(charityLogoUrls)) {
    const outputPath = path.join(logosDir, filename);
    
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }
    
    // Skip empty URLs (placeholders)
    if (!url) {
      console.log(`Skipping ${filename} (no URL provided - placeholder)`);
      continue;
    }
    
    const success = await downloadImage(url, outputPath, filename);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Longer delay for Wikipedia to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\nLogos: ${successCount} successful, ${failCount} failed\n`);
  return { successCount, failCount };
}

async function main() {
  console.log('Starting image downloads...\n');
  
  const caseStudyResults = await downloadCaseStudyImages();
  const logoResults = await downloadCharityLogos();
  
  console.log('='.repeat(50));
  console.log('Summary:');
  console.log(`Case Studies: ${caseStudyResults.successCount} successful, ${caseStudyResults.failCount} failed`);
  console.log(`Logos: ${logoResults.successCount} successful, ${logoResults.failCount} failed`);
  console.log('='.repeat(50));
}

main().catch(console.error);

