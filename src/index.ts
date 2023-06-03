import {resolve} from 'path';
import {writeFileSync, readFileSync, existsSync} from 'fs';

import {default as fetchLegacy, RequestInit, Response} from 'node-fetch';
import {js, JSBeautifyOptions} from 'js-beautify';

// Stored beautifier options
const beautifierOptions: JSBeautifyOptions = {
    indent_size: 2,
    space_in_empty_paren: true,
    end_with_newline: true,
    break_chained_methods: true
};

// Stored regexes - (spade is a URL which gets updated daily but is useless to us).
const spadeRegex = /https:\/\/video-edge-[a-z0-9]{6}\.pdx01\.abs\.hls\.ttvnw\.net\/v1\/segment\/[A-Za-z0-9_-]+\.ts/g;
// A regex to extract the pattern of the experiments in the main sunlight bundle.
const experimentRegex = / +(var [a-z] = \(\([a-z] = {}\)|[a-z])(\n +)?(\.|\[")(?<experiment>[0-9a-zA-Z_\-.]+)("])? = {\n +id: "(?<id>[0-9A-Za-z-_]+)",\n +default: "[0-9A-Za-z-_ ]+",?(\n +staffOverride: "(?<staff>[0-9A-Za-z-_ ]+)")?\n +}/gm;

// If a webhook url is provided, new experiments will be sent here.
const postNewExperiments = process.env.WEBHOOK_URL !== undefined;

// Override fetch to log when a request is being made.
async function fetch(url: string, info?: RequestInit) : Promise<Response> {
    const isSecret = url === process.env.WEBHOOK_URL;

    if (isSecret) {
        return fetchLegacy(url, info);
    }

    // Print out fetch
    process.stdout.write(`Fetching ${url}`)

    const resp = await fetchLegacy(url, info)

    // Print out response code.
    process.stdout.write(` - ${resp.status}: ${resp.statusText}\n`)

    return resp;
}

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

// Just for my own debugging. Feel free to remove.
function postExperiment(experiment: StoredExperiment) {
    console.log(`New experiment found: ${experiment.id} - ${experiment.name}`)

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

/**
 * Fetches the latest settings.json file from twitch.
 */
async function checkLatestSettings() {
    const settingsFetch = await fetch(`https://static.twitchcdn.net/config/settings.js?cachebust=${Math.floor(Math.random() * 100) + 40}`);

    if (settingsFetch.ok) {
        const obj = await settingsFetch.text();

        let configBeatified = js(obj, beautifierOptions);
        configBeatified = configBeatified.replace(spadeRegex, 'https://boomboompower.github.io/twitch-experiments')

        writeFileSync(resolve('docs', 'settings.js'), configBeatified, {encoding: 'utf8'})

        return true;
    } else {
        console.log('Unable to fetch config file.');

        return false;
    }
}

/**
 * Fetches the latest main sunlight file from twitch. Based on the most recent build info.
 *
 * @param buildInfo the latest build info.
 */
async function checkLatestExperiments(buildInfo: BuildInfo) {
    const twilightProd = buildInfo.releases[0].files.find((file: string) => {
        return file.startsWith('assets/core-') && file.endsWith('.js')
    })

    if (!twilightProd) {
        console.error('No updates found for experiments.');

        return false;
    }

    const previousContent = readOldExperiments();
    const nextFetch = await fetch(`https://static.twitchcdn.net/${twilightProd}`);

    if (!nextFetch.ok) {
        return false;
    }

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
    writeFileSync(resolve('docs', 'production.js'), construction, {encoding: 'utf8'});

    return true;
}

/**
 * Runs the checker. Checks if an update has been found. If not halts.
 */
(async () => {
    const latestBuild = await fetch('https://static.twitchcdn.net/config/manifest.json?v=1').then(async (o) => {
        return await o.json();
    });

    if (!latestBuild || !latestBuild.channels || latestBuild.channels.length === 0) {
        console.error('No latest twilight data found.')

        return;
    }

    const buildInfo: BuildInfo = latestBuild.channels[0] as BuildInfo;
    const newestBuild = `${buildInfo.releases[0].buildId}`;

    if (existsSync('docs/version.txt')) {
        const lastBuild = readFileSync('docs/version.txt', {encoding: 'utf8'}).trim();

        if (newestBuild === lastBuild) {
            console.log('no new build')

            return;
        }
    }

    console.info(`New build detected ${newestBuild}`)

    writeFileSync('docs/version.txt', newestBuild, {encoding: 'utf8'})
    writeFileSync('docs/time.txt', new Date(buildInfo.releases[0].created).toLocaleString('en-GB', {year: 'numeric', month: 'long', day: 'numeric'}), {encoding: 'utf8'})

    if (!await checkLatestSettings()) {
        return;
    }

    if (!await checkLatestExperiments(buildInfo)) {
        return;
    }

    console.log('Successfully handled new build!')
})();
