import {resolve} from 'path';
import {writeFileSync} from 'fs';

import fetch from 'node-fetch';
import {js, JSBeautifyOptions} from 'js-beautify';

const beautifierOptions: JSBeautifyOptions = {
    indent_size: 2,
    space_in_empty_paren: true,
    end_with_newline: true,
    break_chained_methods: true
};

(async () => {
    const value = await fetch('https://dashboard.twitch.tv');

    if (value.ok) {
        const text = await value.text()

        const o = text.match(/https:\/\/static\.twitchcdn\.net\/config\/settings\.(?<js>[a-zA-Z0-9]{32})\.js/g)

        if (o && o.length > 0) {
            const nextFetch = await fetch(o[0]);

            if (nextFetch.ok) {
                console.log('Downloading new twitch data: ', o[0])

                const obj = await nextFetch.text();

                writeFileSync(resolve('docs', 'settings.js'), js(obj, beautifierOptions), {encoding: 'utf8'})
            } else {
                process.exit(-1);
            }
        }
    } else {
        process.exit(-1);
    }
})();
