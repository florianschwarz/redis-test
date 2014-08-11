var assert = require('chai').assert;
var redis = require('redis');

describe('Redis tests', function () {

    var client;

    before(function (done) {
        client = redis.createClient();
        done();
    });

    after(function (done) {
        done();
    });

    beforeEach(function (done) {
        done();
    });

    afterEach(function (done) {
        done();
    });


    it('Set simple key', function (done) {
        assert.ok(true);
        client.set('string key', 'string val', function (err, reply) {
            assert.notOk(err);
            assert.equal(reply, 'OK');
            done();
        });
    });
});