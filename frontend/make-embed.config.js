const { InjectManifest } = require("workbox-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
process.traceDeprecation = true;

module.exports = {
    webpack: function (config, env) {
        // your normal config-overrides.js overrides
        config.optimization.splitChunks = {
            cacheGroups: {
                default: false,
            },
        };
        config.optimization.runtimeChunk = false;
        // This should help with typescript source-maps
        config.devtool = "source-map";

        if (!config.module) {
            config.module = {};
        }
        if (!config.module.rules) {
            config.module.rules = [];
        }

        // config.module.rules.push({
        //     test: /\.(s*)css$/,
        //     use: [
        //         MiniCssExtractPlugin.loader,
        //         { loader: "css-loader", options: { sourceMap: false } },
        //         { loader: "sass-loader", options: { sourceMap: false } },
        //     ],
        // });

        config.module.rules.push({
            loader: require.resolve("babel-loader"),
            exclude: /node_modules/,
            query: {
                presets: ["@babel/preset-typescript", "@babel/preset-env", "@babel/preset-react"],
                plugins: ["@babel/proposal-class-properties", "@babel/proposal-object-rest-spread"],
            },
            test: /\.(js|jsx)$/,
        });

        config.module.rules.push({
            test: /\.worker\.js/,
            use: {
                loader: "worker-loader",
                options: { inline: true },
            },
        });

        config.output = {
            ...config.output,
            globalObject: "this",
            filename: "epgg.js",
            chunkFilename: "epgg.chunk.js",
        };

        // Renames main.b100e6da.css to main.css
        config.plugins[5].options.filename = "epgg.css";
        config.plugins[5].options.moduleFilename = () => "epgg.css";

        config.plugins = config.plugins.map((plugin) => {
            if (plugin.constructor.name === "GenerateSW") {
                return new InjectManifest({
                    swSrc: path.join(__dirname, "src", "sw.js"),
                    swDest: "service-worker.js",
                });
            }

            return plugin;
        });
        return config;
    },
    // The paths config to use when compiling your react app
    //  for development or production.
    paths: function (paths, env) {
        // ...add your paths config
        paths.appBuild = path.resolve(__dirname, "dist");
        return paths;
    },
};
