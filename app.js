// =========================================================
// BIMP-EAGA BORDER IMAGERY VIEWER
// =========================================================


// =========================
// MAP CONFIGURATION
// =========================

const MAP_CONFIG = {

  initialCenter: [
    4.65,
    114.85
  ],

  initialZoom: 9,

  minZoom: 3,

  maxZoom: 19,

  projectBounds: [
    [
      4.05,
      113.95
    ],
    [
      5.15,
      115.55
    ]
  ]

};


// =========================
// APPLICATION STATE
// =========================

let currentBasemapIndex = 0;

let activeBasemap = null;

let aoiLayer = null;

let detectionLocationsLayer = null;

let siteIntelligenceDialog = null;

let activeImageryLayer = null;

let comparisonBeforeLayer = null;

let comparisonAfterLayer = null;

let comparisonRenderRequestId = 0;

let previouslyVisibleDatasetIds = [];

let activeImageryId = null;

let pendingGeoTiffFile = null;

let toastTimeout = null;

const imageryDatasets = [];

let activeWorkspaceMode = "imagery";

let sensorLocationsLayer = null;


// =========================
// BASEMAP DEFINITIONS
// =========================

const basemaps = [

  {
    id: "satellite",

    name: "Satellite",

    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/" +
      "World_Imagery/MapServer/tile/{z}/{y}/{x}",

    options: {
      attribution:
        "Tiles &copy; Esri",

      maxZoom:
        19
    }
  },

  {
    id: "dark",

    name: "Dark",

    url:
      "https://{s}.basemaps.cartocdn.com/" +
      "dark_all/{z}/{x}/{y}{r}.png",

    options: {
      attribution:
        "&copy; OpenStreetMap contributors &copy; CARTO",

      subdomains:
        "abcd",

      maxZoom:
        20
    }
  },

  {
    id: "street",

    name: "Street",

    url:
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    options: {
      attribution:
        "&copy; OpenStreetMap contributors",

      maxZoom:
        19
    }
  }

];

const POSTPROCESSING_DATASETS = [

  {
    name:
      "Deforestation Nov to Dec",

    periodLabel:
      "Nov 2025 Dec 2025",

    startDate:
      "2025-11-01",

    endDate:
      "2025-12-01",

    filename:
      "LogDetMask_Nov-Dec.tif"
  },

  {
    name:
      "Deforestation Dec to Jan",

    periodLabel:
      "Dec 2025 Jan 2026",

    startDate:
      "2025-12-01",

    endDate:
      "2026-01-01",

    filename:
      "LogDetMask_Dec-Jan.tif"
  },

  {
    name:
      "Deforestation Jan to Feb",

    periodLabel:
      "Jan 2026 Feb 2026",

    startDate:
      "2026-01-01",

    endDate:
      "2026-02-01",

    filename:
      "LogDetMask_Jan-Feb.tif"
  },

  {
    name:
      "Deforestation Feb to Mar",

    periodLabel:
      "Feb 2026 Mar 2026",

    startDate:
      "2026-02-01",

    endDate:
      "2026-03-01",

    filename:
      "LogDetMask_Feb-Mar.tif"
  },

  {
    name:
      "Deforestation Mar to Apr",

    periodLabel:
      "Mar 2026 Apr 2026",

    startDate:
      "2026-03-01",

    endDate:
      "2026-04-01",

    filename:
      "LogDetMask_Mar-Apr.tif"
  },

  {
    name:
      "Deforestation Overall",

    periodLabel:
      "Nov 2025 Apr 2026",

    startDate:
      "2025-11-01",

    endDate:
      "2026-04-01",

    filename:
      "LogDetMask_Nov-Apr.tif"
  },

    {
    name:
      "Infrastructure Detection Overall",

    periodLabel:
      "Nov 2025 Apr 2026",

    startDate:
      "2025-11-01",

    endDate:
      "2026-04-01",

    filename:
      "InfraDet_NovApr_v3.tif",

    source:
      "LC60 / Sentinel-1 VV",

    category:
      "Infrastructure",

    color:
      "rgba(0, 220, 255, 0.95)",

    comparisonEligible:
      false
  }

];

const DETECTION_LOCATIONS = [

  {
    id: "DEF-01",
    category: "Deforestation",
    name: "Site 1",
    latitude: 4.7933832,
    longitude: 115.2248101,
    periodLabel: "Nov 2025 – Apr 2026",
    detectedAreaHa: 28.33,

    images: {
    before: "./assets/sites/def-01/before.jpg",
    after: "./assets/sites/def-01/after.jpg",
    detection: "./assets/sites/def-01/detection.jpg"
  },

  monthlyChanges: [
    {
      period: "Nov 2025 – Dec 2025",
      image: "./assets/sites/def-01/monthly/nov-dec.jpg"
    },
    {
      period: "Dec 2025 – Jan 2026",
      image: "./assets/sites/def-01/monthly/dec-jan.jpg"
    },
    {
      period: "Jan 2026 – Feb 2026",
      image: "./assets/sites/def-01/monthly/jan-feb.jpg"
    },
    {
      period: "Feb 2026 – Mar 2026",
      image: "./assets/sites/def-01/monthly/feb-mar.jpg"
    },
    {
      period: "Mar 2026 – Apr 2026",
      image: "./assets/sites/def-01/monthly/mar-apr.jpg"
    }
  ],

  monthlyInsights: [
    "Clearing activity is rapidly advancing across the monitoring period.",
    "Persistent change during every monthly interval indicates sustained human intervention."
  ],

  analysis: [
      {
        title: "Pattern of Life",
        text: "Persistent and evolving land disturbance was observed between November 2025 and April 2026."
      },
      {
        title: "Ongoing Activity",
        text: "Changes indicate continued earthworks, excavation or site reorganisation."
      },
      {
        title: "Access Pattern",
        text: "Direct connection to Jalan Labu supports regular vehicle and machinery movement."
      },
      {
        title: "Operational Footprint",
        text: "Internal tracks, exposed soil and possible material-storage zones remain visible."
      },
      {
        title: "Environmental Impact",
        text: "Clearing has fragmented the surrounding forest and increased edge disturbance."
      },
      {
        title: "Assessment",
        text: "The pattern is consistent with sustained human-driven activity. Field verification is required to confirm its purpose and legal status."
      }
    ]
  },

  {
    id: "DEF-02",
    category: "Deforestation",
    name: "Site 2",
    latitude: 4.7810683,
    longitude: 115.2439975,
    periodLabel: "Nov 2025 – Apr 2026",
    detectedAreaHa: 14.35,

      images: {
      before: "./assets/sites/def-02/before.jpg",
      after: "./assets/sites/def-02/after.jpg",
      detection: "./assets/sites/def-02/detection.jpg"
    },

    monthlyChanges: [
      {
        period: "Nov 2025 – Dec 2025",
        image: "./assets/sites/def-02/monthly/nov-dec.jpg"
      },
      {
        period: "Dec 2025 – Jan 2026",
        image: "./assets/sites/def-02/monthly/dec-jan.jpg"
      },
      {
        period: "Jan 2026 – Feb 2026",
        image: "./assets/sites/def-02/monthly/jan-feb.jpg"
      },
      {
        period: "Feb 2026 – Mar 2026",
        image: "./assets/sites/def-02/monthly/feb-mar.jpg"
      },
      {
        period: "Mar 2026 – Apr 2026",
        image: "./assets/sites/def-02/monthly/mar-apr.jpg"
      }
    ],

    monthlyInsights: [
      "A substantial proportion of the detected changes occurred along the roadside.",
      "Persistent activity throughout the monitoring period indicates continuous work at the site."
    ],

    analysis: [
      {
        title: "Land-Clearing Pattern",
        text: "New deliberate clearing is directly connected to the existing road network, indicating rapid expansion of logistical or extraction operations."
      },
      {
        title: "Road Association",
        text: "The detected clearing closely follows the road rather than appearing randomly distributed."
      },
      {
        title: "Likely Activity",
        text: "The bundled detections extending away from the road are consistent with possible resource extraction and machinery access."
      },
      {
        title: "Verification Requirement",
        text: "Cross-reference the footprint against authorised land-use, infrastructure-expansion and extraction permits."
      }
    ]
  },

  {
    id: "DEF-03",
    category: "Deforestation",
    name: "Site 3",
    latitude: 4.7559049,
    longitude: 115.2562655,
    periodLabel: "Nov 2025 – Apr 2026",
    detectedAreaHa: 9.06,

    images: {
      before: "./assets/sites/def-03/before.jpg",
      after: "./assets/sites/def-03/after.jpg",
      detection: "./assets/sites/def-03/detection.jpg"
    },

    monthlyChanges: [
      {
        period:
          "Nov 2025 – Dec 2025",

        image:
          "./assets/sites/def-03/monthly/nov-dec.jpg"
      },
      {
        period:
          "Dec 2025 – Jan 2026",

        image:
          "./assets/sites/def-03/monthly/dec-jan.jpg"
      },
      {
        period:
          "Jan 2026 – Feb 2026",

        image:
          "./assets/sites/def-03/monthly/jan-feb.jpg"
      },
      {
        period:
          "Feb 2026 – Mar 2026",

        image:
          "./assets/sites/def-03/monthly/feb-mar.jpg"
      },
      {
        period:
          "Mar 2026 – Apr 2026",

        image:
          "./assets/sites/def-03/monthly/mar-apr.jpg"
      }
    ],

    monthlyInsights: [
      "The most substantial change occurred during the final monitoring interval, from March to April 2026.",
      "The concentrated increase in detected clearing indicates major human intervention at the site."
    ],

    analysis: [
      {
        title: "Scale and Logistics",
        text: "The clearing and construction of a dedicated road indicate the use of heavy machinery, significant manpower and organised logistics."
      },
      {
        title: "Future Expansion",
        text: "The access road may act as a logistical artery, leaving surrounding forest vulnerable to deeper exploitation."
      },
      {
        title: "Total Canopy Loss",
        text: "The pattern resembles a complete clear-cut event rather than selective logging within the targeted block."
      },
      {
        title: "Erosion and Runoff",
        text: "Exposed soil presents an immediate erosion and sediment-runoff risk to nearby water sources during heavy rainfall."
      },
      {
        title: "Possible Purpose",
        text: "Possible scenarios include a large-scale agricultural plantation or a secure fenced compound."
      },
      {
        title: "Verification Requirement",
        text: "Check agricultural, logging, mining and land-use concessions associated with these coordinates."
      }
    ]
  },

  {
    id: "DEF-04",
    category: "Deforestation",
    name: "Site 4",
    latitude: 4.7536647,
    longitude: 115.2853193,
    periodLabel: "Nov 2025 – Apr 2026",
    detectedAreaHa: 6.76,

    images: {
      before: "./assets/sites/def-04/before.jpg",
      after: "./assets/sites/def-04/after.jpg",
      detection: "./assets/sites/def-04/detection.jpg"
    },

    monthlyChanges: [
      {
        period:
          "Nov 2025 – Dec 2025",

        image:
          "./assets/sites/def-04/monthly/nov-dec.jpg"
      },
      {
        period:
          "Dec 2025 – Jan 2026",

        image:
          "./assets/sites/def-04/monthly/dec-jan.jpg"
      },
      {
        period:
          "Jan 2026 – Feb 2026",

        image:
          "./assets/sites/def-04/monthly/jan-feb.jpg"
      },
      {
        period:
          "Feb 2026 – Mar 2026",

        image:
          "./assets/sites/def-04/monthly/feb-mar.jpg"
      },
      {
        period:
          "Mar 2026 – Apr 2026",

        image:
          "./assets/sites/def-04/monthly/mar-apr.jpg"
      }
    ],

    monthlyInsights: [
      "Similar to Site 3, most of the detected activity occurred during the final monitoring interval.",
      "The sharp increase from March to April 2026 indicates rapid expansion of clearing works."
    ],

    analysis: [
      {
        title: "Current State",
        text: "Significant tracts of bare earth have appeared along the pre-existing northeast road and are branching from established trails."
      },
      {
        title: "Scaling Operations",
        text: "The irregular and sprawling clearing pattern suggests active resource extraction rather than a geometric construction site."
      },
      {
        title: "Riverine Vulnerability",
        text: "The proximity to the major river increases the risk of sedimentation, runoff and water contamination."
      },
      {
        title: "Assessment",
        text: "The expanding footprint strongly indicates a logging operation extending deeper into the adjacent forest."
      }
    ]
  },

  {
    id: "DEF-05",
    category: "Deforestation",
    name: "Site 5",
    latitude: 4.7260246,
    longitude: 115.2867689,
    periodLabel: "Nov 2025 – Apr 2026",
    detectedAreaHa: 6.98,

    images: {
      before: "./assets/sites/def-05/before.jpg",
      after: "./assets/sites/def-05/after.jpg",
      detection: "./assets/sites/def-05/detection.jpg"
    },

     monthlyChanges: [
      {
        period:
          "Nov 2025 – Dec 2025",

        image:
          "./assets/sites/def-05/monthly/nov-dec.jpg"
      },
      {
        period:
          "Dec 2025 – Jan 2026",

        image:
          "./assets/sites/def-05/monthly/dec-jan.jpg"
      },
      {
        period:
          "Jan 2026 – Feb 2026",

        image:
          "./assets/sites/def-05/monthly/jan-feb.jpg"
      },
      {
        period:
          "Feb 2026 – Mar 2026",

        image:
          "./assets/sites/def-05/monthly/feb-mar.jpg"
      },
      {
        period:
          "Mar 2026 – Apr 2026",

        image:
          "./assets/sites/def-05/monthly/mar-apr.jpg"
      }
    ],

    monthlyInsights: [
      "Most of the detected activity occurred during the final monitoring interval, consistent with the pattern observed at Sites 3 and 4.",
      "The spatial pattern suggests expansion of the existing palm oil plantation into the surrounding forest."
    ],

    analysis: [
      {
        title: "Boundary Expansion",
        text: "The estate has expanded to the water's edge, removing the natural forest buffer."
      },
      {
        title: "Sediment Displacement",
        text: "Visible muddy water may indicate severe sediment displacement associated with nearby clearing."
      },
      {
        title: "Maximised Acreage",
        text: "The block-like pattern indicates an organised effort to maximise commercially plantable acreage."
      },
      {
        title: "Chemical Runoff Risk",
        text: "Future agricultural chemicals may enter the regional water supply without the original forest buffer."
      },
      {
        title: "Assessment",
        text: "The pattern is consistent with calculated commercial plantation expansion."
      }
    ]
  },

  {
    id: "DEF-06",
    category: "Deforestation",
    name: "Site 6",
    latitude: 4.6488142,
    longitude: 115.3359824,
    periodLabel: "Nov 2025 – Apr 2026",
    detectedAreaHa: 14.31,

    images: {
      before: "./assets/sites/def-06/before.jpg",
      after: "./assets/sites/def-06/after.jpg",
      detection: "./assets/sites/def-06/detection.jpg"
    },

     monthlyChanges: [
      {
        period:
          "Nov 2025 – Dec 2025",

        image:
          "./assets/sites/def-06/monthly/nov-dec.jpg"
      },
      {
        period:
          "Dec 2025 – Jan 2026",

        image:
          "./assets/sites/def-06/monthly/dec-jan.jpg"
      },
      {
        period:
          "Jan 2026 – Feb 2026",

        image:
          "./assets/sites/def-06/monthly/jan-feb.jpg"
      },
      {
        period:
          "Feb 2026 – Mar 2026",

        image:
          "./assets/sites/def-06/monthly/feb-mar.jpg"
      },
      {
        period:
          "Mar 2026 – Apr 2026",

        image:
          "./assets/sites/def-06/monthly/mar-apr.jpg"
      }
    ],

    monthlyInsights: [
      "The greatest concentration of detected change occurred between February and March 2026.",
      "The purpose of the clearing remains uncertain and may involve agricultural expansion or the establishment of a temporary operational area."
    ],

    analysis: [
      {
        title: "Uncontrolled Expansion",
        text: "The irregular and sprawling pattern suggests targeting of resource veins or high-value timber rather than a planned facility."
      },
      {
        title: "Network Creation",
        text: "The April imagery shows vein-like internal pathways characteristic of repeated heavy logging-machinery movement."
      },
      {
        title: "Environmental Impact",
        text: "Heavy machinery tracks compact the soil, restrict natural regrowth and create a substantial runoff zone."
      },
      {
        title: "Assessment",
        text: "The pattern-of-life strongly indicates a major industrial logging operation."
      }
    ]
  }

];

