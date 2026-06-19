/* Chart 2 — Monthly activity. Vertical bars coloured by Australian season,
   with a season legend, value labels, tooltips and a dynamic insight. */
function renderChart2MonthlyActivity(data){
    var id="#chart2"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var rows=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Month;})
        .map(function(d){return {month:d[0],short:shortMonth[d[0]],season:seasonOf[d[0]],count:d[1],o:monthOrder.indexOf(d[0])};})
        .sort(function(a,b){return a.o-b.o;});

    var m={top:14,right:20,bottom:64,left:62}, W=620,H=420;
    var width=W-m.left-m.right, height=H-m.top-m.bottom;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+m.left+","+m.top+")");

    var x=d3.scaleBand().domain(rows.map(function(d){return d.short;})).range([0,width]).padding(0.25);
    var y=d3.scaleLinear().domain([0,d3.max(rows,function(d){return d.count;})]).nice().range([height,0]);

    g.append("g").attr("class","grid-lines").call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat("")).select(".domain").remove();

    g.selectAll("rect.mark").data(rows).enter().append("rect").attr("class","mark")
        .attr("x",function(d){return x(d.short);}).attr("width",x.bandwidth()).attr("rx",3)
        .attr("fill",function(d){return seasonColor[d.season];}).attr("y",height).attr("height",0)
        .on("mouseover",function(e,d){showTooltip(e,"<b>"+d.month+"</b> ("+d.season+")<br>Pedestrians: <span class='tv'>"+fmtCount(d.count)+"</span>");})
        .on("mousemove",moveTooltip).on("mouseout",hideTooltip)
        .transition().duration(650).delay(function(d,i){return i*25;})
        .attr("y",function(d){return y(d.count);}).attr("height",function(d){return height-y(d.count);});

    g.selectAll("text.value-label").data(rows).enter().append("text").attr("class","value-label")
        .attr("x",function(d){return x(d.short)+x.bandwidth()/2;}).attr("y",function(d){return y(d.count)-6;})
        .attr("text-anchor","middle").style("font-size","10px").text(function(d){return fmtSI(d.count);});

    g.append("g").attr("class","axis").attr("transform","translate(0,"+height+")").call(d3.axisBottom(x));
    g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(5).tickFormat(fmtSI));
    g.append("text").attr("class","axis-title").attr("transform","rotate(-90)").attr("x",-height/2).attr("y",-48)
        .attr("text-anchor","middle").text("Pedestrians counted");

    /* season legend */
    var seasons=["Summer","Autumn","Winter","Spring"];
    var lg=svg.append("g").attr("transform","translate("+(m.left)+",6)");
    var lx=0;
    seasons.forEach(function(s){
        var grp=lg.append("g").attr("transform","translate("+lx+",0)");
        grp.append("rect").attr("width",11).attr("height",11).attr("rx",2).attr("fill",seasonColor[s]);
        grp.append("text").attr("class","legend-label").attr("x",15).attr("y",10).text(s);
        lx+=15+s.length*6.4+16;
    });

    var top=rows.slice().sort(function(a,b){return b.count-a.count;})[0];
    var bySeason=d3.rollups(rows,function(v){return d3.sum(v,function(d){return d.count;});},function(d){return d.season;})
        .sort(function(a,b){return b[1]-a[1];});
    setInsight("#insight2","<b>"+top.month+"</b> records the highest monthly volume. <b>"+bySeason[0][0]+
        "</b> is the busiest season overall, reflecting Melbourne's seasonal street activity.");
}
