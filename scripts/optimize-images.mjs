import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, parse } from 'path';
import { existsSync } from 'fs';

const inputDir = 'public/images';
const outputDir = 'public/images';

// Imagens que precisam ser otimizadas
const imagesToOptimize = [
  'HeroImgLine.jpg',    // 797 KiB - CRÍTICA
  'lineandFlag.jpg',    // Grande
  'about.jpg',          // Grande
  'impact.jpg',         // Grande
  'line.jpg',           // Grande
  'colabore.jpg',       // Grande
  'cinematic.jpg',      // Grande
];

async function optimizeImages() {
  console.log('🖼️  Iniciando otimização de imagens...\n');

  for (const filename of imagesToOptimize) {
    const inputPath = join(inputDir, filename);
    
    if (!existsSync(inputPath)) {
      console.log(`⚠️  Arquivo não encontrado: ${filename}\n`);
      continue;
    }

    const { name } = parse(filename);
    const webpPath = join(outputDir, `${name}.webp`);
    const avifPath = join(outputDir, `${name}.avif`);

    try {
      // Gerar WebP (fallback para navegadores antigos)
      console.log(`📦 WebP: ${filename}`);
      await sharp(inputPath)
        .webp({ 
          quality: 80,  // Qualidade boa, arquivo menor
          effort: 6     // Máximo esforço de compressão
        })
        .toFile(webpPath);
      console.log(`   ✅ ${name}.webp\n`);

      // Gerar AVIF (melhor compressão, navegadores modernos)
      console.log(`📦 AVIF: ${filename}`);
      await sharp(inputPath)
        .avif({ 
          quality: 75,  // Qualidade boa (AVIF é mais eficiente)
          effort: 9     // Máximo esforço (mais lento mas arquivo menor)
        })
        .toFile(avifPath);
      console.log(`   ✅ ${name}.avif\n`);

    } catch (error) {
      console.error(`❌ Erro ao otimizar ${filename}:`, error.message);
    }
  }

  console.log('═════════════════════════════════════════');
  console.log('✨ Otimização completa!\n');
  console.log('📊 Próximos passos:');
  console.log('   1. Usar <picture> com AVIF + WebP + JPG fallback');
  console.log('   2. <source type="image/avif" srcset="...avif" />');
  console.log('   3. <source type="image/webp" srcset="...webp" />');
  console.log('   4. <img src="...jpg" alt="..." />\n');
}

optimizeImages();
