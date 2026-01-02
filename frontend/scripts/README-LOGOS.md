# Charity Logo Download Instructions

Due to network connectivity issues with external APIs, here are instructions for downloading official charity logos:

## Current Status

- ✅ 8 Hong Kong charity logos downloaded (from DiceBear API - geometric shapes)
- ❌ 8 International charity logos need to be downloaded manually

## Manual Download Instructions

### Option 1: Download from Official Websites

1. Visit each charity's official website
2. Look for "Media", "Press", "Resources", or "Brand Guidelines" sections
3. Download their official logo (preferably SVG or high-res PNG)
4. Save to `frontend/public/logos/` with the correct filename:

**International Charities:**
- `unicef.svg` - From https://www.unicef.org
- `world-food-programme.svg` - From https://www.wfp.org
- `doctors-without-borders.svg` - From https://www.msf.org
- `red-cross.svg` - From https://www.icrc.org
- `world-central-kitchen.svg` - From https://www.wck.org
- `oxfam.svg` - From https://www.oxfam.org
- `world-vision.svg` - From https://www.worldvision.org
- `save-the-children.svg` - From https://www.savethechildren.org

### Option 2: Use Logo Databases

1. **Wikipedia Commons**: https://commons.wikimedia.org
   - Search for "[Charity Name] logo"
   - Download SVG format when available

2. **Simple Icons**: https://simpleicons.org
   - Search for charity name
   - Download SVG format

3. **Brands of the World**: https://www.brandsoftheworld.com
   - Search for charity name
   - Download vector formats (SVG, AI, EPS)

### Option 3: Run Script When Network is Available

When you have stable internet connection, run:

```bash
cd frontend
npx tsx scripts/download-logos-final.ts
```

This will attempt to download from Clearbit Logo API.

## File Format Notes

- SVG format is preferred for scalability
- PNG format is acceptable (img tags handle both)
- Files can have `.svg` extension even if they're PNG (browsers handle this)
- Minimum recommended size: 200x200px for good quality

## Verification

After downloading, verify logos appear correctly:
1. Restart the Next.js dev server
2. Visit `/donate` page
3. Check that logos appear next to charity names
4. Visit `/transparency` page
5. Verify logos in charity directory

## Current Placeholders

The HK charities currently have geometric shape logos from DiceBear API. These are functional but can be replaced with official logos when available.

