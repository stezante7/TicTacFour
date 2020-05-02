const CompressionWebpackPlugin = require("compression-webpack-plugin");

module.exports = env => ({
    entry: "./src/index.ts",
    plugins: [new CompressionWebpackPlugin()]
});