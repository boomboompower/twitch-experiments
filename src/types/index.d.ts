type StoredExperiment = {
    id: string,                 // The ID of the experiment.
    name: string,               // The display name of the experiment
    staffOverride?: string,     // If there is a staff override stored in twilight it will be stored here too.
    dateFound?: string          // Called dateFound as it's just the ISO time when this was found in the experiments tab. Not necessarily the exact time it was added
}

type ReleaseInfo = {
    buildId: string,            // The random ID of this build
    created: number,
    files: Array<string>,
    stage: 'live'
}

type BuildInfo = {
    id: string,
    created: number,
    updated: number,
    primary: boolean,
    active: boolean,
    releases: ReleaseInfo[]     // update_chunks
}
