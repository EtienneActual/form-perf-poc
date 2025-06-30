#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function setupPerfTests() {
  try {
    console.log('🚀 Setting up performance testing environment...');
    
    // Create necessary directories
    const directories = [
      'performance-reports',
      'performance-reports/html',
      'performance-reports/json'
    ];
    
    for (const dir of directories) {
      const dirPath = join(projectRoot, dir);
      try {
        await fs.access(dirPath);
        console.log(`✅ Directory ${dir} already exists`);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`📁 Created directory ${dir}`);
      }
    }
    
    // Create .gitignore for performance reports if it doesn't exist
    const gitignorePath = join(projectRoot, 'performance-reports', '.gitignore');
    try {
      await fs.access(gitignorePath);
    } catch {
      const gitignoreContent = `# Ignore performance test results
*.json
*.html

# Keep directory structure
!.gitignore
`;
      await fs.writeFile(gitignorePath, gitignoreContent);
      console.log('📝 Created .gitignore for performance reports');
    }
    
    // Create README for performance testing
    const readmePath = join(projectRoot, 'performance-reports', 'README.md');
    const readmeContent = `# Performance Test Reports

This directory contains performance test results and reports.

## Quick Start

\`\`\`bash
# Run all performance tests and generate report
npm run test:perf:full

# Run specific test suites
npm run test:perf:rendering    # Form rendering tests
npm run test:perf:validation   # Validation performance tests
npm run test:perf:scalability  # Scalability tests

# Generate report from existing results
npm run perf:report

# Clean up old reports
npm run perf:clean
\`\`\`

## Test Categories

- **Rendering Tests**: Measure form initialization and rendering time
- **Interaction Tests**: Measure field input responsiveness
- **Validation Tests**: Compare Zod vs Yup validation performance
- **Scalability Tests**: Test performance with different field counts (5-100 fields)

## Report Format

Reports are generated in both JSON and HTML formats:
- JSON: Machine-readable data for further analysis
- HTML: Human-readable visual reports with charts and recommendations

## Performance Metrics

- Form render time
- Field interaction latency
- Validation response time
- Memory usage
- Scalability analysis
`;
    
    await fs.writeFile(readmePath, readmeContent);
    console.log('📖 Created performance testing README');
    
    console.log('\n✅ Performance testing environment setup complete!');
    console.log('\n🎯 Next steps:');
    console.log('  1. npm run test:perf:quick    # Quick performance test');
    console.log('  2. npm run test:perf:full     # Full test suite with report');
    console.log('  3. Open the generated HTML report in your browser');
    
  } catch (error) {
    console.error('❌ Error setting up performance tests:', error.message);
    process.exit(1);
  }
}

setupPerfTests();