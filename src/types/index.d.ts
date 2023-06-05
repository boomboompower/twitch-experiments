type StoredExperiment = {
    id: string,                 // The ID of the experiment.
    name: string,               // The display name of the experiment
    staffOverride?: string,     // If there is a staff override stored in twilight it will be stored here too.
    dateFound?: string          // Called dateFound as it's just the ISO time when this was found in the experiments tab. Not necessarily the exact time it was added
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
