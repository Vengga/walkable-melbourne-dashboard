/* Chart 7 — Pedestrian sensor hotspot map (fixed CBD frame).
   The Melbourne suburb geometry is embedded in js/melbourne_geo.js and read
   from the global `basemap`. Drawn with d3.geoMercator + d3.geoPath.

   The projection uses a FIXED centre and scale on the Melbourne CBD, not a
   data-derived fit, so the suburbs and bubbles always align and the map
   renders identically every time. Every sensor is always drawn (matching
   ones blue, the rest grey), so the map never goes blank. */
function renderChart7SensorMap(data){
    var id="#chart7"; d3.select(id).html("");
    var source=(typeof fullData!=="undefined" && fullData.length) ? fullData : data;
    if(!source || !source.length){ emptyState(id); return; }

    var allSensors=d3.rollups(source,function(v){return {total:d3.sum(v,function(d){return d.Hourly_Counts;}),
        lat:v[0].latitude,lng:v[0].longitude,status:v[0].status};},function(d){return d.Sensor_Name;})
        .map(function(d){return {sensor:d[0],total:d[1].total,lat:d[1].lat,lng:d[1].lng,status:d[1].status};})
        .filter(function(d){return !isNaN(d.lat)&&!isNaN(d.lng)&&d.lat!==0&&d.lng!==0;})
        .sort(function(a,b){return b.total-a.total;});
    if(!allSensors.length){ emptyState(id); return; }

    var curByName=new Map(d3.rollups(data||[],function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Sensor_Name;}));
    var activeNames=new Set(curByName.keys());
    var filteredView=activeNames.size>0 && activeNames.size<allSensors.length;

    var W=1180,H=560;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    svg.append("rect").attr("x",1).attr("y",1).attr("width",W-2).attr("height",H-2).attr("rx",12).attr("fill","#d7e0db").attr("stroke","var(--line)");
    svg.append("clipPath").attr("id","map-clip").append("rect").attr("x",2).attr("y",2).attr("width",W-4).attr("height",H-4).attr("rx",11);
    var view=svg.append("g").attr("clip-path","url(#map-clip)");
    var zoomLayer=view.append("g");

    /* FIXED projection on the Melbourne CBD (centre = sensor centroid). */
    var projection=d3.geoMercator()
        .center([144.9626, -37.8126])
        .scale(115000)
        .translate([W/2, H/2]);
    var path=d3.geoPath().projection(projection);

    if(basemap&&basemap.features){
        zoomLayer.append("g").selectAll("path.suburb").data(basemap.features).enter().append("path")
            .attr("class","suburb").attr("d",path).attr("fill","#f4f8f6").attr("stroke","#7d8f86").attr("stroke-width",1);
        var labelSet={"Melbourne (3000)":1,"Carlton":1,"Carlton North":1,"North Melbourne":1,
            "West Melbourne":1,"Docklands":1,"Southbank":1,"South Wharf":1,"Parkville":1,
            "Fitzroy":1,"Fitzroy North":1,"Collingwood":1,"Abbotsford":1,"East Melbourne":1,
            "Richmond":1,"Cremorne":1,"South Yarra":1,"Kensington":1,"Princes Hill":1};
        var labelFeatures=basemap.features.filter(function(d){return d.properties&&labelSet[d.properties.name];});
        zoomLayer.append("g").selectAll("text.suburb-label").data(labelFeatures).enter().append("text")
            .attr("class","suburb-label").attr("text-anchor","middle")
            .attr("transform",function(d){var c=path.centroid(d);return "translate("+c[0]+","+c[1]+")";})
            .attr("display",function(d){var c=path.centroid(d);return (c[0]>20&&c[0]<W-20&&c[1]>20&&c[1]<H-20)?null:"none";})
            .text(function(d){return d.properties.name;});
    }

    var maxTotal=d3.max(allSensors,function(d){return d.total;});
    var radius=d3.scaleSqrt().domain([0,maxTotal]).range([4,24]);
    function isActive(d){return activeNames.has(d.sensor);}
    function px(d){return projection([d.lng,d.lat]);}

    zoomLayer.append("g").selectAll("circle.mark").data(allSensors).enter().append("circle")
        .attr("class","mark clickable").attr("data-sensor",function(d){return d.sensor;})
        .attr("cx",function(d){return px(d)[0];}).attr("cy",function(d){return px(d)[1];})
        .attr("r",0)
        .attr("fill",function(d){return isActive(d)?"#2563eb":"#9aa7a1";})
        .attr("fill-opacity",function(d){return isActive(d)?0.66:0.28;})
        .attr("stroke","#fff").attr("stroke-width",1)
        .on("mouseover",function(e,d){d3.select(this).raise().attr("stroke","#1a2330").attr("stroke-width",1.6);
            highlightSensor(d.sensor);
            var html="<b>"+d.sensor+"</b><br>Total pedestrians: <span class='tv'>"+fmtCount(d.total)+"</span>";
            if(filteredView) html+="<br>In current view: <span class='tv'>"+fmtCount(curByName.get(d.sensor)||0)+"</span>";
            html+="<br>Activity level: "+(activityBand[d.sensor]||"n/a")+"<br>Status: "+(d.status||"n/a")+"<br>Coordinates: "+d.lat.toFixed(4)+", "+d.lng.toFixed(4);
            showTooltip(e,html);})
        .on("mousemove",moveTooltip)
        .on("mouseout",function(){d3.select(this).attr("stroke","#fff").attr("stroke-width",1);clearHighlight();hideTooltip();})
        .on("click",function(e,d){selectSensor(d.sensor);})
        .transition().duration(700).attr("r",function(d){return radius(d.total);});

    var legVals=[maxTotal,maxTotal/2,maxTotal/8].filter(function(v){return radius(v)>=4;});
    var lg=svg.append("g").attr("transform","translate(34,"+(H-34)+")");
    lg.append("text").attr("class","legend-title").attr("x",0).attr("y",-radius(maxTotal)*2-12).text("Total pedestrians");
    legVals.forEach(function(v){var r=radius(v);
        lg.append("circle").attr("cx",radius(maxTotal)).attr("cy",-r).attr("r",r).attr("fill","none").attr("stroke","#2563eb").attr("stroke-width",1.2);
        lg.append("text").attr("class","legend-label").attr("x",radius(maxTotal)*2+10).attr("y",-r*2+4).text(fmtSI(v));});

    if(filteredView){
        var ck=svg.append("g").attr("transform","translate(20,18)");
        ck.append("circle").attr("cx",8).attr("cy",8).attr("r",7).attr("fill","#2563eb").attr("fill-opacity",.66).attr("stroke","#fff");
        ck.append("text").attr("class","legend-label").attr("x",20).attr("y",12).text("In current view");
        ck.append("circle").attr("cx",8).attr("cy",30).attr("r",7).attr("fill","#9aa7a1").attr("fill-opacity",.28).attr("stroke","#fff");
        ck.append("text").attr("class","legend-label").attr("x",20).attr("y",34).text("Filtered out");
    }

    var zoom=d3.zoom().scaleExtent([1,16]).on("zoom",function(event){
        zoomLayer.attr("transform",event.transform);
        zoomLayer.selectAll("circle").attr("stroke-width",1/event.transform.k);
        zoomLayer.selectAll("path.suburb").attr("stroke-width",0.9/event.transform.k);
    });
    svg.call(zoom);
    svg.append("text").attr("class","legend-label").attr("x",W-14).attr("y",H-14).attr("text-anchor","end").text("Mercator projection. Scroll to zoom, drag to pan.");

    if(filteredView){
        setInsight("#insight7","<b>"+allSensors[0].sensor+"</b> is the busiest of all "+allSensors.length+" sensors. <b>"+activeNames.size+"</b> match the current slicers (blue); the rest are greyed for context.");
    }else{
        setInsight("#insight7","<b>"+allSensors[0].sensor+"</b> is the top hotspot. All "+allSensors.length+" sensors form a compact cluster in the central city grid, the walkable core that SDG 11 promotes.");
    }
}
