# Postman (ProGest)

## Archivos

- Collection: `postman/ProGest_API_Complete.postman_collection.json`
- Environment (dev): `postman/ProGest_Development.postman_environment.json`
- Environment (E2E marketing): `postman/ProGest_E2E_Marketing.postman_environment.json`

## Importar en Postman

1) Importa la collection `ProGest_API_Complete.postman_collection.json`.
2) Importa el environment `ProGest_E2E_Marketing.postman_environment.json` (recomendado para pruebas automáticas).
3) Selecciona el environment activo en Postman.

## Credenciales E2E (marketing)

Generadas por:
`npm run e2e:team -- marketing 500`

- Owner:
  - Email: `owner_marketing_1773507073679@test.com`
  - Password: `Test12345A`
- Employee (ejemplo):
  - Email: `employee_marketing_10_1773507073679@test.com`
  - Password: `Test12345A`

## Notas

- La variable `base_url` apunta al backend: `http://127.0.0.1:5000`
- `access_token` y `refresh_token` se setean automáticamente al usar “Login” (o “Login (Employee)”).
- SSE (tiempo real):
  - Request: `GET /api/notifications/stream?token={{access_token}}`
  - En Postman, el stream se verá como texto con eventos.

