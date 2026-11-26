# Módulos Faltantes - Contasist

Basado en la investigación de otros software contables orientados a pequeñas y medianas empresas (PyMEs), se identifican a continuación los **módulos clave** que habitualmente ofrecen estas soluciones y que actualmente *no están implementados* en **Contasist**. Esta lista servirá como hoja de ruta para futuras integraciones.

## 1. Módulo de Facturación y Ventas (Facturación Electrónica)
Actualmente, Contasist llega hasta la generación de **Cotizaciones**. El paso natural siguiente es convertir esas cotizaciones en **Facturas**.
*   **Emisión de Facturas:** Conversión de cotizaciones a facturas legales.
*   **Facturación Electrónica:** Integración con la autoridad tributaria correspondiente (ej. DIAN, AFIP, SAT) para emitir comprobantes electrónicos válidos.
*   **Gestión de Ventas:** Control de ciclo completo (Cotización -> Remisión/Albarán -> Factura).
*   **Gestión de Cobros (Cuentas por Cobrar):** Seguimiento de facturas emitidas, vencimientos de pagos y recibos de caja.

## 2. Módulo de Contabilidad y Plan de Cuentas (PUC) — ✅ INTEGRADO (2026-11-24)
El PUC y la contabilidad ya están conectados al backend Go:
*   **Gestión del PUC:** El backend clona la plantilla oficial (Decreto 2650, 377 cuentas) por empresa; la interfaz lista, busca, crea subcuentas/auxiliares y desactiva cuentas (`/accounting/chart`).
*   **Libro Diario:** Comprobantes reales del backend (automáticos por facturación/recaudo y manuales), con anulación por reversa (`/accounting/journal`).
*   **Balance de Prueba:** Nuevo reporte `/reports/trial-balance` con sumas y saldos por cuenta.
*   **Reportes financieros:** Balance General y Estado de Resultados se derivan del balance de prueba del backend; el auxiliar de cuenta consulta los movimientos reales por cuenta.
*   **Causación automática configurable:** Cuentas por defecto (clientes, ingresos, IVA, caja, bancos) editables en Configuración → Contabilidad.

---
**Conclusión para Contasist:**
Con la Facturación y el **Plan de Cuentas (PUC)** ya integrados al backend, la siguiente prioridad es la **Gestión de Gastos (Cuentas por Pagar)** y la emisión de facturación electrónica ante la DIAN.
