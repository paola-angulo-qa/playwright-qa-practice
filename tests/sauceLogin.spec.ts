import { test, expect } from '@playwright/test';

test.describe('SauceDemo - Login', () => {

  test('C46 - Login exitoso con credenciales válidas', async ({ page }) => {
    // Paso 1
    await page.goto('https://www.saucedemo.com/');

    // Resultado esperado 1: se muestra el formulario
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();

    // Paso 2
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Resultado esperado 2: los campos aceptan las credenciales
    await expect(page.locator('[data-test="username"]')).toHaveValue('standard_user');
    await expect(page.locator('[data-test="password"]')).toHaveValue('secret_sauce');

    // Paso 3
    await page.locator('[data-test="login-button"]').click();

    // Resultado esperado 3: accede al catálogo de productos
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

});

test('C47 - Login fallido con contraseña incorrecta', async ({ page }) => {
  // Paso 1
  await page.goto('https://www.saucedemo.com/');

  // Resultado esperado 1: se muestra el formulario
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await expect(page.locator('[data-test="password"]')).toBeVisible();

  // Paso 2
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('wrongpassword');

  // Resultado esperado 2: los campos aceptan los datos
  await expect(page.locator('[data-test="username"]')).toHaveValue('standard_user');
  await expect(page.locator('[data-test="password"]')).toHaveValue('wrongpassword');

  // Paso 3
  await page.locator('[data-test="login-button"]').click();

  // Resultado esperado 3: no permite el acceso, muestra error, permanece en login
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toContainText('do not match');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});

/*import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await page.locator('[data-test="username"]').click();
  await page.locator('[data-test="username"]').fill('locked_out_user');
  await page.locator('[data-test="password"]').click();
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
});*/

test('C48 - Iniciar sesión fallido con usuario bloqueado', async ({ page }) => {
  // Paso 1
  await page.goto('https://www.saucedemo.com/');

  // Resultado esperado 1: se muestra el formulario
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await expect(page.locator('[data-test="password"]')).toBeVisible();

  // Paso 2
  await page.locator('[data-test="username"]').fill('locked_out_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');

  // Resultado esperado 2: los campos aceptan los datos
  await expect(page.locator('[data-test="username"]')).toHaveValue('locked_out_user');
  await expect(page.locator('[data-test="password"]')).toHaveValue('secret_sauce');

  // Paso 3
  await page.locator('[data-test="login-button"]').click();

  // Resultado esperado 3: no permite el acceso, muestra error de bloqueo, permanece en login
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toContainText('has been locked out');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});

test.describe('SauceDemo - Carrito', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('C49 - Agregar producto al carrito', async ({ page }) => {
    // Resultado esperado 1: catálogo visible
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();

    // Paso 2: clic en "Añadir al carrito"
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Resultado esperado 2: el botón cambia a "Eliminar" (Remove)
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();

    // Resultado esperado 3: el contador del carrito muestra "1"
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('C50 - Eliminar producto del carrito', async ({ page }) => {
    // Precondición (setup, no es lo que se está probando): agregar un producto primero
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // Paso real de la acción bajo prueba
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // Resultado esperado 2: el botón "Remove" vuelve a ser "Add to cart"
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();

    // Resultado esperado 3: el contador desaparece
    await expect(page.locator('[data-test="shopping-cart-badge"]')).not.toBeVisible();
  });

  test('C51 - Completar checkout con datos válidos', async ({ page }) => {
    // Precondición (setup): agregar el producto al carrito
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Paso 1: ícono del carrito
    await page.locator('[data-test="shopping-cart-link"]').click();

    // Resultado esperado 1
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();

    // Paso 2: botón "Checkout"
    await page.locator('[data-test="checkout"]').click();

    // Resultado esperado 2
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();
    await expect(page.locator('[data-test="postalCode"]')).toBeVisible();

    // Paso 3: completar formulario y "Continue"
    await page.locator('[data-test="firstName"]').fill('Paola');
    await page.locator('[data-test="lastName"]').fill('Angulo');
    await page.locator('[data-test="postalCode"]').fill('7500000');
    await page.locator('[data-test="continue"]').click();

    // Resultado esperado 3
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('[data-test="payment-info-value"]')).toContainText('SauceCard');
    await expect(page.locator('[data-test="shipping-info-value"]')).toContainText('Pony Express');
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $29.99');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $2.40');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $32.39');

    // Paso 4: clic en "Finish"
    await page.locator('[data-test="finish"]').click();

    // Resultado esperado 4: confirmación de compra
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('C52 - Checkout con campos obligatorios vacíos', async ({ page }) => {
  // Precondición (setup): agregar producto y llegar al formulario de checkout
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();

  // Resultado esperado 1: formulario visible
  await expect(page).toHaveURL(/checkout-step-one\.html/);

  // Paso: completar First Name y Postal Code, dejar Last Name vacío
  await page.locator('[data-test="firstName"]').fill('sdsdsd');
  await page.locator('[data-test="postalCode"]').fill('sds');
  await page.locator('[data-test="continue"]').click();

  // Resultado esperado 2: error de validación, permanece en checkout-step-one
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toContainText('Last Name is required');
  await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

});
  
