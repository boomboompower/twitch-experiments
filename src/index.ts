import {resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

import fetch from 'node-fetch';
import {js, JSBeautifyOptions} from 'js-beautify';

// Stored beautifier options
const beautifierOptions: JSBeautifyOptions = {
    indent_size: 2,
    space_in_empty_paren: true,
    end_with_newline: true,
    break_chained_methods: true
};

type StoredExperiment = {
    id: string,                 // The ID of the experiment.
    name: string,               // The display name of the experiment
    staffOverride?: string,     // If there is a staff override stored in twilight it will be stored here too.
    dateFound?: string          // Called dateFound as it's just the ISO time when this was found in the experiments tab. Not necessarily the exact time it was added
}

// Stored regexes - (spade is a URL which gets updated daily but is useless to us).
const spadeRegex = /https:\/\/video-edge-[a-z0-9]{6}\.pdx01\.abs\.hls\.ttvnw\.net\/v1\/segment\/[A-Za-z0-9_-]+\.ts/g;
// A regex to extract the pattern of the experiments in the main sunlight bundle.
const experimentRegex = / +(var [a-z] = \(\([a-z] = {}\)|[a-z])(\n +)?(\.|\[")(?<experiment>[0-9a-zA-Z_\-.]+)("])? = {\n +id: "(?<id>[0-9A-Za-z-_]+)",\n +default: "[0-9A-Za-z-_ ]+",?(\n +staffOverride: "(?<staff>[0-9A-Za-z-_ ]+)")?\n +}/gm;

// If a webhook url is provided, new experiments will be sent here.
const postNewExperiments = process.env.WEBHOOK_URL !== undefined;

function readOldExperiments() : Array<StoredExperiment> {
    try {
        let oldJSON = readFileSync(resolve('docs', 'production.js'), {encoding: 'utf8'})

        // we want to parse it as JSON to avoid using eval.
        oldJSON = oldJSON.substring('const productionExperiments = '.length);

        return JSON.parse(oldJSON)
    } catch (e) {
        console.error('Failed to read old production data. ', e)

        return [];
    }
}

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
        const previousContent = readOldExperiments();
        const nextFetch = await fetch(twilightProd[0]);

        if (nextFetch.ok) {
            console.log('Downloading new twitch sunlight data', twilightProd[0]);

            const obj = js(await nextFetch.text());
            const matches = obj.matchAll(experimentRegex);

            let current = matches.next();
            const productionExperiments: Array<StoredExperiment> = [];

            while (!current.done) {
                const oldExperiment: StoredExperiment | undefined = previousContent.find((a) => {
                    return a.id === current.value?.groups.id
                })

                const storedExperiment: StoredExperiment = {
                    id: current.value?.groups?.id,
                    name: current.value?.groups?.experiment,
                    staffOverride: current.value?.groups?.staff,
                    dateFound: (oldExperiment === undefined || oldExperiment.dateFound === undefined ? new Date().toISOString() : oldExperiment.dateFound)
                }

                // Add new experiment object
                productionExperiments.push(storedExperiment);

                // If it's a new experiment it will not exist in the old storage.
                if (oldExperiment === undefined) {
                    postExperiment(storedExperiment)
                }

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

    // Just for my own debugging. Feel free to remove.
    function postExperiment(experiment: StoredExperiment) {
        console.log(`New experiment found: ${experiment.id}`)

        // Only post if WEBHOOK_URL exists on the environment variables.
        if (!postNewExperiments) return;

        fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'embeds': [
                {'title': `New Experiment - ${experiment.name}`, 'color': 65450, 'description': `A new experiment \`${experiment.name}\` has been added`,
                    'fields': [{'name': 'ID', 'value': experiment.id, 'inline': true}, {'name': 'Link', 'value': '[Goto](https://github.com/boomboompower/twitch-experiments/commits/main)', 'inline': true}]
                }]
            })
        }).catch((e: Error) => {
            console.error('An error occurred whilst posting to WEBHOOK_URL ', e.message)
        });
    }
})();
