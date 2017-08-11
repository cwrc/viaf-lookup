function person(queryString) {
    return {}
}

function place(queryString) {
    return {}
}

function organization(queryString) {
    return {}
}

function sparql(queryString) {
    return {}
}

module.exports = {
    find: {
        person: person,
        place: place,
        organization: organization,
        sparql: sparql
    }
}