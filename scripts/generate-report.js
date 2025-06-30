#!/usr/bin/env node

import { PerformanceReportGenerator } from '../tests/utils/report-generator.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function generateReport() {
  try {
    console.log('🚀 Generating performance report...');
    
    const metricsDir = join(projectRoot, 'performance-reports');
    const outputDir = join(projectRoot, 'performance-reports');
    
    // Check if metrics directory exists
    try {
      await fs.access(metricsDir);
    } catch (error) {
      console.log('📁 Creating performance-reports directory...');
      await fs.mkdir(metricsDir, { recursive: true });
    }
    
    // Generate report from all JSON files in the metrics directory
    const { jsonPath, htmlPath } = await PerformanceReportGenerator.generateReportFromDirectory(
      metricsDir,
      outputDir
    );
    
    console.log('✅ Performance report generated successfully!');
    console.log(`📊 JSON Report: ${jsonPath}`);
    console.log(`🌐 HTML Report: ${htmlPath}`);
    console.log('');
    console.log('📖 Open the HTML report in your browser to view the detailed analysis.');
    
    // Display summary in console
    const reportContent = await fs.readFile(jsonPath, 'utf-8');
    const report = JSON.parse(reportContent);
    
    console.log('\n🏆 PERFORMANCE SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Overall Winner: ${report.comparisons.overallWinner}`);
    console.log('');
    console.log('🚀 Average Render Times:');
    console.log(`  TanStack Form: ${report.summary.averageRenderTime.tanstack.toFixed(2)}ms`);
    console.log(`  Formik:        ${report.summary.averageRenderTime.formik.toFixed(2)}ms`);
    console.log('');
    console.log('⚡ Average Validation Times:');
    console.log(`  TanStack (Zod): ${report.summary.averageValidationTime.tanstack.toFixed(2)}ms`);
    console.log(`  Formik (Yup):   ${report.summary.averageValidationTime.formik.toFixed(2)}ms`);
    console.log('');
    console.log('💾 Memory Usage:');
    console.log(`  TanStack: ${(report.summary.memoryUsage.tanstack / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Formik:   ${(report.summary.memoryUsage.formik / 1024 / 1024).toFixed(2)}MB`);
    console.log('');
    console.log('💡 Key Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating performance report:', error.message);
    process.exit(1);
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🎯 Performance Report Generator

Usage: npm run perf:report

This script generates a comprehensive performance report from all test results
in the performance-reports directory.

Output:
  - JSON report with detailed metrics
  - HTML report with visual charts and analysis
  - Console summary with key insights

Example workflow:
  1. npm run test:perf:full     # Run all performance tests and generate report
  2. npm run test:perf          # Run tests only
  3. npm run perf:report        # Generate report from existing results
  4. npm run perf:clean         # Clean up old reports

Available test commands:
  - npm run test:perf:rendering    # Test form rendering performance
  - npm run test:perf:interaction  # Test field interaction performance  
  - npm run test:perf:validation   # Test validation performance
  - npm run test:perf:scalability  # Test scalability with different field counts
  - npm run test:perf:quick        # Quick test (rendering + validation)
`);
  process.exit(0);
}

generateReport();