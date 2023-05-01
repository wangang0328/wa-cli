const { createSchema } = require('@wa-dev/cli-shared-utils')
const react = require('@vitejs/plugin-react')
const { defineConfig } = require('vite')
const { createHtmlPlugin } = require('vite-plugin-html')

exports.schema = createSchema((joi) =>
	joi.object({
		publicPath: joi.string().allow(''),
	})
)

exports.defaults = defineConfig({
	plugins: [
		react(),
		createHtmlPlugin({
			inject: {
				data: {
					isVite: true,
				},
			},
		}),
	],
})
