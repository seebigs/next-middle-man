
describe('next-middle-man', () => {

    describe('handles Api routes', () => {

        it('handles a pass through with no matches', async () => {
            const response = await global.nextServer.fetch('/api/passthru');
            const json = await response.json();
            expect(json).toEqual({ response: '/api/passthru' });
        });

        it('handles a simple json response', async () => {
            const response = await global.nextServer.fetch('/api/simple/content');
            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json).toEqual({ response: 'auth /api/simple/content' });
        });

        it('handles a simple redirect response', async () => {
            const response = await global.nextServer.fetch('/api/simple/redirect');
            const json = await response.json();
            expect(json).toEqual({ response: 'auth /api/simple/content' });
        });

        it('handles a complex chain of middlewares', async () => {
            const response = await global.nextServer.fetch('/api/complex/12345/endpoint/?utm=campaign', {
                headers: {
                    cookie: 'token=98765; ref=google;',
                },
            });

            // const heads = [];
            // for (const pair of response.headers.entries()) {
            //     heads.push(pair);
            // }
            // console.log(heads);

            expect(response.headers.get('x-demo-mw1')).toBe('endpoint');
            expect(response.headers.get('x-demo-mw2')).toBe('async:418:0002');
            expect(response.headers.get('x-demo-mw3')).toBe('ok: node');

            expect(response.headers.get('set-cookie')).toBe('c-demo-mw1=MW1; Path=/, c-demo-mw2=MW2; Path=/foo');

            const json = await response.json();
            expect(json).toEqual({
                pathname: '/api/complex/12345/endpoint',
                async: 'async:418',
            });
        }, 7000);

    });

    describe('handles Page routes', () => {

        it('handles a pass through with no matches', async () => {
            const response = await global.nextServer.fetch('/blog/passthru');
            const text = await response.text();
            expect(text).toContain('<h1>PASSTHRU</h1>');
        });

        it('handles a simple redirect response', async () => {
            const response = await global.nextServer.fetch('/blog/simple/redirect');
            const text = await response.text();
            expect(text).toContain('<h1>SIMPLE CONTENT HERE</h1>');
        });

        it('handles a complex chain of middlewares', async () => {
            const response = await global.nextServer.fetch('/blog/complex/12345/article/?utm=campaign', {
                headers: {
                    cookie: 'token=98765; ref=campaign;',
                },
            });

            expect(response.headers.get('x-demo-mw1')).toBe('article');
            expect(response.headers.get('x-demo-mw2')).toBe('async:418:0002');
            expect(response.headers.get('x-demo-mw3')).toBe('ok: node');

            expect(response.headers.get('set-cookie')).toBe('c-demo-mw1=MW1; Path=/, c-demo-mw2=MW2; Path=/foo');

            const text = await response.text();
            expect(text).toContain('<h1>ARTICLE CONTENT HERE</h1>');
        }, 7000);

    });

});
