var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var selectedWave = "wave1";
var filterArray = [0, 0];
var activeButtons = [0, 0];
var buttonIds = ['q1Family', 'q1Friends', 'q1LeisureTime', 'q1Politics', 'q1Religion', 'q1Work',
                'q2Family', 'q2Friends', 'q2LeisureTime', 'q2Politics', 'q2Religion', 'q2Work'];
var otherQuestion = "Life_Satisfaction";
var otherActive = false;

var waveButtonIds = ['wave1', 'wave2', 'wave3', 'wave4'];

var colorSingle = d3.scaleThreshold()
        .domain([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100])
        .range(['#f0ffff','#e6f1f9','#dce3f3','#d2d5ed','#c8c7e7','#beb9e1','#b4acdb','#aa9ed5','#a091cf','#9584c9','#8b77c3','#806abd','#755eb7','#6a51b0','#5e45aa','#5238a4','#442c9e','#351f97','#231091','#00008b']);

var colorCompare = d3.scaleThreshold()
        .domain([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100])
        .range(['#c20033','#c43c2f','#c4592a','#c47222','#c28814','#b99700','#9b9300','#7c8f00','#5a8900','#2f8300','#158422','#268c49','#2c946d','#289c90','#12a5b4','#2194be','#2b7cbe','#2b63be','#214abe','#002fbd']);


var svg;
var map;
var jsonData;
var zoom;


function start(){
    svg = d3.select("#map")
        .append("svg")
        .style("cursor", "move");

    map = svg.append("g")
        .attr("class", "map");



    //var jsonData;

    d3.json("src/data/data.json", function( data){
        jsonData = data;
    });

    svg.attr("viewBox", "50 10 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin");

    zoom = d3.zoom()
        .on("zoom", function () {
            var transform = d3.zoomTransform(this);
            map.attr("transform", transform);
        });

    svg.call(zoom);

}


start();

addEventListeners();
drawLegend();
resetMap();




function makeSenseOfData(data){
    var orderedData = 0;

    if(otherActive){
        if(otherQuestion == "Life_Satisfaction"){
            for(var i = 1; i <= 10; i++){
                orderedData = orderedData + (parseFloat(data['Life_Satisfaction'][i]) * i)
            }
            orderedData = (orderedData/100) * 10
        }
        else if(otherQuestion == "Men_Rather_Than_Women"){
            orderedData = parseFloat(data['Men_Rather_Than_Women']['Agree'])
            

        }
        else if(otherQuestion == "Religious_Person"){
            orderedData = parseFloat(data['Religious_Person']['Yes'])
        }  
    }
    else{
        if(filterArray[0] != 0 && filterArray[1] != 0){
            //console.log(filterArray)
            var very1 = parseFloat(data[filterArray[0]].very)
            var rather1 = parseFloat(data[filterArray[0]].rather)
            var notVery1 = parseFloat(data[filterArray[0]].notVery)
            var notAtAll1 = parseFloat(data[filterArray[0]].notAtAll)
            var very2 = parseFloat(data[filterArray[1]].very)
            var rather2 = parseFloat(data[filterArray[1]].rather)
            var notVery2 = parseFloat(data[filterArray[1]].notVery)
            var notAtAll2 = parseFloat(data[filterArray[1]].notAtAll)

            orderedData = 50 + ((((very2 + rather2)/100)*50)-(((very1 + rather1)/100)*50))

        }
        else if(filterArray[0] != 0 && filterArray[1] == 0){
            var very = parseFloat(data[filterArray[0]].very)
            var rather = parseFloat(data[filterArray[0]].rather)
            var notVery = parseFloat(data[filterArray[0]].notVery)
            var notAtAll = parseFloat(data[filterArray[0]].notAtAll)
            orderedData = (very + rather)
        }
    }

    
    //console.log(orderedData)
    return orderedData
}


function prepData(){
    d3.queue()
    .defer(d3.json, "src/data/50m.json")
    .defer(d3.json, "src/data/data.json")
    .await(function (error, world, data) {


        if(filterArray[0] != 0){
            drawMap(world, data[selectedWave])
        }
        
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        }
        else {
            console.log('Ojdå')
            drawMap(world, data[selectedWave]);
        }
    });
}



