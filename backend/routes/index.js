function registerRoutes(server) {
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'static',
                index: ['index.html']
            }
        }
    });
}

module.exports = {
    registerRoutes: registerRoutes
};
