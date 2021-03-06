try {
    const overridesElement = document.getElementById('overrides')
    const copyButton = document.getElementById('copy');
    const calculationDiv = document.getElementById('calculation');
    const filterDiv = document.getElementById('filter');

    let overridenExperiments = {};
    let calculationDone = false;
    let currentCookie = "";

    function resetCookie() {
        const o = {
            experiments: {},
            disabled: []
        }

        for (const exp of Object.keys(overridenExperiments)) {
            o.experiments[exp] = overridenExperiments[exp];
        }

        currentCookie = JSON.stringify(o).replaceAll(/["]/g, '%22').replaceAll(/[,]/g, '%2C');
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

    function getExperimentObject(experiment, experimentKey, experimentName = undefined, index = -1, staffOverride = undefined) {
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

        let largestWeight = document.createElement('li');
        let largestWeightVal = 0;
        let lastSelected = undefined;

        for (const group of experiment.groups) {
            const chunk = document.createElement('div');
            const ok = document.createElement('input')
            const label = document.createElement('label');

            ok.label = label;
            ok.setAttribute('type', 'radio');
            ok.setAttribute('name', experimentKey)
            ok.setAttribute('value', group.value);
            ok.setAttribute('id', experimentKey + '-' + group.value)

            label.innerText = group.value + ": " + group.weight;
            label.setAttribute('for', experimentKey + '-' + group.value);

            if (staffOverride === group.value) {
                label.classList.add('staff');
            }

            if (group.weight > largestWeightVal) {
                largestWeightVal = group.weight;
                largestWeight = ok;
            }

            ok.addEventListener('change', () => {
                if (lastSelected === ok) {
                    return;
                }

                lastSelected = ok;

                overridenExperiments[experimentKey] = group.value;

                resetCookie();
            })

            chunk.appendChild(ok)
            chunk.appendChild(label)
            opts.appendChild(chunk)
        }

        lastSelected = largestWeight;
        largestWeight.checked = true;
        largestWeight.label.classList.add('blip');

        wrap.appendChild(nameDiv)
        wrap.appendChild(opts)

        return wrap;
    }

    copyButton.addEventListener('click', () => {
        copyCookie();
    })

    const keys = Object.keys(window.__twilightSettings.experiments);
    // Sort by experiment name

    keys.sort((a, b) => {
        return window.__twilightSettings.experiments[a].name.toString().localeCompare(window.__twilightSettings.experiments[b].name)
    });

    filterDiv.addEventListener('change', () => {
        drawExperiments(filterDiv.selectedIndex)
    })

    function drawExperiments(index = 0) {
        overridesElement.innerHTML = '';

        if (typeof productionExperiments !== 'undefined') {
            let p = (function() {
                const unregisteredExperiments = [];
                const servingOneList = [];
                const defaults = [...keys].filter(function (i) {
                    const n = !!productionExperiments.find((a) => { return a.id === i });

                    n || unregisteredExperiments.push(window.__twilightSettings.experiments[i])

                    return n;
                }).map(function (i) {
                    const n = window.__twilightSettings.experiments[i];
                    const e = function (g) {
                        return g.groups.filter(function (consideration) {
                            return 0 === consideration.weight;
                        }).length >= g.groups.length - 1;
                    }(n);
                    const t = {
                        type: 'Experiment',
                        key: i,
                        name: n.name + " - " + i,
                        data: n,
                        servingOneGroup: e,
                        staffOverride: productionExperiments.find((a) => { return a.id === i })?.staffOverride
                    };

                    e && servingOneList.push(t)

                    return t;
                });
                return {
                    unregistered: unregisteredExperiments,
                    servingOne: servingOneList,
                    defaults: defaults
                };
            }());

            function getInactiveExperiments() {
                let o = [];

                for (const unregistered of p.unregistered) {
                    o.push(
                        {
                            type: 'Experiment',
                            key: unregistered,
                            name: unregistered.name,
                            data: unregistered,
                            servingOneGroup: false
                        }
                    );
                }

                return o;
            }

            const activeExperiments = index === 0 ? p.defaults.filter(function (insExt) {
                return !p.servingOne.find(function (npmExt) {
                    return npmExt.name === insExt.name;
                });
            }) : index === 1 ? p.servingOne : getInactiveExperiments();

            const countSpan = document.createElement('span');

            const countPerRow = p.unregistered.length + p.defaults.length;
            const bloat = (100 - activeExperiments.length / countPerRow * 100).toPrecision(3);

            if (activeExperiments.length > 0) {
                let i = 0;

                for (const experiment of activeExperiments) {
                    const wrap = getExperimentObject(experiment.data, experiment.key, experiment.name, ++i, experiment.staffOverride);

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

                    countSpan.innerText = bloat + '%';

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
                calculationDiv.appendChild(document.createTextNode(activeExperiments.length + ' of ' + countPerRow));
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
