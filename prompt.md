Actúa como un CTO (Chief Technology Officer) experto, Arquitecto de Software y Consultor de Negocios Digitales. Tu objetivo es redactar una Guía Técnica y Estratégica de nivel profesional, óptima y de alto calibre para el despliegue de una "Vitrina Digital E-commerce para el Colegio La Victoria" en Abancay, Perú. 

La audiencia de esta guía son desarrolladores, administradores de la institución y stakeholders locales. El tono debe ser técnico, sofisticado, pero sumamente práctico, estructurado con Markdown limpio, títulos claros, tablas comparativas y bloques de código descriptivos.

Toma en cuenta el siguiente contexto y requerimientos clave para estructurar la guía en 5 secciones detalladas:

--- CONTEXTO DEL PROYECTO ---
1. Propósito: Digitalizar, centralizar y ordenar el comercio tradicional de la comunidad escolar (uniformes, útiles, proyectos de alumnos y emprendimientos de padres de familia asociados).
2. Mercado: Estrictamente local e institucional (Abancay). No se utiliza publicidad pagada (Meta/Google Ads). La promoción es 100% orgánica (redes del colegio, grupos de WhatsApp de salones, códigos QR físicos).
3. Infraestructura: El proyecto corre bajo el dominio maestro del desarrollador (manngojk.com) usando servidores Nginx o despliegues en AWS/Vercel.

--- ESTRUCTURA REQUERIDA DE LA GUÍA ---

## 1. ARQUITECTURA DEL SISTEMA Y BACKEND (HEADLESS)
- Desarrolla la justificación técnica de usar soluciones como Medusa JS o WooCommerce para el control total de los datos e inventarios sin suscripciones fijas.
- Explica brevemente la ventaja de acoplar este backend con un despliegue moderno bajo el dominio principal (manngojk.com) usando Nginx/Vercel.

## 2. CONFIGURACIÓN DEL SISTEMA DE AUTENTICACIÓN (SUPABASE + GOOGLE)
- Redacta un tutorial paso a paso (paso 1, paso 2) detallado para integrar Google OAuth con Supabase.
- Explica cómo configurar la Google Cloud Console (ID de cliente, Secreto de cliente, Orígenes JavaScript autorizados).
- Detalla la importancia de registrar con precisión la Callback URL oficial de Supabase (`https://<project-id>.supabase.co/auth/v1/callback`) para evitar errores de redirección.

## 3. INFRAESTRUCTURA DE NOTIFICACIONES Y SMTP (SUPABASE + RESEND)
- Explica cómo integrar Resend como proveedor SMTP externo en Supabase para producción.
- Incluye los parámetros de conexión exactos: Host (smtp.resend.com), Puerto (465/587), Usuario (resend) y la gestión de la contraseña mediante la API Key.
- Enfatiza el uso de correos bajo el dominio verificado (ej. no-reply@manngojk.com) para garantizar 100% de entregabilidad.
- Proporciona un ejemplo de estructura de plantilla HTML con CSS inline para el correo de "Confirm Sign Up", asegurando que se mencione el uso obligatorio de la variable dinámica `{{ .ConfirmationURL }}`.

## 4. FLUJO DE CONVERSIÓN INTEGRADO CON WHATSAPP
- Describe el diseño de la experiencia de usuario (UX) adaptada al contexto de Abancay: El cliente navega en la web -> arma el carrito con stock en tiempo real -> al confirmar, la plataforma genera un texto preformateado -> el pedido se envía directamente al WhatsApp del administrador para coordinar el pago (Yape/Plin) y la entrega física.
- Explica por qué este enfoque híbrido genera confianza local y reduce la carga operativa del administrador.

## 5. ESTRATEGIA DE ENTREGABLES E IMPACTO COMUNITARIO
- Explica la estrategia del entregable físico: Una "Ficha-Ticket" de acceso de una sola hoja impresa a color en Papel Opalina (costo aproximado S/. 1.00 en el mercado local), optimizando un presupuesto de S/. 50.00 para 10 unidades.
- Detalla cómo un código QR de gran tamaño en la ficha actúa como el puente hacia la documentación digital completa alojada en el servidor, permitiendo actualizaciones continuas sin costos de reimpresión.

--- RESTRICCIONES ---
- No inventes nombres de otras herramientas de correo que no sean Resend.
- Todo el código de configuración o plantillas debe ser limpio y listo para producción.
- Mantén un enfoque de arquitectura de software robusta adaptada de forma sumamente realista a un entorno local de confianza comunitaria.

Genera la guía completa basándote estrictamente en estas especificaciones.