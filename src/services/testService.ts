import { config } from '../config';

export type Test = { id: string; title: string; numQuestions: number };

// Default test templates - can be overridden via environment variables
const getDefaultTests = (): Test[] => {
  const defaultTests = [
    { id: 't1', title: config.DEFAULT_TEST_TITLE, numQuestions: config.DEFAULT_TEST_QUESTIONS },
    { id: 't2', title: 'Algorithms 101', numQuestions: Math.min(config.DEFAULT_TEST_QUESTIONS + 3, config.MAX_TEST_QUESTIONS) },
  ];
  return defaultTests;
};

let tests: Test[] = getDefaultTests();

export const testService = {
  async getTests(): Promise<Test[]> {
    await new Promise((r) => setTimeout(r, 120));
    return tests;
  },
  async createTest(title: string, numQuestions: number): Promise<Test> {
    // Validate numQuestions against config limits
    const validNumQuestions = Math.min(Math.max(numQuestions, 1), config.MAX_TEST_QUESTIONS);
    const t: Test = { id: `t${Date.now()}`, title, numQuestions: validNumQuestions };
    tests = [t, ...tests];
    return t;
  },
  async deleteTest(id: string): Promise<void> {
    tests = tests.filter((t) => t.id !== id);
  },
};
