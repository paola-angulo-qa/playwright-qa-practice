import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';

test.describe('SauceDemo - Carrito', () => {
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory\.html/);

    cartPage = new CartPage(page);
  });

  /** Captura evidencia siempre (pase o falle el test), mismo criterio que en login.spec.ts. */
  test.afterEach(async ({ page }, testInfo) => {
    const outcome = testInfo.status === testInfo.expectedStatus ? 'passed' : 'failed';
    const screenshotPath = testInfo.outputPath(`${outcome}.png`);
    await page.screenshot({ path: screenshotPath });
    testInfo.annotations.push({
      type: 'testrail_attachment',
      description: screenshotPath,
    });
  });

  test('C49 - Agregar producto al carrito', async ({ page }) => {
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();

    await cartPage.addBackpackToCart();

    await expect(cartPage.removeBackpackButton).toBeVisible();
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('C50 - Eliminar producto del carrito', async ({ page }) => {
    await cartPage.addBackpackToCart();
    await expect(cartPage.removeBackpackButton).toBeVisible();
    await expect(cartPage.cartBadge).toHaveText('1');

    await cartPage.removeBackpackFromCart();

    await expect(cartPage.addBackpackButton).toBeVisible();
    await expect(cartPage.cartBadge).not.toBeVisible();
  });
});
