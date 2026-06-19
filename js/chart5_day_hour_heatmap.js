/* Chart 5 — Day x hour heatmap (sequential green) with a colour legend
   and a highlighted peak cell. */
function renderChart5DayHourHeatmap(data){
    var id="#chart5"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var nested=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},
        function(d){return d.Day;},function(d){return d.Time;});
    var cells=[];
    nested.forEach(function(dg){dg[1].forEach(function(hg){cells.push({day:dg[0],hour:hg[0],count:hg[1]});});});
    cells=cells.filter(function(d){return dayOrder.indexOf(d.day)!==-1 && !isNaN(d.hour);});
    if(!cells.length){emptyState(id);return;}

    var days=dayOrder.filter(function(d){return cells.some(function(c){return c.day===d;});});
    var hours=d3.range(0,24);
    var m={top:14,right:24,bottom:74,left:60}, W=1180,H=420;
    var width=W-m.left-m.right, height=H-m.top-m.bottom;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+m.left+","+m.top+")");

    var x=d3.scaleBand().domain(hours).range([0,width]).padding(0.05);
    var y=d3.scaleBand().domain(days).range([0,height]).padding(0.05);
    var maxV=d3.max(cells,function(d){return d.count;});
    var color=d3.scaleSequential().domain([0,maxV]).interpolator(d3.interpolateGreens);
    var peak=cells.slice().sort(function(a,b){return b.count-a.count;})[0];

    g.selectAll("rect.mark").data(cells).enter().append("rect").attr("class","mark")
        .attr("x",function(d){return x(d.hour);}).attr("y",function(d){return y(d.day);})
        .attr("width",x.bandwidth()).attr("height",y.bandwidth()).attr("rx",2)
        .attr("fill",function(d){return color(d.count);})
        .attr("stroke",function(d){return (d.day===peak.day&&d.hour===peak.hour)?"#1a2330":"none";})
        .attr("stroke-width",2)
        .on("mouseover",function(e,d){var hr=(d.hour<10?"0"+d.hour:d.hour)+":00";
            showTooltip(e,"<b>"+d.day+" "+hr+"</b><br>Pedestrians: <span class='tv'>"+fmtCount(d.count)+"</span>");})
        .on("mousemove",moveTooltip).on("mouseout",hideTooltip);

    g.append("g").attr("class","axis").attr("transform","translate(0,"+height+")")
        .call(d3.axisBottom(x).tickValues(hours.filter(function(h){return h%2===0;})).tickFormat(function(d){return d+":00";}));
    g.append("g").attr("class","axis").call(d3.axisLeft(y).tickFormat(function(d){return dayShort[d];}));
    g.append("text").attr("class","axis-title").attr("x",width/2).attr("y",height+42).attr("text-anchor","middle").text("Hour of day");

    /* colour legend */
    var legW=220,legH=11,lx=width-legW,ly=height+50;
    var defs=svg.append("defs"); var grad=defs.append("linearGradient").attr("id","heat-grad");
    d3.range(0,1.01,0.1).forEach(function(t){grad.append("stop").attr("offset",(t*100)+"%").attr("stop-color",color(t*maxV));});
    var leg=g.append("g").attr("transform","translate("+lx+","+ly+")");
    leg.append("text").attr("class","legend-title").attr("x",0).attr("y",-5).text("Pedestrians");
    leg.append("rect").attr("width",legW).attr("height",legH).attr("rx",2).style("fill","url(#heat-grad)").attr("stroke","var(--line)");
    leg.append("text").attr("class","legend-label").attr("x",0).attr("y",legH+13).text("0");
    leg.append("text").attr("class","legend-label").attr("x",legW).attr("y",legH+13).attr("text-anchor","end").text(fmtSI(maxV));

    var hr=(peak.hour<10?"0"+peak.hour:peak.hour)+":00";
    setInsight("#insight5","The single busiest moment is <b>"+peak.day+" at "+hr+"</b> (outlined). Activity clusters around weekday commuter peaks and the midday\u2013evening window.");
}
