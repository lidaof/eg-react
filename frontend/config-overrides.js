const { InjectManifest } = require("workbox-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
process.traceDeprecation = true;
module.exports = (config, env) => {
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
        options: {
            presets: ["@babel/preset-typescript", "@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/proposal-class-properties", "@babel/proposal-object-rest-spread"],
        },
        test: /\.(js|jsx)$/,
    });

    config.module.rules.push({
        test: /\.worker\.js/,
        use: {
            loader: "worker-loader",
            // options: { inline: true }
        },
    });

    config.output = {
        ...config.output,
        globalObject: "this",
    };

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
};
