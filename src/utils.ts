import {default as fetchLegacy, RequestInit, Response} from 'node-fetch';

export function formatTime(value: string | number, showTime = false) {
    let opts: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long', day: 'numeric'};

    // show hours, minutes, seconds
    if (showTime) {
        opts = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,

            ...opts
        }
    }

    return value === undefined ? 'undefined' : new Date(value).toLocaleString('en-GB', opts)
}

// Override fetch to log when a request is being made.
export async function fetch(url: string, info?: RequestInit) : Promise<Response> {
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

// Just for my own debugging. Feel free to remove.
export function postExperiment(experiment: StoredExperiment) {
    console.log(`New experiment found: ${experiment.id} - ${experiment.name}`)

    // Only post if WEBHOOK_URL exists on the environment variables.
    // If a webhook url is provided, new experiments will be sent here.
    if (!process.env.WEBHOOK_URL !== undefined) return;

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
