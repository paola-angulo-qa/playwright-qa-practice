/*
================================================================================
ARCHIVO: CheckoutPage.ts
LENGUAJE: TypeScript
OBJETIVO: Page Object que representa el flujo de checkout de dos pasos:
          1) checkout-step-one.html: formulario con nombre, apellido y
             código postal.
          2) checkout-step-two.html: resumen de la compra y botón "Finish".
          3) La pantalla de confirmación final ("Thank you for your order!").

GUÍA DE ETIQUETAS:
[TypeScript]   Sintaxis exclusiva de TypeScript.
[JavaScript]   Característica compartida por JavaScript y TypeScript.
[Playwright API] Acción sobre el navegador o un elemento.
[POO]          Concepto general de Programación Orientada a Objetos.
[POM]          Uso específico de POO aplicado al patrón Page Object Model.
================================================================================
*/

import { Page, Locator } from '@playwright/test';

export class CheckoutPage {

  readonly page: Page;

  // [POM]
  // Locators de checkout-step-one.html (el formulario).
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // [POM]
  // Locators de checkout-step-two.html (el resumen de compra).
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // [POM]
  // Locator de la pantalla de confirmación final.
  readonly completeHeader: Locator;

  // [JavaScript + TypeScript + POO]
  // Constructor: define TODOS los locators de esta clase en un solo lugar,
  // apenas se crea el objeto con "new CheckoutPage(page)".
  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');

    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');

    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  // [POM + TypeScript]
  // Llena las tres casillas del formulario de checkout-step-one.
  // Los tres parámetros son "string" (texto) y se aceptan vacíos ('') a
  // propósito: eso es lo que nos permite reutilizar este mismo método
  // tanto en el caso positivo (C51, todo completo) como en el caso
  // negativo (C52, Last Name vacío) sin duplicar código.
  async fillInfo(firstName: string, lastName: string, postalCode: string) {
    // [Playwright API]
    // .fill('') en un campo vacío no rompe nada: simplemente confirma
    // que el campo queda sin contenido, que es justo lo que C52 necesita probar.
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  // [POM + Playwright API]
  // Envía el formulario de checkout-step-one (botón "Continue").
  async continueCheckout() {
    await this.continueButton.click();
  }

  // [POM + Playwright API]
  // Confirma la compra desde checkout-step-two (botón "Finish").
  async finish() {
    await this.finishButton.click();
  }
}
