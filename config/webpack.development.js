module.exports = env => ({
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist"
    }
});