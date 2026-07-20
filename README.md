# BIMP-EAGA Border Imagery Viewer

A lightweight browser-based geospatial viewer for exploring border-monitoring detection results within the Brunei-Sarawak Area of Interest.

The application displays postprocessed GeoTIFF detection layers, supports temporal comparison, and allows analysts to toggle between deforestation and infrastructure results.

## Features

- Satellite, street, and dark basemaps
- BIMP-EAGA Area of Interest overlay
- Lazy-loaded GeoTIFF datasets
- Deforestation detection layers
- Infrastructure detection layer
- Layer visibility controls
- Grouped imagery catalogue
- Searchable datasets
- GeoTIFF manual import
- Before-and-after temporal comparison
- Swipe comparison control
- Layer opacity adjustment
- Responsive interface
- Missing-file and loading messages

## Technology

- HTML
- CSS
- JavaScript
- Leaflet
- GeoRaster
- GeoRaster Layer for Leaflet
- GeoTIFF

External libraries are loaded through CDN references in `index.html`.

## Project Structure

```text
BIMP-EAGA/
│
├── assets/
│
├── data/
│   ├── aoi/
│   │   └── POC_Border.geojson
│   │
│   └── postprocessing/
│       ├── LogDetMask_Nov-Dec.tif
│       ├── LogDetMask_Dec-Jan.tif
│       ├── LogDetMask_Jan-Feb.tif
│       ├── LogDetMask_Feb-Mar.tif
│       ├── LogDetMask_Mar-Apr.tif
│       ├── LogDetMask_Nov-Apr.tif
│       └── InfraDet_NovApr_v3.tif
│
├── app.js
├── index.html
├── styles.css
├── .gitignore
└── README.md