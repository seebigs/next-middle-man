
async function serverTeardown () {
    global.nextServer.close();
    process.exit(0);
}

module.exports = serverTeardown;
