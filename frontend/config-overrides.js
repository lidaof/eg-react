module.exports = (config, env) => {
    if (!config.module) {
        config.module = {};
    }
    if (!config.module.rules) {
        config.module.rules = [];
    }

    config.module.rules.push({
        test: /\.worker\.js/,
        use: { loader: 'worker-loader' }
    })
    return config;
}
