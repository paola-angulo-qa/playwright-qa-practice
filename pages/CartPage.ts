import { Page, Locator } from '@playwright/test';

/**
 * Page Object del catálogo de productos (inventory.html) y de la
 * página del carrito (cart.html).
 */
export class CartPage {
  readonly page: Page;
  readonly addBackpackButton: Locator;
  readonly removeBackpackButton: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addBackpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.removeBackpackButton = page.locator('[data-test="remove-sauce-labs-backpack"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  /** El nombre describe la intención ("agregar al carrito"), no el detalle técnico, para que un cambio de selector no afecte a los tests. */
  async addBackpackToCart() {
    await this.addBackpackButton.click();
  }

  async removeBackpackFromCart() {
    await this.removeBackpackButton.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async goToCheckout() {
    await this.checkoutButton.click();
  }
}
