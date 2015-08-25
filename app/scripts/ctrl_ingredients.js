// // // // //
// 
// ctrl_ingredients.js
//
// This script is the controller for the ingredients visualization
// 
// * function initiateIngredientsChart
//     - initiates the chart controller object (verticalBarStack) with initial (generic) data
//
// * function redrawIngredients
//     - updates the verticalBarStack object
//     - listens for the onboarding form submit event and handles personalization (adding/substracting ingredients) 
// 
// // // // //

var verticalBarStackChart_listed_core;
var verticalBarStackChart_listed_extra;
var verticalBarStackChart_yours_core;
var verticalBarStackChart_yours_extra;
var lastPersonalizedDataArray = [];
var initialIngredients = [];

var pcFormat = d3.format(".0%");
var lastState = "generic";

var tip = d3.tip()
    .attr('class', 'd3-tip')
    // .direction('w')
    .offset([-10, 0])
    .html(function(d) {
        var jobtitle = $('#jobtitle-span')
            .text();
        jobtitle = $.trim(jobtitle);
        return "<span style='color:red'>" + d['value'] + "g</span> of " + d['name'] + " .";
    })

function initiateIngredientsChart(genericData, personalizedData) {
    var dataSplit = splitData(genericData);

    verticalBarStackChart_listed_core = verticalBarStack()
        .statusColors({
            "core": "#FFB400",
            "extra": "#2a2a2a"
        })
        .nameValue(function(d) {
            return d['name'];
        })
        .yValue(function(d) {
            return parseFloat(d['value']);
        })
        .chartType("listed core")
        .orientation("left")
        .containerID("listed_core")
        .tip(tip)

    verticalBarStackChart_listed_extra = verticalBarStack()
        .statusColors({
            "core": "#FFB400",
            "extra": "#2a2a2a"
        })
        .nameValue(function(d) {
            return d['name'];
        })
        .yValue(function(d) {
            return parseFloat(d['value']);
        })
        .chartType("listed extra")
        .orientation("left")
        .containerID("listed_extra")
        .tip(tip);

    d3.select("#listed_core")
        .datum(dataSplit['core'])
        .call(verticalBarStackChart_listed_core)

    d3.select("#listed_extra")
        .datum(dataSplit['extra'])
        .call(verticalBarStackChart_listed_extra)

    initialIngredients = genericData;

    setInterval(function() {
        if (lastState == "generic") {
            redrawIngredients(getRandomSubarray(personalizedData, personalizedData.length - 2), "user_ingredients")
            lastState = "personalized";
        } else {
            redrawIngredients(getRandomSubarray(genericData, genericData.length - 5), "job_ingredients")
            lastState = "generic";
        }
    }, 3000);
}

function initiateUserVerticalBarStackChart(data) {
    var dataSplit = splitData(data);

    verticalBarStackChart_yours_core = verticalBarStack()
        .statusColors({
            "core": "#FFB400",
            "extra": "#2a2a2a"
        })
        .nameValue(function(d) {
            return d['name'];
        })
        .yValue(function(d) {
            return parseFloat(d['value']);
        })
        .orientation("right")
        .chartType("yours core")
        .containerID("yours_core")
        .tip(tip);

    verticalBarStackChart_yours_extra = verticalBarStack()
        .statusColors({
            "core": "#FFB400",
            "extra": "#2a2a2a"
        })
        .nameValue(function(d) {
            return d['name'];
        })
        .yValue(function(d) {
            return parseFloat(d['value']);
        })
        .orientation("right")
        .chartType("yours extra")
        .containerID("yours_extra")
        .tip(tip)

    d3.select("#yours_core")
        .datum(dataSplit['core'])
        .call(verticalBarStackChart_yours_core)

    d3.select("#yours_extra")
        .datum(dataSplit['extra'])
        .call(verticalBarStackChart_yours_extra)

}


function redrawIngredients(data, type) {
    if (verticalBarStackChart_yours_core && verticalBarStackChart_yours_extra) {
        var dataSplit = splitData(data);
        d3.select("#yours_core")
            .data([dataSplit['core']])
            .call(verticalBarStackChart_yours_core);
        d3.select("#yours_extra")
            .data([dataSplit['extra']])
            .call(verticalBarStackChart_yours_extra);
    } else {
        initiateUserVerticalBarStackChart(data);
    }
    var dataSplit = splitData(data);
    d3.select("#listed_core")
        .data([dataSplit['core']])
        .call(verticalBarStackChart_listed_core);
    d3.select("#listed_extra")
        .data([dataSplit['extra']])
        .call(verticalBarStackChart_listed_extra);

    lastPersonalizedDataArray = data;
}

function listOfIngredientNames(array) {
    return array.map(function(d) {
        return d['name'];
    })
}

function compareArrays(array1, array2) {
    if (JSON.stringify(listOfIngredientNames(array1)) == JSON.stringify(listOfIngredientNames(array2))) {
        return true;
    } else {
        return false;
    }
}


function splitData(data) {
    var core = data.filter(function(d) {
        return d.type == "core"
    });
    var extra = data.filter(function(d) {
        return d.type == "extra"
    });
    return {
        "core": core,
        "extra": extra
    };
}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0),
        i = arr.length,
        temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}