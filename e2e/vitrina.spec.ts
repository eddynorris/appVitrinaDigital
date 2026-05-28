import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './test.config';
import * as path from 'path';

test.describe('Vitrina Digital Escolar - Pruebas E2E', () => {

  test('Debería navegar por la web pública y el catálogo', async ({ page }) => {
    // 1. Visitar la página de inicio
    await page.goto('/');
    await expect(page).toHaveTitle(/Colegio de Artes - Vitrina Victoria/);
    await expect(page.locator('h1.hero-title-light')).toContainText('Talento que trasciende generaciones');

    // 2. Navegar al Catálogo
    await page.click('text=VER COLECCIÓN');
    await page.waitForURL('/catalogo');
    await expect(page).toHaveTitle(/Catálogo de Emprendimiento - Vitrina Victoria/);

    // 3. Buscar un producto que no existe y verificar estado vacío
    const searchInput = page.locator('input.search-input');
    await searchInput.fill('ProductoInexistenteTotalmenteFicticio');
    // Esperar debounce
    await page.waitForTimeout(500);
    await expect(page.locator('.empty-state h3')).toContainText('No se encontraron productos');

    // 4. Limpiar búsqueda
    await searchInput.fill('');
    await page.waitForTimeout(500);
  });

  test('Debería validar el inicio de sesión (credenciales incorrectas y correctas)', async ({ page }) => {
    // 1. Ir a login
    await page.goto('/auth');
    await expect(page.locator('.auth-title')).toContainText('Acceso Educativo');

    // 2. Login fallido
    await page.fill('#email', 'correo-invalido@test.com');
    await page.fill('#password', 'ClaveFalsa123');
    await page.click('button[type="submit"]');
    
    // Verificar alerta de error
    await expect(page.locator('.error-alert')).toBeVisible();
    await expect(page.locator('.error-alert span')).toContainText('Correo electrónico o contraseña incorrectos.');

    // 3. Login exitoso con credenciales del usuario
    await page.fill('#email', TEST_CREDENTIALS.email);
    await page.fill('#password', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Redirección al panel
    await page.waitForURL('/dashboard');
    await expect(page).toHaveTitle(/Panel de Control - Vitrina Victoria/);
    await expect(page.locator('.header-user-info h2')).toContainText('Panel de Administración');
  });

  test('Debería completar el ciclo CRUD de productos y edición de perfil', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;
    const editedProductName = `${productName} Editado`;

    // Escuchar diálogos de confirmación (para la eliminación) y aceptarlos
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('¿Estás seguro de que deseas eliminar este producto?');
      await dialog.accept();
    });

    // 1. Iniciar sesión directamente
    await page.goto('/auth');
    await page.fill('#email', TEST_CREDENTIALS.email);
    await page.fill('#password', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // ==========================================
    // A. CREAR PRODUCTO
    // ==========================================
    await page.click('button:has-text("Nuevo Producto")');
    await expect(page.locator('.form-container h3')).toContainText('Añadir Producto');

    // Rellenar formulario
    await page.fill('#nombre', productName);
    await page.fill('#precio', '29.90');
    await page.selectOption('#categoria', { index: 1 }); // Selecciona la primera categoría
    await page.selectOption('#estado', 'publicado');
    await page.fill('#descripcion', 'Descripción de prueba autogenerada por Playwright E2E script para auditoría de calidad.');

    // Subir imagen de prueba
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.drag-drop-area').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'test-image.png'));

    // Esperar a que la imagen se comprima y se suba
    await page.waitForSelector('.preview-item img', { timeout: 15000 });
    
    // Guardar
    await page.click('button[type="submit"]:has-text("Guardar Producto")');
    
    // Verificar que volvió a la tabla y el producto está listado
    await page.waitForSelector('.products-table', { timeout: 10000 });
    const productRow = page.locator('tr').filter({ has: page.locator('strong').filter({ hasText: new RegExp('^' + productName + '$') }) });
    await expect(productRow).toBeVisible();

    // ==========================================
    // B. EDITAR PRODUCTO (Verificar que guarde sin cuelgues)
    // ==========================================
    await productRow.locator('.btn-action-edit').click();
    await expect(page.locator('.form-container h3')).toContainText('Editar Producto');
    
    // Modificar datos
    await page.fill('#nombre', editedProductName);
    await page.fill('#precio', '34.90');
    
    // Guardar cambios
    await page.click('button[type="submit"]:has-text("Guardar Producto")');
    
    // Verificar que se guardaron los cambios y cerró el form
    await page.waitForSelector('.products-table', { timeout: 10000 });
    const editedRow = page.locator('tr').filter({ has: page.locator('strong').filter({ hasText: new RegExp('^' + editedProductName + '$') }) });
    await expect(editedRow).toBeVisible();
    await expect(editedRow).toContainText('S/. 34.90');

    // ==========================================
    // C. EDITAR PERFIL DE USUARIO
    // ==========================================
    // Abrir menú de usuario y hacer clic en Editar Perfil
    await page.click('.user-badge');
    await page.click('a:has-text("Editar Perfil")');
    await page.waitForURL('/perfil');
    await expect(page.locator('h2:has-text("Mi Perfil Escolar")')).toBeVisible();
    // Modificar perfil
    await page.fill('#nombre_completo', 'Eddy Sagitario Test');
    const whatsappInput = page.locator('#whatsapp_contacto');
    if (await whatsappInput.isVisible()) {
      await whatsappInput.fill('+51987654321');
    }
    
    // Guardar cambios
    await page.click('button[type="submit"]');
    
    // Verificar alerta de éxito
    await expect(page.locator('.success-alert')).toBeVisible();
    await expect(page.locator('.success-alert span')).toContainText('¡Perfil actualizado con éxito!');
    
    // Verificar que el nombre en el badge se actualizó a "Eddy"
    await expect(page.locator('.user-badge .user-name')).toContainText('Eddy');

    // Restaurar los datos originales del perfil (limpieza de datos)
    await page.fill('#nombre_completo', 'Eddy Sagitario');
    if (await whatsappInput.isVisible()) {
      await whatsappInput.fill('+51'); // O dejarlo en blanco/+51
    }
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-alert')).toBeVisible();

    // ==========================================
    // D. ELIMINAR PRODUCTO (CRUD de eliminación)
    // ==========================================
    await page.click('a:has-text("Volver al Panel")');
    await page.waitForURL('/dashboard');
    
    const finalProductRow = page.locator('tr').filter({ has: page.locator('strong').filter({ hasText: new RegExp('^' + editedProductName + '$') }) });
    await expect(finalProductRow).toBeVisible();
    
    // Hacer clic en eliminar
    await finalProductRow.locator('.btn-action-delete').click();
    
    // Verificar que desapareció de la lista
    await expect(finalProductRow).not.toBeVisible();

    // ==========================================
    // E. CERRAR SESIÓN
    // ==========================================
    await page.click('.user-badge');
    await page.click('button:has-text("Cerrar Sesión")');
    await page.waitForURL('/');
    await expect(page.locator('.btn-login')).toBeVisible();
  });

  test('Debería permitir la gestión de instituciones (CRUD) y el cambio de contraseña para administradores', async ({ page }) => {
    // Escuchar diálogos de confirmación (para la eliminación de colegio) y aceptarlos
    page.on('dialog', async dialog => {
      if (dialog.message().includes('¿Estás seguro de que deseas eliminar este colegio?')) {
        await dialog.accept();
      }
    });

    // 1. Iniciar sesión directamente como administrador
    await page.goto('/auth');
    await page.fill('#email', TEST_CREDENTIALS.email);
    await page.fill('#password', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 2. Verificar botón "Gestionar Colegios" y hacer clic
    const btnGestionar = page.locator('a:has-text("Gestionar Colegios")');
    await expect(btnGestionar).toBeVisible();
    await btnGestionar.click();
    await page.waitForURL('/dashboard/instituciones');
    await expect(page.locator('.header-info h2')).toContainText('Gestión de Instituciones Educativas');

    const schoolName = `I.E. Playwright School ${Date.now()}`;

    // ==========================================
    // A. CREAR COLEGIO
    // ==========================================
    await page.click('button:has-text("Añadir Colegio")');
    await expect(page.locator('.form-container h3')).toContainText('Añadir Colegio');

    // Rellenar formulario
    await page.fill('#nombre', schoolName);
    await page.fill('#distrito', 'La Victoria');
    await page.fill('#ciudad', 'Lima');
    await page.fill('#direccion', 'Calle Falsa 123');
    await page.fill('#telefono', '1234567');
    await page.fill('#correo_electronico', 'playwright@test.com');
    await page.fill('#descripcion', 'Institución educativa técnica de prueba para E2E.');

    // Guardar
    await page.click('button[type="submit"]:has-text("Guardar Colegio")');

    // Verificar que se añadió a la lista
    await page.waitForSelector('.schools-table', { timeout: 10000 });
    const schoolRow = page.locator('tr').filter({ hasText: schoolName });
    await expect(schoolRow).toBeVisible();
    await expect(schoolRow).toContainText('Calle Falsa 123');

    // ==========================================
    // B. EDITAR COLEGIO
    // ==========================================
    await schoolRow.locator('.btn-action-edit').click();
    await expect(page.locator('.form-container h3')).toContainText('Editar Colegio');

    // Modificar dirección
    await page.fill('#direccion', 'Calle Falsa 456');

    // Guardar
    await page.click('button[type="submit"]:has-text("Guardar Colegio")');

    // Verificar que se guardó y volvió al listado
    await page.waitForSelector('.schools-table', { timeout: 10000 });
    const editedSchoolRow = page.locator('tr').filter({ hasText: schoolName });
    await expect(editedSchoolRow).toBeVisible();
    await expect(editedSchoolRow).toContainText('Calle Falsa 456');

    // ==========================================
    // C. CAMBIAR CONTRASEÑA EN EL PERFIL
    // ==========================================
    // Ir a Perfil
    await page.goto('/perfil');
    await expect(page.locator('h2:has-text("Mi Perfil Escolar")')).toBeVisible();
    await expect(page.locator('h2:has-text("Cambiar Contraseña")')).toBeVisible();

    // Intentar cambiar contraseña con valores que no coinciden
    await page.fill('#nueva_contrasena', 'ClavePlaywright123');
    await page.fill('#confirmar_contrasena', 'ClavePlaywright456');
    
    // El botón debería estar deshabilitado
    const btnChangePass = page.locator('button[type="submit"]:has-text("Actualizar Contraseña")');
    await expect(btnChangePass).toBeDisabled();

    // Rellenar con valores que coinciden
    await page.fill('#confirmar_contrasena', 'ClavePlaywright123');
    await expect(btnChangePass).toBeEnabled();
    
    // Cambiar contraseña a una temporal (debe ser diferente de la anterior)
    const tempPassword = TEST_CREDENTIALS.password + 'Temp123';
    await page.fill('#nueva_contrasena', tempPassword);
    await page.fill('#confirmar_contrasena', tempPassword);
    await btnChangePass.click();

    // Verificar éxito
    const successAlert = page.locator('.success-alert:has-text("¡Contraseña actualizada con éxito!")');
    await expect(successAlert).toBeVisible();

    // Restaurar contraseña original inmediatamente para no alterar futuros accesos/tests
    await page.fill('#nueva_contrasena', TEST_CREDENTIALS.password);
    await page.fill('#confirmar_contrasena', TEST_CREDENTIALS.password);
    await btnChangePass.click();
    await expect(successAlert).toBeVisible();

    // ==========================================
    // D. ELIMINAR COLEGIO (Limpieza de datos)
    // ==========================================
    await page.goto('/dashboard/instituciones');
    await page.waitForSelector('.schools-table', { timeout: 10000 });
    const rowToDelete = page.locator('tr').filter({ hasText: schoolName });
    await expect(rowToDelete).toBeVisible();

    await rowToDelete.locator('.btn-action-delete').click();

    // Verificar que desapareció
    await expect(rowToDelete).not.toBeVisible();
  });

});
