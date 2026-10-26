# Carreras de caracoles

Aplicación web de demostración con temática de apuestas en carreras de caracoles. Permite registrar un usuario, iniciar y cerrar sesión, ver un dashboard con estadísticas simuladas y recargar saldo mediante **SnailPay**, una pasarela de pagos simulada que vive en el propio backend.

> Todo es una simulación: no se conecta con servicios reales ni procesa información financiera real. Usa siempre datos ficticios.

## Contenido

- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Pruebas](#pruebas)
- [Uso de la aplicación](#uso-de-la-aplicación)
- [SnailPay: API y escenarios simulados](#snailpay-api-y-escenarios-simulados)
- [Decisiones de seguridad](#decisiones-de-seguridad)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Solución de problemas](#solución-de-problemas)

## Funcionalidades

- Registro con nombre completo, correo, contraseña y confirmación, con validaciones.
- Inicio y cierre de sesión; la sesión se conserva al recargar la página.
- Dashboard protegido (solo con sesión activa) con nombre del usuario, saldo, gráfica de dona de apuestas ganadas y perdidas, y gráfica de barras con las victorias de seis caracoles.
- Recarga de saldo con SnailPay: el saldo se actualiza al instante y se conserva en LocalStorage.
- Manejo de los resultados de SnailPay: cobro aprobado, error de transacción, error del sistema, timeout, falta de conexión y respuesta inesperada. El saldo solo cambia cuando el cobro es aprobado.

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Servidor | Node.js, Express 5, TypeScript, zod, helmet, cors, tsx |
| Cliente | Vite, React, TypeScript, Tailwind CSS v4, React Router, zod, Recharts |
| Pruebas | Vitest en ambas capas; Supertest (servidor); Testing Library, user-event y jsdom (cliente) |
| Gestor de paquetes | pnpm |

## Estructura del repositorio

```
.
├── server/                     API Express con SnailPay
│   └── src/
│       ├── index.ts            arranque del servidor
│       ├── app.ts              configuración de Express (la usan también las pruebas)
│       ├── config/             lectura de variables de entorno
│       ├── routes/             rutas
│       ├── controllers/        orquesta cada petición
│       ├── services/           reglas de los escenarios de SnailPay
│       ├── validators/         validación de la petición (zod)
│       ├── middleware/         CORS y manejo de errores
│       └── types/              tipos de las respuestas
└── client/                     aplicación React
    └── src/
        ├── pages/              login, registro y dashboard
        ├── components/         formularios, recarga y gráficas
        ├── context/ y hooks/   estado de autenticación
        ├── services/           hash de contraseñas, almacenamiento, auth y cliente de SnailPay
        ├── schemas/            validación de formularios (zod)
        ├── data/ y utils/      datos simulados y estadísticas
        └── test/               configuración del entorno de pruebas
```

Cada carpeta es independiente: tiene su propio `package.json`, sus dependencias, sus scripts y sus pruebas.

## Requisitos

- Node.js 22 o superior
- pnpm

## Instalación y ejecución

Se necesitan **dos terminales**, una para el servidor y otra para el cliente.

### 1. Servidor

```bash
cd server
cp .env.example .env
pnpm install
pnpm dev
```

El servidor queda escuchando en `http://localhost:3000`. Puedes comprobarlo con:

```bash
curl http://localhost:3000/health
# {"ok":true}
```

> El archivo `.env` es obligatorio: los scripts `dev` y `start` lo cargan con `--env-file=.env` y fallan si no existe.

Si pnpm muestra `ERR_PNPM_IGNORED_BUILDS`, ejecuta `pnpm approve-builds`, aprueba `esbuild` y vuelve a ejecutar `pnpm install`.

**Variables de entorno** (`server/.env`):

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `CORS_ORIGINS` | `http://localhost:5173` | Orígenes permitidos, separados por coma y sin diagonal final |
| `SNAILPAY_MODE` | `normal` | Con `down`, SnailPay simula un error interno (ver [más abajo](#4-error-del-sistema)) |

**Scripts:**

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor con recarga automática |
| `pnpm build` | Compila a `dist/` |
| `pnpm start` | Ejecuta la versión compilada (requiere `pnpm build`) |
| `pnpm typecheck` | Verifica los tipos sin compilar |
| `pnpm test` | Ejecuta las pruebas |

### 2. Cliente

```bash
cd client
cp .env.example .env
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`.

**Variables de entorno** (`client/.env`):

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL base del servidor |

Vite lee el `.env` al arrancar, así que reinicia `pnpm dev` si lo cambias.

**Scripts:** `pnpm dev`, `pnpm build` (verifica tipos y genera `dist/`), `pnpm preview` y `pnpm test`.

## Pruebas

```bash
# Servidor
cd server
pnpm test
pnpm typecheck

# Cliente
cd client
pnpm test
pnpm exec tsc -b --noEmit
```

**Servidor:** cada escenario de SnailPay (cobro exitoso, datos inválidos, fondos insuficientes, CVV incorrecto, tarjeta vencida, rechazo genérico, caída del sistema por header y por variable de entorno, JSON mal formado), que todas las respuestas tengan los mismos campos, las reglas de fechas con una fecha inyectada y CORS.

**Cliente:** hash de contraseñas, registro e inicio de sesión (validaciones, correo duplicado, contraseña incorrecta, sesión que persiste, vence o está corrupta), rutas protegidas, cliente de SnailPay (cada resultado, timeout y respuestas inconsistentes), recarga desde la interfaz y congruencia de los datos de las gráficas.

En las pruebas del cliente puede aparecer el aviso `The width(0) and height(0) of chart should be greater than 0`: es esperado, porque el entorno de pruebas no calcula tamaños y no dibuja las gráficas. Las pruebas verifican su descripción en texto, no el dibujo.

## Uso de la aplicación

1. Abre `http://localhost:5173/register` y crea una cuenta. Reglas: nombre y apellido, correo válido, contraseña de 8 a 128 caracteres con al menos una letra y un número, y confirmación igual.
2. Al registrarte entras al dashboard con saldo `$0.00`.
3. Usa **Cerrar sesión** y vuelve a entrar desde `/login` con el mismo correo y contraseña.
4. En **Recargar saldo** captura los datos de la tarjeta de prueba:

| Campo | Valor |
|---|---|
| Número de tarjeta | `1234 1234 1234 1234` |
| Vencimiento | `12/26` |
| CVV | `543` |
| Nombre del titular | cualquier texto no vacío |
| Monto | mayor que 0, máximo 50,000 y hasta 2 decimales |

5. Con datos aprobados, el saldo se actualiza al instante y se mantiene aunque recargues la página. Prueba también los otros escenarios de la siguiente sección.

**Datos guardados en LocalStorage:**

| Clave | Contenido |
|---|---|
| `snail:users` | Usuarios (con hash de contraseña, nunca la contraseña) y su saldo |
| `snail:session` | Identificador del usuario y expiración (24 horas) |
| `snail:card:<id del usuario>` | Número de tarjeta y CVV ficticios, tras un cobro aprobado |

Para reiniciar todo, borra el LocalStorage desde las herramientas del navegador (pestaña *Application*).

Los datos de las gráficas son **simulados y fijos**: seis caracoles (Turbo, Rayo, Flecha, Capitán, Chispa y Espiral), seis carreras con un ganador cada una y una apuesta por carrera. Las victorias se cuentan a partir de las carreras y las apuestas se resuelven contra esos resultados, por lo que ambas gráficas son congruentes.

## SnailPay: API y escenarios simulados

### Endpoint

```
POST /api/snailpay/payments
Content-Type: application/json
```

**Petición:**

| Campo | Tipo | Reglas |
|---|---|---|
| `card_number` | string | 16 dígitos (se aceptan espacios o guiones) |
| `expiration_date` | string | Formato `MM/AA` |
| `cvv` | string | 3 dígitos |
| `cardholder_name` | string | 1 a 100 caracteres |
| `transaction_amount` | number | Mayor que 0, máximo 50,000 y hasta 2 decimales |
| `payer_id` | string | Identificador del usuario (1 a 64 caracteres) |
| `payer_email` | string | Correo válido |

**Respuesta** (misma forma en éxito, error de transacción y error del sistema):

| Campo | Descripción |
|---|---|
| `id` | Identificador de la operación (UUID) |
| `status` | `approved`, `rejected` o `error` |
| `status_detail` | Detalle del resultado (ver tabla) |
| `transaction_amount` | Monto solicitado (`null` si no era un número válido) |
| `date_created` | Fecha de creación, ISO 8601 en UTC |
| `authorization_code` | Código de 6 dígitos si fue aprobado; `null` en cualquier otro caso |
| `reference` | Referencia de la operación, con formato `SNP-XXXXXXXX` |
| `payer_id` | Identificador del usuario recibido |
| `payer_email` | Correo del usuario recibido |
| `card_number` | Número de tarjeta recibido (siempre ficticio) |
| `cvv` | CVV recibido (siempre ficticio) |

Ejemplo de cobro aprobado (`201`):

```json
{
  "id": "e4cc9452-809c-408c-a823-4631dd5a8e63",
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 500,
  "date_created": "2026-10-21T02:13:22.679Z",
  "authorization_code": "483920",
  "reference": "SNP-99ACB891",
  "payer_id": "user-1",
  "payer_email": "ana@example.com",
  "card_number": "1234123412341234",
  "cvv": "543"
}
```

### Escenarios

Las reglas se evalúan en este orden: **1)** error del sistema, **2)** validación de datos y **3)** reglas de la tarjeta.

| # | Escenario | Cómo provocarlo | HTTP | `status` | `status_detail` |
|---|---|---|---|---|---|
| 1 | Error del sistema | `SNAILPAY_MODE=down` o header `x-snailpay-simulate: down` | 503 | `error` | `service_unavailable` |
| 2 | Datos inválidos | Un campo con formato incorrecto | 400 | `rejected` | `invalid_card_number`, `invalid_expiration_date`, `invalid_cvv`, `invalid_cardholder_name`, `invalid_amount`, `invalid_payer` o `invalid_request` |
| 3 | Cobro exitoso | `1234123412341234`, `12/26`, `543` | 201 | `approved` | `accredited` |
| 4 | Fondos insuficientes | Tarjeta `4000000000000002` | 402 | `rejected` | `insufficient_funds` |
| 5 | CVV incorrecto | Tarjeta `1234123412341234` con otro CVV | 402 | `rejected` | `invalid_security_code` |
| 6 | Tarjeta vencida | Fecha anterior al mes actual | 402 | `rejected` | `expired_card` |
| 7 | Rechazo genérico | Cualquier otra tarjeta válida | 402 | `rejected` | `card_declined` |

Notas:

- El cobro exitoso se decide por **coincidencia exacta** de tarjeta, vencimiento y CVV, y no por la fecha: la tarjeta de prueba sigue aprobando aunque `12/26` ya haya pasado.
- No se valida el algoritmo de Luhn, porque la tarjeta de prueba no lo cumple.
- Otros casos: un JSON mal formado responde `400` (`invalid_request`); un cuerpo mayor a 10 KB responde `413`; un error inesperado responde `500` (`internal_error`); y una ruta inexistente responde `404`.

### Cómo reproducir cada respuesta

Con el servidor corriendo en `http://localhost:3000`:

#### 3. Cobro exitoso

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"1234123412341234","expiration_date":"12/26","cvv":"543","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

#### 2. Datos inválidos (CVV de 2 dígitos)

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"1234123412341234","expiration_date":"12/26","cvv":"54","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

#### 4. Fondos insuficientes

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"4000000000000002","expiration_date":"12/30","cvv":"123","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

#### 5. CVV incorrecto

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"1234123412341234","expiration_date":"12/26","cvv":"000","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

#### 6. Tarjeta vencida

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"5555555555554444","expiration_date":"01/20","cvv":"123","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

#### 7. Rechazo genérico

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"5555555555554444","expiration_date":"12/40","cvv":"123","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

#### 1. Error del sistema

Hay dos formas de simularlo. Mientras está activo, **ninguna recarga se aprueba ni se aplica**.

**Por petición**, con el header (útil con `curl` o un cliente HTTP; la interfaz no puede enviarlo):

```bash
curl -i -X POST http://localhost:3000/api/snailpay/payments \
  -H "Content-Type: application/json" \
  -H "x-snailpay-simulate: down" \
  -d '{"card_number":"1234123412341234","expiration_date":"12/26","cvv":"543","cardholder_name":"Ana Pérez","transaction_amount":500,"payer_id":"user-1","payer_email":"ana@example.com"}'
```

**Para todo el servidor**, con la variable de entorno. Pon `SNAILPAY_MODE=down` en `server/.env`, reinicia el servidor y haz una recarga desde la aplicación: se mostrará el mensaje de que SnailPay no está disponible y el saldo no cambiará. Para volver a la normalidad, cambia el valor a `normal` y reinicia.

### Manejo en el cliente

| Resultado | Qué hace la aplicación |
|---|---|
| Aprobado | Suma el saldo, lo guarda y muestra el código de autorización y la referencia |
| Rechazado (error de transacción) | Muestra el motivo en español; el saldo no cambia |
| Error del sistema | Informa que SnailPay no está disponible; el saldo no cambia |
| Timeout (10 s) | Informa que tardó demasiado; el saldo no cambia |
| Sin conexión | Informa que no pudo conectar; el saldo no cambia |
| Respuesta inesperada | No acredita nada ni confía en la respuesta |

El cliente solo acredita el saldo cuando la respuesta es exitosa, está aprobada, trae un código de autorización y el monto y el pagador coinciden con lo enviado.

## Decisiones de seguridad

- **Contraseñas:** nunca se guardan en texto plano. Se derivan con PBKDF2-SHA256 mediante Web Crypto (600,000 iteraciones y un salt aleatorio de 16 bytes por usuario) y se comparan en tiempo constante. Se eligió PBKDF2 porque es lo que el navegador ofrece de forma nativa; en un sistema real el hash se haría en el servidor con bcrypt o argon2, con sesión por cookie `httpOnly`.
- **Inicio de sesión:** mensaje genérico ante credenciales incorrectas y el mismo trabajo de hash aunque el correo no exista, para no revelar qué cuentas existen.
- **Sesión:** solo guarda el identificador del usuario y una expiración de 24 horas. Todo lo que se lee de LocalStorage se valida antes de usarse.
- **Servidor:** `helmet`, CORS con lista de orígenes permitidos, límite de 10 KB en el cuerpo, validación estricta con zod y sin registrar datos de tarjeta en los logs.
- **Datos de tarjeta:** el número y el CVV se devuelven en las respuestas y se guardan en LocalStorage únicamente porque así lo exige este ejercicio, y siempre deben ser datos ficticios. En un sistema real el CVV nunca se almacena.

## Limitaciones conocidas

- El usuario, la sesión y el saldo viven en LocalStorage y pueden alterarse desde las herramientas del navegador; es inherente a la simulación local.
- La expiración de la sesión se revisa al cargar la aplicación, no mientras la pestaña sigue abierta, y no se sincroniza entre pestañas.
- El timeout de 10 segundos está cubierto por pruebas automáticas, pero no puede provocarse desde la interfaz.
- Los datos de las gráficas son fijos y no dependen del usuario. La moneda se asumió en pesos mexicanos.
- No hay pruebas de extremo a extremo ni integración continua.

## Solución de problemas

| Síntoma | Causa probable y solución |
|---|---|
| `node: .env: not found` al ejecutar `pnpm dev` | Falta el archivo `.env`. Cópialo desde `.env.example` |
| `ERR_PNPM_IGNORED_BUILDS` | Ejecuta `pnpm approve-builds` y aprueba `esbuild` |
| Error de CORS en la consola del navegador | `CORS_ORIGINS` debe incluir exactamente `http://localhost:5173` (sin diagonal final); reinicia el servidor |
| La recarga siempre dice que no pudo conectar | El servidor no está corriendo o `VITE_API_URL` apunta a otro puerto; reinicia el cliente tras cambiarlo |
| No se puede registrar ni iniciar sesión fuera de `localhost` | El hash usa Web Crypto, que solo funciona en contextos seguros (`localhost` o HTTPS) |