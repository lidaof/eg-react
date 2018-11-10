var paths = require('react-scripts-ts/config/paths')

module.exports = (config, env) => {
    // This should help with typescript source-maps
    config.devtool = 'source-map';

    if (!config.module) {
        config.module = {};
    }
    if (!config.module.rules) {
        config.module.rules = [];
    }

    config.module.rules.push({
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
            babelrc: false,
            presets: [require.resolve('babel-preset-react-app')],
            cacheDirectory: true,
        },
        test: /\.(js|jsx)$/,
    });

    config.module.rules.push({
        test: /\.worker\.js/,
        use: {
            loader: 'worker-loader',
            // options: { inline: true }
        },       
    });
    return config;
}
