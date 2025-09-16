/**
 * Modern Image Loader with WebP/AVIF Support
 * Automatically serves the best format based on browser support
 */

class ModernImageLoader {
  constructor() {
    this.formatSupport = {};
    this.imageManifest = null;
    this.init();
  }

  async init() {
    await this.detectFormatSupport();
    await this.loadImageManifest();
  }

  async detectFormatSupport() {
    // Test WebP support
    this.formatSupport.webp = await this.testFormat(
      'webp',
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    );

    // Test AVIF support
    this.formatSupport.avif = await this.testFormat(
      'avif',
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    );

    console.log('Format support:', this.formatSupport);
  }

  async testFormat(format, testImage) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img.width === 2 && img.height === 2);
      img.onerror = () => resolve(false);
      img.src = testImage;
    });
  }

  async loadImageManifest() {
    try {
      const response = await fetch('/dist/assets/image-manifest.json');
      if (response.ok) {
        this.imageManifest = await response.json();
        console.log(
          'Image manifest loaded:',
          Object.keys(this.imageManifest.images).length,
          'images'
        );
      }
    } catch (error) {
      console.warn('Could not load image manifest:', error);
    }
  }

  getBestImageSrc(imagePath, targetWidth = null) {
    if (!this.imageManifest) {
      return imagePath; // Fallback to original
    }

    const imageKey = this.getImageKey(imagePath);
    const imageData = this.imageManifest.images[imageKey];

    if (!imageData) {
      return imagePath; // Fallback if not in manifest
    }

    // Determine best format
    let preferredFormat = 'jpg';
    if (this.formatSupport.avif) {
      preferredFormat = 'avif';
    } else if (this.formatSupport.webp) {
      preferredFormat = 'webp';
    }

    // Find best size variant
    let bestVariant = null;
    if (targetWidth) {
      // Find the smallest variant that's larger than target width
      const suitableVariants = imageData.variants
        .filter(
          v =>
            v.format === preferredFormat &&
            (v.size === null || v.size >= targetWidth)
        )
        .sort((a, b) => (a.size || Infinity) - (b.size || Infinity));

      bestVariant = suitableVariants[0];
    }

    // Fallback to any variant of preferred format
    if (!bestVariant) {
      bestVariant = imageData.variants.find(v => v.format === preferredFormat);
    }

    // Final fallback to original format
    if (!bestVariant) {
      bestVariant = imageData.variants.find(
        v => v.format === 'jpg' || v.format === 'png'
      );
    }

    return bestVariant ? `/dist/assets/${bestVariant.path}` : imagePath;
  }

  generateSrcSet(imagePath) {
    if (!this.imageManifest) {
      return imagePath;
    }

    const imageKey = this.getImageKey(imagePath);
    const imageData = this.imageManifest.images[imageKey];

    if (!imageData) {
      return imagePath;
    }

    // Determine best format
    let preferredFormat = 'jpg';
    if (this.formatSupport.avif) {
      preferredFormat = 'avif';
    } else if (this.formatSupport.webp) {
      preferredFormat = 'webp';
    }

    // Generate srcset for preferred format
    const variants = imageData.variants
      .filter(v => v.format === preferredFormat && v.size)
      .sort((a, b) => a.size - b.size);

    if (variants.length === 0) {
      return this.getBestImageSrc(imagePath);
    }

    const srcSet = variants
      .map(v => `/dist/assets/${v.path} ${v.size}w`)
      .join(', ');

    return srcSet;
  }

  generatePictureElement(
    imagePath,
    alt = '',
    className = '',
    targetWidth = null
  ) {
    if (!this.imageManifest) {
      return `<img src="${imagePath}" alt="${alt}" class="${className}">`;
    }

    const imageKey = this.getImageKey(imagePath);
    const imageData = this.imageManifest.images[imageKey];

    if (!imageData) {
      return `<img src="${imagePath}" alt="${alt}" class="${className}">`;
    }

    let pictureHTML = '<picture>';

    // Add AVIF source if supported
    if (this.formatSupport.avif) {
      const avifSrcSet = this.generateFormatSrcSet(imageData, 'avif');
      if (avifSrcSet) {
        pictureHTML += `<source srcset="${avifSrcSet}" type="image/avif">`;
      }
    }

    // Add WebP source if supported
    if (this.formatSupport.webp) {
      const webpSrcSet = this.generateFormatSrcSet(imageData, 'webp');
      if (webpSrcSet) {
        pictureHTML += `<source srcset="${webpSrcSet}" type="image/webp">`;
      }
    }

    // Add fallback img element
    const fallbackSrc = this.getBestImageSrc(imagePath, targetWidth);
    const fallbackSrcSet =
      this.generateFormatSrcSet(imageData, 'jpg') ||
      this.generateFormatSrcSet(imageData, 'png');

    pictureHTML += `<img src="${fallbackSrc}"`;
    if (fallbackSrcSet) {
      pictureHTML += ` srcset="${fallbackSrcSet}"`;
    }
    pictureHTML += ` alt="${alt}" class="${className}">`;
    pictureHTML += '</picture>';

    return pictureHTML;
  }

  generateFormatSrcSet(imageData, format) {
    const variants = imageData.variants
      .filter(v => v.format === format && v.size)
      .sort((a, b) => a.size - b.size);

    if (variants.length === 0) {
      const singleVariant = imageData.variants.find(v => v.format === format);
      return singleVariant ? `/dist/assets/${singleVariant.path}` : null;
    }

    return variants.map(v => `/dist/assets/${v.path} ${v.size}w`).join(', ');
  }

  getImageKey(imagePath) {
    return imagePath
      .replace(/^.*\//, '')
      .replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
  }

  // Lazy loading with modern formats
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const originalSrc = img.dataset.src;

            // Get optimized source
            const optimizedSrc = this.getBestImageSrc(originalSrc);
            const srcSet = this.generateSrcSet(originalSrc);

            img.src = optimizedSrc;
            if (srcSet && srcSet !== optimizedSrc) {
              img.srcset = srcSet;
            }

            img.classList.add('loaded');
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
      }
    );

    images.forEach(img => imageObserver.observe(img));
  }

  // Convert existing images to use modern formats
  upgradeExistingImages() {
    const images = document.querySelectorAll('img:not([data-src])');

    images.forEach(img => {
      const currentSrc = img.src;
      if (currentSrc && !currentSrc.includes('/dist/assets/')) {
        const optimizedSrc = this.getBestImageSrc(currentSrc);
        const srcSet = this.generateSrcSet(currentSrc);

        if (optimizedSrc !== currentSrc) {
          img.src = optimizedSrc;
          if (srcSet && srcSet !== optimizedSrc) {
            img.srcset = srcSet;
          }
        }
      }
    });
  }

  // Preload critical images
  preloadCriticalImages(imagePaths) {
    imagePaths.forEach(imagePath => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getBestImageSrc(imagePath);

      // Add responsive preload if supported
      const srcSet = this.generateSrcSet(imagePath);
      if (srcSet && srcSet !== link.href) {
        link.imagesrcset = srcSet;
        link.imagesizes = '(max-width: 768px) 100vw, 50vw';
      }

      document.head.appendChild(link);
    });
  }
}

// Initialize and export
const imageLoader = new ModernImageLoader();

// Auto-setup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      imageLoader.setupLazyLoading();
      imageLoader.upgradeExistingImages();
    }, 100);
  });
} else {
  setTimeout(() => {
    imageLoader.setupLazyLoading();
    imageLoader.upgradeExistingImages();
  }, 100);
}

export default imageLoader;
