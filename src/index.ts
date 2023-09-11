import {resolve} from 'path';
import {writeFileSync, readFileSync, existsSync} from 'fs';

import {js, JSBeautifyOptions} from 'js-beautify';
import {fetch, formatTime, postExperiment} from './utils';

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


/**
 * Runs the checker. Checks if an update has been found. If not halts.
 */
(async () => {
    const latestBuild = await fetch('https://static.twitchcdn.net/config/manifest.json?v=1').then(async (o) => {
        return await o.json();
    });

    if (!latestBuild || !latestBuild.channels || latestBuild.channels.length === 0) {
        console.error('Latest twilight data not found!!!')

        return;
    }

    // Use the primary build info
    const buildInfo: BuildInfo = latestBuild.channels.find(channel => return channel.primary) as BuildInfo;
    const updatedAt = `Updated: ${formatTime(buildInfo.updated, true)}`;
    const newestBuild = `${buildInfo.releases[0].buildId}\n${updatedAt}`;

    if (existsSync('docs/version.txt')) {
        const lastBuild = readFileSync('docs/version.txt', {encoding: 'utf8'}).trim();

        if (newestBuild === lastBuild) {
            console.log('No new build found - Build number & update time matched.')

            return;
        }
    }

    const formattedDate = formatTime(buildInfo.releases[0].created);

    console.info(`New build detected ${newestBuild}`)

    writeFileSync('docs/version.txt', newestBuild, {encoding: 'utf8'})
    writeFileSync('docs/time.txt', `${formattedDate}`, {encoding: 'utf8'})

    if (!await checkLatestSettings()) {
        return;
    }

    if (!await checkLatestExperiments(buildInfo)) {
        return;
    }

    console.log('Successfully handled new build!')
})();


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
    const buildFiles = buildInfo.releases[0].files;

    if (buildFiles === null) {
        console.error('No build files found for the selected release.');
        
        return false;
    }
    
    const twilightProd = buildFiles.find((file: string) => {
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

        // construct an experiment object
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
