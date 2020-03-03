/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = function (query) {
    return new Promise(function (fulfill, reject) {
        console.log("query-sender:: sendQuery");

        // const requestData = new XMLHttpRequest();
        // requestData.open('PUT', 'http://localhost:4321/dataset/courses/courses', true);
        // requestData.setRequestHeader("Content-Type", "application/x-zip-compressed");
        // requestData.onload = function () {
        //     console.log("requestData onload");
        //     console.log(requestData.responseText);
        //     fulfill(requestData.responseText);
        // }
        //
        // requestData.onerror = function () {
        //     console.log("requestData onerror");
        //     reject("REJECTED :(");
        // }
        // requestData.send(fs.readFileSync("./test/data/courses.zip").toString("base64"));

        const request = new XMLHttpRequest();
        request.open('POST', 'http://localhost:4321/query', true);
        // set header
        request.setRequestHeader("Content-Type", "application/json");
        //var result;
        request.onload = function () {
            console.log("request onload");
            let result = JSON.parse(request.responseText);
            fulfill(result);
            // Changed from the following to above
            // console.log(request.responseText);
            // fulfill(request.responseText);
        }

        request.onerror = function () {
            console.log("request onerror");
            reject("REJECTED :(");
        }
        request.send(JSON.stringify(query));
    });
};