const SENSOR_LOCATIONS = [
  {
    id: "SNS-001",
    name: "Northern Acoustic Sensor",
    type: "Acoustic Sensor",
    latitude: 4.7892,
    longitude: 115.2298,
    status: "online",
    battery: 87,
    lastCommunication: "2 minutes ago",
    reading: "Normal ambient activity"
  },
  {
    id: "SNS-002",
    name: "Border Vibration Sensor",
    type: "Seismic / Vibration Sensor",
    latitude: 4.7734,
    longitude: 115.2510,
    status: "online",
    battery: 74,
    lastCommunication: "5 minutes ago",
    reading: "Low-level ground vibration"
  },
  {
    id: "SNS-003",
    name: "Eastern Trail Camera",
    type: "Trail Camera",
    latitude: 4.7552,
    longitude: 115.2815,
    status: "warning",
    battery: 31,
    lastCommunication: "18 minutes ago",
    reading: "Motion event detected"
  },
  {
    id: "SNS-004",
    name: "Southern Environment Station",
    type: "Environmental Sensor",
    latitude: 4.7186,
    longitude: 115.2942,
    status: "online",
    battery: 92,
    lastCommunication: "1 minute ago",
    reading: "Rainfall: 1.8 mm/h"
  },
  {
    id: "SNS-005",
    name: "Forest Communications Gateway",
    type: "Monitoring Gateway",
    latitude: 4.6815,
    longitude: 115.3220,
    status: "offline",
    battery: 0,
    lastCommunication: "3 hours ago",
    reading: "Communication unavailable"
  },
  {
    id: "SNS-006",
    name: "River Crossing Monitor",
    type: "Acoustic Sensor",
    latitude: 4.7440,
    longitude: 115.2662,
    status: "online",
    battery: 68,
    lastCommunication: "7 minutes ago",
    reading: "No unusual activity"
  }
];


// =========================
// DOM ELEMENTS
// =========================

const resetViewButton =
  document.getElementById(
    "resetViewButton"
  );

const toggleBasemapButton =
  document.getElementById(
    "toggleBasemapButton"
  );

const zoomToImageryButton =
  document.getElementById(
    "zoomToImageryButton"
  );

const collapseSidebarButton =
  document.getElementById(
    "collapseSidebarButton"
  );

const expandSidebarButton =
  document.getElementById(
    "expandSidebarButton"
  );

const imagerySidebar =
  document.getElementById(
    "imagerySidebar"
  );

const mapCoordinates =
  document.getElementById(
    "mapCoordinates"
  );

const mapZoomLevel =
  document.getElementById(
    "mapZoomLevel"
  );

const geotiffInput =
  document.getElementById(
    "geotiffInput"
  );

const imagerySearchInput =
  document.getElementById(
    "imagerySearchInput"
  );

const imageryList =
  document.getElementById(
    "imageryList"
  );

const datasetCount =
  document.getElementById(
    "datasetCount"
  );

const selectedCount =
  document.getElementById(
    "selectedCount"
  );

const imageryDetailsPanel =
  document.getElementById(
    "imageryDetailsPanel"
  );

const closeDetailsButton =
  document.getElementById(
    "closeDetailsButton"
  );

const detailsTitle =
  document.getElementById(
    "detailsTitle"
  );

const detailsDate =
  document.getElementById(
    "detailsDate"
  );

const detailsFilename =
  document.getElementById(
    "detailsFilename"
  );

const detailsFileSize =
  document.getElementById(
    "detailsFileSize"
  );

const detailsCrs =
  document.getElementById(
    "detailsCrs"
  );

const importDialog =
  document.getElementById(
    "importDialog"
  );

const importForm =
  document.getElementById(
    "importForm"
  );

const closeImportDialogButton =
  document.getElementById(
    "closeImportDialogButton"
  );

const cancelImportButton =
  document.getElementById(
    "cancelImportButton"
  );

const imageryNameInput =
  document.getElementById(
    "imageryNameInput"
  );

const captureDateInput =
  document.getElementById(
    "captureDateInput"
  );

const imagerySourceInput =
  document.getElementById(
    "imagerySourceInput"
  );

const selectedFileName =
  document.getElementById(
    "selectedFileName"
  );

const comparisonToggle =
  document.getElementById(
    "comparisonToggle"
  );

const comparisonSlider =
  document.getElementById(
    "comparisonSlider"
  );

const comparisonSliderValue =
  document.getElementById(
    "comparisonSliderValue"
  );

