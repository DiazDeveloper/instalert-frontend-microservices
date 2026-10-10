# Frontend conectado a Account

El frontend conserva Angular y sus vistas. Registro e inicio de sesión reciben una sesión con perfil completo desde el gateway; se eliminó la creación pública separada de perfil. Las operaciones de Account usan `accountId` (UUID), mientras `id` conserva la referencia de perfil para los contextos todavía alojados en el monolito. Emergencias y reportes usan el usuario autenticado y ya no envían `userId: 1`.

Las rutas privadas y administrativas validan la sesión con Account. La navegación administrativa usa las autoridades reales, no el texto del rol. Se rechazan cachés malformadas, expiradas o del contrato antiguo; la API conserva la autorización definitiva. El interceptor solo agrega tokens a nuestra API protegida y nunca a terceros ni al login/registro. La actualización de nombre ahora se envía al servicio, y el cambio de correo actualiza la identidad de acceso. El cambio de contraseña exige volver a iniciar sesión.

Desarrollo: `npm ci`, `npm start`, con gateway en localhost:8080. Producción: API `/api/v1` en el mismo origen; `Dockerfile` y `nginx.conf` incluyen proxy hacia `api-gateway`. Para un hosting distinto, configurar ese proxy y los orígenes permitidos antes de publicar.

Verificación: `npm run test:account` y `npm run build`. La suite específica tiene tests de sesión, registro y alcance del Bearer; los tests históricos siguen con imports desactualizados que bloquean `npm test`. El build conserva advertencias previas de Leaflet/CommonJS y CSS de reportes.

El backend incluye `docs/ACCOUNT_MIGRATION.md` con el contrato, configuración, arranque, evidencia y límites de la transferencia. No se migraron datos reales ni se publicó en cloud.

Corrección verificada en navegador: la navegación tras login/registro ocurre una sola vez al recibir la sesión; los refrescos de los guards ya no la reinician. Hay una prueba de regresión con RouterTestingHarness y ocho tests de Account aprobados. El acceso local de demostración se describe en `docs/WEBSTORM_LOCAL.md` del backend.
