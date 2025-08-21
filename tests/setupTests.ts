// Silence console.log during tests to keep output tidy.
// You can still assert console.log in specific tests by restoring the mock.

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
    (console.log as jest.Mock).mockRestore();
});
