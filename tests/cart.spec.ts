/*
================================================================================
ARCHIVO: cart.spec.ts
LENGUAJE: TypeScript
FRAMEWORK: Playwright Test (@playwright/test)
OBJETIVO: Pruebas automáticas del carrito de SauceDemo (C49-C50): agregar y
          eliminar un producto, usando LoginPage (para iniciar sesión, precondición
          de estos casos) y CartPage (para las acciones propias del carrito).

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
                     métodos que exponen LoginPage y CartPage.

IMPORTANTE SOBRE beforeEach:
- beforeEach NO es una instrucción de TypeScript, es una función que provee
  Playwright Test.
- Se ejecuta antes de CADA prueba contenida en el mismo test.describe.
- Aquí corresponde usarlo porque C49 y C50 necesitan comenzar siempre con
  una sesión iniciada y ubicadas en inventory.html.
================================================================================
*/

// [TypeScript + Playwright Test]
import { test, expect } from '@playwright/test';

// [TypeScript + POM]
// Importamos LoginPage (para la precondición de sesión) y CartPage
// (para las acciones propias de este archivo).
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';

// [Playwright Test]
test.describe('SauceDemo - Carrito', () => {

  // [TypeScript + POM]
  // Declaramos la variable del Page Object que este grupo necesita,
  // fuera de los tests, para que esté disponible en ambos casos.
  let cartPage: CartPage;

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
    // Creamos el Page Object del carrito, ya con la sesión iniciada,
    // para que cada test pueda usarlo directamente.
    cartPage = new CartPage(page);
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
  // Caso que prueba agregar un producto al carrito.
  test('C49 - Agregar producto al carrito', async ({ page }) => {

    // [Playwright API + Playwright Test]
    // getByText busca un elemento por el texto visible para el usuario
    // (una alternativa a buscar por atributo data-test).
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();

    // [POM]
    // Acción bajo prueba: agregar la mochila al carrito.
    await cartPage.addBackpackToCart();

    // [Playwright Test]
    // Resultado esperado 2: el botón cambió de "Add to cart" a "Remove".
    await expect(cartPage.removeBackpackButton).toBeVisible();

    // [Playwright Test]
    // Resultado esperado 3: la insignia del carrito muestra "1".
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  // [Playwright Test]
  // Caso que prueba eliminar un producto previamente agregado.
  test('C50 - Eliminar producto del carrito', async ({ page }) => {

    // [POM]
    // Precondición (setup, no es lo que se está probando): agregar el
    // producto primero, para tener algo que eliminar.
    await cartPage.addBackpackToCart();
    await expect(cartPage.removeBackpackButton).toBeVisible();
    await expect(cartPage.cartBadge).toHaveText('1');

    // [POM]
    // Acción bajo prueba: eliminar el producto del carrito.
    await cartPage.removeBackpackFromCart();

    // [Playwright Test]
    // Resultado esperado 2: vuelve a aparecer la opción de agregar.
    await expect(cartPage.addBackpackButton).toBeVisible();

    // [Playwright Test]
    // "not" invierte la comprobación: esperamos que el contador YA NO
    // sea visible (porque el carrito quedó vacío).
    await expect(cartPage.cartBadge).not.toBeVisible();
  });

// [TypeScript]
// Cierra el grupo de pruebas de carrito.
});
