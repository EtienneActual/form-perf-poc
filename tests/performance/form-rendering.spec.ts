import { test, expect } from "@playwright/test";
import { PerformanceCollector, FieldTypeConfig } from "../utils/performance";

const testConfigurations: FieldTypeConfig[] = [
  // Small form
  { textField: 2, select: 1, autocomplete: 1, checkbox: 1, datePicker: 0 },
  // Medium form
  { textField: 5, select: 2, autocomplete: 2, checkbox: 2, datePicker: 1 },
  // Large form
  { textField: 10, select: 5, autocomplete: 3, checkbox: 3, datePicker: 2 },
  // Extra large form
  { textField: 15, select: 8, autocomplete: 5, checkbox: 5, datePicker: 2 },
];

test.describe("Form Rendering Performance", () => {
  let collector: PerformanceCollector;

  test.beforeEach(async () => {
    collector = new PerformanceCollector();
  });

  test.afterEach(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await collector.saveMetrics(`form-rendering-${timestamp}.json`);
  });

  for (const config of testConfigurations) {
    const totalFields = Object.values(config).reduce(
      (sum, count) => sum + count,
      0
    );

    test(`TanStack Form rendering with ${totalFields} fields`, async ({
      page,
    }) => {
      // Warm up
      await page.goto("/");

      // Measure TanStack Form rendering
      const metrics = await collector.measureFormRender(
        page,
        `rendering-${totalFields}-fields`,
        "tanstack",
        config
      );

      // Verify form is rendered correctly
      await expect(
        page.locator('[data-testid="form-container"]')
      ).toBeVisible();
      await expect(page.locator("h2")).toContainText("TanStack Form");

      // Verify correct number of fields are rendered
      const totalInputs = await page
        .locator('input, [role="combobox"]')
        .count();
      expect(totalInputs).toBeGreaterThanOrEqual(totalFields);

      // Log metrics
      console.log(
        `TanStack Form (${totalFields} fields): ${metrics.metrics.formRenderTime?.toFixed(
          2
        )}ms`
      );

      // Performance assertions
      expect(metrics.metrics.formRenderTime).toBeLessThan(5000); // Should render within 5 seconds
      if (totalFields <= 10) {
        expect(metrics.metrics.formRenderTime).toBeLessThan(1000); // Small forms should be fast
      }
    });

    test(`Formik Form rendering with ${totalFields} fields`, async ({
      page,
    }) => {
      // Warm up
      await page.goto("/");

      // Measure Formik Form rendering
      const metrics = await collector.measureFormRender(
        page,
        `rendering-${totalFields}-fields`,
        "formik",
        config
      );

      // Verify form is rendered correctly
      await expect(
        page.locator('[data-testid="form-container"]')
      ).toBeVisible();
      await expect(page.locator("h2")).toContainText("Formik Form");

      // Verify correct number of fields are rendered
      const totalInputs = await page
        .locator('input, [role="combobox"]')
        .count();
      expect(totalInputs).toBeGreaterThanOrEqual(totalFields);

      // Log metrics
      console.log(
        `Formik Form (${totalFields} fields): ${metrics.metrics.formRenderTime?.toFixed(
          2
        )}ms`
      );

      // Performance assertions
      expect(metrics.metrics.formRenderTime).toBeLessThan(5000); // Should render within 5 seconds
      if (totalFields <= 10) {
        expect(metrics.metrics.formRenderTime).toBeLessThan(1000); // Small forms should be fast
      }
    });
  }

  test("Rendering Performance Comparison", async ({ page }) => {
    const mediumConfig = {
      textField: 5,
      select: 2,
      autocomplete: 2,
      checkbox: 2,
      datePicker: 1,
    };

    // Test both forms with same configuration
    const tanstackMetrics = await collector.measureFormRender(
      page,
      "comparison-test",
      "tanstack",
      mediumConfig
    );
    await page.goto("/"); // Reset
    const formikMetrics = await collector.measureFormRender(
      page,
      "comparison-test",
      "formik",
      mediumConfig
    );

    // Log comparison
    const tanstackTime = tanstackMetrics.metrics.formRenderTime || 0;
    const formikTime = formikMetrics.metrics.formRenderTime || 0;

    console.log("=== RENDERING PERFORMANCE COMPARISON ===");
    console.log(`TanStack Form: ${tanstackTime.toFixed(2)}ms`);
    console.log(`Formik Form: ${formikTime.toFixed(2)}ms`);
    console.log(
      `Difference: ${Math.abs(tanstackTime - formikTime).toFixed(2)}ms`
    );
    console.log(
      `Faster: ${
        tanstackTime < formikTime ? "TanStack" : "Formik"
      } by ${Math.abs(
        ((tanstackTime - formikTime) / Math.max(tanstackTime, formikTime)) * 100
      ).toFixed(1)}%`
    );

    // Both should be reasonably fast
    expect(tanstackTime).toBeLessThan(2000);
    expect(formikTime).toBeLessThan(2000);
  });
});
