// Function to handle multiple API requests
async function handleApiRequests(quantMethod, tissueLabel, variantID, geneID) {
    const datasets = [];
    const associationsData = [];

    let fetchDatasets = true;
    let datasetsStart = 0;
    while (fetchDatasets) {
        const apiUrl = `https://wwwdev.ebi.ac.uk/eqtl/api/v2/datasets?size=1000&${prepParam('start', datasetsStart)}${prepParam('quant_method', quantMethod)}${prepParam('tissue_label', tissueLabel)}`;
        const data = await makeApiRequest(apiUrl);
        if (!data) {
            fetchDatasets = false;
            break;
        }
        datasets.push(...data);
        datasetsStart += 1000;
    }
    console.log(datasets);

    for (const dataset of extractDatasetIds(datasets)) {
        const apiUrl = `https://wwwdev.ebi.ac.uk/eqtl/api/v2/datasets/${dataset}/associations?${prepParam('variant', variantID)}${prepParam('gene_id', geneID)}`;
        const data = await makeApiRequest(apiUrl);
        if (data) {
            // Adding the dataset to the data before adding it to the associationsData
            associationsData.push(...data.map(function (obj) {
                return {...obj, dataset_id: dataset};
            }));
        }
    }
    console.log(associationsData);


    generateTable(associationsData, datasets);
    createPlot(associationsData);
}

function generateTable(associationsData, datasets) {
    // Here we convert the data to the format that DataTables expects
    const dataTableData = associationsData.map(function (obj) {
        return {
            '': '',
            'dataset_id': obj.dataset_id,
            'nlog10p': obj.nlog10p,
            'pvalue': obj.pvalue,
            'molecular_trait_id': obj.molecular_trait_id,
            'gene_id': obj.gene_id,
            'position': obj.position,
            'chromosome': obj.chromosome,
            'ref': obj.ref,
            'alt': obj.alt,
            'type': obj.type,
            'variant': obj.variant,
            'rsid': obj.rsid,
            'ac': obj.ac,
            'an': obj.an,
            'beta': obj.beta,
            'maf': obj.maf,
            'median_tpm': obj.median_tpm,
            'r2': obj.r2,
            'se': obj.se
        };
    });

    // Create a map of dataset_id to dataset information for easy lookup
    const datasetMap = datasets.reduce((acc, dataset) => {
        acc[dataset.dataset_id] = dataset;
        return acc;
    }, {});

    // If the table already exists, destroy it
    if ($.fn.dataTable.isDataTable('#associationsTable')) {
        $('#associationsTable').DataTable().destroy();
    }

    $('#geneVariantsTable').show();

    // Create the DataTable
    var table = $('#associationsTable').DataTable({
        "data": dataTableData,
        "scrollX": true,
        "paging": true,
        "searching": true,
        "ordering": true,
        "info": true,
        columns: [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: '<div style="text-align:center;cursor:pointer"><i class="fa fa-plus-square text-success expand-collapse"></i></div>', // Plus icon as default
                title: ''
            },
            {data: 'dataset_id', title: 'dataset_id'},
            {data: 'nlog10p', title: 'nlog10p'},
            {data: 'pvalue', title: 'pvalue', visible: false},
            {data: 'molecular_trait_id', title: 'molecular_trait_id', visible: false},
            {data: 'gene_id', title: 'gene_id'},
            {data: 'position', title: 'position', visible: false},
            {data: 'chromosome', title: 'chromosome', visible: false},
            {data: 'ref', title: 'ref', visible: false},
            {data: 'alt', title: 'alt', visible: false},
            {data: 'type', title: 'type', visible: false},
            {data: 'variant', title: 'variant'},
            {data: 'rsid', title: 'rsid', visible: false},
            {data: 'ac', title: 'ac', visible: false},
            {data: 'an', title: 'an', visible: false},
            {data: 'beta', title: 'beta'},
            {data: 'maf', title: 'maf', visible: false},
            {data: 'median_tpm', title: 'median_tpm', visible: false},
            {data: 'r2', title: 'r2', visible: false},
            {data: 'se', title: 'se', visible: false},
        ],
        order: [[1, 'asc']]
    });

    // Handle click on checkbox to set column visibility
    $('input.toggle-vis').on('change', function (e) {
        var column = table.column($(this).attr('data-column'));
        column.visible(!column.visible());
    });

    // Add event listener for opening and closing details
    $('#associationsTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);
        var expandCollapseIcon = $(this).find('.expand-collapse');

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            expandCollapseIcon.removeClass('fa fa-minus-square text-danger'); // Remove minus icon
            expandCollapseIcon.addClass('fa fa-plus-square text-success'); // Add plus icon
        } else {
            // Open this row
            var datasetInfo = datasetMap[row.data().dataset_id];
            row.child(format(datasetInfo)).show();
            tr.addClass('shown');
            expandCollapseIcon.removeClass('fa fa-plus-square text-success'); // Remove plus icon
            expandCollapseIcon.addClass('fa fa-minus-square text-danger'); // Add minus icon
        }
    });
}

