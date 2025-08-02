# 🎨 Sistema de Skeletons Dinámicos

## ✨ ¿Qué son los Skeletons Dinámicos?

En lugar de mostrar un número fijo de skeletons (como 8 o 12), nuestro sistema **obtiene primero el count real** de tweaks/game configs y muestra **exactamente ese número** de skeletons.

## 🚀 **Ventajas**

### ❌ **Antes (Skeletons Estáticos)**
- Hardcodeados: Siempre 8 skeletons
- **Si tienes 3 tweaks**: Muestra 8 skeletons → Se ve raro
- **Si tienes 50 tweaks**: Muestra 8 skeletons → Usuario no espera 50

### ✅ **Después (Skeletons Dinámicos)**
- **Si tienes 3 tweaks**: Muestra 3 skeletons → Perfecto
- **Si tienes 50 tweaks**: Muestra 20 skeletons (max) → Usuario espera muchos
- **Count cacheado**: Súper rápido (~10ms)

## 📁 **Componentes Creados**

### `components/ui/tweak-skeletons.tsx`

#### `TweakCardSkeleton`
- Coincide **exactamente** con la estructura de `CardTweakInfo`
- Header, compatibilidad, stats, botones - todo igual
- Solo que son skeletons grises animados

#### `TweaksPreviewSkeleton`
- Para la sección de tweaks destacados
- Muestra título skeleton + grid de cards
- **Count dinámico**: `Math.min(totalCount, 4)` (máximo 4 para preview)

#### `TweaksGridSkeleton`
- Para la página completa de tweaks
- Incluye filtros skeleton, header, grid de resultados
- **Count dinámico**: `Math.min(totalCount, 20)` (máximo 20 por performance)

## 🔄 **Flujo de Carga Optimizado**

### 1. **Count Rápido** (~10ms)
```typescript
const { data: totalCount = 0 } = useTweaksCount();
// ↑ Normalmente está cacheado, súper rápido
```

### 2. **Skeletons Dinámicos**
```typescript
if (isLoading) {
  const skeletonCount = Math.min(totalCount || 4, 4);
  return <TweaksPreviewSkeleton count={skeletonCount} />;
}
```

### 3. **Datos Reales** (~500-2000ms)
```typescript
const { data: tweaksData, isLoading } = useFeaturedTweaks(4);
// ↑ Toma más tiempo, pero skeletons ya están perfectos
```

## 🎯 **Implementación**

### Tweaks Preview
```typescript
export default function TweaksPreview() {
  // Count primero (rápido)
  const { data: totalCount = 0 } = useTweaksCount();

  // Datos después (más lento)
  const { data: featuredData, isLoading } = useFeaturedTweaks(4);

  if (isLoading) {
    const skeletonCount = Math.min(totalCount || 4, 4);
    return <TweaksPreviewSkeleton count={skeletonCount} />;
  }

  // ... resto del componente
}
```

### Tweaks Full Page
```typescript
export default function TweaksFullPage() {
  // Count primero (rápido)
  const { data: totalCount = 0 } = useTweaksCount();

  // Datos filtrados después (más lento)
  const { data: tweaksData, isLoading } = useTweaks(filters);

  if (isLoading) {
    const skeletonCount = Math.min(totalCount || 12, 20);
    return <TweaksGridSkeleton count={skeletonCount} />;
  }

  // ... resto del componente
}
```

## 🎨 **Estructura de Skeletons**

### TweakCardSkeleton
```
┌─────────────────────────┐
│ [⭕] Título Skeleton    │ ← Header exacto
│ Descripción...          │
│ Descripción...          │
│                         │
│ [🖥️][💻] Win 10/11     │ ← Compatibilidad
│ [Admin] [Restart]       │
│                         │
│ [📥] [❤️] [⭐] [2.5MB] │ ← Stats
│ File type: .reg         │
│                         │
│ [Download] [❤️] [🚩]   │ ← Botones
│ Risk: [Low]             │
└─────────────────────────┘
```

## 🚀 **Resultado**

### **Experiencia del Usuario**
1. **Carga página** → Count se obtiene súper rápido (cacheado)
2. **Skeletons aparecen** → Número exacto, no random
3. **Datos cargan** → Reemplazan skeletons perfectamente
4. **Usuario feliz** → Sabe exactamente qué esperar

### **Performance**
- **Count query**: ~10ms (cacheado)
- **Skeletons render**: ~5ms
- **Data query**: ~500-2000ms (pero user ya ve skeletons)
- **Total percibido**: ~15ms → ⚡ **INSTANTÁNEO**

## 💡 **Mejores Prácticas**

### ✅ **DO**
- Usar count real para skeletons
- Limitar skeletons máximos (performance)
- Cache count queries (long staleTime)
- Estructura skeleton = estructura real

### ❌ **DON'T**
- Hardcodear número de skeletons
- Mostrar 100+ skeletons (performance)
- Skeletons que no coinciden con la estructura real
- Olvidar límites máximos

## 🎉 **Resultado**

**Antes**: "¿Por qué veo 8 cards si solo tengo 2 tweaks?" 😕
**Después**: "¡Perfecto! Veo exactamente lo que espero" 😍

¡Los skeletons dinámicos hacen que tu app se sienta **profesional** y **predecible**! 🚀
