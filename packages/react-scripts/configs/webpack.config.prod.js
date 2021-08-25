const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const baseConfig = require("./webpack.config.base");
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackPaths = require("./webpack.paths.js");
const utils = require("../utils");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const envConfig = require("./env");
const env = envConfig.getClientEnvironment(
  webpackPaths.publicUrlOrPath.slice(0, -1)
);
module.exports = merge(baseConfig, {
  devtool: "source-map",
  bail: true,
  mode: "production",
  entry: [
    require.resolve("core-js"),
    require.resolve("regenerator-runtime/runtime"),
    webpackPaths.appIndexJs,
  ],
  output: {
    path: webpackPaths.appDist,
    filename: "static/js/[name].[contenthash:8].js",
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            cacheDirectory: true,
            presets: [
              [
                require.resolve("@wanglihua/babel-preset-react-app"),
                {
                  runtime: utils.hasJsxRuntime ? "automatic" : "classic",
                },
              ],
            ],
          },
        },
      },
      {
        // CSS/SCSS
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: true,
            },
          },
          require.resolve("sass-loader"),
        ],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ parallel: true }), new CssMinimizerPlugin()],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      DEBUG_PROD: false,
    }),

    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css",
      chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === "true" ? "server" : "disabled",
      openAnalyzer: process.env.OPEN_ANALYZER === "true",
    }),
    new HtmlWebpackPlugin({
      template: path.join(webpackPaths.appPublic, "index.html"),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
  ],
});
