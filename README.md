> Account: [adaptación del frontend](ACCOUNT_MIGRATION.md).

# InstAlert

Aplicación de seguridad ciudadana que permite a los usuarios reportar incidentes, activar alertas de emergencia en tiempo real, formar comunidades vecinales de apoyo y visualizar zonas de riesgo en un mapa interactivo.

**Curso:** Open Source
**Proyecto:** InstAlert

---

## Enlaces de despliegue

| Servicio | URL |
|---|---|
| Frontend (Vercel) | https://instalert-front-end.vercel.app |
| Backend (Railway) | https://instalert-backend-production.up.railway.app |
| Documentación API (Swagger) | https://instalert-backend-production.up.railway.app/swagger-ui/index.html |

---

##  Arquitectura

El backend está construido siguiendo **Domain-Driven Design (DDD)**, organizado en *bounded contexts* independientes. Cada uno mantiene su propia capa de dominio, aplicación, infraestructura e interfaces REST.

```
com.instalert_backend
├── shared/          → clases base, configuración transversal (CORS, Swagger, JPA)
├── iam/             → autenticación, autorización, JWT, roles
├── profiles/         → datos de perfil de usuario (nombre, teléfono, avatar, etc.)
├── incidents/        → reportes de incidentes ciudadanos
├── emergencies/       → alertas del botón de pánico
└── communities/       → comunidades vecinales
```

### Por qué `iam` y `profiles` están separados

`iam` resuelve **"¿quién eres y puedes entrar?"** — email, contraseña encriptada, roles y tokens.
`profiles` resuelve **"¿cómo te ves dentro de la app?"** — nombre, teléfono, ubicación, avatar.

Ambos comparten el mismo `id` de usuario, generado por `iam` en el registro y reutilizado por `profiles` al crear el perfil correspondiente. Esta separación evita acoplar la lógica de seguridad con los datos de presentación, y permite endurecer la autenticación sin tocar el resto del sistema.

---

## Autenticación y seguridad

- **BCrypt** para el hashing de contraseñas (nunca se almacenan en texto plano).
- **JWT (JSON Web Tokens)** firmados con HMAC-SHA256, generados al iniciar sesión o registrarse.
- **Spring Security** protegiendo los endpoints: las operaciones de lectura (`GET`) son públicas, mientras que las de escritura (`POST`, `PUT`, `DELETE`, `PATCH`) requieren un token válido en el header `Authorization: Bearer <token>`.
- **Roles como entidad de dominio** (`ROLE_ADMIN`, `ROLE_USER`), en relación muchos-a-muchos con el usuario, precargados automáticamente al iniciar la aplicación.
- Un **interceptor HTTP** en el frontend adjunta el token a cada petición saliente de forma transparente.

---

## Stack tecnológico

**Backend**
- Java 21+ / Spring Boot 3
- Spring Data JPA + Hibernate
- Spring Security + JJWT
- MySQL
- Swagger / OpenAPI (springdoc)

**Frontend**
- Angular (standalone components, signals)
- Leaflet.js (mapas interactivos)
- ngx-translate (internacionalización)

**Infraestructura**
- Railway (backend + base de datos MySQL)
- Vercel (frontend)

---

## Módulos funcionales

### Incidentes (`incidents`)
CRUD completo de reportes ciudadanos: tipo, severidad, ubicación (coordenadas exactas), descripción y estado (`ACTIVE` / `RESOLVED`). Los reportes se visualizan en un mapa Leaflet con marcadores por nivel de severidad.

### Emergencias (`emergencies`)
Botón de pánico con captura automática de geolocalización. Al activarse, genera una alerta visible en tiempo real para otros usuarios en el mapa de reportes, y puede cancelarse desde el historial o el panel de administración.

### Comunidades (`communities`)
Creación de grupos vecinales públicos o privados, con chat asociado.

### Perfil (`profiles`)
Edición de datos personales (teléfono, correo, fecha de nacimiento, género) y cambio de contraseña, validado contra `iam`.

### Panel de Administración
Accesible para usuarios con rol `Admin`. Permite:
- Gestionar usuarios (editar, cambiar rol, eliminar)
- Gestionar incidentes (resolver, reactivar, eliminar)
- Gestionar emergencias activas (cancelar)
- Gestionar comunidades (eliminar)
- Visualizar estadísticas generales con gráficos

---

##  Limitaciones conocidas

Estas son decisiones conscientes de priorización, no omisiones accidentales:

- **Chat de comunidades:** actualmente persiste en `localStorage` del navegador, no en el backend. La siguiente iteración natural sería un módulo de mensajería con WebSockets para sincronización en tiempo real entre usuarios.
- **Zonas de riesgo (`risk-zones`):** el endpoint no llegó a implementarse en el backend; el frontend está preparado para consumirlo en cuanto exista.
- **Tokens JWT:** se generan, firman y validan correctamente, pero no se implementó expiración/refresh automático ni revocación de tokens (logout del lado del servidor).

---

## Cómo correr el proyecto localmente

### Backend
```bash
cd instalert-backend
./mvnw spring-boot:run
```
Por defecto se conecta a `jdbc:mysql://localhost:3306/instalert_db`. Las tablas se crean automáticamente (`ddl-auto=update`) al iniciar.

### Frontend
```bash
cd instalert-app
npm install
ng serve
```
Corre en `http://localhost:4200`, apuntando por defecto a `http://localhost:8080`.

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| Ciudadano | Reportar incidentes, activar alertas, unirse a comunidades, editar su perfil |
| Admin | Todo lo anterior + gestión completa de usuarios, incidentes, emergencias y comunidades |
