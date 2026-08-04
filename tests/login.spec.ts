/*
================================================================================
ARCHIVO: login.spec.ts
LENGUAJE: TypeScript
FRAMEWORK: Playwright Test (@playwright/test)
OBJETIVO: Pruebas automáticas de la pantalla de Login de SauceDemo (C46-C48),
          usando el Page Object LoginPage. Este archivo NO conoce selectores
          CSS: toda esa responsabilidad vive en pages/LoginPage.ts.

GUÍA DE ETIQUETAS:
[TypeScript]        Sintaxis o característica exclusiva del lenguaje TypeScript.
[JavaScript]        Característica compartida por JavaScript y TypeScript.
[Playwright Test]   Función del framework de pruebas de Playwright
                     (test, describe, beforeEach, expect).
[Playwright API]    Acción realizada sobre el navegador o un elemento
                     (locator, click, fill, goto).
[POO]               Concepto general de Programación Orientada a Objetos.
[POM]               Uso específico de POO aplicado al patrón Page Object Model.

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
// Importamos el Page Object de la pantalla de login.
import { LoginPage } from '../pages/LoginPage';

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
  // afterEach se ejecuta DESPUÉS DE CADA test de este describe, sin importar
  // si pasó o falló. DECISIÓN DE DISEÑO: aquí capturamos evidencia SIEMPRE,
  // en ambos resultados, no solo en la falla. Esto es distinto a lo que
  // hace la mayoría de los pipelines de automatización (que solo capturan
  // en la falla, para depurar), pero se alinea con una práctica de
  // certificación de evidencia: dejar registro visual de que CADA caso se
  // ejecutó, con su resultado real, sin importar si pasó o falló.
  test.afterEach(async ({ page }, testInfo) => {

    // [TypeScript + Playwright Test]
    // testInfo es una fixture que Playwright entrega con metadata del test
    // recién ejecutado: nombre, duración y resultado (status). La usamos
    // aquí solo para decidir el NOMBRE del archivo, ya no para decidir si
    // capturamos o no — eso ya no depende del resultado.
    const outcome = testInfo.status === testInfo.expectedStatus ? 'passed' : 'failed';

    // [Playwright API]
    // outputPath() genera una ruta dentro de test-results/ exclusiva de
    // este test, para que dos tests distintos no se sobrescriban la
    // captura entre sí. El nombre incluye el resultado ("passed"/"failed")
    // para que la evidencia sea identificable de un vistazo.
    const screenshotPath = testInfo.outputPath(`${outcome}.png`);

    // [Playwright API]
    // Capturamos la pantalla tal como quedó al terminar el test, sea cual
    // sea el resultado.
    await page.screenshot({ path: screenshotPath });

    // [Playwright Test]
    // testInfo.annotations es un arreglo donde Playwright permite agregar
    // metadata adicional al resultado. 'testrail_attachment' no es una
    // palabra reservada de Playwright: es la convención que trcli reconoce
    // al leer el junit.xml, gracias a embedAnnotationsAsProperties en
    // playwright.config.ts. Al quedar fuera del "if", esta anotación se
    // agrega para TODOS los tests, no solo para los que fallan.
    testInfo.annotations.push({
      type: 'testrail_attachment',
      description: screenshotPath,
    });
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