function drawMap(world, data) {
    //d3.select('#map').selectAll('svg').remove();
    //var svg = d3.select("#map")
    //    .append("svg")
    //    .style("cursor", "move");
    //console.log(data)    
    // geoMercator projection
    var projection = d3.geoMercator() //d3.geoOrthographic()
        .scale(130)
        .translate([width / 2, height / 1.5]);

    // geoPath projection
    var path = d3.geoPath().projection(projection);

    if(filterArray[0] != 0){
        var questionString = findQuestion();
    }


    //d3.scale.threshold().range(['#c20033','#c43c2f','#c4592a','#c47222','#c28814','#b99700','#9b9300','#7c8f00','#5a8900','#2f8300','#158422','#268c49','#2c946d','#289c90','#12a5b4','#2194be','#2b7cbe','#2b63be','#214abe','#002fbd']);

    
    var features = topojson.feature(world, world.objects.countries).features;
    var populationById = {};
    var printData = {};


    for(var item in data){
        if(data[item][filterArray[0]] == null || data[item][otherQuestion] == null){
            printData[item] = {
                yes: 0
            }
        }
        else{
            printData[item] = {
                yes: makeSenseOfData(data[item])
            }
        }
        
            //console.log(data[item])
    }

    
     /*data.forEach(function (d) {
       
        populationById[d.country] = {
            total: +d.total,
            females: +d.females,
            males: +d.males
        }
        
    });*/
    features.forEach(function (d) {
        if(printData[d.properties.name]) {
            d.details = printData[d.properties.name];
        }
        else{
            d.details = {};
        }
    });

    map.append("g")
        .selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("name", function (d) {
            return d.properties.name;
        })
        .attr("id", function (d) {
            return d.id;
        })
        .attr("d", path)
        .style("fill", function (d) {
            if(filterArray[1] == 0){
                return d.details && d.details.yes ? colorSingle(d.details.yes) : undefined;
            }
            else{
                return d.details && d.details.yes ? colorCompare(d.details.yes) : undefined;
            }
            
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("cursor", "pointer");
            d3.select(".country")
                .text(d.properties.name);

            d3.select(".females")
                .text(d.details && d.details.yes && "Female " + d.details.yes || "¯\\_(ツ)_/¯");

            d3.select(".males")
                .text(d.details && d.details.males && "Male " + d.details.males || "¯\\_(ツ)_/¯");

            d3.select('.details')
                .style('visibility', "visible")
        })
        .on('click', function(d){
            console.log(d.properties.name);
            console.log('ahsilasldlaskla')
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .style("stroke", null)
                .style("stroke-width", 0.25);

            d3.select('.details')
                .style('visibility', "hidden");
        });
    //map.transition()
    //        .attrTween("d", arcTween);
}

