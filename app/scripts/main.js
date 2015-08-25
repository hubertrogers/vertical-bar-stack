skillsQueue("data/data_generic.json", "data/data_personalized.json");

function skillsQueue(genericURL, personalizedURL) {
    queue()
        .defer(d3.json, genericURL) //
        .defer(d3.json, personalizedURL) //
        .await(processSkillsData); // function that uses files    
}

function processSkillsData(error, generic, personalized) {
    // skills stats
    console.log(error, generic, personalized)
    if (generic.length > 0) {
        initiateIngredientsChart(generic, personalized);
    } else {
        $('#no-data').show();
    }
}