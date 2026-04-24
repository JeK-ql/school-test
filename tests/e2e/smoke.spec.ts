import { test, expect } from '@playwright/test';

test('register → login → dashboard renders skills', async ({ page }) => {
  const email = `t_${Date.now()}@example.com`;
  await page.goto('/register');
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', 'longenough');
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard', { timeout: 15_000 });
  await expect(page.getByText('REACT HOOKS')).toBeVisible();
  await expect(page.getByText('JAVASCRIPT FUNDAMENTALS')).toBeVisible();
});
