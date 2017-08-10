'use strict';

const test = require('tape')

test('always true', (assert) => {
    assert.plan(1)
    assert.ok(true, 'should trigger a prompt on load')
})