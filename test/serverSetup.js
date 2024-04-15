const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3333;
const dir = './test/test-app';

async function serverSetup () {
    const app = next({
        dev,
        hostname,
        port,
        dir,
    });

    await app.prepare();
    const handle = app.getRequestHandler();

    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url || '', true);
            await handle(req, res, parsedUrl);
            // app.render(req, res, path, query)
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    })
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Next.js server ready on http://${hostname}:${port} (from ${dir})`);
        });

    /**
     * @param {string} path (starts with slash)
     * @param {RequestInit | undefined} init
     */
    function serverFetch (path, init) {
        return fetch(`http://${hostname}:${port}${path}`, init);
    }
    
    server['fetch'] = serverFetch;
    global.nextServer = server;
}

module.exports = serverSetup;
