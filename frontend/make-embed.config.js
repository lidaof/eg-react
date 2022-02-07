const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "src", "index.tsx"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "epgg.js",
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js|tsx|ts)$/,
                include: path.resolve(__dirname, "src"),
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-typescript", "@babel/preset-env", "@babel/preset-react"],
                        },
                    },
                ],
            },
            {
                test: /worker.js$/i,
                exclude: /node_modules/,
                use: ["worker-loader"],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"],
            },
            {
                loader: "eslint-loader",
                options: {
                    fix: true,
                },
            },
        ],
    },
};
