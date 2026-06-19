/* Chart 1 — Top 10 busiest locations. Horizontal bars coloured by volume
   (sequential blue) with a colour legend, value labels, tooltips,
   click-to-filter and hover linking. */
function renderChart1TopLocations(data){
    var id="#chart1"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var rows=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Sensor_Name;})
        .map(function(d){return {sensor:d[0],count:d[1]};})
        .sort(function(a,b){return b.count-a.count;}).slice(0,10);

    var m={top:14,right:96,bottom:46,left:210}, W=620,H=440;
    var width=W-m.left-m.right, height=H-m.top-m.bottom;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+m.left+","+m.top+")");

    var maxV=d3.max(rows,function(d){return d.count;});
    var x=d3.scaleLinear().domain([0,maxV]).nice().range([0,width]);
    var y=d3.scaleBand().domain(rows.map(function(d){return d.sensor;})).range([0,height]).padding(0.22);
    var col=function(v){return d3.interpolateBlues(0.35+0.6*(v/maxV));};

    g.append("g").attr("class","grid-lines").call(d3.axisTop(x).ticks(5).tickSize(-height).tickFormat("")).select(".domain").remove();

    g.selectAll("rect.mark").data(rows).enter().append("rect")
        .attr("class","mark clickable").attr("data-sensor",function(d){return d.sensor;})
        .attr("y",function(d){return y(d.sensor);}).attr("x",0).attr("height",y.bandwidth()).attr("rx",3)
        .attr("fill",function(d){return col(d.count);}).attr("width",0)
        .on("mouseover",function(e,d){highlightSensor(d.sensor);
            showTooltip(e,"<b>"+d.sensor+"</b><br>Total pedestrians: <span class='tv'>"+fmtCount(d.count)+"</span>");})
        .on("mousemove",moveTooltip)
        .on("mouseout",function(){clearHighlight();hideTooltip();})
        .on("click",function(e,d){selectSensor(d.sensor);})
        .transition().duration(700).attr("width",function(d){return x(d.count);});

    g.selectAll("text.value-label").data(rows).enter().append("text").attr("class","value-label")
        .attr("x",function(d){return x(d.count)+8;}).attr("y",function(d){return y(d.sensor)+y.bandwidth()/2+4;})
        .text(function(d){return fmtSI(d.count);});

    g.append("g").attr("class","axis").call(d3.axisLeft(y));
    g.append("g").attr("class","axis").attr("transform","translate(0,"+height+")").call(d3.axisBottom(x).ticks(5).tickFormat(fmtSI));
    g.append("text").attr("class","axis-title").attr("x",width/2).attr("y",height+38).attr("text-anchor","middle")
        .text("Total pedestrians counted");

    var ratio=rows[0].count/rows[rows.length-1].count;
    setInsight("#insight1","<b>"+rows[0].sensor+"</b> is the busiest location with <b>"+fmtCount(rows[0].count)+
        "</b> pedestrians — about <b>"+ratio.toFixed(1)+"\u00d7</b> the 10th-ranked sensor. Foot traffic is highly concentrated in a few streets.");
}
