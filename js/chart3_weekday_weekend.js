/* Chart 3 — Weekday vs weekend (donut, as proposed). Shows each part's
   SHARE OF TOTAL pedestrian volume (a valid part-to-whole). Tooltip also
   reports the average per day so the comparison is not misread. */
function renderChart3WeekdayWeekend(data){
    var id="#chart3"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var isWknd=function(day){return day==="Saturday"||day==="Sunday";};
    var wkndTotal=d3.sum(data.filter(function(d){return isWknd(d.Day);}),function(d){return d.Hourly_Counts;});
    var wdayTotal=d3.sum(data.filter(function(d){return !isWknd(d.Day);}),function(d){return d.Hourly_Counts;});
    var total=wkndTotal+wdayTotal;
    if(!total){emptyState(id);return;}

    // average per calendar-day-type for a fairer read (5 weekdays, 2 weekend days)
    var parts=[
        {key:"Weekday",val:wdayTotal,days:5,color:"#2563eb"},
        {key:"Weekend",val:wkndTotal,days:2,color:"#f59e0b"}
    ];

    var W=620,H=420, R=Math.min(W*0.55,H)/2-10, cx=W*0.40, cy=H/2;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+cx+","+cy+")");

    var pie=d3.pie().sort(null).value(function(d){return d.val;});
    var arc=d3.arc().innerRadius(R*0.58).outerRadius(R);
    var arcs=pie(parts);

    g.selectAll("path").data(arcs).enter().append("path").attr("class","mark")
        .attr("fill",function(d){return d.data.color;}).attr("stroke","#fff").attr("stroke-width",2)
        .on("mouseover",function(e,d){
            var avgPerDay=d.data.val/d.data.days;
            showTooltip(e,"<b>"+d.data.key+"</b><br>Share of volume: <span class='tv'>"+pct(d.data.val/total)+
                "</span><br>Total: <span class='tv'>"+fmtCount(d.data.val)+"</span><br>Avg per day-type: <span class='tv'>"+fmtCount(avgPerDay)+"</span>");})
        .on("mousemove",moveTooltip).on("mouseout",hideTooltip)
        .each(function(d){this._c=d;})
        .transition().duration(700).attrTween("d",function(d){
            var i=d3.interpolate({startAngle:d.startAngle,endAngle:d.startAngle},d);
            return function(t){return arc(i(t));};});

    // % labels on arcs
    g.selectAll("text.value-label").data(arcs).enter().append("text").attr("class","value-label")
        .attr("transform",function(d){return "translate("+arc.centroid(d)+")";}).attr("text-anchor","middle")
        .attr("fill","#fff").style("font-size","15px").text(function(d){return pct(d.data.val/total);});

    // centre label
    g.append("text").attr("text-anchor","middle").attr("y",-4).attr("class","chart-title-in").style("font-size","13px").text("Total");
    g.append("text").attr("text-anchor","middle").attr("y",16).style("font-weight","bold").style("font-size","16px")
        .attr("fill","#1a2330").text(fmtSI(total));

    // legend
    var lg=svg.append("g").attr("transform","translate("+(W*0.72)+","+(H/2-40)+")");
    parts.forEach(function(p,i){
        var grp=lg.append("g").attr("transform","translate(0,"+(i*46)+")");
        grp.append("rect").attr("width",13).attr("height",13).attr("rx",2).attr("fill",p.color);
        grp.append("text").attr("class","legend-label").attr("x",19).attr("y",7).style("font-weight","bold").text(p.key);
        grp.append("text").attr("class","legend-label").attr("x",19).attr("y",23).text(pct(p.val/total)+" · "+fmtSI(p.val));
    });

    var wkndAvg=wkndTotal/2, wdayAvg=wdayTotal/5;
    var phrase = wkndAvg>wdayAvg
        ? "but an average <b>weekend day is busier</b> than an average weekday"
        : "and an average <b>weekday is busier</b> than an average weekend day";
    setInsight("#insight3","Weekends make up <b>"+pct(wkndTotal/total)+"</b> of all pedestrian volume — "+phrase+" once the 5-vs-2 day difference is accounted for.");
}
