

/*
d3.queue()
    .defer(d3.json, "src/data/50m.json")
    .defer(d3.json, "src/data/population.json")
    .await(function (error, world, data) {
        console.log(data)
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        }
        else {
            //console.log('sdf');
            //drawMap(world, data);
        }
    });*/


    //colors for population metrics
    /*
    var color = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);*/



//in foreach feature

        /*
        if(populationById[d.properties.name]) {
            d.details = populationById[d.properties.name];
        }
        else{
            d.details = {};
        }*/


             //d.details = populationById[d.properties.name] ? populationById[d.properties.name] : {};
        //console.log(d.properties.name)
        //console.log(printData[d.properties.name])