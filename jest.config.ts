import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts','js','json'],
    transform: { '^.+\\.ts$': 'ts-jest' },
    collectCoverage: false,
};

export default config;
