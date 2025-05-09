import { writeFileSync, readFileSync, existsSync } from 'fs';
import {formatDate} from './utils/formatDate';

const LATEST_BUILD_VERSION = '../src/data/version.txt';
const LATEST_BUILD_COMMENT = '../src/data/version_comment.txt';
const EXPERIMENTS_DATA = '../src/data/experiments.json';

type LatestBuild = {
    channels: BuildInfo[]
}

type ReleaseInfo = {
    buildId: string,            // The random ID of this build
    created: number,            // The UNIX time for when twilight was created
    files: Array<string>,       // A list of entry files for the site.
    stage: 'live'               // The stage - 'live', 'staging', 'dev'
}

type BuildInfo = {
    id: string,                 // the identifier for this build
    created: number,            // the time this build was created
    updated: number,            // the time this build was updated
    primary: boolean,           // false - unknown value
    active: boolean,            // will always be true if latest release
    releases: ReleaseInfo[]     // update_chunks
}

type ExperimentData = {
    active: boolean
}

// If it's an env environment, load environment variables from .env file
if (process.env.NODE_ENV === 'development') {
    readFileSync('.env', {encoding: 'utf8'}).split('\n').forEach((line) => {
        // Ignore empty lines and comments
        if (line.trim() === '' || line.startsWith('#') || !line.includes('=')) {
            return;
        }

        const [key, value] = line.split('=');
        process.env[key] = value;
    } );
}

(async () => {
    // Check if environment variable are set for downloading the data
    const prodExpURL = process.env.EXPERIMENTS_URL;

    if (!prodExpURL) {
        console.error('Cannot determine experiment source, EXPERIMENTS_URL are not set!');

        return;
    }

    const latestBuild: LatestBuild = await fetch('https://static.twitchcdn.net/config/manifest.json?v=1').then(async (o) => {
        return await o.json();
    });

    if (!latestBuild || !latestBuild.channels || latestBuild.channels.length === 0) {
        console.error('Latest twilight data not found!!!')

        return;
    }

    const buildInfo: BuildInfo = latestBuild.channels.find((channel) => { return channel.primary; });
    const updatedAt = `Updated: ${formatDate(String(buildInfo.updated))}`;
    const newestBuild = `${buildInfo.releases[0].buildId}\n${updatedAt}`;

    if (existsSync(LATEST_BUILD_VERSION)) {
        const lastBuild = readFileSync(LATEST_BUILD_VERSION, {encoding: 'utf8'}).trim();

        if (newestBuild === lastBuild) {
            console.log('No new build found - Build version remains unchanged.')

            return;
        }
    }

    const previousData = readFileSync(LATEST_BUILD_COMMENT, {encoding: 'utf8'}).trim();
    const parsedPreviousData = JSON.parse(previousData) as ExperimentData[];
    const buildComments: string[] = [];

    console.info(`New build detected ${newestBuild}`)

    writeFileSync(LATEST_BUILD_VERSION, newestBuild, {encoding: 'utf8'})

    // Download the new data from an environment variable
    const experiments: ExperimentData[] = await fetch(prodExpURL).then(async (o) => {
        return await o.json();
    });

    // Observe the data against the previous data, make some comments
    if (experiments.length !== parsedPreviousData.length) {
        console.warn('The number of experiments has changed!');

        // Check if the number of experiments is the same
        if (experiments.length > parsedPreviousData.length) {
            buildComments.push(`There are ${experiments.length - parsedPreviousData.length} new experiments!`);
        } else {
            buildComments.push(`There are ${parsedPreviousData.length - experiments.length} experiments removed!`);
        }
    }

    // Check for active experiments between the two builds
    const activeExperiments = experiments.filter((experiment) => {
        return experiment.active;
    });
    const previousActiveExperiments = parsedPreviousData.filter((experiment) => {
        return experiment.active;
    });

    if (activeExperiments.length !== previousActiveExperiments.length) {
        console.warn('The number of active experiments has changed!');

        // Check if the number of active experiments is the same
        if (activeExperiments.length > previousActiveExperiments.length) {
            buildComments.push(`There are ${activeExperiments.length - previousActiveExperiments.length} new active experiments!`);
        } else {
            buildComments.push(`There are ${previousActiveExperiments.length - activeExperiments.length} active experiments removed!`);
        }
    }

    writeFileSync(EXPERIMENTS_DATA, JSON.stringify(experiments, null, 2), {encoding: 'utf8'});
    writeFileSync(LATEST_BUILD_COMMENT, buildComments.join('\n'), {encoding: 'utf8'});

    console.log('Successfully handled new build!')
})();