const opacitySlider =
  document.getElementById(
    "opacitySlider"
  );

const opacitySliderValue =
  document.getElementById(
    "opacitySliderValue"
  );

const comparisonDivider =
  document.getElementById(
    "comparisonDivider"
  );

const beforeImagerySelect =
  document.getElementById(
    "beforeImagerySelect"
  );

const afterImagerySelect =
  document.getElementById(
    "afterImagerySelect"
  );

const swapComparisonButton =
  document.getElementById(
    "swapComparisonButton"
  );

const toast =
  document.getElementById(
    "toast"
  );

const toastMessage =
  document.getElementById(
    "toastMessage"
  );

const comparisonPanel =
  document.getElementById(
    "comparisonPanel"
  );

const minimizeComparisonButton =
  document.getElementById(
    "minimizeComparisonButton"
  );

const aoiOverviewButton =
  document.getElementById(
    "aoiOverviewButton"
  );

const imageryModeButton =
  document.getElementById(
    "imageryModeButton"
  );

const sensorModeButton =
  document.getElementById(
    "sensorModeButton"
  );

const sidebarSectionLabel =
  document.getElementById(
    "sidebarSectionLabel"
  );

const sidebarTitle =
  document.getElementById(
    "sidebarTitle"
  );

const sensorCatalogue =
  document.getElementById(
    "sensorCatalogue"
  );

const sensorList =
  document.getElementById(
    "sensorList"
  );

const sensorCount =
  document.getElementById(
    "sensorCount"
  );


// =========================
// INITIALIZE MAP
// =========================

const map =
  L.map(
    "map",
    {
      center:
        MAP_CONFIG.initialCenter,

      zoom:
        MAP_CONFIG.initialZoom,

      minZoom:
        MAP_CONFIG.minZoom,

      maxZoom:
        MAP_CONFIG.maxZoom,

      zoomControl:
        true,

      attributionControl:
        true,

      preferCanvas:
        true
    }
  );

  map.createPane(
    "comparisonBeforePane"
  );

  map.createPane(
    "comparisonAfterPane"
  );

  map.createPane(
    "detectionLocationsPane"
  );

  map.getPane(
    "comparisonBeforePane"
  ).style.zIndex =
    350;

  map.getPane(
    "comparisonAfterPane"
  ).style.zIndex =
    360;

  map.getPane(
    "detectionLocationsPane"
  ).style.zIndex =
    650;

  L.control
    .scale(
      {
        position:
          "bottomleft",

        metric:
          true,

        imperial:
          false
      }
    )
    .addTo(
      map
    );

    const comparisonMapLabels =
      document.createElement(
        "div"
      );

    comparisonMapLabels.className =
      "comparison-map-labels";

    comparisonMapLabels.hidden =
      true;

    comparisonMapLabels.innerHTML =
      `
        <div class="comparison-map-label before">

          <span>
            Before
          </span>

          <strong id="comparisonBeforeMapName">
            Select imagery
          </strong>

        </div>

        <div class="comparison-map-label after">

          <span>
            After
          </span>

          <strong id="comparisonAfterMapName">
            Select imagery
          </strong>

        </div>
      `;

    map.getContainer()
      .parentElement
      .appendChild(
        comparisonMapLabels
      );

    const comparisonBeforeMapName =
      document.getElementById(
        "comparisonBeforeMapName"
      );

    const comparisonAfterMapName =
      document.getElementById(
        "comparisonAfterMapName"
      );

function createMapLegend() {

  const mapWorkspace =
    map.getContainer()
      .parentElement;

  if (
    !mapWorkspace ||
    mapWorkspace.querySelector(
      ".map-legend"
    )
  ) {

    return;

  }

  const legend =
    document.createElement(
      "aside"
    );

  legend.className =
    "map-legend";

  legend.setAttribute(
    "aria-label",
    "Map legend"
  );

  legend.innerHTML =
    `
      <h2>
        Map Legend
      </h2>

      <div class="map-legend-item">

        <span
          class="map-legend-symbol deforestation"
          aria-hidden="true"
        ></span>

        <span>
          Detected deforestation
        </span>

      </div>

      <div class="map-legend-item">

        <span
          class="map-legend-symbol infrastructure"
          aria-hidden="true"
        ></span>

        <span>
          Detected infrastructure
        </span>

      </div>

      <div class="map-legend-item">

        <span
          class="map-legend-symbol area-of-interest"
          aria-hidden="true"
        ></span>

        <span>
          Area of Interest
        </span>

      </div>

      <div class="map-legend-item">

        <span
          class="map-legend-site-marker"
          aria-hidden="true"
        ></span>

        <span>
          Verified detection site
        </span>

      </div>
    `;

  mapWorkspace.appendChild(
    legend
  );

}

// =========================
// BASEMAP MANAGEMENT
// =========================

function loadBasemap(index) {

  const basemapConfig =
    basemaps[index];

  if (
    activeBasemap
  ) {

    map.removeLayer(
      activeBasemap
    );

  }

  activeBasemap =
    L.tileLayer(
      basemapConfig.url,
      basemapConfig.options
    );

  activeBasemap.addTo(
    map
  );

  activeBasemap.bringToBack();

  toggleBasemapButton.textContent =
    `Basemap: ${basemapConfig.name}`;

}


function switchBasemap() {

  currentBasemapIndex =
    (
      currentBasemapIndex +
      1
    ) %
    basemaps.length;

  loadBasemap(
    currentBasemapIndex
  );

  showToast(
    `${basemaps[currentBasemapIndex].name} basemap activated.`
  );

}


// =========================
// MAP VIEW
// =========================

function resetMapView() {

  if (
    aoiLayer &&
    aoiLayer.getBounds().isValid()
  ) {

    map.fitBounds(
      aoiLayer.getBounds(),
      {
        padding: [
          40,
          40
        ],

        animate:
          true,

        duration:
          0.8
      }
    );

    return;

  }

  map.fitBounds(
    MAP_CONFIG.projectBounds,
    {
      padding: [
        30,
        30
      ],

      animate:
        true,

      duration:
        0.8
    }
  );

}


function openAoiOverview(
  feature
) {

  ensureSiteIntelligenceDialog();

  const aoiArea =
    feature?.properties?.Area;

  const aoiAreaLabel =
    typeof aoiArea === "number"
      ? `${aoiArea.toFixed(2)} km²`
      : "Not available";

  siteIntelligenceDialog.innerHTML =
    `
      <article
        class="
          site-intelligence-modal
          aoi-overview-modal
        "
      >

        <header class="site-intelligence-header">

          <div>

            <span class="site-category-badge">
              AOI Overview
            </span>

            <h2>
              Deforestation Detection
            </h2>

            <p>
              Brunei–Sarawak Border ·
              November 2025–April 2026
            </p>

          </div>

          <button
            class="site-intelligence-close"
            type="button"
            aria-label="Close AOI overview"
          >
            &times;
          </button>

        </header>

        <div class="aoi-overview-body">

          <section class="aoi-overview-visual">

            <div class="site-section-heading">

              <div>
                <span>Detection Coverage</span>

                <h3>
                  Whole Area of Interest
                </h3>
              </div>

              <span class="site-period-badge">
                Nov 2025 – Apr 2026
              </span>

            </div>

            <figure class="site-image-card">

              <div class="site-image-visual">

                <img
                  src="./assets/aoi/deforestation-overview.jpg"
                  alt="Deforestation detection across the whole Area of Interest"
                >

                <div class="site-image-placeholder">
                  AOI overview image not added yet
                </div>

              </div>

              <figcaption>

                <span>
                  Overall detection result
                </span>

                <strong>
                  Six priority sites identified
                </strong>

              </figcaption>

            </figure>

          </section>

          <aside class="site-analysis-section">

            <div class="site-section-heading">

              <div>
                <span>Analytical Summary</span>

                <h3>
                  AOI Pattern-of-Life Overview
                </h3>
              </div>

            </div>

            <div class="site-primary-metric">

              <span>
                Total detected forest loss
              </span>

              <strong>
                79.78
              </strong>

              <small>
                hectares
              </small>

            </div>

            <ul class="site-analysis-list">

              <li>

                <strong>
                  Detection Coverage
                </strong>

                <p>
                  The result represents deforestation
                  detection across the full Area of
                  Interest for pattern-of-life analysis.
                </p>

              </li>

              <li>

                <strong>
                  Background Noise
                </strong>

                <p>
                  Isolated red detections may include
                  image noise associated with trees,
                  terrain and natural surface variation.
                </p>

              </li>

              <li>

                <strong>
                  Significant Clusters
                </strong>

                <p>
                  Dense and spatially bundled detections
                  indicate substantial unnatural change
                  requiring closer analytical review.
                </p>

              </li>

              <li>

                <strong>
                  Priority Locations
                </strong>

                <p>
                  Six major deforestation clusters were
                  identified and assessed as individual
                  priority sites.
                </p>

              </li>

              <li>

                <strong>
                  Assessment Status
                </strong>

                <p>
                  Findings are based on satellite change
                  detection and should be cross-referenced
                  against permits and field observations.
                </p>

              </li>

            </ul>

          </aside>

        </div>

        <footer class="site-intelligence-footer">

          <div>
            <span>Area of Interest</span>
            <strong>${aoiAreaLabel}</strong>
          </div>

          <div>
            <span>Data source</span>
            <strong>LC60 / Sentinel-1 VH</strong>
          </div>

          <div>
            <span>Priority sites</span>
            <strong>6 deforestation locations</strong>
          </div>

          <button
            class="aoi-zoom-button"
            type="button"
          >
            Zoom to AOI
          </button>

        </footer>

      </article>
    `;

  siteIntelligenceDialog
    .querySelector(
      ".site-intelligence-close"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

      }
    );

  siteIntelligenceDialog
    .querySelector(
      ".aoi-zoom-button"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

        resetMapView();

      }
    );

  const overviewImage =
    siteIntelligenceDialog.querySelector(
      ".aoi-overview-visual img"
    );

  overviewImage.addEventListener(
    "error",
    function () {

      overviewImage.closest(
        ".site-image-visual"
      ).classList.add(
        "missing"
      );

    }
  );

  siteIntelligenceDialog.showModal();

}

