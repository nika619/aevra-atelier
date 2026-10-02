const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public', 'assets');
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg'));

async function processImages() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const basename = path.parse(file).name;
    
    console.log(`Processing ${file}...`);
    
    // Create AVIF
    await sharp(inputPath)
      .avif({ quality: 75 })
      .toFile(path.join(inputDir, `${basename}.avif`));
      
    // Create WebP
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(path.join(inputDir, `${basename}.webp`));
  }
  console.log('Done organizing images');
}

processImages();
