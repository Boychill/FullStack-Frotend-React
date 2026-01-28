# Documento de Requerimientos Funcionales y Técnicos - E-commerce MVP

**Fecha:** 20 de Enero, 2026
**Tipo de Proyecto:** MVP Académico (Showcase Portfolio)
**Plataforma de Despliegue:** Vercel

---

## 1. Visión del Producto
Desarrollar un e-commerce B2C "Premium" funcional para entrega académica. El objetivo es simular una experiencia de compra completa y profesional, con foco en una UI de alta calidad, animaciones fluidas y un flujo de usuario sin fricción, utilizando tecnologías modernas (React).

## 2. Alcance Funcional

### 2.1. Catálogo y Navegación
*   **Volumen:** ~40 Productos iniciales.
*   **Tipología:** Mixta (Tecnología, Ropa, Herramientas).
*   **Estructura:**
    *   Categorías anidadas (Ej: Tecnología > Periféricos; Ropa > Hombre > Camisetas).
    *   **Variaciones Complejas:** Soporte para selectores de Talla/Color (Ropa) o Especificaciones (Tecnología).
*   **Imágenes:** Uso de placeholders de alta calidad o generación dinámica coherente con las variaciones (Ej: Camiseta cambia de color al seleccionar variante).

### 2.2. Gestión de Usuarios
*   **Modelo:** B2C (Consumidor Final).
*   **Acceso:** **Login Obligatorio** para comprar (No Guest Checkout).
*   **Registro:** Email y Contraseña.
*   **Mi Cuenta:**
    *   Historial de Pedidos (Simulado).
    *   Libreta de Direcciones.
*   **Recuperación de Clave:** Simulada (mensaje en pantalla).

### 2.3. Proceso de Compra (Checkout)
*   **Carrito:** Visualización clara, edición de cantidades, resumen de costos.
*   **Precios e Impuestos:**
    *   Moneda: CLP (Pesos Chilenos).
    *   IVA (19%): Incluido en el precio visual, desglosado en el resumen final.
*   **Envío:**
    *   Tarifa plana base (Costo fijo).
    *   **Envío Gratis** al superar un monto X definido (Regla de negocio).
*   **Pasarela de Pagos (Simulación):**
    *   Tarjeta de Crédito / Débito.
    *   PayPal.
    *   Transferencia.

### 2.4. Backoffice (Admin Panel)
*   **Acceso:** Rol de Administrador diferenciado.
*   **Funcionalidades:**
    *   **Dashboard:** Métricas simples (Ventas mensuales/anuales, Top productos).
    *   **Inventario:** Interfaz para Agregar/Editar/Eliminar productos (Persistencia Local/Simulata).
    *   **Pedidos:** Visualizar lista y cambiar estados (Pendiente -> Pagado -> Enviado -> Entregado).
*   **Stock:** Manejo visual. Si stock = 0, el producto desaparece de la tienda pública.

---

## 3. Requerimientos Técnicos

### 3.1. Stack Tecnológico
*   **Frontend:** React (Vite) + TypeScript.
*   **Estilos:** Tailwind CSS (Diseño "Premium" a medida).
*   **Despliegue:** Vercel.

### 3.2. Datos y Persistencia (⚠️ Nota Crítica)
El cliente ha definido un modelo de persistencia ligero para el MVP:
*   **Catálogo Base:** Archivo JSON estático (`data/products.json`).
*   **Persistencia Dinámica:** `LocalStorage` del navegador.
    *   *Nota:* Esto significa que los cambios realizados en el Admin (crear productos) o las compras realizadas **SOLO serán visibles en el navegador donde se realizaron**. Al desplegar en Vercel, no habrá una base de datos compartida real. Si se limpia el caché, se pierden los datos nuevos.
    *   Esto es aceptable para una "Entrega Académica" tipo demo.

### 3.3. Diseño UI/UX
*   Estética limpia, profesional, uso de espacios en blanco y tipografías modernas.
*   Feedback visual inmediato (toasts, loaders, estados hover).

---

## 4. Fuera de Alcance (What's Out)
*   Integración real con SII (Boleta/Factura Electrónica).
*   Sistema automatizado de devoluciones (RMA).
*   Soporte Multi-idioma o Multi-moneda.
*   Emails transaccionales reales (SMTP).
*   Persistencia de datos compartida entre usuarios (Backend real/DB).
