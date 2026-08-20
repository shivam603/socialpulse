const { app, initialize } = require('../server');

let ready;

module.exports = async (req, res) => {
    ready ||= initialize();
    await ready;
    return app(req, res);
};
