import {resolve} from 'path';
import {writeFileSync} from 'fs';

import fetch from 'node-fetch';
import {js, JSBeautifyOptions} from 'js-beautify';

// Stored exp options
const beautifierOptions: JSBeautifyOptions = {
    indent_size: 2,
    space_in_empty_paren: true,
    end_with_newline: true,
    break_chained_methods: true
};

// Stored regexes - (spade is updated daily but is useless).
const spadeRegex = /https:\/\/video-edge-[a-z0-9]{6}\.pdx01\.abs\.hls\.ttvnw\.net\/v1\/segment\/[A-Za-z0-9_-]+\.ts/g;
const experimentRegex = / +(var [a-z] = \(\([a-z] = {}\)|[a-z])(\n +)?(\.|\[")(?<experiment>[0-9a-zA-Z_\-.]+)("])? = {\n +id: "(?<id>[0-9A-Za-z-_]+)",\n +default: "[0-9A-Za-z-_ ]+",?(\n +staffOverride: "(?<staff>[0-9A-Za-z-_ ]+)")?\n +}/gm;

(async () => {
    // Use the dashboard for scraping
    const value = await fetch('https://dashboard.twitch.tv');

    // Check if we can access the website
    if (!value.ok) {
        console.log('Unable to fetch dashboard.');

        process.exit(-1);
    }

    const text = await value.text()

    const configMatch = text.match(/https:\/\/static\.twitchcdn\.net\/config\/settings\.(?<js>[a-zA-Z0-9]{32})\.js/g)

    if (configMatch && configMatch.length > 0) {
        const nextFetch = await fetch(configMatch[0]);

        if (nextFetch.ok) {
            console.log('Downloading new twitch data: ', configMatch[0])

            const obj = await nextFetch.text();

            let configBeatified = js(obj, beautifierOptions);
            configBeatified = configBeatified.replace(spadeRegex, 'https://boomboompower.github.io/twitch-experiments')

            writeFileSync(resolve('docs', 'settings.js'), configBeatified, {encoding: 'utf8'})
        } else {
            console.log('Unable to fetch config file.');

            process.exit(-1);
        }
    }

    const twilightProd = text.match(/https:\/\/static\.twitchcdn\.net\/assets\/sunlight-main-(?<js>[a-zA-Z0-9]{20})\.js/g)

    if (twilightProd && twilightProd.length > 0) {
        const nextFetch = await fetch(twilightProd[0]);

        if (nextFetch.ok) {
            console.log('Downloading new twitch sunlight data', twilightProd[0]);

            const obj = js(await nextFetch.text());
            const matches = obj.matchAll(experimentRegex);

            let current = matches.next();
            const productionExperiments = [];

            while (!current.done) {
                // Add new experiment object
                productionExperiments.push(
                    {
                        id: current.value?.groups?.id,
                        name: current.value?.groups?.experiment,
                        staffOverride: current.value?.groups?.staff
                    }
                );

                current = matches.next();
            }

            // Create the cached string
            const construction = `const productionExperiments = ${JSON.stringify(productionExperiments, null, 4)}`;

            // Write to the cache
            writeFileSync(resolve('docs', 'production.js'), construction, {encoding: 'utf8'})
        } else {
            console.error('No updates found for experiments.');
        }
    }
})();
