import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('SauceDemo - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  /** Captura evidencia siempre (pase o falle el test), como registro auditable de cada corrida, no solo de las fallas. */
  test.afterEach(async ({ page }, testInfo) => {
    const outcome = testInfo.status === testInfo.expectedStatus ? 'passed' : 'failed';
    const screenshotPath = testInfo.outputPath(`${outcome}.png`);
    await page.screenshot({ path: screenshotPath });
    testInfo.annotations.push({
      type: 'testrail_attachment',
      description: screenshotPath,
    });
  });

  test('C46 - Login exitoso con credenciales válidas', async ({ page }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    await loginPage.fillCredentials('standard_user', 'secret_sauce');
    await expect(loginPage.usernameInput).toHaveValue('standard_user');
    await expect(loginPage.passwordInput).toHaveValue('secret_sauce');

    await loginPage.submit();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('C47 - Login fallido con contraseña incorrecta', async ({ page }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    await loginPage.fillCredentials('standard_user', 'wrongpassword');
    await expect(loginPage.usernameInput).toHaveValue('standard_user');
    await expect(loginPage.passwordInput).toHaveValue('wrongpassword');

    await loginPage.submit();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('do not match');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('C48 - Iniciar sesión fallido con usuario bloqueado', async ({ page }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    await loginPage.fillCredentials('locked_out_user', 'secret_sauce');
    await expect(loginPage.usernameInput).toHaveValue('locked_out_user');
    await expect(loginPage.passwordInput).toHaveValue('secret_sauce');

    await loginPage.submit();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('has been locked out');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
