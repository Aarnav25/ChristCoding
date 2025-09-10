export type Test = { id: string; title: string; numQuestions: number };

let tests: Test[] = [
  { id: 't1', title: 'Arrays & Strings Basics', numQuestions: 5 },
  { id: 't2', title: 'Algorithms 101', numQuestions: 8 },
];

export const testService = {
  async getTests(): Promise<Test[]> {
    await new Promise((r) => setTimeout(r, 120));
    return tests;
  },
  async createTest(title: string, numQuestions: number): Promise<Test> {
    const t: Test = { id: `t${Date.now()}`, title, numQuestions };
    tests = [t, ...tests];
    return t;
  },
  async deleteTest(id: string): Promise<void> {
    tests = tests.filter((t) => t.id !== id);
  },
};