async function loadAreaOfInterest() {

  try {

    const response =
      await fetch(
        "./data/aoi/POC_Border.geojson"
      );

    if (
      !response.ok
    ) {

      throw new Error(
        `AOI request failed: ${response.status}`
      );

    }

    const geojson =
      await response.json();

    aoiLayer =
      L.geoJSON(
        geojson,
        {
          style: {
            color:
              "#f2c94c",

            weight:
              2.5,

            opacity:
              1,

            fillColor:
              "#f2c94c",

            fillOpacity:
              0.06,

            dashArray:
              "7 5"
          },

          onEachFeature:
            function (
              feature,
              layer
            ) {

              layer.bindTooltip(
                "Click to open AOI overview",
                {
                  sticky:
                    true,

                  className:
                    "aoi-overview-tooltip"
                }
              );

              layer.on(
                "click",
                function () {

                  openAoiOverview(
                    feature
                  );

                }
              );

            }
        }
      )
      .addTo(
        map
      );

    aoiLayer.bringToFront();

    resetMapView();

    showToast(
      "BIMP-EAGA area of interest loaded."
    );

  } catch (error) {

    console.error(
      "AOI loading error:",
      error
    );

    showToast(
      "Unable to load the AOI GeoJSON."
    );

    resetMapView();

  }

}

function createSiteImageCard(
  title,
  date,
  imagePath,
  alternateText
) {

  return `
    <figure class="site-image-card">

      <div class="site-image-visual">

        <img
          src="${escapeHtml(imagePath)}"
          alt="${escapeHtml(alternateText)}"
        >

        <div class="site-image-placeholder">
          Imagery not added yet
        </div>

      </div>

      <figcaption>

        <span>
          ${escapeHtml(title)}
        </span>

        <strong>
          ${escapeHtml(date)}
        </strong>

      </figcaption>

    </figure>
  `;

}


function ensureSiteIntelligenceDialog() {

  if (
    siteIntelligenceDialog
  ) {

    return;

  }

  siteIntelligenceDialog =
    document.createElement(
      "dialog"
    );

  siteIntelligenceDialog.className =
    "site-intelligence-dialog";

  document.body.appendChild(
    siteIntelligenceDialog
  );

  siteIntelligenceDialog.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        siteIntelligenceDialog
      ) {

        siteIntelligenceDialog.close();

      }

    }
  );

}

function openMonthlyChanges(
  location
) {

  ensureSiteIntelligenceDialog();

  const monthlyCards =
    location.monthlyChanges
      .map(
        function (change) {

          return `
            <article class="monthly-change-card">

              <div class="site-image-visual">

                <img
                  src="${escapeHtml(change.image)}"
                  alt="${
                    escapeHtml(
                      `${location.name} ${change.period} change detection`
                    )
                  }"
                >

                <div class="site-image-placeholder">
                  Monthly imagery not added yet
                </div>

              </div>

              <div class="monthly-change-caption">

                <span>
                  Detection period
                </span>

                <strong>
                  ${escapeHtml(change.period)}
                </strong>

              </div>

            </article>
          `;

        }
      )
      .join("");

  const monthlyInsights =
    location.monthlyInsights
      .map(
        function (insight) {

          return `
            <li>
              ${escapeHtml(insight)}
            </li>
          `;

        }
      )
      .join("");

  siteIntelligenceDialog.innerHTML =
    `
      <article
        class="
          site-intelligence-modal
          monthly-changes-modal
        "
      >

        <header class="site-intelligence-header">

          <div>

            <span class="site-category-badge">
              Monthly Timeline
            </span>

            <h2>
              ${escapeHtml(location.name)}
              Monthly Changes
            </h2>

            <p>
              ${location.latitude.toFixed(7)}°N,
              ${location.longitude.toFixed(7)}°E
            </p>

          </div>

          <button
            class="site-intelligence-close"
            type="button"
            aria-label="Close monthly changes"
          >
            &times;
          </button>

        </header>

        <div class="monthly-changes-content">

          <div class="site-section-heading">

            <div>
              <span>Temporal Analysis</span>

              <h3>
                Change Detection by Monitoring Period
              </h3>
            </div>

            <span class="site-period-badge">
              Nov 2025 – Apr 2026
            </span>

          </div>

          <div class="monthly-changes-grid">
            ${monthlyCards}
          </div>

          <section class="monthly-insight-panel">

            <div>

              <span class="monthly-insight-label">
                Pattern-of-Life Assessment
              </span>

              <h3>
                Sustained Clearing Activity
              </h3>

            </div>

            <ul>
              ${monthlyInsights}
            </ul>

          </section>

        </div>

        <footer class="site-intelligence-footer">

          <div>
            <span>Location ID</span>
            <strong>${escapeHtml(location.id)}</strong>
          </div>

          <div>
            <span>Monitoring windows</span>
            <strong>
              ${location.monthlyChanges.length}
            </strong>
          </div>

          <div>
            <span>Data source</span>
            <strong>LC60 / Sentinel-1 VH</strong>
          </div>

          <div class="site-footer-actions">

            <button
              class="site-back-button"
              type="button"
            >
              Back to Overview
            </button>

            <button
              class="site-zoom-button"
              type="button"
            >
              Zoom to Site
            </button>

          </div>

        </footer>

      </article>
    `;

  siteIntelligenceDialog
    .querySelector(
      ".site-intelligence-close"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

      }
    );

  siteIntelligenceDialog
    .querySelector(
      ".site-back-button"
    )
    .addEventListener(
      "click",
      function () {

        openSiteIntelligence(
          location
        );

      }
    );

  siteIntelligenceDialog
    .querySelector(
      ".site-zoom-button"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

        map.flyTo(
          [
            location.latitude,
            location.longitude
          ],
          16,
          {
            duration: 1
          }
        );

      }
    );

  siteIntelligenceDialog
    .querySelectorAll(
      ".monthly-change-card img"
    )
    .forEach(
      function (image) {

        image.addEventListener(
          "error",
          function () {

            image.closest(
              ".site-image-visual"
            ).classList.add(
              "missing"
            );

          }
        );

      }
    );

  if (
    !siteIntelligenceDialog.open
  ) {

    siteIntelligenceDialog.showModal();

  }

}

function openSiteIntelligence(
  location
) {

  ensureSiteIntelligenceDialog();

  const hasMonthlyChanges =
    Array.isArray(
      location.monthlyChanges
    ) &&
    location.monthlyChanges.length > 0;

  const monthlyChangesButton =
    hasMonthlyChanges
      ? `
          <button
            class="site-monthly-button"
            type="button"
          >
            Monthly Changes
          </button>
        `
      : "";

  const analysisItems =
    location.analysis
      .map(
        function (item) {

          return `
            <li>

              <strong>
                ${escapeHtml(item.title)}
              </strong>

              <p>
                ${escapeHtml(item.text)}
              </p>

            </li>
          `;

        }
      )
      .join("");

  siteIntelligenceDialog.innerHTML =
    `
      <article class="site-intelligence-modal">

        <header class="site-intelligence-header">

          <div>

            <span class="site-category-badge">
              ${escapeHtml(location.category)}
            </span>

            <h2>
              ${escapeHtml(location.name)}
            </h2>

            <p>
              ${location.latitude.toFixed(7)}°N,
              ${location.longitude.toFixed(7)}°E
            </p>

          </div>

          <button
            class="site-intelligence-close"
            type="button"
            aria-label="Close site intelligence"
          >
            &times;
          </button>

        </header>

        <div class="site-intelligence-body">

          <section class="site-imagery-section">

            <div class="site-section-heading">

              <div>
                <span>Visual Analysis</span>
                <h3>Satellite Change Review</h3>
              </div>

              <span class="site-period-badge">
                ${escapeHtml(location.periodLabel)}
              </span>

            </div>

            <div class="site-image-grid">

              ${
                createSiteImageCard(
                  "Before",
                  "November 2025",
                  location.images.before,
                  `${location.name} before imagery`
                )
              }

              ${
                createSiteImageCard(
                  "After",
                  "April 2026",
                  location.images.after,
                  `${location.name} after imagery`
                )
              }

              <div class="site-detection-image">

                ${
                  createSiteImageCard(
                    "Detection Result",
                    `${location.detectedAreaHa.toFixed(2)} ha detected`,
                    location.images.detection,
                    `${location.name} detection result`
                  )
                }

              </div>

            </div>

          </section>

          <aside class="site-analysis-section">

            <div class="site-section-heading">

              <div>
                <span>Analytical Summary</span>
                <h3>Site Overview & Pattern-of-Life</h3>
              </div>

            </div>

            <div class="site-primary-metric">

              <span>
                Detected forest loss
              </span>

              <strong>
                ${location.detectedAreaHa.toFixed(2)}
              </strong>

              <small>
                hectares
              </small>

            </div>

            <ul class="site-analysis-list">
              ${analysisItems}
            </ul>

          </aside>

        </div>

        <footer class="site-intelligence-footer">

          <div>
            <span>Location ID</span>
            <strong>${escapeHtml(location.id)}</strong>
          </div>

          <div>
            <span>Data source</span>
            <strong>Sentinel-2</strong>
          </div>

          <div>
            <span>Assessment status</span>
            <strong>Field verification required</strong>
          </div>

          <div class="site-footer-actions">

            ${monthlyChangesButton}

            <button
              class="site-zoom-button"
              type="button"
            >
              Zoom to Site
            </button>

          </div>

        </footer>

      </article>
    `;

  siteIntelligenceDialog
    .querySelector(
      ".site-intelligence-close"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

      }
    );

  const monthlyButton =
    siteIntelligenceDialog.querySelector(
      ".site-monthly-button"
    );

  if (
    monthlyButton
  ) {

    monthlyButton.addEventListener(
      "click",
      function () {

        openMonthlyChanges(
          location
        );

      }
    );

  }

  siteIntelligenceDialog
    .querySelector(
      ".site-zoom-button"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

        map.flyTo(
          [
            location.latitude,
            location.longitude
          ],
          16,
          {
            duration: 1
          }
        );

      }
    );

  siteIntelligenceDialog
    .querySelectorAll(
      ".site-image-card img"
    )
    .forEach(
      function (image) {

        image.addEventListener(
          "error",
          function () {

            image.closest(
              ".site-image-visual"
            ).classList.add(
              "missing"
            );

          }
        );

      }
    );

  if (
    !siteIntelligenceDialog.open
  ) {

    siteIntelligenceDialog.showModal();

  }

}

