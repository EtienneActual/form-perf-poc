import { test, expect } from "@playwright/test";
import { PerformanceCollector } from "../utils/performance";

test.describe("Field Interaction Performance", () => {
  let collector: PerformanceCollector;

  test.beforeEach(async () => {
    collector = new PerformanceCollector();
  });

  test.afterEach(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await collector.saveMetrics(`field-interaction-${timestamp}.json`);
  });

  test("TanStack Form - Field Input Responsiveness", async ({ page }) => {
    // Setup form
    await page.goto("/tanstack");

    // Configure fields
    await page.locator('label:has-text("Text Fields") + div input').fill("5");
    await page.locator('label:has-text("Select Fields") + div input').fill("2");
    await page
      .locator('label:has-text("Autocomplete Fields") + div input')
      .fill("2");
    await page
      .locator('label:has-text("Checkbox Fields") + div input')
      .fill("2");
    await page
      .locator('label:has-text("Date Picker Fields") + div input')
      .fill("1");

    await page.waitForTimeout(1000); // Wait for form re-render

    // Test text input responsiveness
    const textField = page.locator('input[type="text"]').first();

    const startTime = await page.evaluate(() => performance.now());

    // Type a sequence of characters
    await textField.click();
    await textField.type("Performance test input", { delay: 50 });

    const endTime = await page.evaluate(() => performance.now());
    const inputTime = endTime - startTime;

    console.log(
      `TanStack Form input responsiveness: ${inputTime.toFixed(2)}ms`
    );

    // Verify the input was processed correctly
    await expect(textField).toHaveValue("Performance test input");

    // Performance assertion
    expect(inputTime).toBeLessThan(5000); // Should respond within 5 seconds
  });

  test("Formik Form - Field Input Responsiveness", async ({ page }) => {
    // Setup form
    await page.goto("/formik");

    // Configure fields
    await page.locator('label:has-text("Text Fields") + div input').fill("5");
    await page.locator('label:has-text("Select Fields") + div input').fill("2");
    await page
      .locator('label:has-text("Autocomplete Fields") + div input')
      .fill("2");
    await page
      .locator('label:has-text("Checkbox Fields") + div input')
      .fill("2");
    await page
      .locator('label:has-text("Date Picker Fields") + div input')
      .fill("1");

    await page.waitForTimeout(1000); // Wait for form re-render

    // Test text input responsiveness
    const textField = page.locator('input[type="text"]').first();

    const startTime = await page.evaluate(() => performance.now());

    // Type a sequence of characters
    await textField.click();
    await textField.type("Performance test input", { delay: 50 });

    const endTime = await page.evaluate(() => performance.now());
    const inputTime = endTime - startTime;

    console.log(`Formik Form input responsiveness: ${inputTime.toFixed(2)}ms`);

    // Verify the input was processed correctly
    await expect(textField).toHaveValue("Performance test input");

    // Performance assertion
    expect(inputTime).toBeLessThan(5000); // Should respond within 5 seconds
  });

  test("Select Field Interaction Performance", async ({ page }) => {
    const measurements: { form: string; time: number }[] = [];

    // Test TanStack Form select
    await page.goto("/tanstack");
    await page.locator('label:has-text("Select Fields") + div input').fill("1");
    await page.waitForTimeout(500);

    const tanstackSelect = page.locator('[role="combobox"]').first();
    const startTime1 = await page.evaluate(() => performance.now());

    await tanstackSelect.click();
    await page.locator('[role="listbox"] [role="option"]').first().click();

    const endTime1 = await page.evaluate(() => performance.now());
    measurements.push({ form: "TanStack", time: endTime1 - startTime1 });

    // Test Formik Form select
    await page.goto("/formik");
    await page.locator('label:has-text("Select Fields") + div input').fill("1");
    await page.waitForTimeout(500);

    const formikSelect = page.locator('[role="combobox"]').first();
    const startTime2 = await page.evaluate(() => performance.now());

    await formikSelect.click();
    await page.locator('[role="listbox"] [role="option"]').first().click();

    const endTime2 = await page.evaluate(() => performance.now());
    measurements.push({ form: "Formik", time: endTime2 - startTime2 });

    // Log results
    console.log("=== SELECT INTERACTION PERFORMANCE ===");
    measurements.forEach((m) => {
      console.log(`${m.form} Select: ${m.time.toFixed(2)}ms`);
    });

    // Both should be responsive
    measurements.forEach((m) => {
      expect(m.time).toBeLessThan(1000); // Select should respond within 1000ms
    });
  });

  test("Checkbox Interaction Performance", async ({ page }) => {
    const measurements: { form: string; time: number }[] = [];

    // Test TanStack Form checkbox
    await page.goto("/tanstack");
    await page
      .locator('label:has-text("Checkbox Fields") + div input')
      .fill("3");
    await page.waitForTimeout(500);

    const tanstackCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount1 = await tanstackCheckboxes.count();

    const startTime1 = await page.evaluate(() => performance.now());

    // Click all checkboxes
    for (let i = 0; i < checkboxCount1; i++) {
      await tanstackCheckboxes.nth(i).click();
    }

    const endTime1 = await page.evaluate(() => performance.now());
    measurements.push({ form: "TanStack", time: endTime1 - startTime1 });

    // Test Formik Form checkbox
    await page.goto("/formik");
    await page
      .locator('label:has-text("Checkbox Fields") + div input')
      .fill("3");
    await page.waitForTimeout(500);

    const formikCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount2 = await formikCheckboxes.count();

    const startTime2 = await page.evaluate(() => performance.now());

    // Click all checkboxes
    for (let i = 0; i < checkboxCount2; i++) {
      await formikCheckboxes.nth(i).click();
    }

    const endTime2 = await page.evaluate(() => performance.now());
    measurements.push({ form: "Formik", time: endTime2 - startTime2 });

    // Log results
    console.log("=== CHECKBOX INTERACTION PERFORMANCE ===");
    measurements.forEach((m) => {
      console.log(`${m.form} Checkboxes: ${m.time.toFixed(2)}ms`);
    });

    // Both should be responsive
    measurements.forEach((m) => {
      expect(m.time).toBeLessThan(1000); // Multiple checkboxes should respond within 1 second
    });
  });

  test("Rapid Input Performance Stress Test", async ({ page }) => {
    const testData =
      "This is a rapid input performance stress test with a longer text string to see how the form handles rapid typing";
    const measurements: {
      form: string;
      time: number;
      charactersPerMs: number;
    }[] = [];

    // Test TanStack Form rapid input
    await page.goto("/tanstack");
    await page.locator('label:has-text("Text Fields") + div input').fill("1");
    await page.waitForTimeout(500);

    const tanstackField = page.locator('input[type="text"]').first();
    const startTime1 = await page.evaluate(() => performance.now());

    await tanstackField.click();
    await tanstackField.type(testData, { delay: 10 }); // Very fast typing

    const endTime1 = await page.evaluate(() => performance.now());
    const time1 = endTime1 - startTime1;
    measurements.push({
      form: "TanStack",
      time: time1,
      charactersPerMs: testData.length / time1,
    });

    // Verify input was captured correctly
    await expect(tanstackField).toHaveValue(testData);

    // Test Formik Form rapid input
    await page.goto("/formik");
    await page.locator('label:has-text("Text Fields") + div input').fill("1");
    await page.waitForTimeout(500);

    const formikField = page.locator('input[type="text"]').first();
    const startTime2 = await page.evaluate(() => performance.now());

    await formikField.click();
    await formikField.type(testData, { delay: 10 }); // Very fast typing

    const endTime2 = await page.evaluate(() => performance.now());
    const time2 = endTime2 - startTime2;
    measurements.push({
      form: "Formik",
      time: time2,
      charactersPerMs: testData.length / time2,
    });

    // Verify input was captured correctly
    await expect(formikField).toHaveValue(testData);

    // Log results
    console.log("=== RAPID INPUT PERFORMANCE ===");
    measurements.forEach((m) => {
      console.log(
        `${m.form}: ${m.time.toFixed(2)}ms (${m.charactersPerMs.toFixed(
          3
        )} chars/ms)`
      );
    });

    // Performance assertions
    measurements.forEach((m) => {
      expect(m.time).toBeLessThan(10000); // Should handle rapid input within 10 seconds
      expect(m.charactersPerMs).toBeGreaterThan(0.005); // Should process at least 0.005 chars per ms
    });
  });
});
