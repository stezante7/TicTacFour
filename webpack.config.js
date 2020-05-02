const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpackMerge = require("webpack-merge");
const modeConfig = (env) => require(`./config/webpack.${env}`)(env);

module.exports = ({ mode, presets } = { mode: "production", presets: [] }) => {
    return webpackMerge({
            mode,
            devtool: "source-map",
            module: {
                rules: [{
                        test: /\.js$/,
                        use: ["source-map-loader"],
                        enforce: "pre",
                    },
                    {
                        test: /\.tsx?$/,
                        use: "ts-loader",
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.(png|jpg|bmp)$/,
                        use: [{
                            loader: "file-loader",
                            options: {
                                emitFile: true,
                            },
                        }, ],
                    },
                ],
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
            },
            output: {
                filename: "[name].js",
                sourceMapFilename: "[file].map",
                path: path.resolve(__dirname, "dist"),
            },
            optimization: {
                splitChunks: {
                    chunks: "all",
                },
            },
            plugins: [
                new CleanWebpackPlugin({}),
                new HtmlWebPackPlugin({
                    title: "Tic Tac Four",
                    template: "src/index.html",
                }),
                new CopyWebpackPlugin([{
                    from: "src/assets",
                    to: "assets",
                }, ]),
            ],
        },
        modeConfig(mode)
    );
};