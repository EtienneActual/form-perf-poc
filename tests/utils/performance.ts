import { Page } from "@playwright/test";

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
}

interface PerformanceWithMemory extends Performance {
  memory: MemoryInfo;
}

export interface PerformanceMetrics {
  timestamp: number;
  testName: string;
  formType: "tanstack" | "formik";
  fieldConfig: FieldTypeConfig;
  totalFields: number;
  metrics: {
    // Core Web Vitals
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    firstInputDelay?: number;

    // Custom metrics
    formRenderTime?: number;
    fieldRenderTime?: number;
    validationTime?: number;
    submissionTime?: number;
    memoryUsage?: number;

    // Interaction metrics
    inputResponseTime?: number;
    errorDisplayTime?: number;

    // Bundle metrics
    jsHeapUsedSize?: number;
    jsHeapTotalSize?: number;
  };
  details?: Record<string, string | number | boolean | null>;
}

export interface FieldTypeConfig {
  textField: number;
  select: number;
  autocomplete: number;
  checkbox: number;
  datePicker: number;
}

export class PerformanceCollector {
  private metrics: PerformanceMetrics[] = [];

  async measurePageLoad(
    page: Page
  ): Promise<number> {
    const startTime = await page.evaluate(() => performance.now());

    // Wait for form to be fully loaded and interactive
    await page.waitForSelector('[data-testid="form-container"]', {
      state: "visible",
    });
    await page.waitForLoadState("networkidle");

    const endTime = await page.evaluate(() => performance.now());
    const loadTime = endTime - startTime;

    // Collect Web Vitals
    await this.collectWebVitals(page);

    return loadTime;
  }

  async measureFormRender(
    page: Page,
    testName: string,
    formType: "tanstack" | "formik",
    fieldConfig: FieldTypeConfig
  ): Promise<PerformanceMetrics> {
    const startTime = await page.evaluate(() => performance.now());

    // Navigate to form page
    const url = formType === "tanstack" ? "/tanstack" : "/formik";
    await page.goto(url);

    // Configure fields
    await this.configureFields(page, fieldConfig);

    // Wait for form to render completely
    await page.waitForSelector('[data-testid="form-container"]', {
      state: "visible",
    });
    await page.waitForFunction(() => {
      const form = document.querySelector('[data-testid="form-container"]');
      return form && form.children.length > 0;
    });

    const endTime = await page.evaluate(() => performance.now());
    const renderTime = endTime - startTime;

    // Collect additional metrics
    const webVitals = await this.collectWebVitals(page);
    const memoryUsage = await this.collectMemoryUsage(page);

    const totalFields = Object.values(fieldConfig).reduce(
      (sum, count) => sum + count,
      0
    );

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      testName,
      formType,
      fieldConfig,
      totalFields,
      metrics: {
        ...webVitals,
        formRenderTime: renderTime,
        ...memoryUsage,
      },
    };

