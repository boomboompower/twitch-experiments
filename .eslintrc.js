module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"@typescript-eslint/no-warning-comments": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/camelcase": "off",
		"node/no-missing-import": "off",
		"node/no-empty-function": "off",
		"node/no-unsupported-features/es-syntax": "off",
		"node/no-missing-require": "off",
		"node/shebang": "off",
		"no-dupe-class-members": "off",
		"require-atomic-updates": "off",
		"block-scoped-var": "error",
		"eqeqeq": "error",
		"no-var": "error",
		"prefer-const": "error",
		"prefer-arrow-callback": "error",
		"prefer-destructuring": "error",
		"prefer-promise-reject-errors": "error",
		"prefer-template": "error",
		"eol-last": "error",
		"no-trailing-spaces": "error",
		"quotes": ["warn", "single", { "avoidEscape": true }],
		"@typescript-eslint/ban-types": [
			"off",
			{
				"types": {
					"String": false,
					"Boolean": false,
					"Number": false,
					"Symbol": false,
					"{}": false,
					"Object": false,
					"object": false,
					"Function": true,
				},
				"extendDefaults": true
			}
		]
	}
};
