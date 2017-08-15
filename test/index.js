'use strict';

let viaf = require('../src/index.js')
var path = require('path')
const tape = require('tape')
var tapeNock = require('tape-nock')


var test = tapeNock(tape, { //options object to be passed to nock, not required
    fixtures: path.join(__dirname, 'fixtures'), // this is the default path
    mode: 'record', //wild, dryrun, record, lockdown
    defaultTestOptions: { // optionally provide default options to nockBack for each test
        before: function () {
            //console.log('a preprocessing function, gets called before nock.define')
        },
        after: function () {
            //console.log('a postprocessing function, gets called after nock.define')
        }
    }
})

test('find person', (assert) => {
    assert.plan(2)
    viaf.findPerson('jones').then(result=>{
        //assert.comment(JSON.stringify(result))
        assert.equal(result.originalQueryString, 'jones', 'should return original query string')
        assert.ok(Array.isArray(result.results), 'should return an array of results')
    })
})

test('find place', (assert) => {
    assert.plan(2)
    viaf.findPlace('jones').then(result=>{

        assert.equal(result.originalQueryString, 'jones', 'should return original query string')
        assert.ok(Array.isArray(result.results), 'should return an array of results')
    })
})

test('find organization', (assert) => {
    assert.plan(2)
    viaf.findOrganization('jones').then(result=>{

        assert.equal(result.originalQueryString, 'jones', 'should return original query string')
        assert.ok(Array.isArray(result.results), 'should return an array of results')
    })
})