    this.metrics.push(metrics);
    return metrics;
  }

  async measureFieldInteraction(
    page: Page,
    testName: string,
    formType: "tanstack" | "formik",
    fieldConfig: FieldTypeConfig
  ): Promise<PerformanceMetrics> {
    // Get first text field for interaction test
    const firstTextField = page.locator('input[type="text"]').first();

    const startTime = await page.evaluate(() => performance.now());

    // Type in the field and measure response time
    await firstTextField.click();
    await firstTextField.fill("Test input value");

    // Wait for any validation or state updates
    await page.waitForTimeout(100); // Small delay to ensure all updates are processed

    const endTime = await page.evaluate(() => performance.now());
    const interactionTime = endTime - startTime;

    const totalFields = Object.values(fieldConfig).reduce(
      (sum, count) => sum + count,
      0
    );

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      testName,
      formType,
      fieldConfig,
      totalFields,
      metrics: {
        inputResponseTime: interactionTime,
      },
    };

    this.metrics.push(metrics);
    return metrics;
  }

  async measureValidation(
    page: Page,
    testName: string,
    formType: "tanstack" | "formik",
    fieldConfig: FieldTypeConfig
  ): Promise<PerformanceMetrics> {
    const firstTextField = page.locator('input[type="text"]').first();

    // Clear field to trigger validation error
    await firstTextField.click();
    await firstTextField.fill("");

    const startTime = await page.evaluate(() => performance.now());

    // Trigger validation by blurring the field
    await firstTextField.blur();

    // Wait for error message to appear
    await page.waitForSelector(
      '[role="alert"], .MuiFormHelperText-root.Mui-error',
      { state: "visible" }
    );

    const endTime = await page.evaluate(() => performance.now());
    const validationTime = endTime - startTime;

    const totalFields = Object.values(fieldConfig).reduce(
      (sum, count) => sum + count,
      0
    );

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      testName,
      formType,
      fieldConfig,
      totalFields,
      metrics: {
        validationTime,
        errorDisplayTime: validationTime,
      },
    };

    this.metrics.push(metrics);
    return metrics;
  }

  async measureSubmission(
    page: Page,
    testName: string,
    formType: "tanstack" | "formik",
    fieldConfig: FieldTypeConfig
  ): Promise<PerformanceMetrics> {
    // Fill form with valid data
    await this.fillFormWithValidData(page);

    const submitButton = page.locator('button[type="submit"]');

    const startTime = await page.evaluate(() => performance.now());

    // Submit form
    await submitButton.click();

    // Wait for success message
    await page.waitForSelector(".success-message", { state: "visible" });

    const endTime = await page.evaluate(() => performance.now());
    const submissionTime = endTime - startTime;

    const totalFields = Object.values(fieldConfig).reduce(
      (sum, count) => sum + count,
      0
    );

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      testName,
      formType,
      fieldConfig,
      totalFields,
      metrics: {
        submissionTime,
      },
    };

    this.metrics.push(metrics);
    return metrics;
  }

  private async configureFields(
    page: Page,
    fieldConfig: FieldTypeConfig
  ): Promise<void> {
    // Set text field count using proper Material UI selectors
    await page
      .locator('label:has-text("Text Fields") + div input')
      .fill(fieldConfig.textField.toString());
    await page
      .locator('label:has-text("Select Fields") + div input')
      .fill(fieldConfig.select.toString());
    await page
      .locator('label:has-text("Autocomplete Fields") + div input')
      .fill(fieldConfig.autocomplete.toString());
    await page
      .locator('label:has-text("Checkbox Fields") + div input')
      .fill(fieldConfig.checkbox.toString());
    await page
      .locator('label:has-text("Date Picker Fields") + div input')
      .fill(fieldConfig.datePicker.toString());

    // Wait for form to re-render with new field configuration
    await page.waitForTimeout(500);
  }

  private async fillFormWithValidData(
    page: Page
  ): Promise<void> {
    // Fill text fields (skip configuration fields)
    const textFields = page.locator('input[type="text"]');
    const textFieldCount = await textFields.count();
    for (let i = 0; i < textFieldCount; i++) {
      const field = textFields.nth(i);
      const fieldId = await field.getAttribute('id');
      if (!fieldId || !fieldId.includes('Field')) {
        await field.fill("Valid test input data");
      }
    }

    // Fill select fields
    const selectFields = page.locator('[role="combobox"]');
    const selectCount = await selectFields.count();
    for (let i = 0; i < selectCount; i++) {
      const select = selectFields.nth(i);
      await select.click();
      await page.locator('[role="listbox"] [role="option"]').first().click();
    }

    // Fill autocomplete fields
    const autocompleteFields = page.locator('input[role="combobox"]');
    const autocompleteCount = await autocompleteFields.count();
    for (let i = 0; i < autocompleteCount; i++) {
      const autocomplete = autocompleteFields.nth(i);
      await autocomplete.click();
      await autocomplete.fill('Option 1');
    }

    // Check checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      await checkboxes.nth(i).check();
    }
  }

  private async collectWebVitals(
    page: Page
  ): Promise<Partial<PerformanceMetrics["metrics"]>> {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: Partial<PerformanceMetrics["metrics"]> = {};

          entries.forEach((entry) => {
            if (entry.entryType === "paint") {
              if (entry.name === "first-contentful-paint") {
                metrics.firstContentfulPaint = entry.startTime;
              }
            }
            if (entry.entryType === "largest-contentful-paint") {
              metrics.largestContentfulPaint = entry.startTime;
            }
            if (entry.entryType === "layout-shift") {
              metrics.cumulativeLayoutShift =
                (metrics.cumulativeLayoutShift || 0) + entry.value;
            }
          });

          resolve(metrics);
        });

        observer.observe({
          entryTypes: ["paint", "largest-contentful-paint", "layout-shift"],
        });

        // Fallback timeout
        setTimeout(() => resolve({}), 1000);
      });
    });
  }

  private async collectMemoryUsage(
    page: Page
  ): Promise<Partial<PerformanceMetrics["metrics"]>> {
    return await page.evaluate(() => {
      if ("memory" in performance) {
        const memory = (performance as PerformanceWithMemory).memory;
        return {
          jsHeapUsedSize: memory.usedJSHeapSize,
          jsHeapTotalSize: memory.totalJSHeapSize,
          memoryUsage: memory.usedJSHeapSize,
        };
      }
      return {};
    });
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  async saveMetrics(filename: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const reportsDir = path.join(process.cwd(), "performance-reports");
    await fs.mkdir(reportsDir, { recursive: true });

    const filepath = path.join(reportsDir, filename);
    await fs.writeFile(filepath, JSON.stringify(this.metrics, null, 2));
  }
}
