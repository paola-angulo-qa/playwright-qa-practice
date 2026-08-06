import { Page, Locator } from '@playwright/test';

/**
 * Page Object de la pantalla de login de SauceDemo.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /** Llena usuario y contraseña sin enviar el formulario, para validar los valores antes del submit. */
  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  /** Atajo: fillCredentials + submit en un solo paso. */
  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.submit();
  }
}
