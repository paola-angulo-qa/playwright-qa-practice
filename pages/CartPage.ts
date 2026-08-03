/*
================================================================================
ARCHIVO: CartPage.ts
LENGUAJE: TypeScript
OBJETIVO: Page Object que representa dos pantallas relacionadas:
          1) El catálogo de productos (inventory.html), donde se agrega o
             quita un producto del carrito.
          2) La página del carrito (cart.html), desde donde se pasa a checkout.

GUÍA DE ETIQUETAS:
[TypeScript]   Sintaxis exclusiva de TypeScript.
[JavaScript]   Característica compartida por JavaScript y TypeScript.
[Playwright API] Acción sobre el navegador o un elemento.
[POO]          Concepto general de Programación Orientada a Objetos.
[POM]          Uso específico de POO aplicado al patrón Page Object Model.
================================================================================
*/

// [TypeScript]
// Igual que en LoginPage.ts: importamos solo los tipos Page y Locator.
// No importamos expect() porque esta clase no verifica nada, solo describe
// dónde están los elementos y qué acciones se pueden hacer con ellos.
import { Page, Locator } from '@playwright/test';

// [TypeScript + POO + POM]
// Exportamos la clase para poder usarla en sauceLogin.spec.ts.
export class CartPage {

  // [TypeScript]
  // "readonly" en todas las propiedades: se asignan una sola vez, en el
  // constructor, y no se pueden reasignar después.
  readonly page: Page;

  // [POM]
  // Locators del catálogo de productos (inventory.html).
  readonly addBackpackButton: Locator;
  readonly removeBackpackButton: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  // [POM]
  // Locator de la página del carrito (cart.html).
  readonly checkoutButton: Locator;

  // [JavaScript + TypeScript + POO]
  // Constructor: se ejecuta al crear el objeto con "new CartPage(page)".
  constructor(page: Page) {
    // [JavaScript]
    // Guardamos la página recibida en la propiedad de este objeto.
    this.page = page;

    // [Playwright API + POM]
    // Cada propiedad guarda la "receta" de cómo encontrar ese elemento,
    // usando el selector CSS de atributo data-test que ya verificaste
    // con Codegen en la aplicación real.
    this.addBackpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.removeBackpackButton = page.locator('[data-test="remove-sauce-labs-backpack"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // [POM + Playwright API]
  // Agrega la mochila (Sauce Labs Backpack) al carrito, desde el catálogo.
  // El nombre del método describe la INTENCIÓN de la acción ("qué logra"),
  // no el detalle técnico ("hacer clic en un botón") — eso es a propósito:
  // así, si mañana cambia el selector, el test que llama a este método
  // no se entera ni necesita cambiar.
  async addBackpackToCart() {
    await this.addBackpackButton.click();
  }

  // [POM + Playwright API]
  // Quita la mochila del carrito, desde el catálogo.
  async removeBackpackFromCart() {
    await this.removeBackpackButton.click();
  }

  // [POM + Playwright API]
  // Navega desde el catálogo hacia la página del carrito (cart.html),
  // haciendo clic en el ícono del carrito.
  async goToCart() {
    await this.cartLink.click();
  }

  // [POM + Playwright API]
  // Desde la página del carrito, inicia el flujo de checkout.
  async goToCheckout() {
    await this.checkoutButton.click();
  }
}
