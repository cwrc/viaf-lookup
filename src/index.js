'use strict';

/*
     config is passed through to fetch, so could include things like:
     {
         method: 'get',
         credentials: 'same-origin'
    }
*/
const fetchWithTimeout = (url, config = {}, time = 30000) => {

    /*
        the reject on the promise in the timeout callback won't have any effect, *unless*
        the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
        the whole outer Promise, and the promise from the fetch is dropped entirely.
    */

    // Create a promise that rejects in <time> milliseconds
    const timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Call to VIAF timed out')
        }, time)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        fetch(url, config),
        timeout
    ]);

};

// note that this method is exposed on the npm module to simplify testing,
// i.e., to allow intercepting the HTTP call during testing, using sinon or similar.
const getEntitySourceURI = (queryString, methodName) => `https://viaf.org/viaf/search?query=${methodName}+all+%22${encodeURIComponent(queryString)}%22&httpAccept=application/json&maximumRecords=5`;

const getPersonLookupURI = (queryString) => getEntitySourceURI(queryString, 'local.personalNames');

const getPlaceLookupURI = (queryString) => getEntitySourceURI(queryString, 'local.geographicNames');

const getOrganizationLookupURI = (queryString) => getEntitySourceURI(queryString, 'local.corporateNames');

const getTitleLookupURI = (queryString) => getEntitySourceURI(queryString, 'local.uniformTitleWorks');

const getRSLookupURI = (queryString) => getEntitySourceURI(queryString, 'local.names');

const callVIAF = async (url, queryString) => {

    let response = await fetchWithTimeout(url)
        .catch((error) => {
            return error;
        })

    //if status not ok, through an error
    if (!response.ok) throw new Error(`Something wrong with the call to VIAF, possibly a problem with the network or the server. HTTP error: ${response.status}`)

    response = await response.json();

    const results = response.searchRetrieveResponse.records ? response.searchRetrieveResponse.records.map(
        ({
            record: {
                recordData: {
                    nameType,
                    Document: {
                        '@about': uri
                    },
                    mainHeadings: {
                        data: headings
                    }
                    // mainHeadings: {data: {text: name}}
                }
            }
        }) => {
            const name = Array.isArray(headings) ?
                headings[0].text :
                headings.text;
            return {
                nameType,
                id: uri,
                uri,
                uriForDisplay: null,
                externalLink: uri,
                name,
                repository: 'VIAF',
                originalQueryString: queryString
            }
        }) : [];

    return results;

}

const findPerson = (queryString) => callVIAF(getPersonLookupURI(queryString), queryString);

const findPlace = (queryString) => callVIAF(getPlaceLookupURI(queryString), queryString);

const findOrganization = (queryString) => callVIAF(getOrganizationLookupURI(queryString), queryString);

const findTitle = (queryString) => callVIAF(getTitleLookupURI(queryString), queryString);

const findRS = (queryString) => callVIAF(getRSLookupURI(queryString), queryString);

export default {
    findPerson,
    findPlace,
    findOrganization,
    findTitle,
    findRS,
    getPersonLookupURI,
    getPlaceLookupURI,
    getOrganizationLookupURI,
    getTitleLookupURI,
    getRSLookupURI,
    fetchWithTimeout
}