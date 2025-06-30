import { PerformanceMetrics } from "./performance";
import * as fs from "fs/promises";
import * as path from "path";

export interface PerformanceReport {
  timestamp: string;
  summary: {
    totalTests: number;
    tanstackTests: number;
    formikTests: number;
    averageRenderTime: { tanstack: number; formik: number };
    averageValidationTime: { tanstack: number; formik: number };
    averageInteractionTime: { tanstack: number; formik: number };
    memoryUsage: { tanstack: number; formik: number };
  };
  detailedResults: {
    rendering: PerformanceMetrics[];
    interaction: PerformanceMetrics[];
    validation: PerformanceMetrics[];
    scalability: PerformanceMetrics[];
  };
  comparisons: {
    renderingWinner: string;
    validationWinner: string;
    interactionWinner: string;
    memoryWinner: string;
    overallWinner: string;
  };
  recommendations: string[];
}

export class PerformanceReportGenerator {
  private metrics: PerformanceMetrics[] = [];

  constructor(metricsFiles?: string[]) {
    if (metricsFiles) {
      this.loadMetricsFromFiles(metricsFiles);
    }
  }

  async loadMetricsFromFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        const content = await fs.readFile(file, "utf-8");
        const fileMetrics: PerformanceMetrics[] = JSON.parse(content);
        this.metrics.push(...fileMetrics);
      } catch (error) {
        console.warn(`Could not load metrics from ${file}:`, error);
      }
    }
  }

  addMetrics(metrics: PerformanceMetrics[]): void {
    this.metrics.push(...metrics);
  }

  generateReport(): PerformanceReport {
    const tanstackMetrics = this.metrics.filter(
      (m) => m.formType === "tanstack"
    );
    const formikMetrics = this.metrics.filter((m) => m.formType === "formik");

    const summary = this.generateSummary(tanstackMetrics, formikMetrics);
    const detailedResults = this.categorizeResults();
    const comparisons = this.generateComparisons(
      tanstackMetrics,
      formikMetrics
    );
    const recommendations = this.generateRecommendations(comparisons, summary);

    return {
      timestamp: new Date().toISOString(),
      summary,
      detailedResults,
      comparisons,
      recommendations,
    };
  }

  private generateSummary(
    tanstackMetrics: PerformanceMetrics[],
    formikMetrics: PerformanceMetrics[]
  ) {
    const getAverage = (
      metrics: PerformanceMetrics[],
      field: keyof PerformanceMetrics["metrics"]
    ) => {
      const values = metrics
        .map((m) => m.metrics[field])
        .filter((v) => v !== undefined) as number[];
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    };

    return {
      totalTests: this.metrics.length,
      tanstackTests: tanstackMetrics.length,
      formikTests: formikMetrics.length,
      averageRenderTime: {
        tanstack: getAverage(tanstackMetrics, "formRenderTime"),
        formik: getAverage(formikMetrics, "formRenderTime"),
      },
      averageValidationTime: {
        tanstack: getAverage(tanstackMetrics, "validationTime"),
        formik: getAverage(formikMetrics, "validationTime"),
      },
      averageInteractionTime: {
        tanstack: getAverage(tanstackMetrics, "inputResponseTime"),
        formik: getAverage(formikMetrics, "inputResponseTime"),
      },
      memoryUsage: {
        tanstack: getAverage(tanstackMetrics, "memoryUsage"),
        formik: getAverage(formikMetrics, "memoryUsage"),
      },
    };
  }

  private categorizeResults() {
    return {
      rendering: this.metrics.filter(
        (m) => m.metrics.formRenderTime !== undefined
      ),
      interaction: this.metrics.filter(
        (m) => m.metrics.inputResponseTime !== undefined
      ),
      validation: this.metrics.filter(
        (m) => m.metrics.validationTime !== undefined
      ),
      scalability: this.metrics.filter((m) => m.totalFields > 20),
    };
  }

  private generateComparisons(
    tanstackMetrics: PerformanceMetrics[],
    formikMetrics: PerformanceMetrics[]
  ) {
    const getWinner = (
      tanstackAvg: number,
      formikAvg: number,
      lowerIsBetter: boolean = true
    ) => {
      if (tanstackAvg === 0 && formikAvg === 0) return "Tie";
      if (tanstackAvg === 0) return "Formik";
      if (formikAvg === 0) return "TanStack";

      if (lowerIsBetter) {
        return tanstackAvg < formikAvg ? "TanStack" : "Formik";
      } else {
        return tanstackAvg > formikAvg ? "TanStack" : "Formik";
      }
    };

    const getAverage = (
      metrics: PerformanceMetrics[],
      field: keyof PerformanceMetrics["metrics"]
    ) => {
      const values = metrics
        .map((m) => m.metrics[field])
        .filter((v) => v !== undefined) as number[];
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    };

    const renderingWinner = getWinner(
      getAverage(tanstackMetrics, "formRenderTime"),
      getAverage(formikMetrics, "formRenderTime")
    );

    const validationWinner = getWinner(
      getAverage(tanstackMetrics, "validationTime"),
      getAverage(formikMetrics, "validationTime")
    );

    const interactionWinner = getWinner(
      getAverage(tanstackMetrics, "inputResponseTime"),
      getAverage(formikMetrics, "inputResponseTime")
    );

    const memoryWinner = getWinner(
      getAverage(tanstackMetrics, "memoryUsage"),
      getAverage(formikMetrics, "memoryUsage")
    );

    // Calculate overall winner based on weighted scores
    const scores = {
      TanStack: 0,
      Formik: 0,
    };

    [
      renderingWinner,
      validationWinner,
      interactionWinner,
      memoryWinner,
    ].forEach((winner) => {
      if (winner === "TanStack") scores.TanStack++;
      if (winner === "Formik") scores.Formik++;
    });

    const overallWinner =
      scores.TanStack > scores.Formik
        ? "TanStack"
        : scores.Formik > scores.TanStack
        ? "Formik"
        : "Tie";

    return {
      renderingWinner,
      validationWinner,
      interactionWinner,
      memoryWinner,
      overallWinner,
    };
  }

  private generateRecommendations(
    comparisons: PerformanceReport["comparisons"],
    summary: PerformanceReport["summary"]
  ): string[] {
    const recommendations: string[] = [];

    // Rendering recommendations
    if (comparisons.renderingWinner === "TanStack") {
      recommendations.push(
        "TanStack Form shows better rendering performance, especially for complex forms"
      );
    } else if (comparisons.renderingWinner === "Formik") {
      recommendations.push(
        "Formik shows better rendering performance in your test scenarios"
      );
    }

    // Validation recommendations
    if (comparisons.validationWinner === "TanStack") {
      recommendations.push(
        "Zod validation (TanStack) performs better than Yup validation (Formik)"
      );
    } else if (comparisons.validationWinner === "Formik") {
      recommendations.push(
        "Yup validation (Formik) performs better than Zod validation (TanStack)"
      );
    }

    // Memory recommendations
    if (comparisons.memoryWinner === "TanStack") {
      recommendations.push("TanStack Form has better memory efficiency");
    } else if (comparisons.memoryWinner === "Formik") {
      recommendations.push("Formik has better memory efficiency");
    }

    // Scale recommendations
    const hasScalabilityData = summary.totalTests > 10;
    if (hasScalabilityData) {
      if (
        summary.averageRenderTime.tanstack < summary.averageRenderTime.formik
      ) {
        recommendations.push("TanStack Form scales better with larger forms");
      } else {
        recommendations.push("Formik scales better with larger forms");
      }
    }

    // Overall recommendation
    if (comparisons.overallWinner === "TanStack") {
      recommendations.push(
        "🏆 Overall recommendation: TanStack Form for better performance"
      );
    } else if (comparisons.overallWinner === "Formik") {
      recommendations.push(
        "🏆 Overall recommendation: Formik for better performance"
      );
    } else {
      recommendations.push(
        "🤝 Both libraries show similar performance - choose based on developer experience preferences"
      );
    }

    return recommendations;
  }

  async generateHtmlReport(
    report: PerformanceReport,
    outputPath: string
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Performance Report - ${new Date(
      report.timestamp
    ).toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .comparison-table th,
        .comparison-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .comparison-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .winner {
            background-color: #d4edda;
            font-weight: bold;
        }
        .recommendations {
            background: #e7f3ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .recommendation-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #cce7ff;
        }
        .chart-container {
            margin: 30px 0;
            text-align: center;
        }
        .bar-chart {
            display: flex;
            justify-content: space-around;
            align-items: end;
            height: 200px;
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .bar {
            width: 60px;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 4px 4px 0 0;
            color: white;
            display: flex;
            align-items: end;
            justify-content: center;
            padding: 10px 5px;
            font-weight: bold;
            font-size: 12px;
        }
        .bar-label {
            margin-top: 10px;
            font-size: 14px;
            font-weight: bold;
        }
        .section {
            margin: 40px 0;
            padding: 20px 0;
            border-top: 2px solid #eee;
        }
        .section h2 {
            color: #333;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Form Performance Report</h1>
            <p>TanStack Form vs Formik - Generated on ${new Date(
              report.timestamp
            ).toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📈 Executive Summary</h2>
                <div class="summary-grid">
                    <div class="metric-card">
                        <div class="metric-value">${
                          report.summary.totalTests
                        }</div>
                        <div class="metric-label">Total Tests</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          report.comparisons.overallWinner
                        }</div>
                        <div class="metric-label">Overall Winner</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          report.summary.averageRenderTime.tanstack > 0
                            ? report.summary.averageRenderTime.tanstack.toFixed(
                                0
                              )
                            : "N/A"
                        }ms</div>
                        <div class="metric-label">TanStack Avg Render</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          report.summary.averageRenderTime.formik > 0
                            ? report.summary.averageRenderTime.formik.toFixed(0)
                            : "N/A"
                        }ms</div>
                        <div class="metric-label">Formik Avg Render</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🏆 Performance Comparison</h2>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>TanStack Form</th>
                            <th>Formik</th>
                            <th>Winner</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Form Rendering</td>
                            <td>${report.summary.averageRenderTime.tanstack.toFixed(
                              2
                            )}ms</td>
                            <td>${report.summary.averageRenderTime.formik.toFixed(
                              2
                            )}ms</td>
                            <td class="${
                              report.comparisons.renderingWinner ===
                                "TanStack" ||
                              report.comparisons.renderingWinner === "Formik"
                                ? "winner"
                                : ""
                            }">${report.comparisons.renderingWinner}</td>
                        </tr>
                        <tr>
                            <td>Validation</td>
                            <td>${report.summary.averageValidationTime.tanstack.toFixed(
                              2
                            )}ms</td>
                            <td>${report.summary.averageValidationTime.formik.toFixed(
                              2
                            )}ms</td>
                            <td class="${
                              report.comparisons.validationWinner ===
                                "TanStack" ||
                              report.comparisons.validationWinner === "Formik"
                                ? "winner"
                                : ""
                            }">${report.comparisons.validationWinner}</td>
                        </tr>
                        <tr>
                            <td>Interaction</td>
                            <td>${report.summary.averageInteractionTime.tanstack.toFixed(
                              2
                            )}ms</td>
                            <td>${report.summary.averageInteractionTime.formik.toFixed(
                              2
                            )}ms</td>
                            <td class="${
                              report.comparisons.interactionWinner ===
                                "TanStack" ||
                              report.comparisons.interactionWinner === "Formik"
                                ? "winner"
                                : ""
                            }">${report.comparisons.interactionWinner}</td>
                        </tr>
                        <tr>
                            <td>Memory Usage</td>
                            <td>${(
                              report.summary.memoryUsage.tanstack /
                              1024 /
                              1024
                            ).toFixed(2)}MB</td>
                            <td>${(
                              report.summary.memoryUsage.formik /
                              1024 /
                              1024
                            ).toFixed(2)}MB</td>
                            <td class="${
                              report.comparisons.memoryWinner === "TanStack" ||
                              report.comparisons.memoryWinner === "Formik"
                                ? "winner"
                                : ""
                            }">${report.comparisons.memoryWinner}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>📊 Performance Visualization</h2>
                <div class="chart-container">
                    <h3>Average Render Time Comparison</h3>
                    <div class="bar-chart">
                        <div>
                            <div class="bar" style="height: ${Math.max(
                              (report.summary.averageRenderTime.tanstack /
                                Math.max(
                                  report.summary.averageRenderTime.tanstack,
                                  report.summary.averageRenderTime.formik
                                )) *
                                150,
                              20
                            )}px">
                                ${report.summary.averageRenderTime.tanstack.toFixed(
                                  0
                                )}ms
                            </div>
                            <div class="bar-label">TanStack</div>
                        </div>
                        <div>
                            <div class="bar" style="height: ${Math.max(
                              (report.summary.averageRenderTime.formik /
                                Math.max(
                                  report.summary.averageRenderTime.tanstack,
                                  report.summary.averageRenderTime.formik
                                )) *
                                150,
                              20
                            )}px">
                                ${report.summary.averageRenderTime.formik.toFixed(
                                  0
                                )}ms
                            </div>
                            <div class="bar-label">Formik</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>💡 Recommendations</h2>
                <div class="recommendations">
                    ${report.recommendations
                      .map(
                        (rec) =>
                          `<div class="recommendation-item">• ${rec}</div>`
                      )
                      .join("")}
                </div>
            </div>

            <div class="section">
                <h2>📋 Test Details</h2>
                <p><strong>Rendering Tests:</strong> ${
                  report.detailedResults.rendering.length
                }</p>
                <p><strong>Interaction Tests:</strong> ${
                  report.detailedResults.interaction.length
                }</p>
                <p><strong>Validation Tests:</strong> ${
                  report.detailedResults.validation.length
                }</p>
                <p><strong>Scalability Tests:</strong> ${
                  report.detailedResults.scalability.length
                }</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(outputPath, html);
  }

  async saveReport(
    report: PerformanceReport,
    outputDir: string
  ): Promise<{ jsonPath: string; htmlPath: string }> {
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonPath = path.join(
      outputDir,
      `performance-report-${timestamp}.json`
    );
    const htmlPath = path.join(
      outputDir,
      `performance-report-${timestamp}.html`
    );

    // Save JSON report
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    // Save HTML report
    await this.generateHtmlReport(report, htmlPath);

    return { jsonPath, htmlPath };
  }

  static async generateReportFromDirectory(
    metricsDir: string,
    outputDir: string
  ): Promise<{ jsonPath: string; htmlPath: string }> {
    const files = await fs.readdir(metricsDir);
    const jsonFiles = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(metricsDir, file));

    const generator = new PerformanceReportGenerator();
    await generator.loadMetricsFromFiles(jsonFiles);

    const report = generator.generateReport();
    return await generator.saveReport(report, outputDir);
  }
}
