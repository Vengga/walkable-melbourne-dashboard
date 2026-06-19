/* Chart 8 — Animated monthly activity (bar-chart race), clearer version.
   Each frame ranks the top 8 sensors for the month; bars slide to new ranks
   with eased transitions. The current leader is outlined and named, a running
   total for the month counts up, and a progress bar tracks position in the
   year. Play, Pause, and Replay are provided. Each sensor keeps a stable
   colour so it can be tracked across months. */
function renderChart8AnimatedMonthly(data){
    var id="#chart8"; d3.select(id).html("");
    if(!data.length){emptyState(id);return;}

    var present=new Set(data.map(function(d){return d.Month;}));
    var months=monthOrder.filter(function(m){return present.has(m);});
    if(!months.length){emptyState(id);return;}

    var bar=d3.select(id).append("div").attr("class","anim-bar");
    var playBtn=bar.append("button").attr("class","btn-play").attr("type","button").text("\u25B6 Play");
    var replayBtn=bar.append("button").attr("class","btn-ghost").attr("type","button").text("\u21BB Replay");
    var monthLabel=bar.append("span").attr("class","anim-month").text(months[0]);
    var totalLabel=bar.append("span").attr("class","anim-total").text("");
    var track=bar.append("span").attr("class","anim-track");
    var progress=track.append("span").attr("class","anim-progress");

    var m={top:12,right:96,bottom:38,left:236}, W=1180,H=420;
    var width=W-m.left-m.right, height=H-m.top-m.bottom;
    var rowH=height/8;
    var svg=d3.select(id).append("svg").attr("viewBox","0 0 "+W+" "+H).attr("preserveAspectRatio","xMidYMid meet");
    var g=svg.append("g").attr("transform","translate("+m.left+","+m.top+")");
    var gGrid=g.append("g").attr("class","grid-lines");
    var gAxis=g.append("g").attr("class","axis").attr("transform","translate(0,"+height+")");
    g.append("text").attr("class","axis-title").attr("x",width/2).attr("y",height+32).attr("text-anchor","middle").text("Total pedestrians counted");
    var gBars=g.append("g"), gNames=g.append("g"), gVals=g.append("g");

    var palette=(d3.schemeTableau10||[]).concat(d3.schemeSet2||[],d3.schemeSet3||[]);
    var colorMap={}, ci=0;
    function colorFor(n){ if(!(n in colorMap)){colorMap[n]=palette[ci%palette.length]||"#2563eb";ci++;} return colorMap[n]; }

    var timer=null;

    function frame(month){
        var idx=months.indexOf(month);
        monthLabel.text(month);
        progress.style("width",((idx+1)/months.length*100)+"%");

        var rows=d3.rollups(data.filter(function(d){return d.Month===month;}),
            function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Sensor_Name;})
            .map(function(d){return {sensor:d[0],count:d[1]};})
            .sort(function(a,b){return b.count-a.count;}).slice(0,8);
        rows.forEach(function(d,i){d.rank=i;});
        var monthTotal=d3.sum(rows,function(d){return d.count;});
        totalLabel.text("Top 8 total: "+fmtCount(monthTotal));

        var x=d3.scaleLinear().domain([0,d3.max(rows,function(d){return d.count;})||1]).nice().range([0,width]);
        var T=d3.transition().duration(700).ease(d3.easeCubicInOut);
        var yOf=function(d){return d.rank*rowH;};
        var leaderName = rows.length ? rows[0].sensor : null;

        gGrid.transition(T).call(d3.axisTop(x).ticks(5).tickSize(-height).tickFormat("")).selection().select(".domain").remove();
        gAxis.transition(T).call(d3.axisBottom(x).ticks(5).tickFormat(fmtSI));

        var bars=gBars.selectAll("rect").data(rows,function(d){return d.sensor;});
        bars.exit().transition(T).attr("width",0).style("opacity",0).remove();
        bars.enter().append("rect").attr("rx",3).attr("x",0).attr("height",rowH-10)
                .attr("y",function(d){return yOf(d);}).attr("width",0)
            .merge(bars).transition(T)
                .attr("y",function(d){return yOf(d);}).attr("height",rowH-10)
                .attr("fill",function(d){return colorFor(d.sensor);})
                .attr("stroke",function(d){return d.sensor===leaderName?"#1a2330":"none";})
                .attr("stroke-width",function(d){return d.sensor===leaderName?2:0;})
                .attr("width",function(d){return x(d.count);});

        var names=gNames.selectAll("text").data(rows,function(d){return d.sensor;});
        names.exit().remove();
        names.enter().append("text").attr("text-anchor","end").attr("x",-10).style("font-size","12px").style("fill","#1a2330")
                .attr("y",function(d){return yOf(d)+(rowH-10)/2+4;}).text(function(d){return d.sensor;})
            .merge(names).transition(T).attr("y",function(d){return yOf(d)+(rowH-10)/2+4;})
                .style("font-weight",function(d){return d.sensor===leaderName?"bold":"normal";})
                .text(function(d){return d.sensor;});

        var vals=gVals.selectAll("text").data(rows,function(d){return d.sensor;});
        vals.exit().remove();
        vals.enter().append("text").attr("class","value-label").attr("data-v",0).attr("y",function(d){return yOf(d)+(rowH-10)/2+4;})
            .merge(vals).transition(T)
                .attr("x",function(d){return x(d.count)+8;}).attr("y",function(d){return yOf(d)+(rowH-10)/2+4;})
                .tween("text",function(d){var self=d3.select(this);
                    var i=d3.interpolateNumber(+(self.attr("data-v")||0),d.count);
                    return function(t){self.attr("data-v",i(t));self.text(fmtSI(i(t)));};});

        if(rows.length) setInsight("#insight8","In <b>"+month+"</b>, <b>"+rows[0].sensor+"</b> leads with <b>"+fmtCount(rows[0].count)+"</b> pedestrians. Press play to watch the ranking shift across the year.");
    }

    function stop(){clearInterval(timer);timer=null;playBtn.text("\u25B6 Play");}
    playBtn.on("click",function(){
        if(timer){stop();return;}
        playBtn.text("\u275A\u275A Pause");
        timer=setInterval(function(){var next=(months.indexOf(monthLabel.text())+1)%months.length;frame(months[next]);},1400);
    });
    replayBtn.on("click",function(){stop();frame(months[0]);});
    frame(months[0]);
}
