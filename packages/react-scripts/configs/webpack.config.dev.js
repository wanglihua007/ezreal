const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackPaths = require("./webpack.paths.js");
const { hasJsxRuntime } = require("../utils");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const envConfig = require("./env");
const env = envConfig.getClientEnvironment(
  webpackPaths.publicUrlOrPath.slice(0, -1)
);

module.exports = merge(baseConfig, {
  devtool: "cheap-module-source-map",
  mode: "development",
  entry: [
    // `webpack-dev-server/client?http://localhost:${port}/dist`,
    // "webpack/hot/only-dev-server",
    require.resolve("core-js/stable"),
    require.resolve("regenerator-runtime/runtime"),
    webpackPaths.appIndexJs,
  ],
  output: {
    path: webpackPaths.appDist,
    filename: "static/js/bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                [
                  require.resolve("@wanglihua/babel-preset-react-app"),
                  {
                    runtime: hasJsxRuntime ? "automatic" : "classic",
                  },
                ],
              ],
              plugins: [require.resolve("react-refresh/babel")].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: require.resolve("style-loader"),
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: require.resolve("style-loader"),
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
        ],
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: require.resolve("style-loader"),
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              sourceMap: true,
            },
          },
          {
            loader: require.resolve("sass-loader"),
          },
        ],
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: require.resolve("style-loader"),
          },
          {
            loader: require.resolve(
              "@teamsupercell/typings-for-css-modules-loader"
            ),
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: require.resolve("sass-loader"),
          },
        ],
      },
    ],
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new HtmlWebpackPlugin({
      filename: path.join("index.html"),
      template: path.join(webpackPaths.appPublic, "index.html"),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      env: process.env.NODE_ENV,
      isDevelopment: process.env.NODE_ENV !== "production",
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    contentBase: [webpackPaths.appDist, webpackPaths.appPublic],
    open: true,
    compress: true,
    hot: true,
    inline: true,
    noInfo: false,
    lazy: false,
    stats: "errors-warnings",
    headers: { "Access-Control-Allow-Origin": "*" },
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
  },
});
