# Walkable Melbourne. Interactive Pedestrian Mobility Dashboard

CDS6324 Data Visualization. Group TT7L_G9. SDG 11: Sustainable Cities and Communities.

**Live dashboard:** https://walkable-melbourne-dashboard.netlify.app/

| Member | Student ID |
|---|---|
| Venggadanaathan A/L K. Salvam | 1231303562 |
| Pavithira Saravanan | 1211110400 |
| Tharraniah Tamilwanan | 1211111799 |

Lecturer: Dr. Alandoli Mohammed Nasser Mohammed. Lecture TC3L. Tutorial TT7L.

An interactive D3.js dashboard exploring pedestrian activity across Melbourne, 2009 to 2022,
built from the City of Melbourne Pedestrian Counting System.

## View it online

The easiest way to see the dashboard, with the full dataset already loaded, is the live link:
https://walkable-melbourne-dashboard.netlify.app/

Allow a few seconds on first load, since it fetches the full dataset.

## Run it locally

1. Download the dataset `melbourne_pedestrian_dashboard.csv` from the
   [Releases page](https://github.com/Vengga/walkable-melbourne-dashboard/releases)
   and place it inside the `data` folder.
2. Open the project folder in Visual Studio Code.
3. Install the "Live Server" extension by Ritwick Dey.
4. Right click `index.html` and choose "Open with Live Server".
5. The dashboard opens in your browser (for example at http://127.0.0.1:5500).

Do not open `index.html` directly with a double click. The browser blocks the dataset from
loading over `file://`, so the page must be served over HTTP by Live Server. An internet
connection is needed on first load because D3 v7 is fetched from a CDN. The Melbourne basemap
geometry is embedded in `js/melbourne_geo.js`, so no external map file is required.

## Structure

```
index.html                    page structure, slicers, KPI cards, chart grid
css/style.css                 Arial dashboard theme, two column tile layout
js/melbourne_geo.js           embedded Melbourne suburb geometry (basemap)
js/main.js                    data load, slicers, KPIs, linked interactions
js/chart1_top_locations.js    top 10 locations (bars, colour by volume)
js/chart2_monthly_activity.js monthly (bars coloured by season)
js/chart3_weekday_weekend.js  weekday vs weekend (donut, share of volume)
js/chart4_yearly_trend.js     yearly trend (line, dashed gap years)
js/chart5_day_hour_heatmap.js day by hour heatmap (colour legend)
js/chart6_sensor_comparison.js grouped bar, weekday vs weekend per sensor
js/chart7_sensor_map.js       hotspot map on the Melbourne suburb basemap
js/chart8_animated_monthly.js animated monthly bar chart race
data/                         place melbourne_pedestrian_dashboard.csv here
```

## Analytical questions

1. Which Melbourne locations experience the highest pedestrian activity, and where are these hotspots located?
2. How do pedestrian volumes vary across years, months, weekdays, and hours of the day?
3. Which sensor locations show increasing or decreasing pedestrian movement over time?
4. How do weekday and weekend pedestrian patterns differ across Melbourne's urban spaces?

## Interactivity

Hover tooltips on every mark. Six slicers: year, month, day of week, hour, activity level, and
sensor. Zoom and pan on the hotspot map. Linked interactions: hovering a sensor highlights it
across charts, and clicking any bar or map point filters the whole dashboard to that sensor.
Animation: Chart 8 is a bar chart race with play, pause, and replay.

The activity level slicer groups sensors into High, Medium, and Low bands derived directly from
each sensor's own total pedestrian counts using count tertiles. This is a transparent
reclassification of the data, not an invented metric.

## Data

City of Melbourne Pedestrian Counting System, hourly counts joined with sensor locations on
Sensor_ID. 888,425 hourly records, 60 sensors, 2009 to 2022. Years 2015 to 2018 and 2020 to
2021 are absent from the source and shown as a dashed gap in the yearly trend. Basemap:
Melbourne suburb boundaries (click_that_hood, ODbL). Counts are raw tallies and are not
adjusted for sensor downtime.

## Contributors

- Venggadanaathan A/L K. Salvam (1231303562)
- Pavithira Saravanan (1211110400)
- Tharraniah Tamilwanan (1211111799)
