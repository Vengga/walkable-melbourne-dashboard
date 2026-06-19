# Walkable Melbourne. Interactive Pedestrian Mobility Dashboard

CDS6324 Data Visualization. Group TT7L_G9. SDG 11: Sustainable Cities and Communities.

| Member | Student ID |
|---|---|
| Venggadanaathan A/L K. Salvam | 1231303562 |
| Pavithira Saravanan | 1211110400 |
| Tharraniah Tamilwanan | 1211111799 |

Lecturer: Dr. Alandoli Mohammed Nasser Mohammed. Lecture TC3L. Tutorial TT7L.

An interactive D3.js dashboard exploring pedestrian activity across Melbourne, 2009 to 2022,
built from the City of Melbourne Pedestrian Counting System.

## How to run

The dashboard loads the dataset with d3.csv, so it must be served over HTTP. Opening
index.html directly with file:// is blocked by the browser.

VS Code and Live Server: open the folder, install the Live Server extension, right click
index.html, then choose Open with Live Server.

Python alternative: run `python -m http.server 8000` and open http://localhost:8000.

An internet connection is needed on first load because D3 v7 is fetched from a CDN. The
dataset and the Melbourne basemap are local. The basemap geometry is embedded in
js/melbourne_geo.js, so the map works without any external map file.

## Structure

```
TT7L_G9_D3_Dashboard/
  index.html
  css/style.css
  js/
    melbourne_geo.js          embedded Melbourne suburb geometry (basemap)
    main.js                   data load, slicers, KPIs, linked interactions
    chart1_top_locations.js   top 10 locations (bars, colour by volume)
    chart2_monthly_activity.js monthly (bars coloured by season)
    chart3_weekday_weekend.js weekday vs weekend (donut, share of volume)
    chart4_yearly_trend.js    yearly trend (line, dashed gap years)
    chart5_day_hour_heatmap.js day by hour heatmap (colour legend)
    chart6_sensor_comparison.js grouped bar, weekday vs weekend per sensor
    chart7_sensor_map.js      hotspot map on the Melbourne suburb basemap
    chart8_animated_monthly.js animated monthly bar chart race
  data/
    melbourne_pedestrian_dashboard.csv   your dataset (888,425 rows)
```

## Analytical questions

1. Which Melbourne locations experience the highest pedestrian activity, and where are these hotspots located?
2. How do pedestrian volumes vary across years, months, weekdays, and hours of the day?
3. Which sensor locations show increasing or decreasing pedestrian movement over time?
4. How do weekday and weekend pedestrian patterns differ across Melbourne's urban spaces?

Each chart card on the dashboard states which question it addresses.

## Interactivity

Hover tooltips on every mark. Six slicers: year, month, day of week, hour, activity level,
and sensor. Zoom and pan on the hotspot map. Linked interactions: hovering a sensor
highlights it across charts, and clicking any bar or map point filters the whole dashboard
to that sensor. Animation: Chart 8 is a bar chart race with play, pause, and replay.

The activity level slicer groups sensors into High, Medium, and Low bands. These bands are
derived directly from each sensor's own total pedestrian counts using count tertiles, so the
classification is a transparent reclassification of the data and not an invented metric.

## Design principles applied

Tufte graphical integrity: marks proportional to data, bars start at zero, missing years
drawn dashed. Cole Nussbaumer four concepts: affordances, accessibility, aesthetics, and
acceptance. Shaffer four C's: clear, clean, concise, captivating. Every graphic variable is
explained by a legend or a direct value label.

## SDG 11 and Malaysia

The dashboard includes a panel relating the findings to SDG 11 and to the Malaysian context,
drawing on the Kuala Lumpur City Plan walkable district actions and on walkability studies of
pedestrian access to Light Rail Transit stations in the Kuala Lumpur City Centre and the
Klang Valley.

## Data and submission note

City of Melbourne Pedestrian Counting System, hourly counts joined with sensor locations on
Sensor_ID. 888,425 hourly records, 60 sensors, 2009 to 2022. Years 2015 to 2018 and 2020 to
2021 are absent from the source and shown as a dashed gap in the yearly trend. The dataset is
about 128 MB, which exceeds the 2 MB submission zip limit, so confirm with the lecturer
whether code is submitted by GitHub link with the report in the 2 MB zip.
