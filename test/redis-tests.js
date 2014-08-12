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
        async.series([
            function (cb) {
                client.hset('hash key', 'hashtest 1', 'some value', cb);
            },
            function (cb) {
                client.hset('hash key', 'hashtest 2', 'some other value', cb);
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

    it('Incr value', function (done) {
        async.series([
            function (cb) {
                client.set('incr test', '6', cb);
            },
            function (cb) {
                client.incr('incr test', cb);
            },
            function () {
                client.get('incr test', function (err, reply) {
                    assert.notOk(err);
                    assert.equal(reply, '7');
                    done();
                });
            }
        ]);
    });

    it('Incr and decrease value', function (done) {
        async.series([
            function (cb) {
                client.set('incr test2', 6, cb);
            },
            function (cb) {
                client.incrby('incr test2', 56, cb);
            },
            function (cb) {
                client.decrby('incr test2', 2, cb);
            },
            function () {
                client.incr('incr test2', function (err, reply) {
                    assert.notOk(err);
                    assert.equal(reply, 61);
                    done();
                });
            }
        ]);
    });

    it('mset and mget', function (done) {
        async.series([
            function (cb) {
                client.mset('a1', 'a1 value', 'a2', 'a2 value', cb);
            },
            function () {
                client.mget('a1', 'a2', 'a3', function (err, replies) {
                    assert.notOk(err);
                    assert.equal(replies[0], 'a1 value');
                    assert.equal(replies[1], 'a2 value');
                    assert.notOk(replies[2]);
                    done();
                });
            }
        ]);
    });

    it('Exists and delete', function (done) {
        async.series([
            function (cb) {
                client.set('Exists and delete', 6, cb);
            },
            function (cb) {
                client.exists('Exists and delete', function (err, reply) {
                    assert.notOk(err);
                    assert.ok(reply);
                    cb();
                });
            },
            function (cb) {
                client.del('Exists and delete', cb);
            },
            function () {
                client.exists('Exists and delete', function (err, reply) {
                    assert.notOk(err);
                    assert.notOk(reply);
                    done();
                });
            }
        ]);
    });

    it('Store and get object as JSON', function (done) {
        var user = {
            id: 321,
            name: 'peter',
            description: 'peter desc'
        };
        async.series([
            function (cb) {
                client.set('user:321', JSON.stringify(user), cb);
            },
            function () {
                client.get('user:321', function (err, userJsonString) {
                    assert.notOk(err);
                    assert.ok(userJsonString);

                    var user2 = JSON.parse(userJsonString);
                    assert.equal(user2.id, 321);
                    assert.equal(user2.name, 'peter');
                    assert.equal(user2.description, 'peter desc');
                    done();
                });
            }
        ]);
    });

});