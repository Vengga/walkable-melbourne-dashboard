/* ============================================================
   Walkable Melbourne — controller (Group TT7L_G9)
   ============================================================ */

var fullData = [];
var basemap = (typeof MELBOURNE_GEO !== "undefined") ? MELBOURNE_GEO : null;
var activityBand = {};   // sensor name -> "High" | "Medium" | "Low"

var monthOrder = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
var shortMonth = {January:"Jan",February:"Feb",March:"Mar",April:"Apr",May:"May",June:"Jun",
    July:"Jul",August:"Aug",September:"Sep",October:"Oct",November:"Nov",December:"Dec"};
var dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
var dayShort = {Monday:"Mon",Tuesday:"Tue",Wednesday:"Wed",Thursday:"Thu",Friday:"Fri",Saturday:"Sat",Sunday:"Sun"};

var seasonOf = {December:"Summer",January:"Summer",February:"Summer",
    March:"Autumn",April:"Autumn",May:"Autumn",
    June:"Winter",July:"Winter",August:"Winter",
    September:"Spring",October:"Spring",November:"Spring"};
var seasonColor = {Summer:"#f59e0b",Autumn:"#ea580c",Winter:"#2563eb",Spring:"#16a34a"};

var fmtInt = d3.format(",");
var fmtSI  = d3.format(".2s");
function fmtCount(n){return fmtInt(Math.round(n));}
function pct(n){return d3.format(".0%")(n);}

/* ---------- Load data ---------- */
d3.csv("data/melbourne_pedestrian_dashboard.csv").then(function(data){
    data.forEach(function(d){
        d.Year=+d.Year; d.Mdate=+d.Mdate; d.Time=+d.Time; d.Sensor_ID=+d.Sensor_ID;
        d.Hourly_Counts=+d.Hourly_Counts; d.latitude=+d.latitude; d.longitude=+d.longitude;
        d.Month=String(d.Month).trim(); d.Day=String(d.Day).trim();
        d.Sensor_Name=String(d.Sensor_Name).trim(); d.status=String(d.status).trim();
    });
    fullData = data;
    computeActivityBands(fullData);
    console.log("Loaded", data.length, "rows; basemap:", basemap?"embedded":"none");
    setupSlicers(fullData);
    updateDashboard();
}).catch(function(err){
    console.error("Load error:",err);
    d3.selectAll(".chart").html('<p class="empty">Could not load the dataset. Serve the folder with Live Server, not file://.</p>');
});

/* ---------- Activity bands: derived from each sensor's own total counts ---------- */
function computeActivityBands(data){
    var totals=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Sensor_Name;})
        .map(function(d){return {sensor:d[0],total:d[1]};})
        .sort(function(a,b){return b.total-a.total;});
    var vals=totals.map(function(d){return d.total;});
    var t1=d3.quantile(vals,2/3), t2=d3.quantile(vals,1/3);
    totals.forEach(function(d){
        activityBand[d.sensor] = d.total>=t1 ? "High" : (d.total>=t2 ? "Medium" : "Low");
    });
}

/* ---------- Slicers ---------- */
function setupSlicers(data){
    var years=Array.from(new Set(data.map(function(d){return d.Year;}))).sort(function(a,b){return a-b;});
    fill("#year-filter","yo",years,years);
    var months=Array.from(new Set(data.map(function(d){return d.Month;}))).sort(function(a,b){return monthOrder.indexOf(a)-monthOrder.indexOf(b);});
    fill("#month-filter","mo",months,months);
    var days=dayOrder.filter(function(d){return data.some(function(r){return r.Day===d;});});
    fill("#day-filter","do",days,days);
    var hours=Array.from(new Set(data.map(function(d){return d.Time;}))).sort(function(a,b){return a-b;});
    fill("#hour-filter","ho",hours,hours.map(function(h){return (h<10?"0"+h:h)+":00";}));
    var sensors=Array.from(new Set(data.map(function(d){return d.Sensor_Name;}))).sort();
    fill("#sensor-filter","so",sensors,sensors);

    d3.selectAll("#year-filter,#month-filter,#day-filter,#hour-filter,#activity-filter,#sensor-filter").on("change",updateDashboard);
    d3.select("#reset-filters").on("click",resetSlicers);
}
function fill(sel,cls,vals,labs){
    d3.select(sel).selectAll("option."+cls).data(vals).enter().append("option")
        .attr("class",cls).attr("value",function(d){return d;}).text(function(d,i){return labs[i];});
}

function getFiltered(){
    var y=d3.select("#year-filter").property("value");
    var m=d3.select("#month-filter").property("value");
    var dy=d3.select("#day-filter").property("value");
    var hr=d3.select("#hour-filter").property("value");
    var act=d3.select("#activity-filter").property("value");
    var s=d3.select("#sensor-filter").property("value");
    var out=fullData;
    if(y!=="all")   out=out.filter(function(d){return d.Year===+y;});
    if(m!=="all")   out=out.filter(function(d){return d.Month===m;});
    if(dy!=="all")  out=out.filter(function(d){return d.Day===dy;});
    if(hr!=="all")  out=out.filter(function(d){return d.Time===+hr;});
    if(act!=="all") out=out.filter(function(d){return activityBand[d.Sensor_Name]===act;});
    if(s!=="all")   out=out.filter(function(d){return d.Sensor_Name===s;});
    return out;
}

