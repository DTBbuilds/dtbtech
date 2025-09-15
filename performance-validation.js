/**
 * Performance Validation Script
 * Quick test to validate all optimizations are working
 */

console.log('🚀 DTB Technologies Performance Validation');

// Test 1: Check if modules are loaded
setTimeout(() => {
  const tests = {
    'Main App': window.dtbApp !== undefined,
    'Lazy Loader': window.lazyLoader !== undefined,
    'Animation Optimizer': window.animationOptimizer !== undefined,
    'Web Vitals Monitor': window.webVitalsMonitor !== undefined,
    'Service Worker Support': 'serviceWorker' in navigator,
    'Intersection Observer': 'IntersectionObserver' in window,
    'Performance API': 'performance' in window && 'memory' in performance
  };

  console.log('📊 Module Loading Tests:');
  Object.entries(tests).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  // Test 2: Performance Metrics
  if (window.webVitalsMonitor) {
    setTimeout(() => {
      const metrics = window.webVitalsMonitor.getMetrics();
      const score = window.webVitalsMonitor.getPerformanceScore();
      
      console.log('📈 Performance Metrics:');
      console.log(`Overall Score: ${score}/100`);
      console.log('Core Web Vitals:', {
        LCP: metrics.LCP ? `${metrics.LCP}ms` : 'measuring...',
        FID: metrics.FID ? `${metrics.FID}ms` : 'waiting for interaction...',
        CLS: metrics.CLS ? metrics.CLS.toFixed(3) : 'measuring...',
        FCP: metrics.FCP ? `${metrics.FCP}ms` : 'measuring...',
        TTFB: metrics.TTFB ? `${metrics.TTFB}ms` : 'measuring...'
      });
    }, 2000);
  }

  // Test 3: Animation Optimization
  if (window.animationOptimizer) {
    const optimizer = window.animationOptimizer;
    console.log('🎬 Animation Optimization Status:');
    console.log(`Mobile Device: ${optimizer.isMobile}`);
    console.log(`Low-end Device: ${optimizer.isLowEndDevice}`);
    console.log(`Reduced Motion: ${optimizer.prefersReducedMotion}`);
  }

  // Test 4: CSS Optimizations
  const mobileCSS = document.querySelector('link[href*="mobile-optimized"]');
  console.log(`📱 Mobile CSS Loaded: ${mobileCSS ? '✅ YES' : '❌ NO'}`);

  // Test 5: Image Optimization
  const preloadedImages = document.querySelectorAll('link[rel="preload"][as="image"]');
  console.log(`🖼️ Preloaded Images: ${preloadedImages.length}`);

}, 1000);

// Test 6: Scroll Performance Test
function testScrollPerformance() {
  console.log('🔄 Testing scroll performance...');
  let frameCount = 0;
  const startTime = performance.now();
  
  const testScroll = () => {
    window.scrollBy(0, 5);
    frameCount++;
    
    if (frameCount < 60) {
      requestAnimationFrame(testScroll);
    } else {
      const endTime = performance.now();
      const fps = Math.round(1000 / ((endTime - startTime) / frameCount));
      console.log(`📊 Scroll Performance: ${fps} FPS`);
      window.scrollTo(0, 0);
      
      if (fps >= 55) {
        console.log('✅ Excellent scroll performance!');
      } else if (fps >= 45) {
        console.log('⚠️ Good scroll performance');
      } else {
        console.log('❌ Poor scroll performance - optimizations needed');
      }
    }
  };
  
  requestAnimationFrame(testScroll);
}

// Auto-run scroll test after 3 seconds
setTimeout(testScrollPerformance, 3000);

console.log('✨ Performance validation complete! Check console for results.');
