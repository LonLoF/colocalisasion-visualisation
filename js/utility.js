// Function to prep api parameters
function prepParam(prep, param) {
    if (param === '') return '';
    return `${prep}=${param}&`;
}

// Function to extract dataset IDs
function extractDatasetIds(datasets) {
    return datasets.map(dataset => dataset.dataset_id);
}

// Function to make API request
async function makeApiRequest(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (response.status === 400) return null;

        return await response.json();
    } catch (error) {
        console.log('Error occurred when fetching the data:', error);
        return null;
    }
}
