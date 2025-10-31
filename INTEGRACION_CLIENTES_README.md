# Integración Frontend-Backend: Módulo de Clientes

## Cambios Realizados

### 1. Tipos TypeScript (`src/types/client.ts`)
✅ **Actualizado completamente** para coincidir con las entidades del backend Java:

- `TipoCliente`: Tipo que refleja el enum del backend ('NATURAL' | 'EMPRESA')
- `Cliente`: Interfaz base con los atributos exactos de `Cliente.java`
  - `id` (UUID)
  - `tipoCliente`
  - `correo`
  - `telefono`
  - `direccion`
  - `creadoEn` (OffsetDateTime)
  - `activo`

- `ClienteNatural`: Extiende Cliente, coincide con `ClienteNatural.java`
  - `nombre`
  - `apellido`
  - `tipoDocumento`
  - `numeroDocumento`

- `ClienteEmpresa`: Extiende Cliente, coincide con `ClienteEmpresa.java`
  - `razonSocial`
  - `ruc`
  - `giroComercial`
  - `direccionFiscal`
  - `representante` (objeto Representante)

- `Representante`: Coincide con `Representante.java`
  - `id`
  - `nombre`
  - `apellido`
  - `tipoDocumento`
  - `numeroDocumento`
  - `cargo`
  - `correo`
  - `telefono`

- **DTOs** que coinciden exactamente con el backend:
  - `ClienteNaturalDto`
  - `ClienteEmpresaDto`
  - `RepresentanteDto`
  - `ClienteContratoDto` (para Feign client)
  - `ClienteReporteDto` (para reportes)

### 2. Servicio API (`src/services/clienteService.ts`)
✅ **Nuevo archivo** que consume todos los endpoints del `ClienteController.java`:

#### Endpoints implementados:
- `GET /api/clientes` - Listar todos los clientes
- `GET /api/clientes/activos` - Listar clientes activos
- `GET /api/clientes/inactivos` - Listar clientes inactivos  
- `GET /api/clientes/{id}` - Buscar cliente por ID
- `POST /api/clientes/naturales` - Crear cliente natural
- `PUT /api/clientes/naturales/{id}` - Actualizar cliente natural
- `POST /api/clientes/empresas` - Crear cliente empresa
- `PUT /api/clientes/empresas/{id}` - Actualizar cliente empresa
- `DELETE /api/clientes/{id}` - Desactivar cliente (soft delete)
- `GET /api/clientes/contratos/{id}` - Obtener cliente para contrato
- `POST /api/clientes/reportes/por-ids` - Obtener clientes para reportes

#### Características:
- Manejo de errores con mensajes descriptivos
- Headers correctos (Content-Type: application/json)
- Validación de respuestas HTTP
- Tipado fuerte con TypeScript

### 3. Componentes a Actualizar

#### `ClientManagement.tsx`
**Estado**: Pendiente de actualización
**Cambios necesarios**:
- Importar `clienteService` y tipos actualizados
- Usar `findAllActivos()` para cargar clientes
- Adaptar el renderizado para mostrar `ClienteNatural` y `ClienteEmpresa`
- Actualizar el método de eliminación para usar `delete(id)`

#### `RegisterClient.tsx`
**Estado**: Respaldado (`.bak` creado)
**Cambios necesarios**:
- Usar `ClienteNaturalDto` y `ClienteEmpresaDto`
- Implementar lógica de creación/edición con `clienteService`
- Validaciones que coincidan con las del backend (anotaciones @Valid)
- Diferenciar entre Cliente Natural y Empresa

#### `ClientCard.tsx`
**Cambios necesarios**:
- Aceptar `ClienteUnion` (ClienteNatural | ClienteEmpresa)
- Mostrar nombre completo según el tipo:
  - Natural: `${nombre} ${apellido}`
  - Empresa: `${razonSocial}`
- Mostrar documento según el tipo:
  - Natural: `${tipoDocumento}: ${numeroDocumento}`
  - Empresa: `RUC: ${ruc}`

#### `ClientDetailsModal.tsx`
**Cambios necesarios**:
- Mostrar información diferenciada según tipo de cliente
- Para ClienteNatural: nombre, apellido, documento
- Para ClienteEmpresa: razón social, RUC, representante

## Configuración del Backend

### URL del Microservicio
Por defecto, el servicio apunta a:
```typescript
const API_BASE_URL = 'http://localhost:8080/api/clientes';
```

### CORS
El backend ya tiene configurado CORS para:
- `http://localhost:5173` (Vite por defecto)
- `http://localhost:3000`

Si necesitas otro puerto, actualiza `@CrossOrigin` en `ClienteController.java`.

## Validaciones del Backend

