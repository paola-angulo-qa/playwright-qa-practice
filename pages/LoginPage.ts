/*
================================================================================
ARCHIVO: LoginPage.ts
LENGUAJE: TypeScript
OBJETIVO: Page Object que representa la pantalla de login de SauceDemo.
          Encapsula los locators (dónde están los elementos) y las acciones
          (qué se puede hacer con ellos), para que los archivos de test
          no necesiten conocer los selectores CSS directamente.

GUÍA DE ETIQUETAS:
[TypeScript]         Sintaxis o característica propia del lenguaje TypeScript
                      (no existe en JavaScript puro).
[JavaScript]          Característica compartida por JavaScript y TypeScript
                      (clases, this, async/await, etc. ya existían en JS).
[Playwright API]      Acción concreta ejecutada sobre el navegador o un elemento
                      (page.locator, .fill, .click, .goto).
[POO]                 Concepto general de Programación Orientada a Objetos
                      (clase, constructor, propiedad, método).
[POM]                 Uso específico de POO aplicado al patrón Page Object Model:
                      esta clase representa una pantalla completa de la app.
================================================================================
*/

// [TypeScript]
// Importamos los "tipos" Page y Locator desde la librería de Playwright.
// Un tipo le dice al editor y al compilador qué forma tiene un valor:
// qué propiedades y métodos están disponibles en él. Esto es lo que te
// da el autocompletado y los errores en rojo ANTES de ejecutar el código.
//
// A propósito NO importamos "expect" en este archivo: expect() sirve para
// VERIFICAR resultados, y esa responsabilidad es de los archivos de test
// (tests/*.spec.ts), no de un Page Object. Un Page Object solo describe
// "dónde están las cosas" y "qué se puede hacer con ellas".
import { Page, Locator } from '@playwright/test';

// [TypeScript + POO + POM]
// "export" permite que esta clase se pueda importar desde otro archivo
// (como sauceLogin.spec.ts) usando: import { LoginPage } from '../pages/LoginPage'.
//
// "class" declara una clase: un molde para crear objetos que agrupan
// datos (propiedades) y comportamiento (métodos) relacionados entre sí.
// Este es el concepto de POO.
//
// Que esta clase específicamente represente "todo lo que existe y se puede
// hacer en la pantalla de login" es lo que la convierte en un Page Object,
// es decir, aplicar el patrón POM.
export class LoginPage {

  // [TypeScript]
  // Declaración de propiedades de la clase. La sintaxis es:
  // nombrePropiedad: Tipo;
  //
  // "readonly" es una palabra clave EXCLUSIVA de TypeScript (no existe en
  // JavaScript puro). Significa: esta propiedad solo se puede asignar UNA
  // vez, dentro del constructor. Si en cualquier otro lugar del código
  // alguien intenta hacer "loginPage.usernameInput = otraCosa", TypeScript
  // marcará un error ANTES de ejecutar nada. Protege contra errores de
  // reasignar por accidente algo que no debería cambiar.
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  // [JavaScript + TypeScript + POO]
  // El constructor es un método especial de toda clase: se ejecuta
  // automáticamente una sola vez, cada vez que se crea un objeto nuevo
  // con la palabra "new" (ej: new LoginPage(page)). Su trabajo es dejar
  // el objeto recién creado listo para usarse.
  //
  // "page: Page" es el parámetro que recibe el constructor. ": Page" es
  // la anotación de tipo (TypeScript): le dice a TypeScript que ese
  // parámetro debe ser específicamente un objeto de tipo Page.
  constructor(page: Page) {

    // [JavaScript]
    // "this" es una palabra clave de JavaScript que, dentro de un método
    // de una clase, hace referencia al objeto concreto que se está
    // creando/usando en ese momento (no a la clase en general, sino a
    // ESA instancia particular).
    //
    // "this.page = page;" guarda el "page" que llegó como parámetro dentro
    // de la propiedad "page" de este objeto. Así queda disponible para
    // usarse después en otros métodos de la clase, como goto().
    this.page = page;

    // [Playwright API + POM]
    // page.locator('[data-test="..."]') es una función de Playwright que
    // describe CÓMO encontrar un elemento en la página, usando un selector
    // CSS de atributo (busca un elemento HTML que tenga ese atributo
    // data-test con ese valor exacto).
    //
    // Importante: llamar a .locator() NO busca el elemento todavía, solo
    // crea una "receta" de cómo encontrarlo cuando se necesite (por eso
    // se puede guardar en una propiedad sin que la página ya esté cargada).
    //
    // Guardar estos locators como propiedades de la clase es la esencia
    // de POM: en vez de que cada test escriba el selector CSS completo,
    // el test solo dice "loginPage.usernameInput" y no necesita saber
    // que por dentro es '[data-test="username"]'.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // [JavaScript + Playwright API + POM]
  // "async" es una palabra clave de JavaScript que marca este método como
  // asíncrono: contiene operaciones que toman tiempo (como cargar una
  // página web) y que deben esperarse con "await" antes de seguir.
  //
  // Este método navega a la URL inicial de SauceDemo. Es una ACCIÓN de
  // Page Object: encapsula "cómo se llega a esta pantalla".
  async goto() {
    // [Playwright API]
    // page.goto(url) le ordena al navegador cargar esa dirección.
    // "await" detiene la ejecución del test en esta línea hasta que la
    // navegación termine por completo, antes de continuar con la línea
    // siguiente.
    await this.page.goto('https://www.saucedemo.com/');
  }

  // [POM + TypeScript]
  // Método que SOLO llena los campos de usuario y contraseña, sin hacer
  // clic en el botón todavía. Lo separamos de "submit" a propósito, para
  // poder verificar (con expect) los valores escritos en los campos ANTES
  // de enviar el formulario — así lo pedían tus casos de TestRail en el
  // "Resultado esperado 2" (los campos aceptan las credenciales).
  //
  // "username: string, password: string" son los parámetros de este
  // método, cada uno anotado con su tipo (TypeScript): ambos deben ser texto.
  async fillCredentials(username: string, password: string) {
    // [Playwright API]
    // .fill(valor) primero limpia cualquier contenido que tuviera el campo
    // y luego escribe el valor indicado, como si el usuario lo tipeara.
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  // [POM + Playwright API]
  // Método que SOLO hace clic en el botón de login, sin tocar los campos.
  async submit() {
    // [Playwright API]
    // .click() simula un clic del mouse sobre el elemento.
    await this.loginButton.click();
  }

  // [POM + POO]
  // Método de conveniencia: llama a los dos métodos anteriores, en orden,
  // uno después del otro. A esto se le llama "composición": un método
  // que reutiliza el comportamiento de otros métodos de la misma clase,
  // en vez de repetir la lógica de fill/click de nuevo.
  //
  // Úsalo en los casos donde NO necesitas revisar los valores de los
  // campos antes de enviar el formulario (por ejemplo, si más adelante
  // agregas un test que solo confirma "puedo loguearme rápido").
  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.submit();
  }
}
