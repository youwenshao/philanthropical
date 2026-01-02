/**
 * Script to download case study images from Unsplash
 * Uses Unsplash Source API (no auth required for basic usage)
 * Run with: npx tsx scripts/download-case-study-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Case study image mappings - using Unsplash Source API
// Format: https://source.unsplash.com/1920x1080/?{keywords}
const caseStudyImages: Array<{ filename: string; keywords: string; description: string }> = [
  {
    filename: 'clean-water-kenya.jpg',
    keywords: 'clean+water+well+africa+rural',
    description: 'Clean Water Initiative in Rural Kenya',
  },
  {
    filename: 'education-technology.jpg',
    keywords: 'children+tablets+education+technology',
    description: 'Education Technology for Remote Learning',
  },
  {
    filename: 'medical-supplies.jpg',
    keywords: 'medical+supplies+hospital+aid',
    description: 'Medical Supplies Distribution in Conflict Zones',
  },
  {
    filename: 'sustainable-agriculture.jpg',
    keywords: 'farming+agriculture+sustainable+training',
    description: 'Sustainable Agriculture Training Program',
  },
  {
    filename: 'women-entrepreneurship.jpg',
    keywords: 'women+business+entrepreneurship+success',
    description: "Women's Entrepreneurship Support",
  },
  {
    filename: 'reforestation-amazon.jpg',
    keywords: 'reforestation+trees+amazon+forest',
    description: 'Reforestation Project in Amazon Basin',
  },
];

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`Downloading from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(outputPath);
    
    await pipeline(stream, writeStream);
    console.log(`✓ Saved to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error:`, error);
    return false;
  }
}

async function main() {
  const caseStudiesDir = path.join(process.cwd(), 'public', 'case-studies');
  
  if (!fs.existsSync(caseStudiesDir)) {
    fs.mkdirSync(caseStudiesDir, { recursive: true });
  }
  
  console.log('Downloading case study images from Unsplash...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const image of caseStudyImages) {
    const outputPath = path.join(caseStudiesDir, image.filename);
    
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${image.filename} (already exists)`);
      continue;
    }
    
    // Use Unsplash Source API
    const url = `https://source.unsplash.com/1920x1080/?${image.keywords}`;
    
    const success = await downloadImage(url, outputPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\nCompleted: ${successCount} successful, ${failCount} failed`);
}

main().catch(console.error);

