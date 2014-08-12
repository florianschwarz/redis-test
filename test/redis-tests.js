var assert = require('chai').assert;
var redis = require('redis');
var async = require('async');

describe('Redis tests', function () {

    var client;

    before(function (done) {
        client = redis.createClient();
        client.on('error', function (err) {
            console.error('Redis error ' + err);
        });
        done();
    });

    after(function (done) {
        client.quit();
        done();
    });

    beforeEach(function (done) {
        client.flushdb(done);
    });

    it('Set simple key', function (done) {
        client.set('string key', 'string val', function (err, reply) {
            assert.notOk(err);
            assert.equal(reply, 'OK');
            done();
        });
    });

    it('Set hash field and get hash keys', function (done) {
        assert.ok(true);

        async.series([
            function (cb) {
                client.hset('hash key', 'hashtest 1', 'some value', cb);
            },
            function (cb) {
                client.hset(['hash key', 'hashtest 2', 'some other value'], cb);
            },
            function () {
                client.hkeys('hash key', function (err, replies) {
                    assert.equal(replies[0], 'hashtest 1');
                    assert.equal(replies[1], 'hashtest 2');
                    done();
                });
            }
        ]);
    });

    it('Set and get new key', function (done) {
        client.set('my key 412', 'string val less than 512M', 'NX', function (err, reply) {
            assert.notOk(err);
            assert.equal(reply, 'OK');
            client.get('my key 412', function (err, reply) {
                assert.notOk(err);
                assert.equal(reply, 'string val less than 512M');
                done();
            });
        });
    });

    it('Set non existing key only if key exists', function (done) {
        client.set('my key 123123', 'some value', 'XX', function (err, reply) {
            assert.notOk(err);
            assert.notOk(reply);
            done();
        });
    });

});