/* ---------- Linked interaction ---------- */
function selectSensor(name){
    var sel=d3.select("#sensor-filter");
    sel.property("value", sel.property("value")===name ? "all" : name);
    updateDashboard();
}
function highlightSensor(name){
    d3.selectAll("[data-sensor]").classed("dim",true);
    d3.selectAll('[data-sensor="'+cssEsc(name)+'"]').classed("dim",false).classed("hl",true);
}
function clearHighlight(){d3.selectAll("[data-sensor]").classed("dim",false).classed("hl",false);}
function cssEsc(s){return (window.CSS&&CSS.escape)?CSS.escape(s):String(s).replace(/["\\]/g,"\\$&");}

function resetSlicers(){
    d3.selectAll("#year-filter,#month-filter,#day-filter,#hour-filter,#activity-filter,#sensor-filter").property("value","all");
    updateDashboard();
}

function updateActiveFilters(){
    var defs=[["#year-filter","Year"],["#month-filter","Month"],["#day-filter","Day"],
              ["#hour-filter","Hour"],["#activity-filter","Activity"],["#sensor-filter","Sensor"]];
    var box=d3.select("#active-filters").html(""); var any=false;
    defs.forEach(function(f){
        var v=d3.select(f[0]).property("value");
        if(v==="all") return; any=true;
        var label = f[1]==="Hour" ? ((+v<10?"0"+v:v)+":00") : v;
        var chip=box.append("span").attr("class","chip");
        chip.append("span").text(label);
        chip.append("button").attr("type","button").attr("aria-label","Remove "+f[1]+" filter").html("&times;")
            .on("click",function(){d3.select(f[0]).property("value","all");updateDashboard();});
    });
    d3.select("#reset-filters").attr("hidden",any?null:true);
}

/* ---------- Render all ---------- */
function updateDashboard(){
    var data=getFiltered();
    updateKPIs(data);
    updateActiveFilters();
    safeRender(renderChart7SensorMap,data,"#chart7");
    safeRender(renderChart1TopLocations,data,"#chart1");
    safeRender(renderChart2MonthlyActivity,data,"#chart2");
    safeRender(renderChart4YearlyTrend,data,"#chart4");
    safeRender(renderChart3WeekdayWeekend,data,"#chart3");
    safeRender(renderChart5DayHourHeatmap,data,"#chart5");
    safeRender(renderChart6SensorComparison,data,"#chart6");
    safeRender(renderChart8AnimatedMonthly,data,"#chart8");
}
function safeRender(fn,data,id){
    try{ if(typeof fn==="function") fn(data);
         else d3.select(id).html('<p class="empty">Chart module not loaded.</p>'); }
    catch(e){ console.error("Error in "+id+":",e);
              d3.select(id).html('<p class="empty">This chart could not be drawn. See the browser console.</p>'); }
}

/* ---------- KPIs ---------- */
function updateKPIs(data){
    d3.select("#kpi-records").text(fmtInt(data.length));
    var total=d3.sum(data,function(d){return d.Hourly_Counts;});
    d3.select("#kpi-count").text(fmtInt(total));
    d3.select("#kpi-sensors").text(new Set(data.map(function(d){return d.Sensor_ID;})).size);
    if(!data.length){
        ["#kpi-period","#kpi-busiest","#kpi-peakhour","#kpi-busyday","#kpi-weekend"].forEach(function(i){d3.select(i).text("\u2014");});
        return;
    }
    var minY=d3.min(data,function(d){return d.Year;}), maxY=d3.max(data,function(d){return d.Year;});
    d3.select("#kpi-period").text(minY===maxY?minY:minY+" to "+maxY);
    var byLoc=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Sensor_Name;}).sort(function(a,b){return b[1]-a[1];});
    d3.select("#kpi-busiest").text(byLoc[0][0]);
    var byHour=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Time;}).sort(function(a,b){return b[1]-a[1];});
    var ph=byHour[0][0]; d3.select("#kpi-peakhour").text((ph<10?"0"+ph:ph)+":00");
    var byDay=d3.rollups(data,function(v){return d3.sum(v,function(d){return d.Hourly_Counts;});},function(d){return d.Day;}).sort(function(a,b){return b[1]-a[1];});
    d3.select("#kpi-busyday").text(byDay[0][0]);
    var wknd=d3.sum(data.filter(function(d){return d.Day==="Saturday"||d.Day==="Sunday";}),function(d){return d.Hourly_Counts;});
    d3.select("#kpi-weekend").text(total?pct(wknd/total):"\u2014");
}

function setInsight(id,html){ d3.select(id).html(html); }

/* ---------- Tooltip ---------- */
function showTooltip(event,html){
    d3.select("#tooltip").style("opacity",1).html(html)
        .style("left",(event.clientX+14)+"px").style("top",(event.clientY+14)+"px");
}
function moveTooltip(event){ d3.select("#tooltip").style("left",(event.clientX+14)+"px").style("top",(event.clientY+14)+"px"); }
function hideTooltip(){ d3.select("#tooltip").style("opacity",0); }
function emptyState(id,msg){ d3.select(id).html('<p class="empty">'+(msg||"No data for the current slicers.")+"</p>"); }