function loadDetectionLocations() {

  if (
    detectionLocationsLayer &&
    map.hasLayer(
      detectionLocationsLayer
    )
  ) {

    map.removeLayer(
      detectionLocationsLayer
    );

  }

  detectionLocationsLayer =
    L.layerGroup();

  DETECTION_LOCATIONS.forEach(
    function (location) {

      const marker =
        L.circleMarker(
          [
            location.latitude,
            location.longitude
          ],
          {
            pane:
              "detectionLocationsPane",

            radius:
              7,

            color:
              "#ff3535",

            weight:
              2,

            opacity:
              1,

            fillColor:
              "#ff3535",

            fillOpacity:
              0.28
          }
        );

      marker.bindTooltip(
        location.id,
        {
          direction:
            "top",

          offset: [
            0,
            -7
          ],

          className:
            "detection-location-tooltip"
        }
      );

      marker.on(
        "click",
        function () {

          openSiteIntelligence(
            location
          );

        }
      );

      marker.addTo(
        detectionLocationsLayer
      );

    }
  );

  detectionLocationsLayer.addTo(
    map
  );

}


function zoomToActiveImagery() {

  const dataset =
    getActiveDataset();

  if (
    !dataset
  ) {

    showToast(
      "Select an imagery dataset first."
    );

    return;

  }

  map.fitBounds(
    dataset.layer.getBounds(),
    {
      padding: [
        30,
        30
      ],

      animate:
        true
    }
  );

}


// =========================
// MAP INFORMATION
// =========================

function updateZoomLevel() {

  mapZoomLevel.textContent =
    `Zoom: ${map.getZoom()}`;

}


function updateMapCoordinates(event) {

  const latitude =
    event.latlng.lat.toFixed(
      5
    );

  const longitude =
    event.latlng.lng.toFixed(
      5
    );

  mapCoordinates.innerHTML =
    `Lat: ${latitude}` +
    ` &nbsp; Lon: ${longitude}`;

}


function clearMapCoordinates() {

  mapCoordinates.innerHTML =
    "Lat: ” &nbsp; Lon: ”";

}


// =========================
// SIDEBAR
// =========================

function collapseSidebar() {

  imagerySidebar.classList.add(
    "collapsed"
  );

  expandSidebarButton.hidden =
    false;

  setTimeout(
    function () {

      map.invalidateSize();

    },
    260
  );

}


function expandSidebar() {

  imagerySidebar.classList.remove(
    "collapsed"
  );

  expandSidebarButton.hidden =
    true;

  setTimeout(
    function () {

      map.invalidateSize();

    },
    260
  );

}

function toggleComparisonPanel() {

  const isMinimized =
    comparisonPanel.classList.toggle(
      "minimized"
    );

  minimizeComparisonButton.innerHTML =
    isMinimized
      ? "+"
      : "&minus;";

  minimizeComparisonButton.title =
    isMinimized
      ? "Expand comparison panel"
      : "Minimize comparison panel";

  minimizeComparisonButton.setAttribute(
    "aria-label",
    minimizeComparisonButton.title
  );

}

async function loadPostProcessingDatasets() {

  let registeredCount =
    0;

  for (
    const config of
    POSTPROCESSING_DATASETS
  ) {

    const detectionColor =
      config.color ||
      "rgba(255, 35, 35, 0.85)";

    const dataset = {

        id:
          createDatasetId(),

        name:
          config.name,

        periodLabel:
          config.periodLabel,

        startDate:
          config.startDate,

        endDate:
          config.endDate,

        // Retained for current sorting logic
        date:
          config.endDate,

        source:
          config.source ||
          "LC60 / Sentinel-1 VH",

        category:
          config.category ||
          "Deforestation",

        color:
          detectionColor,

        comparisonEligible:
          config.comparisonEligible !==
          false,

        visible:
          false,

        filename:
          config.filename,

        fileSize:
          0,

        format:
          "GeoTIFF",

        width:
          null,

        height:
          null,

        projection:
          "Not loaded",

        georaster:
          null,

        layer:
          null,

        filePath:
          `./data/postprocessing/${config.filename}`,

        loaded:
          false,

        loading:
          false,

        loadError:
          null,

        loadingPromise:
          null

      };

      imageryDatasets.push(
        dataset
      );

    registeredCount++;

  }

  imageryDatasets.sort(
    function (a, b) {

      return (
        new Date(a.date) -
        new Date(b.date)
      );

    }
  );

  renderImageryCatalogue();

  updateComparisonOptions();

  if (
    registeredCount > 0
  ) {

    showToast(
      `${registeredCount} datasets ready. Open a layer to load it.`
    );

  } else {

    showToast(
      "No postprocessing datasets were configured."
    );

  }

}

function createRasterLayer(dataset) {

  return new GeoRasterLayer(
    {
      georaster:
        dataset.georaster,

      opacity:
        1,

      resolution:
        128,

      pixelValuesToColorFn:
        function (values) {

          if (
            values[0] === 1
          ) {

            return (
              dataset.color ||
              "rgba(255, 35, 35, 0.85)"
            );

          }

          return null;

        }
    }
  );

}

async function ensureDatasetLoaded(dataset) {

  if (
    dataset.georaster &&
    dataset.layer
  ) {

    dataset.loaded =
      true;

    return dataset;

  }

  if (
    dataset.loadingPromise
  ) {

    return dataset.loadingPromise;

  }

  if (
    !dataset.filePath
  ) {

    throw new Error(
      `No source file is available for ${dataset.name}.`
    );

  }

  dataset.loading =
    true;

  dataset.loadError =
    null;

  renderImageryCatalogue();

  dataset.loadingPromise =
    (async function () {

      const response =
        await fetch(
          dataset.filePath
        );

      if (
        !response.ok
      ) {

        throw new Error(
          `${dataset.filename}: ${response.status}`
        );

      }

      const arrayBuffer =
        await response.arrayBuffer();

      const georaster =
        await parseGeoraster(
          arrayBuffer
        );

      dataset.fileSize =
        arrayBuffer.byteLength;

      dataset.width =
        georaster.width;

      dataset.height =
        georaster.height;

      dataset.projection =
        getProjectionLabel(
          georaster.projection
        );

      dataset.georaster =
        georaster;

      dataset.layer =
        createRasterLayer(
          dataset
        );

      dataset.loaded =
        true;

      return dataset;

    })();

  try {

    return await dataset.loadingPromise;

  } catch (error) {

    dataset.loaded =
      false;

    dataset.loadError =
      error.message ||
      "GeoTIFF loading failed.";

    console.error(
      "GeoTIFF lazy-load error:",
      error
    );

    showToast(
      `Unable to load ${dataset.name}. Check that the TIFF exists locally.`
    );

    throw error;

  } finally {

    dataset.loading =
      false;

    dataset.loadingPromise =
      null;

    renderImageryCatalogue();

  }

}

// =========================
// GEOTIFF FILE SELECTION
// =========================

function handleGeoTiffSelection(event) {

  const files =
    Array.from(
      event.target.files
    );

  if (
    files.length === 0
  ) {
    return;
  }

  pendingGeoTiffFile =
    files[0];

  selectedFileName.textContent =
    pendingGeoTiffFile.name;

  imageryNameInput.value =
    removeFileExtension(
      pendingGeoTiffFile.name
    );

  captureDateInput.value =
    "";

  imagerySourceInput.value =
    "";

  importDialog.showModal();

}


// =========================
// IMPORT GEOTIFF
// =========================

async function importGeoTiff(event) {

  event.preventDefault();

  if (
    !pendingGeoTiffFile
  ) {

    showToast(
      "No GeoTIFF file selected."
    );

    return;

  }

  const imageryName =
    imageryNameInput.value.trim();

  const captureDate =
    captureDateInput.value;

  const source =
    imagerySourceInput.value.trim() ||
    "Unknown source";

  if (
    !imageryName ||
    !captureDate
  ) {

    showToast(
      "Enter an imagery name and capture date."
    );

    return;

  }

  showToast(
    "Processing GeoTIFF imagery..."
  );

  const submitButton =
    importForm.querySelector(
      'button[type="submit"]'
    );

  submitButton.disabled =
    true;

  submitButton.textContent =
    "Processing...";

  try {

    const arrayBuffer =
      await pendingGeoTiffFile.arrayBuffer();

    const georaster =
      await parseGeoraster(
        arrayBuffer
      );

    const rasterLayer =
      new GeoRasterLayer(
        {
          projection:
              getProjectionLabel(
                georaster.projection
              ),

          georaster:
            georaster,

          opacity:
            1,

          resolution:
            256,

          pixelValuesToColorFn:
            function (values) {

              const value =
                values[0];

              if (
                value === 1
              ) {

                return "rgba(255, 35, 35, 0.85)";

              }

              return null;

            }
        }
      );

    const dataset = {

      id:
        createDatasetId(),

      name:
        imageryName,

      date:
        captureDate,

      source:
        source,

      category:
        "Imported",

      visible:
        false,

      filename:
        pendingGeoTiffFile.name,

      fileSize:
        pendingGeoTiffFile.size,

      format:
        "GeoTIFF",

      width:
        georaster.width,

      height:
        georaster.height,

      projection:
        getProjectionLabel(
          georaster.projection
        ),

      georaster:
        georaster,

      layer:
        rasterLayer,

      loaded:
        true,

      loading:
        false,

      loadError:
        null,

      loadingPromise:
        null

    };

    imageryDatasets.push(
      dataset
    );

    imageryDatasets.sort(
      function (a, b) {

        return new Date(a.date) -
          new Date(b.date);

      }
    );

    closeImportDialog();

    renderImageryCatalogue();

    updateComparisonOptions();

    activateImagery(
      dataset.id,
      true
    );

    showToast(
      `${dataset.name} added successfully.`
    );

  } catch (error) {

    console.error(
      "GeoTIFF import error:",
      error
    );

    showToast(
      "Unable to load this GeoTIFF. Check its projection and file structure."
    );

  } finally {

    submitButton.disabled =
      false;

    submitButton.textContent =
      "Add to Map";

  }

}


// =========================
// ACTIVATE IMAGERY
// =========================

async function activateImagery(
  datasetId,
  zoomToLayer = false
) {

  const dataset =
    imageryDatasets.find(
      function (item) {

        return item.id ===
          datasetId;

      }
    );

  if (
    !dataset
  ) {
    return;
  }

  if (
    !dataset.loaded
  ) {

    showToast(
      `Loading ${dataset.name}...`
    );

  }

  try {

    await ensureDatasetLoaded(
      dataset
    );

  } catch (error) {

    return;

  }

  activeImageryId =
    dataset.id;

  activeImageryLayer =
    dataset.layer;

  if (
    !dataset.visible
  ) {

    dataset.layer.addTo(
      map
    );

    dataset.visible =
      true;

  }

  activeBasemap.bringToBack();

  if (
    aoiLayer
  ) {

    aoiLayer.bringToFront();

  }

  if (
    zoomToLayer
  ) {

    map.fitBounds(
      dataset.layer.getBounds(),
      {
        padding: [
          30,
          30
        ],

        animate:
          true
      }
    );

  }

  zoomToImageryButton.disabled =
    false;

  updateVisibleLayerCount();

  renderImageryCatalogue();

  showImageryDetails(
    dataset
  );

}