### Cliente Natural (`ClienteNaturalDto`)
- ✅ `nombre`: 2-50 caracteres, obligatorio
- ✅ `apellido`: 2-50 caracteres, obligatorio
- ✅ `tipoDocumento`: obligatorio
- ✅ `numeroDocumento`: mínimo 8 caracteres, obligatorio
- ✅ `correo`: formato email válido
- ✅ `telefono`: 9-15 caracteres, obligatorio, patrón `[0-9+\-\s()]+`
- ✅ `direccion`: máximo 200 caracteres, opcional

### Cliente Empresa (`ClienteEmpresaDto`)
- ✅ `razonSocial`: 3-100 caracteres, obligatorio
- ✅ `ruc`: exactamente 11 dígitos numéricos, obligatorio
- ✅ `giroComercial`: máximo 100 caracteres, opcional
- ✅ `direccionFiscal`: máximo 200 caracteres, opcional
- ✅ `representante`: objeto RepresentanteDto válido, obligatorio
- ✅ `correo`: formato email válido, obligatorio
- ✅ `telefono`: 9-15 caracteres, obligatorio
- ✅ `direccion`: máximo 200 caracteres, opcional

### Representante (`RepresentanteDto`)
- Todos los campos del representante se deben enviar
- Validaciones similares a Cliente Natural

## Próximos Pasos

### Para completar la integración:

1. **Actualizar ClientManagement.tsx**:
   ```typescript
   import { clienteService } from '../services/clienteService';
   import type { ClienteUnion } from '../types/client';
   
   // En el useEffect o función de carga:
   const loadClientes = async () => {
     try {
       const clientes = await clienteService.findAllActivos();
       setClientes(clientes);
     } catch (error) {
       console.error('Error al cargar clientes:', error);
     }
   };
   ```

2. **Crear nuevo RegisterClient.tsx** basado en los DTOs del backend

3. **Actualizar ClientCard** para renderizar diferenciadamente

4. **Actualizar ClientDetailsModal** para mostrar detalles específicos

## Notas Importantes

- ⚠️ **No se modificaron los atributos** del backend, todo coincide exactamente
- ⚠️ El backend usa **UUIDs** como IDs, no números
- ⚠️ El campo `activo` es un **boolean**, no un string 'Activo'/'Inactivo'
- ⚠️ La fecha de creación (`creadoEn`) viene en formato **ISO 8601**
- ⚠️ El endpoint `DELETE` hace **soft delete** (marca como inactivo)

## Testing

Para probar la integración:

1. Iniciar el microservicio de clientes (puerto 8080)
2. Iniciar el frontend React Vite:
   ```bash
   npm run dev
   ```
3. Verificar que ambos se comunican correctamente
4. Probar creación de Cliente Natural
5. Probar creación de Cliente Empresa con Representante
6. Verificar listado, edición y eliminación

## Estructura de Datos de Ejemplo

### Cliente Natural (Response del backend):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "tipoCliente": "NATURAL",
  "correo": "juan.perez@email.com",
  "telefono": "+51987654321",
  "direccion": "Jr. Los Olivos 123",
  "creadoEn": "2025-10-31T10:30:00-05:00",
  "activo": true,
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez"
}
```

### Cliente Empresa (Response del backend):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "tipoCliente": "EMPRESA",
  "correo": "contacto@empresa.com",
  "telefono": "+51987654322",
  "direccion": "Av. Principal 456",
  "creadoEn": "2025-10-31T10:35:00-05:00",
  "activo": true,
  "razonSocial": "Empresa Transportes SAC",
  "ruc": "20123456789",
  "giroComercial": "Transporte",
  "direccionFiscal": "Av. Javier Prado 789",
  "representante": {
    "id": "223e4567-e89b-12d3-a456-426614174002",
    "nombre": "Carlos",
    "apellido": "López",
    "tipoDocumento": "DNI",
    "numeroDocumento": "87654321",
    "cargo": "Gerente General",
    "correo": "carlos.lopez@empresa.com",
    "telefono": "+51987654323"
  }
}
```

---

## Archivos Modificados

✅ `src/types/client.ts` - Tipos actualizados  
✅ `src/services/clienteService.ts` - Servicio API nuevo  
⚠️ `src/pages/RegisterClient.tsx` - Respaldado, pendiente actualización  
⚠️ `src/pages/ClientManagement.tsx` - Pendiente actualización  
⚠️ `src/components/ClientCard.tsx` - Pendiente actualización  
⚠️ `src/components/ClientDetailsModal.tsx` - Pendiente actualización  

## Archivos de Respaldo

- `src/pages/RegisterClient.tsx.bak` - Versión original del componente
