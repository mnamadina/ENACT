// import autocomplete from "autocompleter";

$(document).ready(function () {
    "use strict"
    let resourcesJSON = null
    // page is ready
    $.ajax({
        type: 'GET',
        url: '/resources/all',
        async: false,
        dataType: 'json',
        success: function (data) {
            resourcesJSON = data
        }
    });

    let tagsJSON = null
    // page is ready
    $.ajax({
        type: 'GET',
        url: '/tags/all',
        async: false,
        dataType: 'json',
        success: function (data) {
            tagsJSON = data
        }
    });

    let tags = ['agriculture'
        , 'arts and culture'
        , 'cannabis'
        , 'consumer protection'
        , 'COVID-19'
        , 'criminal justice'
        , 'disability'
        , 'education'
        , 'elderly'
        , 'energy'
        , 'environment/climate change'
        , 'gun control'
        , 'healthcare'
        , 'higher education'
        , 'housing and homelessness'
        , 'immigration'
        , 'labor'
        , 'LGBTQ+'
        , 'mental health'
        , 'opioids'
        , 'public health'
        , 'public safety'
        , 'race'
        , 'substance use and recovery'
        , 'taxes'
        , 'technology'
        , 'tourism'
        , 'transportation'
        , 'veterans'
        , 'violence and sexual assault'
        , 'voting'
        , 'women and gender']

    for (let tag = 0; tag < tagsJSON.length; tag++) {
        tags.push(tagsJSON[tag].info)
    }

    for (let resource = 0; resource < resourcesJSON.length; resource++) {
        if (resourcesJSON[resource].contentType !== "empty")
            resourcesJSON[resource].label = resourcesJSON[resource].name + " [" + resourcesJSON[resource].contentType + "] ";
        else
            resourcesJSON[resource].label = resourcesJSON[resource].name;
    }

    let input = document.getElementById("resources");

    autocomplete({
        input: input,
        fetch: function (text, update) {
            // build tags JSON

            let tagsJSON = []
            for (let tag in tags) {
                let newJSON = {
                    "label": tags[tag]
                }
                tagsJSON.push(newJSON)
            }
            tagsJSON = JSON.parse(JSON.stringify(tagsJSON))

            // build name JSON
            let namesJSON = []
            let seenNames = new Set()
            for (let resource in resourcesJSON) {
                let name = resourcesJSON[resource].ownerName
                if (!seenNames.has(name)) {
                    let newJSON = {
                        "label": name
                    }
                    namesJSON.push(newJSON)
                    seenNames.add(name)
                }
            }
            namesJSON = JSON.parse(JSON.stringify(namesJSON))

            // build contentType JSON
            let contentJSON = []
            let seenContent = new Set()
            for (let resource in resourcesJSON) {
                let contentType = resourcesJSON[resource].contentType
                if (!seenContent.has(contentType)) {
                    let newJSON = {
                        "label": contentType
                    }
                    contentJSON.push(newJSON)
                    seenContent.add(contentType)
                }
            }
            contentJSON = JSON.parse(JSON.stringify(contentJSON))
            text = text.toLowerCase();
            // you can also use AJAX requests instead of preloaded data
            let suggestions = resourcesJSON.filter(n => (n.label !== undefined && n.label.toLowerCase().includes(text))).slice(0, 10);
            let tagSuggestions = tagsJSON.filter(n => (n.label !== undefined && n.label.toLowerCase().includes(text)))
            let nameSuggestions = namesJSON.filter(n => (n.label !== undefined && n.label.toLowerCase().includes(text)))
            let contentSuggestions = contentJSON.filter(n => (n.label !== undefined && n.label.toLowerCase().includes(text)))
            suggestions = tagSuggestions.concat(nameSuggestions).concat(contentSuggestions).concat(suggestions)
            // console.log("suggestions: ", suggestions)
            update(suggestions);
        },
        onSelect: function (item) {
            input.value = item.label;
        },
        render: function (item, currentValue) {
            let div = document.createElement("div");
            div.append("<span class=''>")
            div.textContent = item.label;
            div.setAttribute('class', "complete-items");
            return div;
        },
        // className: "className",
        disableAutoSelect: true
    });
})