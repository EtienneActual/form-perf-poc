import { test, expect } from '@playwright/test';
import { PerformanceCollector } from '../utils/performance';

test.describe('Validation Performance', () => {
  let collector: PerformanceCollector;

  test.beforeEach(async () => {
    collector = new PerformanceCollector();
  });

  test.afterEach(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await collector.saveMetrics(`validation-${timestamp}.json`);
  });

  test('TanStack Form - Field Validation Performance', async ({ page }) => {
    await page.goto('/tanstack');
    
    // Configure form with multiple text fields for validation testing
    await page.locator('label:has-text("Text Fields") + div input').fill('5');
    await page.waitForTimeout(500);
    
    const textFields = page.locator('input[type="text"]');
    const measurements: number[] = [];
    
    // Test validation on each text field
    for (let i = 0; i < 3; i++) { // Test first 3 fields to avoid config fields
      const field = textFields.nth(i);
      
      // Test invalid input (too short)
      await field.click();
      await field.fill('ab'); // Less than 3 characters
      
      const startTime = await page.evaluate(() => performance.now());
      await field.blur(); // Trigger validation
      
      // Wait for error message to appear
      try {
        await page.waitForSelector('.MuiFormHelperText-root.Mui-error, [role="alert"]', { 
          state: 'visible', 
          timeout: 2000 
        });
        const endTime = await page.evaluate(() => performance.now());
        measurements.push(endTime - startTime);
      } catch {
        // If no error appears, record a timeout
        measurements.push(2000);
      }
      
      // Clear field for next test
      await field.fill('');
    }
    
    const avgValidationTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
    console.log(`TanStack Form validation time: ${avgValidationTime.toFixed(2)}ms (avg)`);
    
    // Performance assertions
    expect(avgValidationTime).toBeLessThan(500); // Validation should be fast
    measurements.forEach(time => {
      expect(time).toBeLessThan(1000); // Each validation should be under 1 second
    });
  });

  test('Formik Form - Field Validation Performance', async ({ page }) => {
    await page.goto('/formik');
    
    // Configure form with multiple text fields for validation testing
    await page.locator('label:has-text("Text Fields") + div input').fill('5');
    await page.waitForTimeout(500);
    
    const textFields = page.locator('input[type="text"]');
    const measurements: number[] = [];
    
    // Test validation on each text field
    for (let i = 0; i < 3; i++) { // Test first 3 fields to avoid config fields
      const field = textFields.nth(i);
      
      // Test invalid input (too short)
      await field.click();
      await field.fill('ab'); // Less than 3 characters
      
      const startTime = await page.evaluate(() => performance.now());
      await field.blur(); // Trigger validation
      
      // Wait for error message to appear
      try {
        await page.waitForSelector('.MuiFormHelperText-root.Mui-error, [role="alert"]', { 
          state: 'visible', 
          timeout: 2000 
        });
        const endTime = await page.evaluate(() => performance.now());
        measurements.push(endTime - startTime);
      } catch {
        // If no error appears, record a timeout
        measurements.push(2000);
      }
      
      // Clear field for next test
      await field.fill('');
    }
    
    const avgValidationTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
    console.log(`Formik Form validation time: ${avgValidationTime.toFixed(2)}ms (avg)`);
    
    // Performance assertions
    expect(avgValidationTime).toBeLessThan(500); // Validation should be fast
    measurements.forEach(time => {
      expect(time).toBeLessThan(1000); // Each validation should be under 1 second
    });
  });

  test('Validation Performance Comparison - Zod vs Yup', async ({ page }) => {
    const validationTests = [
      { input: '', expectedError: 'required' },
      { input: 'ab', expectedError: 'at least 3 characters' },
      { input: 'valid input', expectedError: null }
    ];
    
    const results: { form: string; testCase: string; time: number }[] = [];
    
    for (const testCase of validationTests) {
      // Test TanStack Form (Zod)
      await page.goto('/tanstack');
      await page.locator('label:has-text("Text Fields") + div input').fill('1');
      await page.waitForTimeout(300);
      
      const tanstackField = page.locator('input[type="text"]').first();
      await tanstackField.click();
      
      const startTime1 = await page.evaluate(() => performance.now());
      await tanstackField.fill(testCase.input);
      await tanstackField.blur();
      
      // Wait a bit for validation to complete
      await page.waitForTimeout(100);
      const endTime1 = await page.evaluate(() => performance.now());
      
      results.push({
        form: 'TanStack (Zod)',
        testCase: testCase.input || 'empty',
        time: endTime1 - startTime1
      });
      
      // Test Formik Form (Yup)
      await page.goto('/formik');
      await page.locator('label:has-text("Text Fields") + div input').fill('1');
      await page.waitForTimeout(300);
      
      const formikField = page.locator('input[type="text"]').first();
      await formikField.click();
      
      const startTime2 = await page.evaluate(() => performance.now());
      await formikField.fill(testCase.input);
      await formikField.blur();
      
      // Wait a bit for validation to complete
      await page.waitForTimeout(100);
      const endTime2 = await page.evaluate(() => performance.now());
      
      results.push({
        form: 'Formik (Yup)',
        testCase: testCase.input || 'empty',
        time: endTime2 - startTime2
      });
    }
    
    // Log results
    console.log('=== VALIDATION PERFORMANCE COMPARISON ===');
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.testCase]) acc[result.testCase] = [];
      acc[result.testCase].push(result);
      return acc;
    }, {} as Record<string, typeof results>);
    
    Object.entries(groupedResults).forEach(([testCase, results]) => {
      console.log(`\n${testCase}:`);
      results.forEach(result => {
        console.log(`  ${result.form}: ${result.time.toFixed(2)}ms`);
      });
    });
    
    // Calculate averages
    const tanstackTimes = results.filter(r => r.form.includes('TanStack')).map(r => r.time);
    const formikTimes = results.filter(r => r.form.includes('Formik')).map(r => r.time);
    
    const tanstackAvg = tanstackTimes.reduce((sum, time) => sum + time, 0) / tanstackTimes.length;
    const formikAvg = formikTimes.reduce((sum, time) => sum + time, 0) / formikTimes.length;
    
    console.log(`\nAverage validation times:`);
    console.log(`TanStack (Zod): ${tanstackAvg.toFixed(2)}ms`);
    console.log(`Formik (Yup): ${formikAvg.toFixed(2)}ms`);
    
    // Performance assertions
    expect(tanstackAvg).toBeLessThan(300);
    expect(formikAvg).toBeLessThan(400); // Formik/Yup peut être un peu plus lent
  });


  test('Large Form Validation Performance', async ({ page }) => {
    const measurements: { form: string; scenario: string; time: number }[] = [];
    
    // Test large form field validation on TanStack Form
    await page.goto('/tanstack');
    
    // Configure large form
    await page.locator('label:has-text("Text Fields") + div input').fill('5');
    await page.waitForTimeout(1000);
    
    // Test validation performance on multiple fields
    const textFields1 = page.locator('input[type="text"]');
    const textFieldCount1 = await textFields1.count();
    
    const startTime1 = await page.evaluate(() => performance.now());
    
    // Fill multiple fields and trigger validation
    for (let i = 0; i < Math.min(textFieldCount1, 3); i++) {
      const field = textFields1.nth(i);
      const fieldId = await field.getAttribute('id');
      if (!fieldId || !fieldId.includes('Field')) {
        await field.fill('ab'); // Too short - will trigger validation
        await field.blur(); // Trigger validation
      }
    }
    
    // Wait for validation errors to appear
    await page.waitForSelector('.MuiFormHelperText-root.Mui-error', { state: 'visible', timeout: 3000 });
    const endTime1 = await page.evaluate(() => performance.now());
    
    measurements.push({ 
      form: 'TanStack', 
      scenario: 'Large form field validation', 
      time: endTime1 - startTime1 
    });
    
    // Test large form field validation on Formik Form
    await page.goto('/formik');
    
    // Configure large form
    await page.locator('label:has-text("Text Fields") + div input').fill('5');
    await page.waitForTimeout(1000);
    
    // Test validation performance on multiple fields
    const textFields2 = page.locator('input[type="text"]');
    const textFieldCount2 = await textFields2.count();
    
    const startTime2 = await page.evaluate(() => performance.now());
    
    // Fill multiple fields and trigger validation
    for (let i = 0; i < Math.min(textFieldCount2, 3); i++) {
      const field = textFields2.nth(i);
      const fieldId = await field.getAttribute('id');
      if (!fieldId || !fieldId.includes('Field')) {
        await field.fill('ab'); // Too short - will trigger validation
        await field.blur(); // Trigger validation
      }
    }
    
    // Wait for validation errors to appear
    await page.waitForSelector('.MuiFormHelperText-root.Mui-error', { state: 'visible', timeout: 3000 });
    const endTime2 = await page.evaluate(() => performance.now());
    
    measurements.push({ 
      form: 'Formik', 
      scenario: 'Large form field validation', 
      time: endTime2 - startTime2 
    });
    
    // Log results
    console.log('=== LARGE FORM VALIDATION PERFORMANCE ===');
    measurements.forEach(m => {
      console.log(`${m.form} ${m.scenario}: ${m.time.toFixed(2)}ms`);
    });
    
    // Performance assertions
    measurements.forEach(m => {
      expect(m.time).toBeLessThan(2000); // Large form validation should complete within 2 seconds
    });
  });
});