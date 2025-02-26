module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "./src/**/*.ts",
    "!./src/__tests__/**/*.ts"
  ],
  coverageReporters: [
    "lcov"
  ],
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  transform: {
    "^.+\\.ts$": [
      "ts-jest", {
        tsconfig: "tsconfig.jest.json"
      }
    ]
  },
  testMatch: [
    "<rootDir>/src/**/*.spec.ts"
  ]
};