// Helper function to format the dataset information
function format(datasetInfo) {
    return `
        <div class="card" style="width: 18rem;">
            <div class="card-header">
                Dataset Info
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>Study ID:</strong> ${datasetInfo.study_id}</li>
                <li class="list-group-item"><strong>Quantification Method:</strong> ${datasetInfo.quant_method}</li>
                <li class="list-group-item"><strong>Sample Group:</strong> ${datasetInfo.sample_group}</li>
                <li class="list-group-item"><strong>Tissue ID:</strong> ${datasetInfo.tissue_id}</li>
                <li class="list-group-item"><strong>Study Label:</strong> ${datasetInfo.study_label}</li>
                <li class="list-group-item"><strong>Tissue Label:</strong> ${datasetInfo.tissue_label}</li>
                <li class="list-group-item"><strong>Condition Label:</strong> ${datasetInfo.condition_label}</li>
                <li class="list-group-item"><strong>Dataset ID:</strong> ${datasetInfo.dataset_id}</li>
                <li class="list-group-item"><strong>Sample Size:</strong> ${datasetInfo.sample_size}</li>
            </ul>
        </div>
    `;
}

function createPlot(associationsData) {
    if (!associationsData.length) return;

    var betaValues = associationsData.map(function (obj) {
        return obj.beta;
    });
    var nlog10pValues = associationsData.map(function (obj) {
        return obj.nlog10p;
    });
    var datasetIds = associationsData.map(function (obj) {
        return obj.dataset_id;
    });

    var hoverTexts = datasetIds.map(function (id, i) {
        return `Dataset ID: ${id}<br>Beta: ${betaValues[i]}<br>nlog10p: ${nlog10pValues[i]}`;
    });

    var data = [{
        x: betaValues,
        y: nlog10pValues,
        mode: 'markers',
        type: 'scatter',
        marker: {size: 12},
        text: hoverTexts,
        hoverinfo: 'text'
    }];

    var layout = {
        title: `Effect of ${associationsData[0].variant} on ${associationsData[0].gene_id} expression`,
        xaxis: {
            title: 'Beta',
            zeroline: false
        },
        yaxis: {
            title: 'nlog10p',
            showline: false
        }
    };

    $('#geneVariantsPlot').show();
    $('#geneVariantsPlotTableSeparator').show();
    Plotly.newPlot('geneVariantsPlot', data, layout, {responsive: true});
}

document.getElementById('geneVariantsForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    // Hide old data
    $('#geneVariantsPlot').hide();
    $('#geneVariantsTable').hide();
    $('#geneVariantsPlotTableSeparator').hide();

    // Get the form values
    const quantificationMethod = document.getElementById('quantificationMethod').value;
    const tissueLabel = document.getElementById('tissueLabel').value;
    const variantID = document.getElementById('variantID').value;
    const geneID = document.getElementById('geneID').value;

    // Use the form values as needed (e.g., send them to the server for processing)
    console.log('Quantification Method:', quantificationMethod);
    console.log('Tissue Label:', tissueLabel);
    console.log('Variant ID:', variantID);
    console.log('Gene ID:', geneID);

    // Change the button's content to a loading state
    $('#geneVariantsQuery').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
    $('#geneVariantsQuery').prop('disabled', true);

    // Call the function to start the API requests, table generation, and plot creation
    handleApiRequests(quantificationMethod, tissueLabel, variantID, geneID)
    .then(() => {
        // After the API requests and data processing have completed, update the button again
        $('#geneVariantsQuery').html('Query');
        $('#geneVariantsQuery').prop('disabled', false);
    });
});
