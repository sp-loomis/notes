const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
  // Main process configuration
  {
    mode: process.env.NODE_ENV || "development",
    entry: "./src/main/main.ts",
    target: "electron-main",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js",
    },
    resolve: {
      extensions: [".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
    node: {
      __dirname: false,
    },
  },
  // Preload process configuration
  {
    mode: process.env.NODE_ENV || "development",
    entry: "./src/main/preload.ts",
    target: "electron-preload",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "preload.js",
    },
    resolve: {
      extensions: [".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
  },
  // Renderer process configuration
  {
    mode: process.env.NODE_ENV || "development",
    entry: "./src/renderer/index.tsx",
    target: "electron-renderer",
    output: {
      path: path.resolve(__dirname, "dist/renderer"),
      filename: "index.js",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/renderer/index.html"),
      }),
    ],
  },
];
