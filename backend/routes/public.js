const path = require('path');

const PUBLIC_FOLDER_NAME = 'browser';

function registerRoutes(server) {
    server.route({
        method: 'GET',
        path: `/${PUBLIC_FOLDER_NAME}/{any*}`,
        handler: {
            directory: {
                path: PUBLIC_FOLDER_NAME,
                listing: true
            }
        }
    });
    server.route({
        method: 'GET',
        path: `/js/{any*}`,
        handler: {
            directory: {
                path: `${PUBLIC_FOLDER_NAME}/js`,
                listing: true
            }
        }
    });
}

module.exports = {
    registerRoutes: registerRoutes
};
