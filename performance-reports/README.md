# Performance Test Reports

This directory contains performance test results and reports.

## Quick Start

```bash
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
```

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
