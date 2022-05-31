import {resolve} from 'path';
import {writeFileSync} from 'fs';

import fetch from 'node-fetch';

(async () => {
    const value = await fetch('https://dashboard.twitch.tv');

    if (value.ok) {
        const text = await value.text()

        const o = text.match(/https:\/\/static\.twitchcdn\.net\/config\/settings\.(?<js>[a-zA-Z0-9]{32})\.js/g)

        if (o && o.length > 0) {
            const nextFetch = await fetch(o[0]);

            if (nextFetch.ok) {
                console.log('Downloading new twitch data: ', o[0])

                writeFileSync(resolve('docs', 'settings.js'), await nextFetch.text(), {encoding: 'utf8'})
            }
        }
    }
})();
