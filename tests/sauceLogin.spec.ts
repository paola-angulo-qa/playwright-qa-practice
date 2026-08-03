/*
================================================================================
ARCHIVO: sauceLogin.spec.ts
LENGUAJE: TypeScript
FRAMEWORK: Playwright Test (@playwright/test)
OBJETIVO: Ejecutar las pruebas automáticas de login, carrito y checkout
          de SauceDemo, usando el patrón Page Object Model (POM) a través
          de las clases LoginPage, CartPage y CheckoutPage.

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
- Se ejecuta antes de CADA prueba contenida en el mismo test.describe.
- Se usa para preparar una condición común y evitar repetir código.
- Cada test debe seguir siendo independiente entre sí.
================================================================================
*/

// [TypeScript + Playwright Test]
// Importamos "test" para declarar y organizar pruebas, y "expect" para
// realizar verificaciones (aserciones).
import { test, expect } from '@playwright/test';

// [TypeScript + POM]
// Importamos las tres clases de Page Object que vamos a usar en este
// archivo. La ruta '../pages/...' sube una carpeta (desde tests/) y
// entra en la carpeta pages/.
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// [Playwright Test]
// test.describe agrupa pruebas relacionadas bajo un mismo nombre, que
// es el que aparece en el reporte de resultados.
test.describe('SauceDemo - Login', () => {

  // [TypeScript + POM]
  // Declaramos una variable cuyo tipo debe ser LoginPage. Todavía no
  // creamos el objeto, solo reservamos la variable. Está declarada
  // fuera de los test() para que los tres tests de este describe puedan usarla.
  let loginPage: LoginPage;

  // [Playwright Test]
  // beforeEach se ejecuta ANTES DE CADA test dentro de este describe.
  // Se usa aquí porque C46, C47 y C48 necesitan comenzar siempre igual:
  // 1. Con un objeto LoginPage recién creado.
  // 2. Ubicados en la página inicial de SauceDemo.
  // No se usa beforeAll porque Playwright entrega una página aislada a
  // cada test, y compartir estado entre pruebas las haría dependientes
  // entre sí (si una falla, podría arrastrar a las siguientes).
  test.beforeEach(async ({ page }) => {

    // [TypeScript + POO + POM]
    // "new" crea una instancia (un objeto concreto) de la clase LoginPage.
    // Le entregamos el "page" que Playwright generó para este test.
    loginPage = new LoginPage(page);

    // [POM + Playwright API]
    // Llamamos al método goto() del Page Object. Por dentro, ese método
    // ejecuta page.goto('https://www.saucedemo.com/'), pero el test no
    // necesita saber eso.
    await loginPage.goto();
  });

  // [Playwright Test]
  // test(...) define un caso de prueba.
  // Primer argumento: nombre del caso (aparece en el reporte).
  // Segundo argumento: función asíncrona con los pasos del test.
  // { page } es una "fixture": un objeto que Playwright inyecta
  // automáticamente y que representa la pestaña del navegador de este test.
  test('C46 - Login exitoso con credenciales válidas', async ({ page }) => {

    // [Playwright Test]
    // Resultado esperado 1: el formulario está disponible.
    // expect() recibe un locator y toBeVisible() comprueba que el usuario
    // pueda verlo en pantalla.
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // [POM]
    // Paso 2: completar credenciales válidas, usando el método del Page Object.
    await loginPage.fillCredentials('standard_user', 'secret_sauce');

    // [Playwright Test]
    // Resultado esperado 2: toHaveValue comprueba el valor exacto que
    // quedó escrito en el campo, confirmando que fillCredentials funcionó.
    await expect(loginPage.usernameInput).toHaveValue('standard_user');
    await expect(loginPage.passwordInput).toHaveValue('secret_sauce');

    // [POM]
    // Paso 3: enviar el formulario.
    await loginPage.submit();

    // [Playwright Test]
    // Resultado esperado 3: expect(page).toHaveURL verifica la dirección
    // actual del navegador. /inventory\.html/ es una expresión regular:
    // comprueba que la URL CONTENGA el texto "inventory.html".
    await expect(page).toHaveURL(/inventory\.html/);

    // [Playwright API + Playwright Test]
    // page.locator('.title') busca un elemento por su clase CSS ".title".
    // toHaveText comprueba que su texto sea exactamente "Products".
    await expect(page.locator('.title')).toHaveText('Products');
  });

  // [Playwright Test]
  // Segundo caso: login con contraseña incorrecta.
  test('C47 - Login fallido con contraseña incorrecta', async ({ page }) => {

    // [Playwright Test]
    // Resultado esperado 1: formulario visible antes de interactuar.
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // [POM]
    // Paso 2: usuario válido con contraseña deliberadamente incorrecta.
    await loginPage.fillCredentials('standard_user', 'wrongpassword');

    // [Playwright Test]
    // Resultado esperado 2: los campos aceptaron los datos ingresados.
    await expect(loginPage.usernameInput).toHaveValue('standard_user');
    await expect(loginPage.passwordInput).toHaveValue('wrongpassword');

    // [POM]
    // Paso 3: enviar el formulario.
    await loginPage.submit();

    // [Playwright Test]
    // Resultado esperado 3: aparece el mensaje de error.
    await expect(loginPage.errorMessage).toBeVisible();

    // [Playwright Test]
    // toContainText NO exige que el mensaje sea idéntico completo,
    // solo que contenga el fragmento indicado. Es más tolerante que
    // toHaveText cuando el mensaje puede variar levemente.
    await expect(loginPage.errorMessage).toContainText('do not match');

    // [Playwright Test]
    // Confirma que no navegó al catálogo: sigue en la URL de login.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  // [Playwright Test]
  // Tercer caso: usuario bloqueado.
  test('C48 - Iniciar sesión fallido con usuario bloqueado', async ({ page }) => {

    // [Playwright Test]
    // Resultado esperado 1: formulario visible.
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // [POM]
    // Paso 2: completar con las credenciales del usuario bloqueado.
    await loginPage.fillCredentials('locked_out_user', 'secret_sauce');

    // [Playwright Test]
    // Resultado esperado 2: los campos aceptaron los datos.
    await expect(loginPage.usernameInput).toHaveValue('locked_out_user');
    await expect(loginPage.passwordInput).toHaveValue('secret_sauce');

    // [POM]
    // Paso 3: intentar iniciar sesión.
    await loginPage.submit();

    // [Playwright Test]
    // Resultado esperado 3: mensaje de error específico de bloqueo,
    // y la aplicación permanece en la pantalla de login.
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('has been locked out');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

// [TypeScript]
// Esta llave cierra la función que recibe test.describe, y ");" termina
// la instrucción completa del describe.
});

// [Playwright Test]
// Nuevo grupo de pruebas, independiente del anterior: carrito y checkout.
// A diferencia del describe de Login, aquí usamos TRES Page Objects en
// conjunto: LoginPage (para entrar), CartPage y CheckoutPage.
test.describe('SauceDemo - Carrito', () => {

  // [TypeScript + POM]
  // Declaramos las variables de los Page Objects que este grupo necesita,
  // fuera de los tests, para que estén disponibles en los cuatro casos.
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  // [Playwright Test]
  // Este beforeEach también corre antes de CADA test de este grupo,
  // pero es independiente del beforeEach del describe de Login (no se
  // mezclan entre sí).
  //
  // Aquí corresponde usarlo porque C49, C50, C51 y C52 necesitan comenzar
  // siempre con una sesión iniciada y ubicados en inventory.html.
  test.beforeEach(async ({ page }) => {

    // [POM]
    // Reutilizamos LoginPage para el login, en vez de repetir locators
    // sueltos como se hacía antes del refactor. Es el mismo principio de
    // "no repetir código" (DRY), aplicado ahora ENTRE archivos distintos,
    // no solo dentro de un mismo test.
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
// Cierra el grupo de pruebas de carrito.
});
