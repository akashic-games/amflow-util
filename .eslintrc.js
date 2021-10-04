module.exports = {
	root: true,
	extends: [
		"@akashic/eslint-config"
	],
	parserOptions: {
		project: "./tsconfig.jest.json",
		sourceType: "module",
		tsconfigRootDir: __dirname
	},
	ignorePatterns: [
		"**/*.js"
	]
}
