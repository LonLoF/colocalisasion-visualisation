# Bioinformatics Project

## Overview

This project aims to test if the [European Bioinformatics Institute (EBI) eQTL API](https://wwwdev.ebi.ac.uk/eqtl/api/docs#/) would be suitable for live use in a web application for visualizing the data provided by the API. The project provides an interface to query and visualise gene variant associations. 

## How it Works
### User Interaction

The application allows users to input a `quantification method`, `tissue label` for dataset selection and a `gene ID`, `variant ID` for associations. Upon form submission, the form values are retrieved and passed to the `handleApiRequests` function, which triggers the API requests, data processing and visualisation.

### API Requests

The `handleApiRequests(quantMethod, tissueLabel, variantID, geneID)` function in the `geneVariants.js` file handles the API requests. This function uses the provided parameters to fetch datasets from the eQTL Catalogue API. The function then processes each dataset, making additional requests to fetch the associations data for the specified variant and gene.

### Data Processing

#### Data table

Once all the data has been fetched, it is processed and prepared for display. The data is first converted into the format expected by DataTables. This is done in the `generateTable(associationsData, datasets)` function. This function also handles the creation and manipulation of the DataTable that displays the results. 

The DataTable contains various columns, some of which are hidden by default but can be toggled using the checkboxes at the top of the table. Each row in the DataTable can be expanded to see additional information about the dataset that data came from.

#### Scatter plot
The data is also used to create a scatter plot, showing the correlation between `beta` values and `nlog10p` values for each association in each dataset. This is done in the `createPlot(associationsData)` function.

Hovering over each point in the scatter plot will display the `Dataset ID`, `Beta`, and `nlog10p` values.

## Demo

[![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://lonlof.github.io/colocalisasion-visualisation/)](https://lonlof.github.io/colocalisasion-visualisation/)

Follow the above QR code or [click here](https://lonlof.github.io/colocalisasion-visualisation/) to see the live demo of the project.

## Files

* [geneVariants.js](js/geneVariants.js) - contains the main functions that handle the API requests, data processing, and visualisation.
* [utility.js](js/utility.js) - contains utility functions that aid in the process, including a function to prepare API parameters and a function to make the API requests.

## APIs Used

* EBI eQTL Catalogue API - [API documentation](https://wwwdev.ebi.ac.uk/eqtl/api/docs#/)

## Technology Stack

1. **Front-end** 
   * HTML 
   * JavaScript
   * [jQuery - 3.7.0](https://jquery.com/)
   * [Bootstrap - 4.5](https://getbootstrap.com/docs/4.5/getting-started/introduction/)
   * [Font Awesome - latest](https://fontawesome.com/docs)
2. **Data visualization:** 
   * [DataTables - 1.13.4](https://datatables.net/)
   * [Plotly - latest](https://plotly.com/javascript/)
