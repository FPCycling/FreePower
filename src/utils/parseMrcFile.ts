import type { Workout, WorkoutData } from '../types/workout';
import dayjs, { Dayjs } from 'dayjs';

export function parseMrcFile(file: string): Workout {
    return {
        ...parseHeader(file),
        workoutData: parseData(file),
    };
}

function parseHeader(file: string): { description: string; date: Dayjs } {
    const header = file.split('[END COURSE HEADER]')[0]?.split('[COURSE HEADER]')[1];
    if (!header) throw new Error('Invalid MRC file format');

    const headerLines = header
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => line.split('=').map((item) => item.trim()))
        .map((item) => {
            const key = item[0];
            const value = item[1];
            return key && value ? { [key]: value } : {};
        })
        .reduce((result, current) => Object.assign(result, current), {} as Record<string, string>);

    const fileName = (headerLines['FILE NAME'] as string) || '';
    const date = fileName.slice(0, fileName.indexOf('.'));

    return {
        description: headerLines['DESCRIPTION'] || '',
        date: dayjs(date),
    };
}

function parseData(file: string): WorkoutData[] {
    const courseData = file.split('[END COURSE DATA]')[0]?.split('[COURSE DATA]')[1];
    if (!courseData) throw new Error('Invalid MRC file format');

    const result = courseData
        .split('\n')
        .filter((line) => line.trim())
        .map((line): WorkoutData => {
            const split = line.replace(/\t/g, ' ').split(' ');

            return {
                startMs: Number(split[0]) * 60000,
                percentFtp: Number(split[1]),
                watts: 0,
            };
        })
        .filter(function removeDuplicatedLines(line, index, array) {
            if (index > 0 && index !== array.length - 1) {
                const prevLine = array[index - 1];
                return prevLine ? line.percentFtp !== prevLine.percentFtp : true;
            }
            return true;
        });

    return result;
}
