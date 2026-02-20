# Módulos Faltantes - Contasist

Basado en la investigación de otros software contables orientados a pequeñas y medianas empresas (PyMEs), se identifican a continuación los **módulos clave** que habitualmente ofrecen estas soluciones y que actualmente *no están implementados* en **Contasist**. Esta lista servirá como hoja de ruta para futuras integraciones.

## 1. Módulo de Facturación y Ventas (Facturación Electrónica)
Actualmente, Contasist llega hasta la generación de **Cotizaciones**. El paso natural siguiente es convertir esas cotizaciones en **Facturas**.
*   **Emisión de Facturas:** Conversión de cotizaciones a facturas legales.
*   **Facturación Electrónica:** Integración con la autoridad tributaria correspondiente (ej. DIAN, AFIP, SAT) para emitir comprobantes electrónicos válidos.
*   **Gestión de Ventas:** Control de ciclo completo (Cotización -> Remisión/Albarán -> Factura).
*   **Gestión de Cobros (Cuentas por Cobrar):** Seguimiento de facturas emitidas, vencimientos de pagos y recibos de caja.

## 2. [COMPLETADO] Módulo de Compras y Gastos (Cuentas por Pagar)
Este módulo ya ha sido integrado exitosamente en el sistema.
*   **Registro de Gastos:** Implementado mediante `ExpenseList` y `ExpenseForm`.
*   **Gestión de Proveedores:** Implementado mediante `SupplierList` y `SupplierForm`.
*   **Cuentas por Pagar:** Implementado con lógica de estados (Pendiente/Pagado) en `useExpense`.

## 3. Módulo de Contabilidad General
El núcleo de cualquier sistema contable, necesario para la formalización financiera.
*   **Plan Único de Cuentas (PUC):** Catálogo de cuentas contables parametrizable según el país.
*   **Libro Diario y Mayor:** Registro de asientos contables automáticos (basados en ventas/compras) y manuales.
*   **Conciliación Bancaria:** Módulo para cargar extractos bancarios y cruzar los movimientos del sistema con los del banco.

## 4. Módulo de Reportes e Informes Financieros
Actualmente el Dashboard muestra un resumen básico, pero se requiere profundidad contable.
*   **Estado de Resultados (Pérdidas y Ganancias):** Para conocer la rentabilidad en tiempo real.
*   **Balance General:** Estado de situación financiera de la empresa (Activos, Pasivos, Patrimonio).
*   **Flujo de Caja:** Para entender la liquidez del negocio mes a mes.
*   **Reportes de Impuestos:** Resúmenes automáticos para facilitar las declaraciones de impuestos (ej. IVA, Retenciones).

## 5. Módulo de Inventario (Avanzado)
Aunque Contasist tiene un módulo de "Productos", un software contable suele requerir características de inventario más robustas.
*   **Control de Stock Físico:** Entradas, salidas y traslados de almacén.
*   **Kardex / Costeo de Inventario:** Métodos de valoración (Promedio Ponderado, PEPS/FIFO, etc.).
*   **Alertas de Stock Mínimo:** Avisos cuando un producto se está agotando.

## 6. Módulos Adicionales (Opcionales según crecimiento)
*   **Módulo de Nómina (RRHH):** Gestión de empleados, liquidación de sueldos, aportes de seguridad social y provisiones.
*   **Presupuestos (Forecasting):** Proyección de ingresos y gastos para comparación versus la ejecución real.
*   **Integración Bancaria Directa (Open Banking):** Conexión directa con APIs de bancos para descargar movimientos automáticamente.

---
**Conclusión para Contasist:**
Para que Contasist evolucione de un "Gestor de Cotizaciones" a un "Software Contable", la prioridad número uno debería ser la **Facturación (Cuentas por Cobrar)** y la **Gestión de Gastos (Cuentas por Pagar)**, seguido de la estructuración de la **Contabilidad General (Asientos y Reportes Clave)**.
