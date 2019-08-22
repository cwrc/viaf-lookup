'use strict';

let viaf = require('../src/index.js');

const fetchMock = require('fetch-mock');

const queryString = 'smith';
const queryStringWithNoResults = 'wilson';
const queryStringForTimeout = "chartrand";
const queryStringForError = "cuff";
const expectedResultLength = 5;
const emptyResultFixture = JSON.stringify(require('./httpResponseMocks/noResults.json'));
const personFixture = JSON.stringify(require('./httpResponseMocks/person.json'));
const placeFixture = JSON.stringify(require('./httpResponseMocks/place.json'));
const organizationFixture = JSON.stringify(require('./httpResponseMocks/organization.json'));
const titleFixture = JSON.stringify(require('./httpResponseMocks/title.json'));
const rsFixture = JSON.stringify(require('./httpResponseMocks/rs.json'));

jest.useFakeTimers();

// setup server mocks
[
    {uriBuilderFn: 'getPersonLookupURI', testFixture:personFixture},
    {uriBuilderFn: 'getPlaceLookupURI', testFixture:placeFixture},
    {uriBuilderFn: 'getOrganizationLookupURI', testFixture:organizationFixture},
    {uriBuilderFn: 'getTitleLookupURI', testFixture:titleFixture},
    {uriBuilderFn: 'getRSLookupURI', testFixture:rsFixture}
].forEach(entityLookup=> {

   let uriBuilderFn = viaf[entityLookup.uriBuilderFn];

    fetchMock.get(uriBuilderFn(queryString), entityLookup.testFixture);
    fetchMock.get(uriBuilderFn(queryStringWithNoResults), emptyResultFixture);
    fetchMock.get(uriBuilderFn(queryStringForTimeout), (url, opts)=> {
        setTimeout(Promise.resolve, 8100);
    });
    fetchMock.get(uriBuilderFn(queryStringForError), 500);
})

// from https://stackoverflow.com/a/35047888
function doObjectsHaveSameKeys(...objects){
    const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), []);
    const union = new Set(allKeys);
    return objects.every(object => union.size === Object.keys(object).length);
}

test('lookup builders', ()=> {
    expect.assertions(5);
    ['getPersonLookupURI', 'getPlaceLookupURI', 'getTitleLookupURI', 'getOrganizationLookupURI', 'getRSLookupURI'].forEach(uriBuilderMethod => {
        expect(viaf[uriBuilderMethod](queryString).includes(queryString)).toBe(true);
    });
});

['findPerson', 'findPlace', 'findOrganization', 'findTitle', 'findRS'].forEach((nameOfLookupFn)=> {
    test(nameOfLookupFn, async () => {
        expect.assertions(18);
        let lookupFn = viaf[nameOfLookupFn];
        expect(typeof lookupFn).toBe('function');
        results = await lookupFn(queryString);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeLessThanOrEqual(expectedResultLength);
        results.forEach(singleResult => {
            expect(doObjectsHaveSameKeys(singleResult, {
                nameType: '',
                id: '',
                uri: '',
                uriForDisplay: '',
                externalLink: '',
                name: '',
                repository: '',
                originalQueryString: ''
            })).toBe(true);
            expect(singleResult.originalQueryString).toBe(queryString);
        })

        // with no results
        let results = await lookupFn(queryStringWithNoResults);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);

        // with a server error
        let shouldBeNullResult = false;
        shouldBeNullResult = await lookupFn(queryStringForError).catch(error=>{
             // an http error should reject the promise
             expect(true).toBe(true);
             return false;
        })
        // a falsey result should be returned
        expect(shouldBeNullResult).toBeFalsy();

        // when query times out
        try {
           await lookupFn(queryStringForTimeout);
        } catch (err) {
            // the promise should be rejected
            expect(true).toBe(true);
        }

    })
})




