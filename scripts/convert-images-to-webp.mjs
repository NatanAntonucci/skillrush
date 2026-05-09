import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, parse } from 'path';
import { existsSync } from 'fs';

const inputDir = 'public/images';
const outputDir = 'public/images';

// Imagens que precisam ser convertidas (maiores que 100KB)
const imagesToConvert = [
  'HeroImgLine.jpg',
  'lineandFlag.jpg',
  'about.jpg',
  'impact.jpg',
  'line.jpg'
];

async function convertToWebP() {
  console.log('🔄 Iniciando conversão de imagens para WebP...\n');

  for (const filename of imagesToConvert) {
    const inputPath = join(inputDir, filename);
    const { name } = parse(filename);
    const outputPath = join(outputDir, `${name}.webp`);

    try {
      console.log(`Converting: ${filename}`);
      
      await sharp(inputPath)
        .webp({ 
          quality: 85, // Qualidade balanceada
          effort: 6    // Esforço de compressão (0-6, maior = menor arquivo)
        })
        .toFile(outputPath);

      console.log(`✅ Criado: ${name}.webp\n`);
    } catch (error) {
      console.error(`❌ Erro ao converter ${filename}:`, error.message);
    }
  }

  console.log('✨ Conversão completa!');
  console.log('\nPróximos passos:');
  console.log('1. Atualizar imports nos componentes para usar .webp');
  console.log('2. Adicionar fallback <picture> para navegadores antigos');
}

convertToWebP();
