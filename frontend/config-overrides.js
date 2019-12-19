const { InjectManifest } = require("workbox-webpack-plugin");
const path = require("path");

module.exports = (config, env) => {
  // This should help with typescript source-maps
  config.devtool = "source-map";

  if (!config.module) {
    config.module = {};
  }
  if (!config.module.rules) {
    config.module.rules = [];
  }

  config.module.rules.push({
    loader: require.resolve("babel-loader"),
    exclude: /node_modules/,
    query: {
      presets: [
        "@babel/preset-typescript",
        "@babel/preset-env",
        "@babel/preset-react"
      ],
      plugins: [
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread"
      ]
    },
    test: /\.(js|jsx)$/
  });

  config.module.rules.push({
    test: /\.worker\.js/,
    use: {
      loader: "worker-loader"
      // options: { inline: true }
    }
  });

  config.output = {
    ...config.output,
    globalObject: "this"
  };

  if (env === "production") {
    const workboxConfigProd = {
      swSrc: path.join(__dirname, "public", "custom-service-worker.js"),
      swDest: "custom-service-worker.js"
      //   importWorkboxFrom: "disabled"
    };
    config = removeSWPrecachePlugin(config);
    config.plugins.push(new InjectManifest(workboxConfigProd));
  }

  return config;
};

function removeSWPrecachePlugin(config) {
  const swPrecachePluginIndex = config.plugins.findIndex(element => {
    return element.constructor.name === "SWPrecacheWebpackPlugin";
  });
  if (swPrecachePluginIndex !== -1) {
    config.plugins.splice(swPrecachePluginIndex, 1);
  }
  return config;
}
