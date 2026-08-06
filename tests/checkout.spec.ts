import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('SauceDemo - Checkout', () => {
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory\.html/);

    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
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

  test('C51 - Completar checkout con datos válidos', async ({ page }) => {
    await cartPage.addBackpackToCart();
    await cartPage.goToCart();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();

    await cartPage.goToCheckout();

    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.firstNameInput).toBeVisible();
    await expect(checkoutPage.lastNameInput).toBeVisible();
    await expect(checkoutPage.postalCodeInput).toBeVisible();

    await checkoutPage.fillInfo('Paola', 'Angulo', '7500000');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(checkoutPage.paymentInfo).toContainText('SauceCard');
    await expect(checkoutPage.shippingInfo).toContainText('Pony Express');
    await expect(checkoutPage.subtotalLabel).toHaveText('Item total: $29.99');
    await expect(checkoutPage.taxLabel).toHaveText('Tax: $2.40');
    await expect(checkoutPage.totalLabel).toHaveText('Total: $32.39');

    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('C52 - Checkout con campos obligatorios vacíos', async ({ page }) => {
    await cartPage.addBackpackToCart();
    await cartPage.goToCart();
    await cartPage.goToCheckout();

    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillInfo('sdsdsd', '', 'sds');
    await checkoutPage.continueCheckout();

    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toContainText('Last Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