function drawLegend(data){
    //console.log(filterArray[0])

    let legendTitle = 'Which is more important?';
    let legendLeft = '';
    let legendRight= '';
    if(otherActive){
        if(otherQuestion == 'Life_Satisfaction'){
            legendTitle = "Life Satisfaction"
            legendLeft = '0'
            legendRight = '10'
        }
        else if(otherQuestion == 'Men_Rather_Than_Women'){
            legendTitle = "When jobs are scarce, Men should have more rights to a job than Women?"
            legendLeft = 'Disagree'
            legendRight = 'Agree'
        }
        else if(otherQuestion == 'Religious_Person'){
            legendTitle = "Life Satisfaction"
            legendLeft = '0'
            legendRight = '10'
        }
    }
    else{
        if(filterArray[0] != 0){
            var legendText1 = filterArray[0].replace(/Important/g, '');
            legendText1 = legendText1.replace(/_/, '');
            legendText1 = legendText1.replace(/_/, ' ');
            legendTitle = 'How important is ' + legendText1 + '?';
        }
        if(filterArray[1] != 0){
            var legendText2 = filterArray[1].replace(/Important/g, '');
            legendText2 = legendText2.replace(/_/, '');
            legendText2 = legendText2.replace(/_/, ' ');
        }
    }

    
    
    legendLeft = legendText1;
    legendRight = legendText2;

    d3.select('#legendContainer').selectAll('svg').remove();
    var legend = d3.select('#legendContainer')
        .append("svg")
        .attr('width', width)
        .attr('height', 110);

    //var svg = d3.select("svg");

    legend.append("g")
      .attr("class", "legendLinear")
      .attr("transform", "translate(20,20)");

    if(filterArray[1] != 0){
        var legendLinear = d3.legendColor()
            .shapeWidth(30)
            .cells(20)
            .orient('horizontal')
            .scale(colorCompare)
            .title(legendTitle)
            .labels([legendText1, '', '', '', '', '', '', '', '', '', 'Equal', '', '', '', '', '', '', '', '', legendText2])
            .labelWrap(5);
    }
    else{
        var legendLinear = d3.legendColor()
            .shapeWidth(30)
            .cells(20)
            .orient('horizontal')
            .scale(colorSingle)
            .title(legendTitle)
            .labels([legendLeft, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', legendRight])
            .labelWrap(5);
    }

    

    legend.select(".legendLinear")
        .call(legendLinear);

}

function findQuestion(){
    let questionString = "";
    let firstQuestion = filterArray[0]
    let secondQuestion = filterArray[1]

    return questionString;
}

function resetMap(){
    d3.select('.map').selectAll('g').remove();
    //exit().remove();
    //start();
    filterArray[1] = 0
    activeButtons[1] = 0
    setFilter('Important_Family1', 'q1Family')
}

function setFilter(filter, button){
    d3.select('.map').selectAll('g').transition().duration(1000).remove()
    if(filter.slice(-1) == "1"){
        filterArray[0] = filter.slice(0, -1);
        activeButtons[0] = button;
        setButtonColors(button);
        drawLegend();
        prepData();
    }
    if(filter.slice(-1) == "2"){
        activeButtons[1] = button;
        filterArray[1] = filter.slice(0, -1);
        setButtonColors(button);
        drawLegend();
        prepData();
    }
    
}

function setOtherButtons(question){
    otherActive = true;
    otherQuestion = question;
    prepData();

}

function setButtonColors(clickedButton){
    for(var button in buttonIds){
        document.getElementById(buttonIds[button]).classList.remove("clickedButton");
        document.getElementById(buttonIds[button]).classList.add("unClickedButton");
    }
    for(var button in activeButtons){
        if(activeButtons[button]){
            document.getElementById(activeButtons[button]).classList.remove("unClickedButton");
            document.getElementById(activeButtons[button]).classList.add("clickedButton");
        }
    }
}

function setWave(wave){
    selectedWave = wave;

    for(var button in waveButtonIds){
        document.getElementById(waveButtonIds[button]).classList.remove("clickedButton");
        document.getElementById(waveButtonIds[button]).classList.add("unClickedButton");
    }
    document.getElementById(selectedWave).classList.remove("unClickedButton");
    document.getElementById(selectedWave).classList.add("clickedButton");
    prepData();
}

function addEventListeners(){
  document.getElementById("q1Family").onclick = function() {setFilter("Important_Family1", "q1Family")};
  document.getElementById("q1Friends").onclick = function() {setFilter("Important_Friends1", "q1Friends")};
  document.getElementById("q1LeisureTime").onclick = function() {setFilter("Important_Leisure_time1", "q1LeisureTime")};
  document.getElementById("q1Politics").onclick = function() {setFilter("Important_Politics1", "q1Politics")};
  document.getElementById("q1Religion").onclick = function() {setFilter("Important_Religion1", "q1Religion")};
  document.getElementById("q1Work").onclick = function() {setFilter("Important_Work1", "q1Work")};
  document.getElementById("q2Family").onclick = function() {setFilter("Important_Family2", "q2Family")};
  document.getElementById("q2Friends").onclick = function() {setFilter("Important_Friends2", "q2Friends")};
  document.getElementById("q2LeisureTime").onclick = function() {setFilter("Important_Leisure_time2", "q2LeisureTime")};
  document.getElementById("q2Politics").onclick = function() {setFilter("Important_Politics2", "q2Politics")};
  document.getElementById("q2Religion").onclick = function() {setFilter("Important_Religion2", "q2Religion")};
  document.getElementById("q2Work").onclick = function() {setFilter("Important_Work2", "q2Work")};

  document.getElementById("resetButton").onclick = function() {resetMap()};

  document.getElementById("lifeSatisButton").onclick = function() {setOtherButtons("Life_Satisfaction")};
  document.getElementById("menWomenButton").onclick = function() {setOtherButtons("Men_Rather_Than_Women")};
  document.getElementById("religPersonButton").onclick = function() {setOtherButtons("Religious_Person")};

  document.getElementById("wave1").onclick = function() {setWave('wave1')};
  document.getElementById("wave2").onclick = function() {setWave('wave2')};
  document.getElementById("wave3").onclick = function() {setWave('wave3')};
  document.getElementById("wave4").onclick = function() {setWave('wave4')};
}