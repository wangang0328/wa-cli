const paths = require('./config/paths')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { getCssModuleLocalIdent } = require('@wa-dev/cli-shared-utils')
// 抽离css文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩css文件
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const EslintPlugin = require('eslint-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
// 智能提示使用
const { Configuration } = require('webpack')

const cssModuleRegex = /\.module\.css$/
const cssRegex = /\.css$/
const lessModuleRegex = /\.module\.less$/
const lessRegex = /\.less$/

/**
 * @type {Configuration}
 */
const baseConfig = (webpackEnv) => {
	const isEnvDevelopment = webpackEnv === 'development'
	const isEnvProduction = webpackEnv === 'production'

	const getStyleLoaders = (cssOptions, preProcessor) => {
		const loaders = [
			isEnvDevelopment && require.resolve('style-loader'),
			isEnvProduction && {
				loader: MiniCssExtractPlugin.loader,
				options: {}, // TODO: 处理publicPath
			},
			{
				loader: require.resolve('css-loader'),
				options: { sourceMap: !!isEnvDevelopment, ...cssOptions },
			},
			{
				// 处理css时，自动加前缀
				loader: require.resolve('postcss-loader'),
				options: {
					postcssOptions: {
						plugins: ['autoprefix'], // 决定添加哪些浏览器的前缀到css中
					},
				},
			},
		].filter(Boolean)
		if (preProcessor) {
			loaders.push(
				{
					loader: require.resolve('resolve-url-loader'), // 链式引用(@import)后找不到资源的问题
					options: {
						root: paths.appSrc,
						sourceMap: !!isEnvDevelopment,
					},
				},
				{
					loader: require.resolve(preProcessor),
					options: {
						sourceMap: !!isEnvDevelopment,
					},
				}
			)
		}
		return loaders
	}

	return {
		// target: ["browserslist"], // 如果有配置browserslist则会使用配置信息
		mode: isEnvProduction ? 'production' : 'development',
		entry: paths.appIndex,
		devtool: isEnvProduction ? false : 'cheap-module-source-map',
		output: {
			path: paths.appBuild,
			publicPath: '/', // 打包后文件的公共前缀路径
			filename: 'static/js/[name].[contenthash:8].js',
			// 如果使用了 code splitting 将会增加额外的js chunk file
			chunkFilename: isEnvProduction
				? 'static/js/[name].[contenthash:8].chunk.js'
				: 'static/js/[name].chunk.js',
			assetModuleFilename: 'static/media/[name].[hash][ext]',
		},
		cache: {
			// 将缓存类型文件设置为文件系统，默认是memory
			type: 'filesystem',
			buildDependencies: {
				// 更改配置时，重新缓存
				config: [__filename],
			},
		},
		optimization: {
			minimize: !!isEnvProduction,
			// 值为single会创建一个在所有生成chunk之间共享的运行时文件
			runtimeChunk: 'single',
			moduleIds: 'deterministic', // 保证模块的id不会随着解析的顺序的变化而变化，生产环境默认开启
			minimizer: [new CssMinimizerPlugin()],
		},
		module: {
			rules: [
				{
					oneOf: [
						{
							test: [/\.jpe?g$/, /\.bmp$/, /\.gif$/, /\.png$/, /\.svg$/],
							type: 'asset',
							parser: {
								dataUrlCondition: {
									maxSize: 10000,
								},
							},
						},
						{
							test: /\.(m?js|jsx|ts|tsx)$/,
							include: paths.appSrc,
							loader: require.resolve('babel-loader'),
							options: {
								presets: [
									[
										require.resolve('@babel/preset-env'),
										{
											useBuiltIns: 'usage',
											corejs: 3,
										},
									],
									[
										require.resolve('@babel/preset-react'),
										{
											targets: {},
											// 两种方式，classic、automatic不必手动引用react
											runtime: 'automatic',
										},
									],
									[require.resolve('@babel/preset-typescript')],
								],
								babelrc: false,
								configFile: false,
								cacheDirectory: true,
							},
						},
						{
							test: cssRegex,
							exclude: cssModuleRegex,
							use: getStyleLoaders({
								modules: {
									mode: 'icss',
								},
							}),
						},
						{
							test: cssModuleRegex,
							use: getStyleLoaders({
								modules: {
									mode: 'local',
									// 命名规则
									getLocalIdent: getCssModuleLocalIdent,
								},
							}),
						},
						{
							test: lessRegex,
							exclude: lessModuleRegex,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									modules: {
										mode: 'icss',
									},
								},
								'less-loader'
							),
						},
						{
							test: lessModuleRegex,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									modules: {
										mode: 'local',
										getLocalIdent: getCssModuleLocalIdent,
									},
								},
								'less-loader'
							),
						},
					],
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: paths.appHtml,
				inject: true, // 自动注入静态资源
			}),
			isEnvProduction &&
				new MiniCssExtractPlugin({
					filename: 'static/css/[name].[contenthash:8].css',
					chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
				}),
			new EslintPlugin({
				extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx'],
				eslintPath: require.resolve('eslint'),
				// extends: "standard",
				// fix: true,
			}),
			new ProgressPlugin(),
		].filter(Boolean),
		resolve: {
			extensions: ['.tsx', '.ts', '.js', '.json', '.mjs', '.jsx'],
			alias: {
				src: paths.appSrc,
				'@': paths.appSrc,
				// "@icon": paths.iconSrc,
				// "@components": paths.componentsSrc,
				// "@common": paths.commonSrc,
				// "@pages": paths.pagesSrc,
			},
		},
	}
}

module.exports = baseConfig
