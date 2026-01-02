/**
 * Utility for mapping charity names and addresses to logo file paths
 */

// Map charity names to their logo filenames (sanitized)
// Note: Currently using SVG placeholders, can be replaced with PNG logos later
const charityLogoMap: Record<string, string> = {
  // International Charities
  'UNICEF': 'unicef.svg',
  'World Food Programme': 'world-food-programme.svg',
  'Doctors Without Borders': 'doctors-without-borders.svg',
  'Red Cross': 'red-cross.svg',
  'World Central Kitchen': 'world-central-kitchen.svg',
  'Oxfam': 'oxfam.svg',
  'World Vision': 'world-vision.svg',
  'Save the Children': 'save-the-children.svg',
  
  // Hong Kong Local Charities
  'Caritas Hong Kong': 'caritas-hong-kong.svg',
  'The Community Chest of Hong Kong': 'community-chest-hong-kong.svg',
  'Crossroads Foundation': 'crossroads-foundation.svg',
  "The Boys' and Girls' Clubs Association of Hong Kong": 'bgca-hong-kong.svg',
  'Feeding Hong Kong': 'feeding-hong-kong.svg',
  'SPCA Hong Kong': 'spca-hong-kong.svg',
  'Hong Kong Dog Rescue': 'hong-kong-dog-rescue.svg',
  'Support! International Foundation': 'support-international-foundation.svg',
};

// Map charity addresses to names (from seed.sql)
const addressToNameMap: Record<string, string> = {
  '0x1111111111111111111111111111111111111111': 'UNICEF',
  '0x2222222222222222222222222222222222222222': 'World Food Programme',
  '0x3333333333333333333333333333333333333333': 'Doctors Without Borders',
  '0x4444444444444444444444444444444444444444': 'Red Cross',
  '0x5555555555555555555555555555555555555555': 'World Central Kitchen',
  '0x6666666666666666666666666666666666666666': 'Oxfam',
  '0x7777777777777777777777777777777777777777': 'World Vision',
  '0x8888888888888888888888888888888888888888': 'Save the Children',
  '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'Caritas Hong Kong',
  '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB': 'The Community Chest of Hong Kong',
  '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC': 'Crossroads Foundation',
  '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD': "The Boys' and Girls' Clubs Association of Hong Kong",
  '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE': 'Feeding Hong Kong',
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF': 'SPCA Hong Kong',
  '0x1010101010101010101010101010101010101010': 'Hong Kong Dog Rescue',
  '0x2020202020202020202020202020202020202020': 'Support! International Foundation',
};

/**
 * Get the logo path for a charity by name
 */
export function getCharityLogoByName(name: string): string | null {
  const logoFile = charityLogoMap[name];
  if (!logoFile) return null;
  return `/logos/${logoFile}`;
}

/**
 * Get the logo path for a charity by address
 */
export function getCharityLogoByAddress(address: string): string | null {
  const name = addressToNameMap[address];
  if (!name) return null;
  return getCharityLogoByName(name);
}

/**
 * Get the logo path for a charity (tries both name and address)
 */
export function getCharityLogo(charity: { name?: string; address?: string }): string | null {
  if (charity.name) {
    const logo = getCharityLogoByName(charity.name);
    if (logo) return logo;
  }
  if (charity.address) {
    const logo = getCharityLogoByAddress(charity.address);
    if (logo) return logo;
  }
  return null;
}

