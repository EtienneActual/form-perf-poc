import { test, expect } from "@playwright/test";
import { PerformanceCollector, FieldTypeConfig } from "../utils/performance";

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
}

interface PerformanceWithMemory extends Performance {
  memory: MemoryInfo;
}

test.describe("Scalability Performance Tests", () => {
  let collector: PerformanceCollector;

  test.beforeEach(async () => {
    collector = new PerformanceCollector();
  });

  test.afterEach(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await collector.saveMetrics(`scalability-${timestamp}.json`);
  });

  // Test configurations from small to very large
  const scalabilityConfigs: { name: string; config: FieldTypeConfig }[] = [
    {
      name: "Tiny (5 fields)",
      config: {
        textField: 3,
        select: 1,
        autocomplete: 1,
        checkbox: 0,
        datePicker: 0,
      },
    },
    {
      name: "Small (12 fields)",
      config: {
        textField: 5,
        select: 2,
        autocomplete: 2,
        checkbox: 2,
        datePicker: 1,
      },
    },
    {
      name: "Medium (25 fields)",
      config: {
        textField: 10,
        select: 5,
        autocomplete: 5,
        checkbox: 3,
        datePicker: 2,
      },
    },
    {
      name: "Large (50 fields)",
      config: {
        textField: 20,
        select: 10,
        autocomplete: 10,
        checkbox: 5,
        datePicker: 5,
      },
    },
    {
      name: "Extra Large (100 fields)",
      config: {
        textField: 40,
        select: 20,
        autocomplete: 20,
        checkbox: 10,
        datePicker: 10,
      },
    },
  ];

  for (const testConfig of scalabilityConfigs) {
    test(`TanStack Form Scalability - ${testConfig.name}`, async ({ page }) => {
      const totalFields = Object.values(testConfig.config).reduce(
        (sum, count) => sum + count,
        0
      );

      await page.goto("/tanstack");

      // Measure initial render time
      const renderStartTime = await page.evaluate(() => performance.now());

      // Configure the form
      await page
        .locator('label:has-text("Text Fields") + div input')
        .fill(testConfig.config.textField.toString());
      await page
        .locator('label:has-text("Select Fields") + div input')
        .fill(testConfig.config.select.toString());
      await page
        .locator('label:has-text("Autocomplete Fields") + div input')
        .fill(testConfig.config.autocomplete.toString());
      await page
        .locator('label:has-text("Checkbox Fields") + div input')
        .fill(testConfig.config.checkbox.toString());
      await page
        .locator('label:has-text("Date Picker Fields") + div input')
        .fill(testConfig.config.datePicker.toString());

      // Wait for form to fully render
      await page.waitForTimeout(1000);
      await page.waitForSelector('[data-testid="form-container"]', {
        state: "visible",
      });

      const renderEndTime = await page.evaluate(() => performance.now());
      const renderTime = renderEndTime - renderStartTime;

      // Measure memory usage
      const memoryUsage = await page.evaluate(() => {
        if ("memory" in performance) {
          const memory = (performance as PerformanceWithMemory).memory;
          return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
          };
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0 };
      });

      // Test interaction performance
      const interactionStartTime = await page.evaluate(() => performance.now());

      // Interact with a few fields
      const textFields = page.locator('input[type="text"]');
      const fieldCount = Math.min(await textFields.count(), 5); // Test max 5 fields

      for (let i = 0; i < fieldCount; i++) {
        const field = textFields.nth(i);
        const label = await field.getAttribute("aria-label");
        if (!label?.includes("Fields")) {
          // Skip configuration fields
          await field.click();
          await field.fill(`Test ${i}`);
        }
      }

      const interactionEndTime = await page.evaluate(() => performance.now());
      const interactionTime = interactionEndTime - interactionStartTime;

      // Log results
      console.log(`=== TanStack Form - ${testConfig.name} ===`);
      console.log(`Total fields: ${totalFields}`);
      console.log(`Render time: ${renderTime.toFixed(2)}ms`);
      console.log(`Interaction time: ${interactionTime.toFixed(2)}ms`);
      console.log(
        `Memory usage: ${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(
          2
        )}MB`
      );

      // Performance assertions based on form size
      if (totalFields <= 15) {
        expect(renderTime).toBeLessThan(3000); // Small forms should render quickly
        expect(interactionTime).toBeLessThan(1000); // Should be responsive
      } else if (totalFields <= 30) {
        expect(renderTime).toBeLessThan(5000); // Medium forms
        expect(interactionTime).toBeLessThan(2000);
      } else if (totalFields <= 60) {
        expect(renderTime).toBeLessThan(10000); // Large forms
        expect(interactionTime).toBeLessThan(4000);
      } else {
        expect(renderTime).toBeLessThan(20000); // Extra large forms
        expect(interactionTime).toBeLessThan(8000);
      }

      // Memory usage should be reasonable
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    test(`Formik Form Scalability - ${testConfig.name}`, async ({ page }) => {
      const totalFields = Object.values(testConfig.config).reduce(
        (sum, count) => sum + count,
        0
      );

      await page.goto("/formik");

      // Measure initial render time
      const renderStartTime = await page.evaluate(() => performance.now());

      // Configure the form
      await page
        .locator('label:has-text("Text Fields") + div input')
        .fill(testConfig.config.textField.toString());
      await page
        .locator('label:has-text("Select Fields") + div input')
        .fill(testConfig.config.select.toString());
      await page
        .locator('label:has-text("Autocomplete Fields") + div input')
        .fill(testConfig.config.autocomplete.toString());
      await page
        .locator('label:has-text("Checkbox Fields") + div input')
        .fill(testConfig.config.checkbox.toString());
      await page
        .locator('label:has-text("Date Picker Fields") + div input')
        .fill(testConfig.config.datePicker.toString());

      // Wait for form to fully render
      await page.waitForTimeout(1000);
      await page.waitForSelector('[data-testid="form-container"]', {
        state: "visible",
      });

      const renderEndTime = await page.evaluate(() => performance.now());
      const renderTime = renderEndTime - renderStartTime;

      // Measure memory usage
      const memoryUsage = await page.evaluate(() => {
        if ("memory" in performance) {
          const memory = (performance as PerformanceWithMemory).memory;
          return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
          };
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0 };
      });

      // Test interaction performance
      const interactionStartTime = await page.evaluate(() => performance.now());

      // Interact with a few fields
      const textFields = page.locator('input[type="text"]');
      const fieldCount = Math.min(await textFields.count(), 5); // Test max 5 fields

      for (let i = 0; i < fieldCount; i++) {
        const field = textFields.nth(i);
        const label = await field.getAttribute("aria-label");
        if (!label?.includes("Fields")) {
          // Skip configuration fields
          await field.click();
          await field.fill(`Test ${i}`);
        }
      }

      const interactionEndTime = await page.evaluate(() => performance.now());
      const interactionTime = interactionEndTime - interactionStartTime;

      // Log results
      console.log(`=== Formik Form - ${testConfig.name} ===`);
      console.log(`Total fields: ${totalFields}`);
      console.log(`Render time: ${renderTime.toFixed(2)}ms`);
      console.log(`Interaction time: ${interactionTime.toFixed(2)}ms`);
      console.log(
        `Memory usage: ${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(
          2
        )}MB`
      );

      // Performance assertions based on form size
      if (totalFields <= 15) {
        expect(renderTime).toBeLessThan(3000); // Small forms should render quickly
        expect(interactionTime).toBeLessThan(2000); // Should be responsive
      } else if (totalFields <= 30) {
        expect(renderTime).toBeLessThan(5000); // Medium forms
        expect(interactionTime).toBeLessThan(3000);
      } else if (totalFields <= 60) {
        expect(renderTime).toBeLessThan(10000); // Large forms
        expect(interactionTime).toBeLessThan(4000);
      } else {
        expect(renderTime).toBeLessThan(20000); // Extra large forms
        expect(interactionTime).toBeLessThan(8000);
      }

      // Memory usage should be reasonable
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });
  }

  test("Scalability Comparison - Performance Degradation Analysis", async ({
    page,
  }) => {
    const comparisonConfigs = [
      {
        name: "Small",
        config: {
          textField: 5,
          select: 2,
          autocomplete: 2,
          checkbox: 2,
          datePicker: 1,
        },
      },
      {
        name: "Medium",
        config: {
          textField: 10,
          select: 5,
          autocomplete: 5,
          checkbox: 3,
          datePicker: 2,
        },
      },
      {
        name: "Large",
        config: {
          textField: 20,
          select: 10,
          autocomplete: 10,
          checkbox: 5,
          datePicker: 5,
        },
      },
    ];

    const results: {
      size: string;
      totalFields: number;
      tanstackRender: number;
      formikRender: number;
      tanstackMemory: number;
      formikMemory: number;
    }[] = [];

    for (const testConfig of comparisonConfigs) {
      const totalFields = Object.values(testConfig.config).reduce(
        (sum, count) => sum + count,
        0
      );

      // Test TanStack Form
      await page.goto("/tanstack");

      const tanstackStartTime = await page.evaluate(() => performance.now());

      await page
        .locator('label:has-text("Text Fields") + div input')
        .fill(testConfig.config.textField.toString());
      await page
        .locator('label:has-text("Select Fields") + div input')
        .fill(testConfig.config.select.toString());
      await page
        .locator('label:has-text("Autocomplete Fields") + div input')
        .fill(testConfig.config.autocomplete.toString());
      await page
        .locator('label:has-text("Checkbox Fields") + div input')
        .fill(testConfig.config.checkbox.toString());
      await page
        .locator('label:has-text("Date Picker Fields") + div input')
        .fill(testConfig.config.datePicker.toString());

      await page.waitForTimeout(1000);
      const tanstackEndTime = await page.evaluate(() => performance.now());
      const tanstackRenderTime = tanstackEndTime - tanstackStartTime;

      const tanstackMemory = await page.evaluate(() => {
        if ("memory" in performance) {
          return (performance as PerformanceWithMemory).memory.usedJSHeapSize;
        }
        return 0;
      });

      // Test Formik Form
      await page.goto("/formik");

      const formikStartTime = await page.evaluate(() => performance.now());

      await page
        .locator('label:has-text("Text Fields") + div input')
        .fill(testConfig.config.textField.toString());
      await page
        .locator('label:has-text("Select Fields") + div input')
        .fill(testConfig.config.select.toString());
      await page
        .locator('label:has-text("Autocomplete Fields") + div input')
        .fill(testConfig.config.autocomplete.toString());
      await page
        .locator('label:has-text("Checkbox Fields") + div input')
        .fill(testConfig.config.checkbox.toString());
      await page
        .locator('label:has-text("Date Picker Fields") + div input')
        .fill(testConfig.config.datePicker.toString());

      await page.waitForTimeout(1000);
      const formikEndTime = await page.evaluate(() => performance.now());
      const formikRenderTime = formikEndTime - formikStartTime;

      const formikMemory = await page.evaluate(() => {
        if ("memory" in performance) {
          return (performance as PerformanceWithMemory).memory.usedJSHeapSize;
        }
        return 0;
      });

      results.push({
        size: testConfig.name,
        totalFields,
        tanstackRender: tanstackRenderTime,
        formikRender: formikRenderTime,
        tanstackMemory,
        formikMemory,
      });
    }

    // Log comprehensive comparison
    console.log("\n=== SCALABILITY COMPARISON ANALYSIS ===");
    console.log("Size\t\tFields\tTanStack(ms)\tFormik(ms)\tDiff(ms)\tFaster");
    console.log(
      "-------------------------------------------------------------------"
    );

    results.forEach((result) => {
      const diff = Math.abs(result.tanstackRender - result.formikRender);
      const faster =
        result.tanstackRender < result.formikRender ? "TanStack" : "Formik";
      const percentage = (
        (diff / Math.max(result.tanstackRender, result.formikRender)) *
        100
      ).toFixed(1);

      console.log(
        `${result.size}\t\t${
          result.totalFields
        }\t${result.tanstackRender.toFixed(0)}\t\t${result.formikRender.toFixed(
          0
        )}\t\t${diff.toFixed(0)}\t${faster} (${percentage}%)`
      );
    });

    console.log("\n=== MEMORY USAGE COMPARISON ===");
    console.log("Size\t\tTanStack(MB)\tFormik(MB)\tDiff(MB)");
    console.log("-----------------------------------------------");

    results.forEach((result) => {
      const tanstackMB = result.tanstackMemory / 1024 / 1024;
      const formikMB = result.formikMemory / 1024 / 1024;
      const diffMB = Math.abs(tanstackMB - formikMB);

      console.log(
        `${result.size}\t\t${tanstackMB.toFixed(1)}\t\t${formikMB.toFixed(
          1
        )}\t\t${diffMB.toFixed(1)}`
      );
    });

    // Performance degradation analysis
    console.log("\n=== PERFORMANCE DEGRADATION ANALYSIS ===");

    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];

      const tanstackDegradation =
        ((curr.tanstackRender - prev.tanstackRender) / prev.tanstackRender) *
        100;
      const formikDegradation =
        ((curr.formikRender - prev.formikRender) / prev.formikRender) * 100;

      console.log(`${prev.size} → ${curr.size}:`);
      console.log(`  TanStack degradation: ${tanstackDegradation.toFixed(1)}%`);
      console.log(`  Formik degradation: ${formikDegradation.toFixed(1)}%`);
    }

    // Assert that performance degrades reasonably
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];

      // Performance shouldn't degrade more than 5x when doubling form size
      expect(curr.tanstackRender).toBeLessThan(prev.tanstackRender * 5);
      expect(curr.formikRender).toBeLessThan(prev.formikRender * 5);
    }
  });
});
