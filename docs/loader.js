try {
    const overridesElement = document.getElementById('overrides');
    const copyButton = document.getElementById('copy');
    const calculationDiv = document.getElementById('calculation');
    const filterDiv = document.getElementById('filter');
    const importButton = document.getElementById('import');

    const overriddenExperiments = {};
    let calculationDone = false;
    let currentCookie = '';

    function resetCookie() {
        // basic template for how the experiment override cookie is formed.
        const temporaryObject = {
            experiments: {},
            disabled: []
        }

        // iterate through all experiments and add them to our temporary object
        for (const exp of Object.keys(overriddenExperiments)) {
            temporaryObject.experiments[exp] = overriddenExperiments[exp];
        }

        // similar format to how regular experiments are stored in the cookie
        currentCookie = JSON.stringify(temporaryObject)
            .replaceAll(/ /g, '%20')
            .replaceAll(/["]/g, '%22')
            .replaceAll(/[,]/g, '%2C');
    }

    // A bit of a hack to override cookies from an existing state.
    function importCookie() {
        let current = prompt('Enter your current experiment cookie')

        // do nothing for empty strings
        if (!current || current.trim().length === 0) return

        try {
            current = decodeURIComponent(current)
        } catch (e) {
            alert('Unable to parse cookie. Could not decode.')

            return
        }

        try {
            const parsedCookie = JSON.parse(current);

            // missing critical component of cookie :(
            // they might have used the wrong cookie value
            if (!parsedCookie.experiments) {
                alert('Cookie was missing the experiments object.')

                return
            }

            const oldText = importButton.innerText;
            const overrides = Object.entries(parsedCookie.experiments);

            // add each override to our override list
            for (const entry of overrides) {
                overriddenExperiments[entry[0]] = entry[1]
            }

            importButton.innerText = 'Cookie Imported';

            setTimeout(() => {
                importButton.innerText = oldText;
            }, 1200)

            // draw the new screen
            drawExperiments(filterDiv.selectedIndex)
            resetCookie()
        } catch (e) {
            alert('Unable to parse cookie. Invalid JSON.')
        }
    }

    function copyCookie() {
        const oldText = copyButton.innerText;

        copyButton.innerText = 'Copied!';

        navigator.clipboard.writeText(currentCookie).then(() => {
        }, () => {
            if (calculationDiv) {
                calculationDiv.style.fontFamily = 'monospace';
                calculationDiv.style.padding = '10px 20px';
                calculationDiv.style.borderRadius = '4px';
                calculationDiv.style.background = 'rgba(204,204,204,0.19)';
                calculationDiv.innerText = currentCookie;
            }
        });

        setTimeout(() => {
            copyButton.innerText = oldText;
        }, 1200)
    }

    function getExperimentObject(experiment, experimentKey, experimentName = undefined, index = -1, staffOverride = undefined, foundOn = undefined) {
        const wrap = document.createElement('div');
        const nameDiv = document.createElement('div');
        const opts = document.createElement('form')

        if (index > 0) {
            const indexDiv = document.createElement('div');
            const actualName = document.createElement('span');

            nameDiv.style.padding = '0';

            indexDiv.style.userSelect = 'none';
            indexDiv.style.display = 'inline-block';
            indexDiv.style.padding = '5px';
            indexDiv.style.fontSize = '0.8rem'
            indexDiv.style.borderRight = '1px solid hsla(0,0%,100%,0.1)'
            indexDiv.innerText = index.toString();

            actualName.style.padding = '5px';
            actualName.style.fontSize = '0.9rem'
            actualName.style.fontFamily = 'monospace';
            actualName.innerText = experimentName || experiment.name;

            nameDiv.appendChild(indexDiv);
            nameDiv.appendChild(actualName);
        } else {
            nameDiv.innerText = experimentName || experiment.name;
        }

        if (foundOn !== undefined) {
            let foundDate = undefined;

            try {
                const date = new Date(foundOn);

                // 2022-06-15T07:19:12.000Z
                // Magic number but this is when the first run occurred.
                if (date.getUTCDate() === 15 && date.getUTCMonth() === 5 && date.getUTCFullYear() === 2022) {
                    foundDate = undefined;
                } else {
                    foundDate = date.toLocaleDateString();
                }
            } catch (e) {
                console.error(`Failed to parse date for ${experimentName}`, e)
            }

            if (foundDate !== undefined) {
                const foundElement = document.createElement('div');
                foundElement.style.float = 'right';
                foundElement.style.padding = '5px';
                foundElement.style.fontSize = '0.8rem'
                foundElement.style.fontFamily = 'monospace';
                foundElement.style.display = 'inline-block';

                foundElement.innerText = `Found ${foundDate}` ;

                nameDiv.appendChild(foundElement);
            }
        } else {
            console.warn(`No found date for ${experimentKey}`)
        }

        let largestWeight = document.createElement('li');
        let largestWeightVal = 0;
        let lastSelected = undefined;
        const hasOverride = overriddenExperiments[experimentKey] !== undefined

        for (const group of experiment.groups) {
            const chunk = document.createElement('div');
            const radioObject = document.createElement('input')
            const label = document.createElement('label');

            radioObject.label = label;
            radioObject.setAttribute('type', 'radio');
            radioObject.setAttribute('name', experimentKey)
            radioObject.setAttribute('value', group.value);
            radioObject.setAttribute('id', `${experimentKey}-${group.value}`)

            label.innerText = `${group.value}: ${group.weight}`;
            label.setAttribute('for', `${experimentKey}-${group.value}`);

            if (staffOverride === group.value) {
                label.classList.add('staff');
            }

            // if the overriden experiments contains this object, we should use it instead.
            if (hasOverride && group.value === overriddenExperiments[experimentKey]) {
                radioObject.checked = true
                lastSelected = radioObject
            }
            // decide which experiment has the largest weight
            if (group.weight > largestWeightVal) {
                largestWeightVal = group.weight;
                largestWeight = radioObject;
            }

            radioObject.addEventListener('change', () => {
                if (lastSelected === radioObject) {
                    return;
                }

                lastSelected = radioObject;

                overriddenExperiments[experimentKey] = group.value;

                resetCookie();
            })

            chunk.appendChild(radioObject)
            chunk.appendChild(label)
            opts.appendChild(chunk)
        }

        if (!hasOverride) {
            lastSelected = largestWeight;
            largestWeight.checked = true;
        }
        largestWeight.label.classList.add('blip');

        wrap.appendChild(nameDiv)
        wrap.appendChild(opts)

        return wrap;
    }

    copyButton.addEventListener('click', () => {
        copyCookie();
    })

    if (importButton) {
        importButton.addEventListener('click', () => { importCookie() })
    }

    const keys = Object.keys(window.__twilightSettings.experiments);
    // Sort by experiment name

    keys.sort((a, b) => {
        return window.__twilightSettings.experiments[a].name.toString().localeCompare(window.__twilightSettings.experiments[b].name)
    });

    filterDiv.addEventListener('change', () => {
        drawExperiments(filterDiv.selectedIndex)
    })

    function isServingOneGroup(exp) {
        const groupsAt0 = exp.groups.filter((group) => {
            return group.weight === 0;
        });

        return groupsAt0.length >= exp.groups.length - 1;
    }

    function normalizeExperiments() {
        const unregistered = [];
        const servingOne = [];

        // experiment t = 1 is an experiment on a device ID     [Device]
        // experiment t = 2 is an experiment using a user ID    [User]
        // experiment t = 3 is an experiment using a channel    [Channel]
        //
        // experiment v is the experiment version.

        const defaults = Object.keys(window.__twilightSettings.experiments)
            .filter((key) => {
                const isRegistered = productionExperiments.find((a) => { return a.id === key });

                if (!isRegistered) {
                    unregistered.push(window.__twilightSettings.experiments[key]);
                }
                return isRegistered;
            })
            .map((key) => {
                const expData = window.__twilightSettings.experiments[key];
                const servingOneGroup = isServingOneGroup(expData);

                const exp = {
                    type: 'Experiment',
                    key,
                    name: `${expData.name} - ${key}`,
                    data: expData,
                    servingOneGroup,
                };

                if (servingOneGroup) {
                    servingOne.push(exp);
                }

                return exp;
            });

        return {
            unregistered,
            servingOne,
            defaults,
        };
    }

    function getInactiveExperiments(normalizedExperiments) {
        const inactiveExperiments = [];

        for (const unregistered of normalizedExperiments.unregistered) {
            inactiveExperiments.push(
                {
                    type: 'Experiment',
                    key: unregistered,
                    name: unregistered.name,
                    data: unregistered,
                    servingOneGroup: false
                }
            );
        }

        return inactiveExperiments;
    }

    function drawExperiments(index = 0) {
        overridesElement.innerHTML = '';

        if (typeof productionExperiments !== 'undefined') {
            const normalizedExperiments = normalizeExperiments();

            const activeExperiments = index === 0 ? normalizedExperiments.defaults.filter((insExt) => {
                return !normalizedExperiments.servingOne.find((npmExt) => {
                    return npmExt.name === insExt.name;
                });
            }) : index === 1 ? normalizedExperiments.servingOne : getInactiveExperiments(normalizedExperiments);

            const countSpan = document.createElement('span');

            const countPerRow = normalizedExperiments.unregistered.length + normalizedExperiments.defaults.length;
            const bloat = (100 - activeExperiments.length / countPerRow * 100).toPrecision(3);

            if (activeExperiments.length > 0) {
                let i = 0;

                for (const experiment of activeExperiments) {
                    // This is a lot of overhead for one field. Consider changing this in the future.
                    const prodExp = productionExperiments.find((a) => { return a.id === experiment.key })

                    // noinspection JSUnresolvedVariable
                    const wrap = getExperimentObject(experiment.data, experiment.key, experiment.name, ++i, experiment.staffOverride, prodExp?.dateFound);

                    overridesElement.appendChild(wrap);
                }

                if (calculationDiv && !calculationDone) {
                    if (bloat > 80) {
                        countSpan.style.color = '#ff8280';
                    } else if (bloat > 50) {
                        countSpan.style.color = '#e69900';
                    } else {
                        countSpan.style.color = '#00c274';
                    }

                    countSpan.innerText = `${bloat}%`;

                    calculationDiv.appendChild(document.createTextNode('Experiment bloat is at '));
                    calculationDiv.appendChild(countSpan);
                }
            } else {
                const countSpan = document.createElement('span');
                countSpan.style.color = '#ff8280';
                countSpan.innerText = 'zero';

                copyButton.style.display = 'none';

                if (calculationDiv && !calculationDone) {
                    calculationDiv.appendChild(document.createTextNode('There are currently '));
                    calculationDiv.appendChild(countSpan);
                    calculationDiv.appendChild(document.createTextNode(' active experiments'));
                }
            }

            if (calculationDiv && !calculationDone) {
                calculationDiv.appendChild(document.createTextNode('. ('));
                calculationDiv.appendChild(document.createTextNode(`${activeExperiments.length} of ${countPerRow}`));
                calculationDiv.appendChild(document.createTextNode(' experiments being used.)'));

                calculationDone = true;
            }
        } else {
            filterDiv.style.display = 'none';

            for (const experimentKey of keys) {
                const experiment = window.__twilightSettings.experiments[experimentKey];
                const wrap = getExperimentObject(experiment, experimentKey);

                overridesElement.appendChild(wrap);
            }
        }
    }

    drawExperiments();
    resetCookie()
} catch (e) {
    document.write(e.toString())

    console.error(e)
}
