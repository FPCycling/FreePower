/**
 * Workout format mappers
 * Convert from various workout formats to the generic workout format
 */

export { parseMrcFile as mapMrcWorkout } from './mrcMapper';
export { mapIntervalsIcuWorkout } from './intervalsIcuMapper';

// Future mappers can be added here:
// export { mapZwiftWorkout } from './zwiftMapper';
// export { mapTrainerRoadWorkout } from './trainerRoadMapper';
