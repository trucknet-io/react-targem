const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CaseSensitivePathsWebpackPlugin = require("case-sensitive-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const WebpackBar = require("webpackbar");

const filesExts = require("../config/filesExts");
const LANGUAGES_REGEX = require("../config/languagesRegex");

const paths = {
  input: "./src",
  static: "./public",
  output: "./www",
  template: "./src/index.ejs",
  entry: {
    main: "./src/index.tsx",
  },
};

const TITLE = "Boilerplate";
const DEV = process.env.NODE_ENV !== "production";

const plugins = [
  new WebpackBar(),
  new webpack.ContextReplacementPlugin(/date-fns[/\\]locale$/, LANGUAGES_REGEX),
  new CleanWebpackPlugin([paths.output]),
  new CopyWebpackPlugin([paths.static]),
  new CaseSensitivePathsWebpackPlugin({ debug: false }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, paths.template),
    hash: false,
    filename: "index.html",
    inject: "body",
    title: TITLE,
    minify: {
      collapseWhitespace: false,
    },
  }),
];

if (DEV) {
  plugins.push(new webpack.NamedModulesPlugin());
  plugins.push(new BundleAnalyzerPlugin({ openAnalyzer: false }));
} else {
  plugins.push(
    new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerMode: "static" }),
  );
}

module.exports = {
  context: __dirname,
  entry: paths.entry,
  devtool: DEV ? "cheap-module-eval-source-map" : "hidden-source-map", // https://webpack.js.org/configuration/devtool/
  devServer: {
    // https://webpack.js.org/configuration/dev-server/
    port: "3000",
    contentBase: path.join(__dirname, paths.static),
    historyApiFallback: true,
    hot: true,
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 500,
      ignored: ["node_modules", "dist"],
    },
    stats: "minimal",
  },
  mode: DEV ? "development" : "production",
  output: {
    path: path.resolve(__dirname, paths.output),
    filename: DEV ? "[name].js" : "assets/js/[name].[hash].js",
    chunkFilename: DEV ? "[name].js" : "assets/js/[name].[hash].bundle.js",
  },
  plugins,
  resolve: {
    extensions: [".ts", ".tsx", ".wasm", ".mjs", ".js", ".json"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, "./tsconfig.json"),
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        include: /node_modules/,
        use: [require.resolve("react-hot-loader/webpack")],
      },
      {
        test: new RegExp(`\.(${filesExts.join("|")})$`),
        use: [
          {
            loader: require.resolve("file-loader"),
            options: { outputPath: "assets/images" },
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: require.resolve("html-loader"),
          },
          {
            loader: require.resolve("markdown-loader"),
          },
        ],
      },
    ],
  },
};