async function toggleImageryVisibility(
  datasetId
) {

  const dataset =
    imageryDatasets.find(
      function (item) {

        return item.id ===
          datasetId;

      }
    );

  if (
    !dataset
  ) {
    return;
  }

  if (
    dataset.visible
  ) {

    map.removeLayer(
      dataset.layer
    );

    dataset.visible =
      false;

  } else {

    if (
      !dataset.loaded
    ) {

      showToast(
        `Loading ${dataset.name}...`
      );

    }

    try {

      await ensureDatasetLoaded(
        dataset
      );

    } catch (error) {

      return;

    }

    dataset.layer.addTo(
      map
    );

    dataset.visible =
      true;

    activeImageryId =
      dataset.id;

    activeImageryLayer =
      dataset.layer;

    activeBasemap.bringToBack();

    if (
      aoiLayer
    ) {

      aoiLayer.bringToFront();

    }

    showImageryDetails(
      dataset
    );

  }

  updateVisibleLayerCount();

  renderImageryCatalogue();

}

function updateVisibleLayerCount() {

  const visibleLayers =
    imageryDatasets.filter(
      function (dataset) {

        return dataset.visible;

      }
    );

  selectedCount.textContent =
    visibleLayers.length;

}


// =========================
// IMAGERY CATALOGUE
// =========================

function renderImageryCatalogue() {

  const searchValue =
    imagerySearchInput.value
      .trim()
      .toLowerCase();

  function getCatalogueCategory(
    dataset
  ) {

    if (
      dataset.category ===
      "Deforestation"
    ) {

      return "Deforestation";

    }

    if (
      dataset.category ===
      "Infrastructure"
    ) {

      return "Infrastructure";

    }

    return "Imported";

  }

  const filteredDatasets =
    imageryDatasets.filter(
      function (dataset) {

        const category =
          getCatalogueCategory(
            dataset
          );

        return (
          dataset.name
            .toLowerCase()
            .includes(
              searchValue
            ) ||

          dataset.filename
            .toLowerCase()
            .includes(
              searchValue
            ) ||

          dataset.source
            .toLowerCase()
            .includes(
              searchValue
            ) ||

          category
            .toLowerCase()
            .includes(
              searchValue
            )
        );

      }
    );

  imageryList.innerHTML =
    "";

  if (
    filteredDatasets.length === 0
  ) {

    imageryList.innerHTML =
      `
        <div class="empty-state">

          <div class="empty-state-icon">
            &#9638;
          </div>

          <h3>
            ${
              imageryDatasets.length === 0
                ? "No imagery loaded"
                : "No imagery found"
            }
          </h3>

          <p>
            ${
              imageryDatasets.length === 0
                ? "Add a GeoTIFF file to begin exploring imagery over time."
                : "Try using a different search term."
            }
          </p>

        </div>
      `;

  } else {

    const catalogueGroups = [
      {
        category:
          "Deforestation",

        label:
          "Deforestation",

        className:
          "deforestation"
      },

      {
        category:
          "Infrastructure",

        label:
          "Infrastructure",

        className:
          "infrastructure"
      },

      {
        category:
          "Imported",

        label:
          "Manually Imported Imagery",

        className:
          "imported"
      }
    ];

    catalogueGroups.forEach(
      function (group) {

        const groupDatasets =
          filteredDatasets.filter(
            function (dataset) {

              return (
                getCatalogueCategory(
                  dataset
                ) ===
                group.category
              );

            }
          );

        if (
          groupDatasets.length === 0
        ) {

          return;

        }

        const groupSection =
          document.createElement(
            "section"
          );

        groupSection.className =
          `imagery-group ${group.className}`;

        groupSection.innerHTML =
          `
            <div class="imagery-group-header">

              <span
                class="imagery-group-marker"
                aria-hidden="true"
              ></span>

              <h3>
                ${escapeHtml(group.label)}
              </h3>

              <span class="imagery-group-count">
                ${groupDatasets.length}
              </span>

            </div>

            <div class="imagery-group-cards"></div>
          `;

        const groupCards =
          groupSection.querySelector(
            ".imagery-group-cards"
          );

        groupDatasets.forEach(
          function (dataset) {

            const card =
              document.createElement(
                "article"
              );

            card.className =
              "imagery-card";

            if (
              dataset.id ===
              activeImageryId
            ) {

              card.classList.add(
                "active"
              );

            }

            card.innerHTML =
              `
                <div class="imagery-thumbnail">
                  GeoTIFF
                </div>

                <div class="imagery-card-content">

                  <h3>
                    ${escapeHtml(dataset.name)}
                  </h3>

                  <p>
                    ${
                      dataset.periodLabel ||
                      formatDate(dataset.date)
                    }
                  </p>

                  <span
                    class="
                      imagery-source
                      ${dataset.loadError ? "error" : ""}
                    "
                  >
                    ${
                      dataset.loading
                        ? "Loading GeoTIFF..."
                        : dataset.loadError
                        ? "File unavailable · click to retry"
                        : escapeHtml(dataset.source)
                    }
                  </span>

                </div>

                <button
                  class="
                    imagery-visibility-button
                    ${dataset.visible ? "visible" : ""}
                  "
                  type="button"
                  ${dataset.loading ? "disabled" : ""}
                  aria-busy="${dataset.loading}"
                  title="${
                    dataset.loading
                      ? "Loading imagery"
                      : dataset.loadError
                      ? "Retry loading imagery"
                      : dataset.visible
                      ? "Hide imagery"
                      : "Show imagery"
                  }"
                  aria-label="${
                    dataset.loading
                      ? "Loading imagery"
                      : dataset.loadError
                      ? "Retry loading imagery"
                      : dataset.visible
                      ? "Hide imagery"
                      : "Show imagery"
                  }"
                  aria-pressed="${dataset.visible}"
                >
                  <span class="visibility-eye"></span>
                </button>
              `;

            card.addEventListener(
              "click",
              function () {

                activateImagery(
                  dataset.id,
                  true
                );

              }
            );

            const visibilityButton =
              card.querySelector(
                ".imagery-visibility-button"
              );

            visibilityButton.addEventListener(
              "click",
              function (event) {

                event.stopPropagation();

                toggleImageryVisibility(
                  dataset.id
                );

              }
            );

            groupCards.appendChild(
              card
            );

          }
        );

        imageryList.appendChild(
          groupSection
        );

      }
    );

  }

  datasetCount.textContent =
    imageryDatasets.length;

  }


// =========================
// IMAGERY DETAILS
// =========================

function showImageryDetails(dataset) {

  detailsTitle.textContent =
    dataset.name;

  detailsDate.textContent =
    dataset.periodLabel ||
    formatDate(
      dataset.date
    );

  detailsFilename.textContent =
    dataset.filename;

  detailsFileSize.textContent =
    formatFileSize(
      dataset.fileSize
    );

  detailsCrs.textContent =
    dataset.projection;

  imageryDetailsPanel.hidden =
    false;

}


function closeImageryDetails() {

  imageryDetailsPanel.hidden =
    true;

}


function getActiveDataset() {

  return imageryDatasets.find(
    function (dataset) {

      return dataset.id ===
        activeImageryId;

    }
  );

}


// =========================
// COMPARISON OPTIONS
// =========================

function getComparisonDisplayName(
  dataset
) {

  const dateLabel =
    dataset.periodLabel ||
    formatDate(
      dataset.date
    );

  if (
    dataset.category ===
    "Deforestation"
  ) {

    const shortName =
      dataset.name.replace(
        /^Deforestation\s*[—-]\s*/,
        ""
      );

    return (
      `${shortName} · ${dateLabel}`
    );

  }

  return (
    `${dataset.name} · ${dateLabel}`
  );

}


function updateComparisonOptions() {

  const previousBefore =
    beforeImagerySelect.value;

  const previousAfter =
    afterImagerySelect.value;

  const comparableDatasets =
    imageryDatasets.filter(
      function (dataset) {

        return (
          dataset.comparisonEligible !==
          false
        );

      }
    );

  const options =
    comparableDatasets
      .map(
        function (dataset) {

          return `
            <option value="${dataset.id}">
              ${
                escapeHtml(
                  getComparisonDisplayName(
                    dataset
                  )
                )
              }
            </option>
          `;

        }
      )
      .join("");

  beforeImagerySelect.innerHTML =
    `
      <option value="">
        Select before imagery
      </option>

      ${options}
    `;

  afterImagerySelect.innerHTML =
    `
      <option value="">
        Select after imagery
      </option>

      ${options}
    `;

  const beforeStillExists =
    comparableDatasets.some(
      function (dataset) {

        return (
          dataset.id ===
          previousBefore
        );

      }
    );

  const afterStillExists =
    comparableDatasets.some(
      function (dataset) {

        return (
          dataset.id ===
          previousAfter
        );

      }
    );

  if (
    beforeStillExists
  ) {

    beforeImagerySelect.value =
      previousBefore;

  }

  if (
    afterStillExists
  ) {

    afterImagerySelect.value =
      previousAfter;

  }

  const hasEnoughImagery =
    comparableDatasets.length >= 2;

  beforeImagerySelect.disabled =
    !hasEnoughImagery;

  afterImagerySelect.disabled =
    !hasEnoughImagery;

  comparisonToggle.disabled =
    !hasEnoughImagery;

  swapComparisonButton.disabled =
    !hasEnoughImagery;

}

function createComparisonLayer(
  dataset,
  paneName
) {

  return new GeoRasterLayer(
    {
      georaster:
        dataset.georaster,

      pane:
        paneName,

      opacity:
        Number(
          opacitySlider.value
        ) / 100,

      resolution:
        128,

      pixelValuesToColorFn:
        function (values) {

          const value =
            values[0];

          if (
            value === 1
          ) {

            return (
              dataset.color ||
              "rgba(255, 35, 35, 0.9)"
            );

          }

          return null;

        }
    }
  );

}


