import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = './public/assets';

// Get all jpg/jpeg files
const files = fs.readdirSync(assetsDir).filter(file => 
  file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
);

console.log(`Found ${files.length} images to convert to WebP\n`);

async function convertImage(filename) {
  const inputPath = path.join(assetsDir, filename);
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;
  
  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  const outputPath = path.join(assetsDir, `${nameWithoutExt}.webp`);
  
  console.log(`Processing: ${filename}`);
  console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB, ${metadata.width}x${metadata.height}`);
  
  // Resize to max 1920px width/height and convert to WebP with quality 70
  await sharp(inputPath)
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(outputPath);
  
  const newStats = fs.statSync(outputPath);
  const newSize = newStats.size;
  const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
  
  console.log(`  WebP: ${(newSize / 1024 / 1024).toFixed(2)} MB (${savings}% smaller vs original)\n`);
  
  // Remove original file
  fs.unlinkSync(inputPath);
}

async function main() {
  for (const file of files) {
    await convertImage(file);
  }
  console.log('All images converted to WebP successfully!');
}

main().catch(console.error);
