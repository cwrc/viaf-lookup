'use strict';

import fetchMock from 'fetch-mock';
import viaf from '../src/index.js';

const emptyResultFixture = JSON.stringify(require('./httpResponseMocks/noResults.json'));
const personFixture = JSON.stringify(require('./httpResponseMocks/person.json'));
const placeFixture = JSON.stringify(require('./httpResponseMocks/place.json'));
const organizationFixture = JSON.stringify(require('./httpResponseMocks/organization.json'));
const titleFixture = JSON.stringify(require('./httpResponseMocks/title.json'));
const rsFixture = JSON.stringify(require('./httpResponseMocks/rs.json'));

const queryString = 'smith';
const queryStringWithNoResults = 'wilson';
const queryStringForTimeout = 'chartrand';
const queryStringForError = 'cuff';
const expectedResultLength = 5;

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
    fetchMock.get(uriBuilderFn(queryStringForTimeout), ()=> {
        setTimeout(Promise.resolve, 8100);
    });
    fetchMock.get(uriBuilderFn(queryStringForError), 500);
})

// from https://stackoverflow.com/a/35047888
const doObjectsHaveSameKeys = (...objects) => {
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
        expect.assertions(12);
        
        const results = await viaf[nameOfLookupFn](queryString);
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

    })

    test(`${nameOfLookupFn} - no results`, async () => {
        // with no results
       expect.assertions(2);

       const results = await await viaf[nameOfLookupFn](queryStringWithNoResults);
       expect(Array.isArray(results)).toBe(true);
       expect(results.length).toBe(0);
   })

    test(`${nameOfLookupFn} - server error`, async () => {
        // with a server error
        expect.assertions(2);
     
        let shouldBeNullResult = false;
        shouldBeNullResult = await viaf[nameOfLookupFn](queryStringForError).catch( () => {
            // an http error should reject the promise
            expect(true).toBe(true);
            return false;
        })
        // a falsey result should be returned
        expect(shouldBeNullResult).toBeFalsy();
    })

    test(`${nameOfLookupFn} - times out`, async () => {
        // when query times out
        expect.assertions(1);
        await viaf[nameOfLookupFn](queryStringForTimeout)
            .catch( () => {
                expect(true).toBe(true);
            })
   })
})