function clearComparisonLayers() {

  if (
    comparisonBeforeLayer &&
    map.hasLayer(
      comparisonBeforeLayer
    )
  ) {

    map.removeLayer(
      comparisonBeforeLayer
    );

  }

  if (
    comparisonAfterLayer &&
    map.hasLayer(
      comparisonAfterLayer
    )
  ) {

    map.removeLayer(
      comparisonAfterLayer
    );

  }

  comparisonBeforeLayer =
    null;

  comparisonAfterLayer =
    null;

  comparisonMapLabels.hidden =
    true;

}


function applyComparisonClip() {

  const sliderValue =
    Number(
      comparisonSlider.value
    );

  const afterPane =
    map.getPane(
      "comparisonAfterPane"
    );

  afterPane.style.clipPath =
    `inset(0 0 0 ${sliderValue}%)`;

  comparisonDivider.style.left =
    `${sliderValue}%`;

}

function setComparisonLoading(
  isLoading
) {

  comparisonPanel.classList.toggle(
    "loading",
    isLoading
  );

  const comparableCount =
    imageryDatasets.filter(
      function (dataset) {

        return (
          dataset.comparisonEligible !==
          false
        );

      }
    ).length;

  const hasEnoughImagery =
    comparableCount >= 2;

  beforeImagerySelect.disabled =
    isLoading ||
    !hasEnoughImagery;

  afterImagerySelect.disabled =
    isLoading ||
    !hasEnoughImagery;

  swapComparisonButton.disabled =
    isLoading ||
    !hasEnoughImagery;

  comparisonSlider.disabled =
    isLoading ||
    !comparisonToggle.checked;

  opacitySlider.disabled =
    isLoading ||
    !comparisonToggle.checked;

}

async function renderComparisonLayers() {

  clearComparisonLayers();

  const beforeDataset =
    imageryDatasets.find(
      function (dataset) {

        return (
          dataset.id ===
          beforeImagerySelect.value
        );

      }
    );

  const afterDataset =
    imageryDatasets.find(
      function (dataset) {

        return (
          dataset.id ===
          afterImagerySelect.value
        );

      }
    );

  if (
    !beforeDataset ||
    !afterDataset
  ) {

    showToast(
      "Select a before and after dataset."
    );

    return;

  }

  if (
    beforeDataset.id ===
    afterDataset.id
  ) {

    showToast(
      "Choose two different detection periods."
    );

    return;

  }

  const requestId =
    ++comparisonRenderRequestId;

  const requestedBeforeId =
    beforeDataset.id;

  const requestedAfterId =
    afterDataset.id;

  setComparisonLoading(
    true
  );

  try {

    await Promise.all(
      [
        ensureDatasetLoaded(
          beforeDataset
        ),

        ensureDatasetLoaded(
          afterDataset
        )
      ]
    );

    const requestIsStale =
      requestId !==
      comparisonRenderRequestId;

    const selectionChanged =
      beforeImagerySelect.value !==
        requestedBeforeId ||
      afterImagerySelect.value !==
        requestedAfterId;

    if (
      requestIsStale ||
      selectionChanged ||
      !comparisonToggle.checked
    ) {

      return;

    }

    comparisonBeforeLayer =
      createComparisonLayer(
        beforeDataset,
        "comparisonBeforePane"
      );

    comparisonAfterLayer =
      createComparisonLayer(
        afterDataset,
        "comparisonAfterPane"
      );

    comparisonBeforeLayer.addTo(
      map
    );

    comparisonAfterLayer.addTo(
      map
    );

    activeBasemap.bringToBack();

    if (
      aoiLayer
    ) {

      aoiLayer.bringToFront();

    }

    comparisonBeforeMapName.textContent =
      getComparisonDisplayName(
        beforeDataset
      );

    comparisonAfterMapName.textContent =
      getComparisonDisplayName(
        afterDataset
      );

    comparisonMapLabels.hidden =
      false;

    applyComparisonClip();

  } catch (error) {

    console.error(
      "Comparison render error:",
      error
    );

  } finally {

    if (
      requestId ===
      comparisonRenderRequestId
    ) {

      setComparisonLoading(
        false
      );

    }

  }

}


function enableComparison() {

  if (
    imageryDatasets.length < 2
  ) {

    comparisonToggle.checked =
      false;

    showToast(
      "At least two datasets are required."
    );

    return;

  }

  const monthlyDatasets =
    imageryDatasets.filter(
      function (dataset) {

        return !dataset.name.includes(
          "Overall"
        );

      }
    );

  if (
    !beforeImagerySelect.value
  ) {

    beforeImagerySelect.value =
      monthlyDatasets[0]?.id ||
      imageryDatasets[0].id;

  }

  if (
    !afterImagerySelect.value
  ) {

    afterImagerySelect.value =
      monthlyDatasets[
        monthlyDatasets.length - 1
      ]?.id ||
      imageryDatasets[
        imageryDatasets.length - 1
      ].id;

  }

  previouslyVisibleDatasetIds =
    imageryDatasets
      .filter(
        function (dataset) {

          return dataset.visible;

        }
      )
      .map(
        function (dataset) {

          return dataset.id;

        }
      );

  imageryDatasets.forEach(
    function (dataset) {

      if (
        dataset.layer &&
        map.hasLayer(
          dataset.layer
        )
      ) {

        map.removeLayer(
          dataset.layer
        );

      }

    }
  );

  imageryDetailsPanel.hidden =
    true;

  comparisonSlider.disabled =
    false;

  opacitySlider.disabled =
    false;

  comparisonDivider.hidden =
    false;

  renderComparisonLayers();

}


function disableComparison() {

  clearComparisonLayers();

  comparisonSlider.disabled =
    true;

  comparisonDivider.hidden =
    true;

  imageryDatasets.forEach(
    function (dataset) {

      if (
        previouslyVisibleDatasetIds.includes(
          dataset.id
        ) &&
        dataset.layer
      ) {

        dataset.layer.addTo(
          map
        );

      }

    }
  );

  activeBasemap.bringToBack();

  if (
    aoiLayer
  ) {

    aoiLayer.bringToFront();

  }

  previouslyVisibleDatasetIds =
    [];

}


function handleComparisonToggle() {

  if (
    comparisonToggle.checked
  ) {

    enableComparison();

  } else {

    disableComparison();

  }

}


function swapComparisonDatasets() {

  const beforeValue =
    beforeImagerySelect.value;

  beforeImagerySelect.value =
    afterImagerySelect.value;

  afterImagerySelect.value =
    beforeValue;

  if (
    comparisonToggle.checked
  ) {

    renderComparisonLayers();

  }

}


// =========================
// DIALOG
// =========================

function closeImportDialog() {

  if (
    importDialog.open
  ) {

    importDialog.close();

  }

  importForm.reset();

  geotiffInput.value =
    "";

  pendingGeoTiffFile =
    null;

  selectedFileName.textContent =
    "No file selected";

}


// =========================
// SLIDERS
// =========================

function updateComparisonSlider() {

  const value =
    Number(
      comparisonSlider.value
    );

  comparisonSliderValue.textContent =
    `${value}%`;

  if (
    comparisonToggle.checked
  ) {

    applyComparisonClip();

  }

}

function updateOpacitySlider() {

  const value =
    Number(
      opacitySlider.value
    );

  opacitySliderValue.textContent =
    `${value}%`;

  const opacity =
    value / 100;

  if (
    comparisonToggle.checked
  ) {

    if (
      comparisonBeforeLayer
    ) {

      comparisonBeforeLayer.setOpacity(
        opacity
      );

    }

    if (
      comparisonAfterLayer
    ) {

      comparisonAfterLayer.setOpacity(
        opacity
      );

    }

    return;

  }

  if (
    activeImageryLayer
  ) {

    activeImageryLayer.setOpacity(
      opacity
    );

  }

}


// =========================
// HELPERS
// =========================

function createDatasetId() {

  return (
    "imagery-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


function removeFileExtension(filename) {

  return filename.replace(
    /\.[^/.]+$/,
    ""
  );

}


function getProjectionLabel(
  projection
) {

  if (
    projection === undefined ||
    projection === null
  ) {

    return "Unknown";

  }

  const projectionText =
    String(
      projection
    );

  if (
    projectionText
      .toUpperCase()
      .startsWith(
        "EPSG:"
      )
  ) {

    return projectionText;

  }

  return `EPSG:${projectionText}`;

}


function formatDate(dateValue) {

  if (
    !dateValue
  ) {
    return "Unknown date";
  }

  const date =
    new Date(
      `${dateValue}T00:00:00`
    );

  return date.toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric"
    }
  );

}


function formatFileSize(bytes) {

  if (
    bytes === 0
  ) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];

  const unitIndex =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  const value =
    bytes /
    Math.pow(
      1024,
      unitIndex
    );

  return (
    value.toFixed(
      unitIndex === 0
        ? 0
        : 2
    ) +
    " " +
    units[unitIndex]
  );

}


function escapeHtml(value) {

  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    value;

  return element.innerHTML;

}


function showToast(message) {

  clearTimeout(
    toastTimeout
  );

  toastMessage.textContent =
    message;

  toast.hidden =
    false;

  toastTimeout =
    setTimeout(
      function () {

        toast.hidden =
          true;

      },
      3200
    );

}

function formatSensorStatus(
  status
) {

  if (
    status === "online"
  ) {

    return "Online";

  }

  if (
    status === "warning"
  ) {

    return "Warning";

  }

  if (
    status === "offline"
  ) {

    return "Offline";

  }

  return "Placeholder";

}


function renderSensorCatalogue() {

  sensorList.innerHTML =
    "";

  SENSOR_LOCATIONS.forEach(
    function (sensor) {

      const card =
        document.createElement(
          "button"
        );

      card.className =
        "sensor-card";

      card.type =
        "button";

      card.innerHTML =
        `
          <span
            class="
              sensor-status-indicator
              ${sensor.status}
            "
            aria-hidden="true"
          ></span>

          <span class="sensor-card-content">

            <strong>
              ${escapeHtml(sensor.name)}
            </strong>

            <span>
              ${escapeHtml(sensor.type)}
            </span>

            <small>
              ${escapeHtml(sensor.id)}
              ·
              ${formatSensorStatus(sensor.status)}
            </small>

          </span>

          <span
            class="sensor-card-arrow"
            aria-hidden="true"
          >
            ›
          </span>
        `;

      card.addEventListener(
        "click",
        function () {

          map.flyTo(
            [
              sensor.latitude,
              sensor.longitude
            ],
            16,
            {
              duration: 1
            }
          );

          openSensorDetails(
            sensor
          );

        }
      );

      sensorList.appendChild(
        card
      );

    }
  );

  sensorCount.textContent =
    SENSOR_LOCATIONS.length;

}


