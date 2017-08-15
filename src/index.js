let viafWrapper = require('viaf-wrapper')

async function findPerson(queryString) {
    let viafResults = await viafWrapper.searchPersonalNames(queryString)
    let simplifiedResults = viafResults.map(result=>{
        return {name: result.heading, uri: result.primaryTopic, birthDate: result.birthDate, deathDate: result.deathDate
        }})
    return {originalQueryString: queryString, results:  simplifiedResults }
}

async function findPlace(queryString) {
    let viafResults = await viafWrapper.searchGeographic(queryString)
    let simplifiedResults = viafResults.map(result=>{
        return {name: result.heading, uri: result.primaryTopic}})
    return {originalQueryString: queryString, results:  simplifiedResults }
}

async function findOrganization(queryString) {

    let simplifiedResults = (await viafWrapper.searchCorporate(queryString)).map(result=>{
        return {name: result.heading, uri: result.primaryTopic}})
    return {originalQueryString: queryString, results:  simplifiedResults }
}


module.exports = {
    findPerson: findPerson,
    findPlace: findPlace,
    findOrganization: findOrganization,

}