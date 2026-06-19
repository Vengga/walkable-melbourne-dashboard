/* Chart 4 — Yearly trend (line + markers). Non-consecutive years are
   drawn dashed (missing-data rule). Legend explains solid vs dashed. */
function renderChart4YearlyTrend(data){
    var id="#chart4"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var rows=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Year;})
        .map(function(d){return {year:d[0],count:d[1]};}).sort(function(a,b){return a.year-b.year;});

    var m={top:16,right:24,bottom:48,left:62}, W=620,H=420;
    var width=W-m.left-m.right, height=H-m.top-m.bottom;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+m.left+","+m.top+")");

    var x=d3.scalePoint().domain(rows.map(function(d){return d.year;})).range([0,width]).padding(0.5);
    var y=d3.scaleLinear().domain([0,d3.max(rows,function(d){return d.count;})]).nice().range([height,0]);
    var line=d3.line().x(function(d){return x(d.year);}).y(function(d){return y(d.count);});

    g.append("g").attr("class","grid-lines").call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat("")).select(".domain").remove();

    var hasGap=false;
    for(var i=0;i<rows.length-1;i++){
        var pair=[rows[i],rows[i+1]];
        var gap=(rows[i+1].year-rows[i].year)>1; if(gap) hasGap=true;
        g.append("path").datum(pair).attr("fill","none").attr("stroke","#7c3aed").attr("stroke-width",2.5)
            .attr("stroke-dasharray",gap?"5 5":null).attr("opacity",gap?0.5:1).attr("d",line);
    }

    g.selectAll("circle").data(rows).enter().append("circle")
        .attr("cx",function(d){return x(d.year);}).attr("cy",function(d){return y(d.count);})
        .attr("r",5).attr("fill","#7c3aed").attr("stroke","#fff").attr("stroke-width",1.5)
        .on("mouseover",function(e,d){showTooltip(e,"<b>"+d.year+"</b><br>Pedestrians: <span class='tv'>"+fmtCount(d.count)+"</span>");})
        .on("mousemove",moveTooltip).on("mouseout",hideTooltip);

    g.selectAll("text.value-label").data(rows).enter().append("text").attr("class","value-label")
        .attr("x",function(d){return x(d.year);}).attr("y",function(d){return y(d.count)-10;})
        .attr("text-anchor","middle").style("font-size","10px").text(function(d){return fmtSI(d.count);});

    g.append("g").attr("class","axis").attr("transform","translate(0,"+height+")").call(d3.axisBottom(x).tickFormat(d3.format("d")));
    g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(5).tickFormat(fmtSI));
    g.append("text").attr("class","axis-title").attr("transform","rotate(-90)").attr("x",-height/2).attr("y",-48)
        .attr("text-anchor","middle").text("Pedestrians counted");

    if(hasGap){
        var lg=svg.append("g").attr("transform","translate("+(m.left)+",4)");
        lg.append("line").attr("x1",0).attr("x2",22).attr("y1",6).attr("y2",6).attr("stroke","#7c3aed").attr("stroke-width",2.5);
        lg.append("text").attr("class","legend-label").attr("x",27).attr("y",10).text("Recorded");
        lg.append("line").attr("x1",100).attr("x2",122).attr("y1",6).attr("y2",6).attr("stroke","#7c3aed").attr("stroke-width",2.5).attr("stroke-dasharray","5 5").attr("opacity",.5);
        lg.append("text").attr("class","legend-label").attr("x",127).attr("y",10).text("Gap (no data)");
    }

    var top=rows.slice().sort(function(a,b){return b.count-a.count;})[0];
    setInsight("#insight4","Activity peaks in <b>"+top.year+"</b>. The dashed segment marks years missing from the dataset (2015 to 2018 and 2020 to 2021). The apparent fall in the final years should be read with caution, since it likely reflects incomplete annual coverage and COVID era disruption rather than a genuine long term decline in walking.");
}