function openSensorDetails(
  sensor
) {

  ensureSiteIntelligenceDialog();

  siteIntelligenceDialog.innerHTML =
    `
      <article
        class="
          site-intelligence-modal
          sensor-intelligence-modal
        "
      >

        <header
          class="
            site-intelligence-header
            sensor-intelligence-header
          "
        >

          <div>

            <span class="sensor-demo-badge">
              Demonstration Sensor
            </span>

            <h2>
              ${escapeHtml(sensor.name)}
            </h2>

            <p>
              ${escapeHtml(sensor.id)}
              ·
              ${escapeHtml(sensor.type)}
            </p>

          </div>

          <button
            class="site-intelligence-close"
            type="button"
            aria-label="Close sensor details"
          >
            &times;
          </button>

        </header>

        <div class="sensor-intelligence-body">

          <section class="sensor-status-overview">

            <span
              class="
                sensor-large-status
                ${sensor.status}
              "
            ></span>

            <div>

              <span>
                Operational Status
              </span>

              <strong>
                ${formatSensorStatus(sensor.status)}
              </strong>

              <p>
                Placeholder demonstration data
              </p>

            </div>

          </section>

          <div class="sensor-metric-grid">

            <article class="sensor-metric-card">

              <span>
                Battery Level
              </span>

              <strong>
                ${sensor.battery}%
              </strong>

            </article>

            <article class="sensor-metric-card">

              <span>
                Last Communication
              </span>

              <strong>
                ${escapeHtml(sensor.lastCommunication)}
              </strong>

            </article>

            <article class="sensor-metric-card">

              <span>
                Latest Reading
              </span>

              <strong>
                ${escapeHtml(sensor.reading)}
              </strong>

            </article>

            <article class="sensor-metric-card">

              <span>
                Sensor Type
              </span>

              <strong>
                ${escapeHtml(sensor.type)}
              </strong>

            </article>

          </div>

          <div class="sensor-location-section">

            <span>
              Placeholder Location
            </span>

            <strong>
              ${sensor.latitude.toFixed(6)}°N,
              ${sensor.longitude.toFixed(6)}°E
            </strong>

            <p>
              Replace this location and telemetry
              when confirmed deployment information
              becomes available.
            </p>

          </div>

        </div>

        <footer class="site-intelligence-footer">

          <div>
            <span>Sensor ID</span>
            <strong>${escapeHtml(sensor.id)}</strong>
          </div>

          <div>
            <span>Network</span>
            <strong>Placeholder Network</strong>
          </div>

          <div>
            <span>Data classification</span>
            <strong>Demonstration Only</strong>
          </div>

          <button
            class="sensor-zoom-button"
            type="button"
          >
            Zoom to Sensor
          </button>

        </footer>

      </article>
    `;

  siteIntelligenceDialog
    .querySelector(
      ".site-intelligence-close"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

      }
    );

  siteIntelligenceDialog
    .querySelector(
      ".sensor-zoom-button"
    )
    .addEventListener(
      "click",
      function () {

        siteIntelligenceDialog.close();

        map.flyTo(
          [
            sensor.latitude,
            sensor.longitude
          ],
          17,
          {
            duration: 1
          }
        );

      }
    );

  if (
    !siteIntelligenceDialog.open
  ) {

    siteIntelligenceDialog.showModal();

  }

}


function loadPlaceholderSensors() {

  sensorLocationsLayer =
    L.layerGroup();

  SENSOR_LOCATIONS.forEach(
    function (sensor) {

      const marker =
        L.circleMarker(
          [
            sensor.latitude,
            sensor.longitude
          ],
          {
            radius: 8,
            color: "#07171c",
            weight: 3,
            fillColor:
              sensor.status === "online"
                ? "#22c55e"
                : sensor.status === "warning"
                ? "#f59e0b"
                : sensor.status === "offline"
                ? "#ef4444"
                : "#94a3b8",
            fillOpacity: 1
          }
        );

      marker.bindTooltip(
        `
          <strong>
            ${escapeHtml(sensor.name)}
          </strong>
          <br>
          ${escapeHtml(sensor.type)}
          ·
          ${formatSensorStatus(sensor.status)}
        `,
        {
          direction: "top",
          offset: [0, -8]
        }
      );

      marker.on(
        "click",
        function () {

          openSensorDetails(
            sensor
          );

        }
      );

      marker.addTo(
        sensorLocationsLayer
      );

    }
  );

  renderSensorCatalogue();

}


function switchWorkspaceMode(
  mode
) {

  const sensorMode =
    mode === "sensors";

  activeWorkspaceMode =
    sensorMode
      ? "sensors"
      : "imagery";

  document.body.classList.toggle(
    "sensor-mode",
    sensorMode
  );

  imageryModeButton.classList.toggle(
    "active",
    !sensorMode
  );

  sensorModeButton.classList.toggle(
    "active",
    sensorMode
  );

  imageryModeButton.setAttribute(
    "aria-pressed",
    String(!sensorMode)
  );

  sensorModeButton.setAttribute(
    "aria-pressed",
    String(sensorMode)
  );

  sidebarSectionLabel.textContent =
    sensorMode
      ? "Field Network"
      : "Dataset";

  sidebarTitle.textContent =
    sensorMode
      ? "Sensor Network"
      : "Imagery Catalogue";

  sensorCatalogue.hidden =
    !sensorMode;

  comparisonPanel.hidden =
    sensorMode;

  zoomToImageryButton.hidden =
    sensorMode;

  imageryDetailsPanel.hidden =
    true;

  imageryDatasets.forEach(
    function (dataset) {

      if (
        !dataset.layer
      ) {

        return;

      }

      if (
        sensorMode &&
        map.hasLayer(dataset.layer)
      ) {

        map.removeLayer(
          dataset.layer
        );

      }

      if (
        !sensorMode &&
        dataset.visible &&
        !map.hasLayer(dataset.layer)
      ) {

        dataset.layer.addTo(
          map
        );

      }

    }
  );

  if (
    comparisonBeforeLayer &&
    map.hasLayer(comparisonBeforeLayer)
  ) {

    map.removeLayer(
      comparisonBeforeLayer
    );

  }

  if (
    comparisonAfterLayer &&
    map.hasLayer(comparisonAfterLayer)
  ) {

    map.removeLayer(
      comparisonAfterLayer
    );

  }

  if (
    sensorMode
  ) {

    if (
      detectionLocationsLayer &&
      map.hasLayer(detectionLocationsLayer)
    ) {

      map.removeLayer(
        detectionLocationsLayer
      );

    }

    if (
      sensorLocationsLayer &&
      !map.hasLayer(sensorLocationsLayer)
    ) {

      sensorLocationsLayer.addTo(
        map
      );

    }

    showToast(
      "Sensor Network opened with demonstration data."
    );

  } else {

    if (
      sensorLocationsLayer &&
      map.hasLayer(sensorLocationsLayer)
    ) {

      map.removeLayer(
        sensorLocationsLayer
      );

    }

    if (
      detectionLocationsLayer &&
      !map.hasLayer(detectionLocationsLayer)
    ) {

      detectionLocationsLayer.addTo(
        map
      );

    }

    if (
      comparisonToggle.checked
    ) {

      renderComparisonLayers();

    }

    showToast(
      "Imagery Intelligence workspace opened."
    );

  }

  if (
    aoiLayer
  ) {

    map.fitBounds(
      aoiLayer.getBounds(),
      {
        padding: [40, 40]
      }
    );

  }

  setTimeout(
    function () {

      map.invalidateSize();

    },
    50
  );

}


// =========================
// MAP EVENTS
// =========================

map.on(
  "mousemove",
  updateMapCoordinates
);

map.on(
  "mouseout",
  clearMapCoordinates
);

map.on(
  "zoomend",
  updateZoomLevel
);


// =========================
// BUTTON EVENTS
// =========================

resetViewButton.addEventListener(
  "click",
  resetMapView
);

toggleBasemapButton.addEventListener(
  "click",
  switchBasemap
);

zoomToImageryButton.addEventListener(
  "click",
  zoomToActiveImagery
);

collapseSidebarButton.addEventListener(
  "click",
  collapseSidebar
);

expandSidebarButton.addEventListener(
  "click",
  expandSidebar
);

geotiffInput.addEventListener(
  "change",
  handleGeoTiffSelection
);

imagerySearchInput.addEventListener(
  "input",
  renderImageryCatalogue
);

importForm.addEventListener(
  "submit",
  importGeoTiff
);

closeImportDialogButton.addEventListener(
  "click",
  closeImportDialog
);

cancelImportButton.addEventListener(
  "click",
  closeImportDialog
);

closeDetailsButton.addEventListener(
  "click",
  closeImageryDetails
);

comparisonToggle.addEventListener(
  "change",
  handleComparisonToggle
);

aoiOverviewButton.addEventListener(
  "click",
  function () {

    const aoiFeature =
      aoiLayer
        ?.toGeoJSON()
        ?.features?.[0];

    openAoiOverview(
      aoiFeature
    );

  }
);

beforeImagerySelect.addEventListener(
  "change",
  function () {

    if (
      comparisonToggle.checked
    ) {

      renderComparisonLayers();

    }

  }
);

afterImagerySelect.addEventListener(
  "change",
  function () {

    if (
      comparisonToggle.checked
    ) {

      renderComparisonLayers();

    }

  }
);

swapComparisonButton.addEventListener(
  "click",
  swapComparisonDatasets
);

comparisonSlider.addEventListener(
  "input",
  updateComparisonSlider
);

opacitySlider.addEventListener(
  "input",
  updateOpacitySlider
);

minimizeComparisonButton.addEventListener(
  "click",
  toggleComparisonPanel
);

window.addEventListener(
  "resize",
  function () {

    map.invalidateSize();

  }
);

imageryModeButton.addEventListener(
  "click",
  function () {

    switchWorkspaceMode(
      "imagery"
    );

  }
);

sensorModeButton.addEventListener(
  "click",
  function () {

    switchWorkspaceMode(
      "sensors"
    );

  }
);


// =========================
// INITIALIZE APPLICATION
// =========================

loadBasemap(
  currentBasemapIndex
);

updateZoomLevel();

updateComparisonOptions();

renderImageryCatalogue();

loadAreaOfInterest();

loadDetectionLocations();

createMapLegend();

loadPostProcessingDatasets();

loadPlaceholderSensors();

console.log(
  "BIMP-EAGA Border Imagery Viewer initialized."
);