# Workout Format Mappers

This project uses a **generic workout format** (`GenericWorkout`) as the internal representation for all workouts, regardless of their source.

## Architecture

```
Source Format (MRC, Intervals.icu, Zwift)
    ↓
Mapper Function
    ↓
GenericWorkout (internal format)
    ↓
currentWorkout store
    ↓
Workout execution
```

## Generic Workout Format

```typescript
interface GenericWorkout {
    name: string; // Workout name
    description?: string; // Optional description
    intervals: WorkoutInterval[]; // Array of power intervals
}

interface WorkoutInterval {
    startMs: number; // Start time in milliseconds
    percentFtp: number; // Power target as % of FTP
}
```

## Available Mappers

### 1. MRC Files

```typescript
import { parseMrcFile } from './utils/mappers/mrcMapper';

const mrcFileContent = '...'; // MRC file as string
const workout = parseMrcFile(mrcFileContent);
writableCurrentWorkout.set(workout);
```

### 2. Intervals.icu Workouts

```typescript
import { mapIntervalsIcuWorkout } from './utils/mappers/intervalsIcuMapper';

const plannedWorkout: PlannedWorkout = { ... }; // From API
const workout = mapIntervalsIcuWorkout(plannedWorkout);
writableCurrentWorkout.set(workout);
```

## Adding New Formats

To add support for a new workout format (e.g., Zwift):

1. Create a new mapper file: `src/utils/mappers/zwiftMapper.ts`
2. Implement the mapper function that returns `GenericWorkout`
3. Export it from `src/utils/mappers/index.ts`

Example:

```typescript
// src/utils/mappers/zwiftMapper.ts
import type { GenericWorkout } from '../../types/genericWorkout';

export function mapZwiftWorkout(zwiftData: ZwiftWorkout): GenericWorkout {
    return {
        name: zwiftData.name,
        description: zwiftData.description,
        intervals: zwiftData.segments.map((segment, index) => ({
            startMs: segment.startTime * 1000,
            percentFtp: segment.powerZone * 100,
        })),
    };
}
```

## Benefits

- **Decoupled**: Workout execution doesn't depend on source format
- **Extensible**: Easy to add new workout formats
- **Maintainable**: Changes to one format don't affect others
- **Type-safe**: Full TypeScript support across all mappers
