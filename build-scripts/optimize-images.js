/**
 * Image Optimization Script
 * Converts images to modern formats (WebP/AVIF) and generates responsive variants
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageOptimizer {
  constructor() {
    this.inputDir = path.join(__dirname, '../assets');
    this.outputDir = path.join(__dirname, '../dist/assets');
    this.formats = ['webp', 'avif'];
    this.qualities = { webp: 80, avif: 70 };
    this.sizes = [400, 800, 1200, 1600]; // Responsive breakpoints
  }

  async optimize() {
    console.log('🖼️  Starting image optimization...');

    try {
      await this.ensureOutputDir();
      const imageFiles = await this.findImages();

      for (const imagePath of imageFiles) {
        await this.processImage(imagePath);
      }

      await this.generateImageManifest();
      console.log('✅ Image optimization completed!');
    } catch (error) {
      console.error('❌ Image optimization failed:', error);
      process.exit(1);
    }
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async findImages() {
    const images = [];

    const scanDirectory = async dir => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (this.isImageFile(entry.name)) {
          images.push(fullPath);
        }
      }
    };

    await scanDirectory(this.inputDir);
    return images;
  }

  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  async processImage(imagePath) {
    const relativePath = path.relative(this.inputDir, imagePath);
    const parsedPath = path.parse(relativePath);
    const outputBase = path.join(
      this.outputDir,
      parsedPath.dir,
      parsedPath.name
    );

    console.log(`Processing: ${relativePath}`);

    try {
      // First, validate the image file
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // Skip if metadata is invalid or image is corrupted
      if (!metadata || !metadata.width || !metadata.height) {
        console.warn(`⚠️  Skipping ${relativePath}: Invalid image metadata`);
        return;
      }

      // Generate original format (optimized)
      await this.generateOptimizedOriginal(
        image,
        imagePath,
        outputBase
      );

      // Generate modern formats
      for (const format of this.formats) {
        await this.generateModernFormat(image, outputBase, format);
      }

      // Generate responsive variants for large images
      if (metadata.width > 800) {
        await this.generateResponsiveVariants(image, outputBase, metadata);
      }

      console.log(`✅ Successfully processed: ${relativePath}`);
    } catch (error) {
      // Log warning but don't fail the build
      console.warn(`⚠️  Skipping ${relativePath}: ${error.message}`);
      
      // Copy the original file as fallback if it's a valid image extension
      try {
        const outputPath = path.join(this.outputDir, relativePath);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.copyFile(imagePath, outputPath);
        console.log(`📋 Copied original file as fallback: ${relativePath}`);
      } catch (copyError) {
        console.warn(`❌ Could not copy fallback for ${relativePath}: ${copyError.message}`);
      }
    }
  }

  async generateOptimizedOriginal(image, originalPath, outputBase) {
    const ext = path.extname(originalPath).toLowerCase();
    const outputPath = `${outputBase}${ext}`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let pipeline = image.clone();

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 85, progressive: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: 90, progressive: true });
    }

    await pipeline.toFile(outputPath);
  }

  async generateModernFormat(image, outputBase, format) {
    const outputPath = `${outputBase}.${format}`;
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let pipeline = image.clone();

    if (format === 'webp') {
      pipeline = pipeline.webp({ quality: this.qualities.webp });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality: this.qualities.avif });
    }

    await pipeline.toFile(outputPath);
  }

  async generateResponsiveVariants(image, outputBase, metadata) {
    const applicableSizes = this.sizes.filter(size => size < metadata.width);

    for (const size of applicableSizes) {
      for (const format of [...this.formats, 'original']) {
        const suffix = `_${size}w`;
        let pipeline = image.clone().resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside',
        });

        let outputPath;
        if (format === 'original') {
          const ext = path.extname(outputBase) || '.jpg';
          outputPath = `${outputBase}${suffix}${ext}`;
          if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({ quality: 85, progressive: true });
          } else if (ext === '.png') {
            pipeline = pipeline.png({ quality: 90, progressive: true });
          }
        } else {
          outputPath = `${outputBase}${suffix}.${format}`;
          if (format === 'webp') {
            pipeline = pipeline.webp({ quality: this.qualities.webp });
          } else if (format === 'avif') {
            pipeline = pipeline.avif({ quality: this.qualities.avif });
          }
        }

        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await pipeline.toFile(outputPath);
      }
    }
  }

  async generateImageManifest() {
    const manifest = {
      generated: new Date().toISOString(),
      formats: this.formats,
      qualities: this.qualities,
      sizes: this.sizes,
      images: {},
    };

    const scanOptimizedImages = async (dir, basePath = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          await scanOptimizedImages(fullPath, relativePath);
        } else if (this.isOptimizedImage(entry.name)) {
          const stats = await fs.stat(fullPath);
          const key = this.getImageKey(relativePath);

          if (!manifest.images[key]) {
            manifest.images[key] = { variants: [] };
          }

          manifest.images[key].variants.push({
            path: relativePath.replace(/\\/g, '/'),
            format: this.getImageFormat(entry.name),
            size: this.getImageSize(entry.name),
            fileSize: stats.size,
          });
        }
      }
    };

    await scanOptimizedImages(this.outputDir);

    const manifestPath = path.join(this.outputDir, 'image-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(
      `📋 Generated image manifest with ${Object.keys(manifest.images).length} images`
    );
  }

  isOptimizedImage(filename) {
    return /\.(jpg|jpeg|png|webp|avif)$/i.test(filename);
  }

  getImageKey(relativePath) {
    return relativePath.replace(/(_\d+w)?\.(jpg|jpeg|png|webp|avif)$/i, '');
  }

  getImageFormat(filename) {
    const match = filename.match(/\.(jpg|jpeg|png|webp|avif)$/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  getImageSize(filename) {
    const match = filename.match(/_(\d+)w\./);
    return match ? parseInt(match[1]) : null;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ImageOptimizer();
  optimizer.optimize();
}

export default ImageOptimizer;
