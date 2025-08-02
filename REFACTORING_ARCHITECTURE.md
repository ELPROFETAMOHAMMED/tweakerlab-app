# 🏗️ Refactoring Architecture - Screaming Architecture

## 🎯 Objetivo

Refactorización completa del proyecto aplicando **Screaming Architecture** - organización por dominio de negocio en lugar de tipo técnico.

## 📁 Nueva Estructura

```
src/
├── domains/
│   ├── auth/
│   │   ├── components/     # Login, Register, AuthGuard
│   │   ├── hooks/         # useAuth, useSession
│   │   ├── services/      # auth-service.ts
│   │   ├── types/         # auth.ts
│   │   ├── validations/   # auth-schemas.ts
│   │   └── api/          # route handlers relacionados
│   ├── tweaks/
│   │   ├── components/    # TweakCard, TweakModal, TweaksGrid
│   │   ├── hooks/         # use-tweaks.ts ✅
│   │   ├── services/      # tweaks-client-service.ts ✅
│   │   ├── types/         # tweaks.ts ✅
│   │   ├── validations/   # tweak-schemas.ts
│   │   └── api/          # route handlers
│   ├── game-configs/
│   │   ├── components/    # GameConfigCard, GameConfigsCarousel
│   │   ├── hooks/         # use-game-configs.ts ✅
│   │   ├── services/      # game-configs-client-service.ts ✅
│   │   ├── types/         # game-configs.ts ✅
│   │   └── api/          # route handlers
│   ├── dashboard/
│   │   ├── components/    # DashboardStats, QuickActions
│   │   ├── hooks/         # use-dashboard.ts
│   │   └── types/         # dashboard.ts
│   ├── pc-info/
│   │   ├── components/    # PCInfoCard, OnboardingSteps
│   │   ├── hooks/         # use-pc-info.ts
│   │   ├── services/      # pc-info-service.ts
│   │   └── types/         # pc-info.ts
│   └── shared/
│       ├── components/
│       │   └── ui/       # Button, Card, Dialog (shadcn/ui)
│       ├── providers/     # QueryProvider, ThemeProvider
│       ├── utils/         # cn, formatters, validators
│       └── types/         # common.ts, api.ts
├── app/                   # Solo routing Next.js
└── lib/                  # Utilities globales (supabase, etc.)
```

## ✅ Completado

### Tweaks Domain
- ✅ `src/domains/tweaks/hooks/use-tweaks.ts`
- ✅ `src/domains/tweaks/services/tweaks-client-service.ts`
- ✅ `src/domains/tweaks/types/tweaks.ts`
- ✅ `src/domains/tweaks/index.ts`

### Game Configs Domain
- ✅ `src/domains/game-configs/hooks/use-game-configs.ts`
- ✅ `src/domains/game-configs/services/game-configs-client-service.ts`
- ✅ `src/domains/game-configs/types/game-configs.ts`
- ✅ `src/domains/game-configs/index.ts`

### Infrastructure
- ✅ Path mappings en `tsconfig.json`
- ✅ Estructura de carpetas base

## 🚧 Pendiente

### 1. Auth Domain
```bash
# Migrar y refactorizar:
lib/auth/session.ts → src/domains/auth/services/
lib/validations/auth.ts → src/domains/auth/validations/
components/forms/login-form.tsx → src/domains/auth/components/
components/forms/register-form.tsx → src/domains/auth/components/
hooks/use-auth.ts → src/domains/auth/hooks/
```

### 2. Dashboard Domain
```bash
# Migrar y refactorizar:
components/dashboard/* → src/domains/dashboard/components/
# Crear hooks específicos para dashboard analytics
```

### 3. PC Info Domain
```bash
# Migrar y refactorizar:
components/pc-info/* → src/domains/pc-info/components/
services/pc-info.ts → src/domains/pc-info/services/
hooks/use-pc-info.ts → src/domains/pc-info/hooks/
lib/parsers/* → src/domains/pc-info/services/parsers/
```

### 4. Shared Domain
```bash
# Migrar y refactorizar:
components/ui/* → src/domains/shared/components/ui/
components/providers/* → src/domains/shared/providers/
lib/utils.ts → src/domains/shared/utils/
components/theme-provider.tsx → src/domains/shared/providers/
```

### 5. API Routes Refactoring
```bash
# Aplicar mismo patrón de refactorización:
# - Eliminar comentarios
# - Eliminar console.log
# - Convertir async/await a promesas
# - Validaciones con Zod
```

## 🎨 Patrones Aplicados

### Servicios Cliente
```typescript
// ❌ Antes: Clase con async/await
export class TweaksClientService {
  static async getFeaturedTweaks() {
    try {
      const response = await fetch('/api/tweaks/featured')
      // ...
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }
}

// ✅ Después: Objeto funcional con promesas
export const TweaksClientService = {
  getFeaturedTweaks: (limit = 10) =>
    fetch(`/api/tweaks/featured?limit=${limit}`)
    .then(handleResponse<TweaksResponse>)
}
```

### Hooks
```typescript
// ❌ Antes: Con comentarios y lógica compleja
export function useFeaturedTweaks(limit: number = 10) {
  return useQuery({
    queryKey: tweaksKeys.featured(limit),
    queryFn: () => TweaksClientService.getFeaturedTweaks(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes - featured tweaks cache
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection
  });
}

// ✅ Después: Limpio y funcional
export function useFeaturedTweaks(limit = 10) {
  return useQuery({
    queryKey: tweaksKeys.featured(limit),
    queryFn: () => TweaksClientService.getFeaturedTweaks(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
```

### Tipos
```typescript
// ❌ Antes: Con comentarios innecesarios
export type TweakRiskLevel =
  | 'minimal'      // Safe tweaks, no system impact
  | 'low'         // Minor changes, easily reversible
  | 'medium'      // Moderate changes, some risk
  | 'high'        // Major changes, high BSOD risk
  | 'critical';   // Dangerous, expert only

// ✅ Después: Limpio y directo
export type TweakRiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical'
```

## 🔄 Scripts de Migración

### Actualizar Imports
```bash
# Buscar y reemplazar imports en toda la aplicación:
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/hooks/use-tweaks-cache|@/tweaks/hooks/use-tweaks|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/lib/services/client/tweaks-client-service|@/tweaks/services/tweaks-client-service|g'
```

### Validar Compilación
```bash
npm run build
npm run type-check
```

## 🎯 Beneficios

1. **Screaming Architecture**: El código "grita" su propósito de negocio
2. **Separación Clara**: Cada dominio es independiente y cohesivo
3. **Mantenibilidad**: Fácil localizar y modificar funcionalidades
4. **Escalabilidad**: Agregar nuevos dominios es straightforward
5. **Testing**: Tests organizados por dominio de negocio
6. **Código Limpio**: Sin comentarios, sin console.log, funcional
7. **Performance**: Uso eficiente de promesas en lugar de async/await

## 🚀 Siguiente Fase

1. Completar migración de dominios restantes
2. Actualizar todos los imports en componentes
3. Refactorizar API routes aplicando mismos patrones
4. Implementar validaciones Zod en todos los dominios
5. Testing completo de la nueva arquitectura
6. Documentación de uso para cada dominio
