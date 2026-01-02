/**
 * Create placeholder SVG logos for charities
 * These are simple colored circles with initials as placeholders
 */

import * as fs from 'fs';
import * as path from 'path';

interface CharityLogo {
  filename: string;
  name: string;
  initials: string;
  color: string;
}

const charities: CharityLogo[] = [
  { filename: 'unicef.png', name: 'UNICEF', initials: 'UN', color: '#0193D7' },
  { filename: 'world-food-programme.png', name: 'World Food Programme', initials: 'WFP', color: '#1A4480' },
  { filename: 'doctors-without-borders.png', name: 'Doctors Without Borders', initials: 'MSF', color: '#D22630' },
  { filename: 'red-cross.png', name: 'Red Cross', initials: 'RC', color: '#D52B1E' },
  { filename: 'world-central-kitchen.png', name: 'World Central Kitchen', initials: 'WCK', color: '#FF6B35' },
  { filename: 'oxfam.png', name: 'Oxfam', initials: 'OX', color: '#EB5E28' },
  { filename: 'world-vision.png', name: 'World Vision', initials: 'WV', color: '#005EB8' },
  { filename: 'save-the-children.png', name: 'Save the Children', initials: 'SC', color: '#E31837' },
  { filename: 'caritas-hong-kong.png', name: 'Caritas Hong Kong', initials: 'CH', color: '#0066CC' },
  { filename: 'community-chest-hong-kong.png', name: 'The Community Chest of Hong Kong', initials: 'CC', color: '#FF6B6B' },
  { filename: 'crossroads-foundation.png', name: 'Crossroads Foundation', initials: 'CF', color: '#4ECDC4' },
  { filename: 'bgca-hong-kong.png', name: "The Boys' and Girls' Clubs Association of Hong Kong", initials: 'BG', color: '#95E1D3' },
  { filename: 'feeding-hong-kong.png', name: 'Feeding Hong Kong', initials: 'FH', color: '#F38181' },
  { filename: 'spca-hong-kong.png', name: 'SPCA Hong Kong', initials: 'SP', color: '#AA96DA' },
  { filename: 'hong-kong-dog-rescue.png', name: 'Hong Kong Dog Rescue', initials: 'HK', color: '#FCBAD3' },
  { filename: 'support-international-foundation.png', name: 'Support! International Foundation', initials: 'SI', color: '#A8E6CF' },
];

function createSVGLogo(charity: CharityLogo): string {
  const size = 200;
  const fontSize = charity.initials.length > 2 ? 48 : 64;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size / 4}" fill="${charity.color}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${fontSize}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >${charity.initials}</text>
</svg>`;
}

async function main() {
  const logosDir = path.join(process.cwd(), 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
  
  console.log('Creating placeholder SVG logos...\n');
  
  for (const charity of charities) {
    const outputPath = path.join(logosDir, charity.filename);
    
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${charity.filename} (already exists)`);
      continue;
    }
    
    // Create SVG
    const svg = createSVGLogo(charity);
    
    // For PNG files, we'll save as SVG but with .png extension
    // In a real scenario, you'd convert SVG to PNG using a library like sharp
    // For now, we'll save as SVG and update the utility to handle both
    const svgPath = outputPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);
    console.log(`✓ Created ${svgPath}`);
  }
  
  console.log('\nCompleted! Note: These are SVG placeholders. For production, convert to PNG or use actual logos.');
}

main().catch(console.error);

