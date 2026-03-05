# Módulos Faltantes - Contasist

Basado en la investigación de otros software contables orientados a pequeñas y medianas empresas (PyMEs), se identifican a continuación los **módulos clave** que habitualmente ofrecen estas soluciones y que actualmente *no están implementados* en **Contasist**. Esta lista servirá como hoja de ruta para futuras integraciones.

## 1. Módulo de Facturación y Ventas (Facturación Electrónica)
Actualmente, Contasist llega hasta la generación de **Cotizaciones**. El paso natural siguiente es convertir esas cotizaciones en **Facturas**.
*   **Emisión de Facturas:** Conversión de cotizaciones a facturas legales.
*   **Facturación Electrónica:** Integración con la autoridad tributaria correspondiente (ej. DIAN, AFIP, SAT) para emitir comprobantes electrónicos válidos.
*   **Gestión de Ventas:** Control de ciclo completo (Cotización -> Remisión/Albarán -> Factura).
*   **Gestión de Cobros (Cuentas por Cobrar):** Seguimiento de facturas emitidas, vencimientos de pagos y recibos de caja.

## 2. Módulo de Contabilidad y Plan de Cuentas (PUC)
Actualmente, el PUC es fundamental para la estructuración contable. Se requiere una interfaz jerárquica para gestionar el catálogo de cuentas.
*   **Gestión del PUC:** Interfaz para navegar la jerarquía (Clase, Grupo, Cuenta, Subcuenta).
*   **Creación/Edición de Cuentas:** Formulario con validación de niveles de código y asignación de descripciones.
*   **Visualización en Árbol:** Componente interactivo para expandir/colapsar niveles del plan de cuentas.
*   **Búsqueda Avanzada:** Filtros por código PUC o nombre de cuenta.
*   **Integración Contable:** Vinculación de cuentas con otros módulos (ej. Ventas -> Cuenta de Ingresos).

---
**Conclusión para Contasist:**
Para que Contasist evolucione de un "Gestor de Cotizaciones" a un "Software Contable", la prioridad número uno debería ser la **Facturación (Cuentas por Cobrar)**, la **Gestión de Gastos (Cuentas por Pagar)** y la implementación del **Plan de Cuentas (PUC)** como eje central de la contabilidad.
