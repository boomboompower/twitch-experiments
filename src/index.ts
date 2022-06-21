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

        const twilightProd = text.match(/https:\/\/static\.twitchcdn\.net\/assets\/sunlight-main-(?<js>[a-zA-Z0-9]{20})\.js/g)

        if (twilightProd && twilightProd.length > 0) {
            const nextFetch = await fetch(twilightProd[0]);

            if (nextFetch.ok) {
                console.log('Downloading new twitch sunlight data', twilightProd[0]);

                const obj = js(await nextFetch.text());
                const matches = obj.matchAll(/ +(var [a-z] = \(\([a-z] = {}\)|[a-z])(\n +)?(\.|\[")[0-9a-zA-Z_\-.]+("])? = {\n +id: "(?<id>[0-9A-Za-z-_]+)",\n +default: "[0-9A-Za-z-_ ]+",?(\n +staffOverride: "(?<staff>[0-9A-Za-z-_ ]+)")?\n +}/gm);

                let current = matches.next();
                let productionExperiments = [];

                while (!current.done) {
                    productionExperiments.push(
                        {
                            id: current.value.groups.id,
                            staffOverride: current.value.groups.staff
                        }
                    );

                    current = matches.next();
                }

                writeFileSync(resolve('docs', 'production.js'), `const productionExperiments = ${JSON.stringify(productionExperiments, null, 4)}`, {encoding: "utf8"})
            } else {
                console.error('No updating done for experiments.');
            }
        }
    } else {
        process.exit(-1);
    }
})();
