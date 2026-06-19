/* Chart 6 — Sensor location comparison (grouped bar, as proposed).
   For the eight busiest sensors, two grouped bars show the AVERAGE hourly
   count on weekdays versus weekends. Averaging keeps the comparison fair
   across sensors of different ages, and the grouping answers how each
   location's weekday and weekend balance differs. Click a bar to filter. */
function renderChart6SensorComparison(data){
    var id="#chart6"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var isWknd=function(day){return day==="Saturday"||day==="Sunday";};
    var grouped=d3.rollups(data,
        function(v){
            var wd=v.filter(function(d){return !isWknd(d.Day);});
            var we=v.filter(function(d){return isWknd(d.Day);});
            return {
                weekday: wd.length? d3.mean(wd,function(d){return d.Hourly_Counts;}) : 0,
                weekend: we.length? d3.mean(we,function(d){return d.Hourly_Counts;}) : 0,
                all: d3.mean(v,function(d){return d.Hourly_Counts;})
            };
        },
        function(d){return d.Sensor_Name;})
        .map(function(d){return {sensor:d[0],weekday:d[1].weekday,weekend:d[1].weekend,all:d[1].all};})
        .sort(function(a,b){return b.all-a.all;}).slice(0,8);

    var sub=["weekday","weekend"];
    var subColor={weekday:"#2563eb",weekend:"#f59e0b"};
    var subLabel={weekday:"Weekday",weekend:"Weekend"};

    var m={top:16,right:24,bottom:150,left:66}, W=1180,H=480;
    var width=W-m.left-m.right, height=H-m.top-m.bottom;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+m.left+","+m.top+")");

    var x0=d3.scaleBand().domain(grouped.map(function(d){return d.sensor;})).range([0,width]).paddingInner(0.28);
    var x1=d3.scaleBand().domain(sub).range([0,x0.bandwidth()]).padding(0.12);
    var maxV=d3.max(grouped,function(d){return Math.max(d.weekday,d.weekend);});
    var y=d3.scaleLinear().domain([0,maxV]).nice().range([height,0]);

    g.append("g").attr("class","grid-lines").call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat("")).select(".domain").remove();

    var groups=g.selectAll("g.sensor-group").data(grouped).enter().append("g")
        .attr("class","sensor-group").attr("transform",function(d){return "translate("+x0(d.sensor)+",0)";});

    groups.selectAll("rect").data(function(d){
            return sub.map(function(k){return {sensor:d.sensor,key:k,value:d[k]};});
        }).enter().append("rect")
        .attr("class","mark clickable").attr("data-sensor",function(d){return d.sensor;})
        .attr("x",function(d){return x1(d.key);}).attr("width",x1.bandwidth()).attr("rx",3)
        .attr("fill",function(d){return subColor[d.key];})
        .attr("y",height).attr("height",0)
        .on("mouseover",function(e,d){highlightSensor(d.sensor);
            showTooltip(e,"<b>"+d.sensor+"</b><br>"+subLabel[d.key]+" avg hourly count: <span class='tv'>"+fmtCount(d.value)+"</span>");})
        .on("mousemove",moveTooltip).on("mouseout",function(){clearHighlight();hideTooltip();})
        .on("click",function(e,d){selectSensor(d.sensor);})
        .transition().duration(650)
        .attr("y",function(d){return y(d.value);}).attr("height",function(d){return height-y(d.value);});

    g.append("g").attr("class","axis").attr("transform","translate(0,"+height+")").call(d3.axisBottom(x0))
        .selectAll("text").attr("transform","rotate(-32)").style("text-anchor","end");
    g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(5).tickFormat(fmtSI));
    g.append("text").attr("class","axis-title").attr("transform","rotate(-90)").attr("x",-height/2).attr("y",-52)
        .attr("text-anchor","middle").text("Average hourly count");

    var lg=svg.append("g").attr("transform","translate("+m.left+",4)");
    var lx=0;
    sub.forEach(function(k){
        var grp=lg.append("g").attr("transform","translate("+lx+",0)");
        grp.append("rect").attr("width",12).attr("height",12).attr("rx",2).attr("fill",subColor[k]);
        grp.append("text").attr("class","legend-label").attr("x",16).attr("y",11).text(subLabel[k]);
        lx+=16+subLabel[k].length*7+18;
    });

    var leader=grouped[0];
    setInsight("#insight6","<b>"+leader.sensor+"</b> has the highest average intensity. Comparing the blue and amber bars shows whether a location is driven mainly by weekday commuting or by weekend activity.");
}
