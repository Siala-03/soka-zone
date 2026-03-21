import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = './public/assets';

// Get all webp files
const files = fs.readdirSync(assetsDir).filter(file => 
  file.toLowerCase().endsWith('.webp') && !file.startsWith('small_')
);

console.log(`Found ${files.length} images to resize\n`);

async function resizeImage(filename) {
  const inputPath = path.join(assetsDir, filename);
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;
  
  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  
  console.log(`Processing: ${filename}`);
  console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB, ${metadata.width}x${metadata.height}`);
  
  // Resize to max 800px width/height for smaller file size
  const outputPath = path.join(assetsDir, `small_${filename}`);
  await sharp(inputPath)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(outputPath);
  
  const newStats = fs.statSync(outputPath);
  const newSize = newStats.size;
  const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
  
  console.log(`  Resized: ${(newSize / 1024 / 1024).toFixed(2)} MB (${savings}% smaller)\n`);
}

async function main() {
  for (const file of files) {
    await resizeImage(file);
  }
  console.log('All images resized successfully!');
}

main().catch(console.error);
