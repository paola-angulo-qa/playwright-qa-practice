/*
================================================================================
ARCHIVO: checkout.spec.ts
LENGUAJE: TypeScript
FRAMEWORK: Playwright Test (@playwright/test)
OBJETIVO: Pruebas automáticas del checkout de SauceDemo (C51-C52): compra
          completa con datos válidos, y validación de campo obligatorio vacío.
          Usa LoginPage (precondición de sesión), CartPage (para agregar el
          producto y llegar al checkout) y CheckoutPage (para el formulario
          de dos pasos y la confirmación).

GUÍA DE ETIQUETAS:
[TypeScript]        Sintaxis o característica exclusiva del lenguaje TypeScript.
[JavaScript]        Característica compartida por JavaScript y TypeScript.
[Playwright Test]   Función del framework de pruebas de Playwright
                     (test, describe, beforeEach, expect).
[Playwright API]    Acción realizada sobre el navegador o un elemento
                     (locator, click, fill, goto).
[POO]               Concepto general de Programación Orientada a Objetos.
[POM]               Uso específico de POO aplicado al patrón Page Object Model:
                     este archivo NO conoce selectores CSS, solo usa los
                     métodos que exponen LoginPage, CartPage y CheckoutPage.

IMPORTANTE SOBRE beforeEach:
- beforeEach NO es una instrucción de TypeScript, es una función que provee
  Playwright Test.
- Se ejecuta antes de CADA prueba dentro de este describe.
- Aquí corresponde usarlo porque C51 y C52 necesitan comenzar siempre con
  sesión iniciada y los Page Objects de carrito y checkout ya creados.
================================================================================
*/

// [TypeScript + Playwright Test]
import { test, expect } from '@playwright/test';

// [TypeScript + POM]
// Importamos los tres Page Objects que este archivo necesita.
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// [Playwright Test]
test.describe('SauceDemo - Checkout', () => {

  // [TypeScript + POM]
  // Declaramos las variables de los Page Objects que este grupo necesita,
  // fuera de los tests, para que estén disponibles en ambos casos.
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  // [Playwright Test]
  test.beforeEach(async ({ page }) => {

    // [POM]
    // Reutilizamos LoginPage para el login: la sesión iniciada es una
    // precondición de estos casos, no lo que se está probando.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // [Playwright Test]
    // Validamos la precondición: el login terminó correctamente antes
    // de seguir con el resto del setup.
    await expect(page).toHaveURL(/inventory\.html/);

    // [TypeScript + POO + POM]
    // Creamos los Page Objects de carrito y checkout, ya con la sesión
    // iniciada, para que cada test pueda usarlos directamente.
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  // [Playwright Test]
  // afterEach se ejecuta DESPUÉS DE CADA test de este describe. Capturamos
  // evidencia SIEMPRE (pase o falle el test) — mismo criterio de
  // certificación de evidencia que en login.spec.ts, no solo depuración.
  test.afterEach(async ({ page }, testInfo) => {
    const outcome = testInfo.status === testInfo.expectedStatus ? 'passed' : 'failed';
    const screenshotPath = testInfo.outputPath(`${outcome}.png`);
    await page.screenshot({ path: screenshotPath });
    testInfo.annotations.push({
      type: 'testrail_attachment',
      description: screenshotPath,
    });
  });

  // [Playwright Test]
  // Caso de compra completa con datos válidos: el flujo más largo,
  // recorre catálogo → carrito → checkout-step-one → checkout-step-two → confirmación.
  test('C51 - Completar checkout con datos válidos', async ({ page }) => {

    // [POM]
    // Precondición: agregar el producto al carrito.
    await cartPage.addBackpackToCart();

    // [POM]
    // Paso 1: ir a la página del carrito.
    await cartPage.goToCart();

    // [Playwright Test]
    // Resultado esperado 1: navegó al carrito y el producto/precio se ven.
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();

    // [POM]
    // Paso 2: avanzar al formulario de checkout.
    await cartPage.goToCheckout();

    // [Playwright Test]
    // Resultado esperado 2: se abrió el primer paso del checkout y sus
    // tres campos están visibles.
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.firstNameInput).toBeVisible();
    await expect(checkoutPage.lastNameInput).toBeVisible();
    await expect(checkoutPage.postalCodeInput).toBeVisible();

    // [POM]
    // Paso 3: completar el formulario con datos válidos y continuar.
    await checkoutPage.fillInfo('Paola', 'Angulo', '7500000');
    await checkoutPage.continueCheckout();

    // [Playwright Test]
    // Resultado esperado 3: se abrió el resumen de compra con los datos
    // correctos de pago, envío, subtotal, impuesto y total.
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(checkoutPage.paymentInfo).toContainText('SauceCard');
    await expect(checkoutPage.shippingInfo).toContainText('Pony Express');
    await expect(checkoutPage.subtotalLabel).toHaveText('Item total: $29.99');
    await expect(checkoutPage.taxLabel).toHaveText('Tax: $2.40');
    await expect(checkoutPage.totalLabel).toHaveText('Total: $32.39');

    // [POM]
    // Paso 4: finalizar la compra.
    await checkoutPage.finish();

    // [Playwright Test]
    // Resultado esperado 4: mensaje de confirmación de compra exitosa.
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  // [Playwright Test]
  // Caso negativo: intenta avanzar sin completar el campo obligatorio Last Name.
  test('C52 - Checkout con campos obligatorios vacíos', async ({ page }) => {

    // [POM]
    // Precondición: agregar producto y llegar al formulario de checkout.
    await cartPage.addBackpackToCart();
    await cartPage.goToCart();
    await cartPage.goToCheckout();

    // [Playwright Test]
    // Resultado esperado 1: el formulario correcto está abierto.
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    // [POM]
    // Paso: completar First Name y Postal Code, dejar Last Name vacío
    // a propósito (segundo parámetro '' de fillInfo), y continuar.
    await checkoutPage.fillInfo('sdsdsd', '', 'sds');
    await checkoutPage.continueCheckout();

    // [Playwright Test]
    // Resultado esperado 2: aparece el error de validación específico
    // ("Last Name is required") y la aplicación NO avanzó al paso siguiente.
    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toContainText('Last Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

// [TypeScript]
// Cierra el grupo de pruebas de checkout.
});
