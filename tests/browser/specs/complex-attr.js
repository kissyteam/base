/**
 *  complex tc for base and attribute
 *  @author yiminghe@gmail.com
 */

var Base = require('base');
describe('complex attr', function () {
    it('can merge property value object from parent class', function () {
        var A = Base.extend({}, {
            ATTRS: {
                x: {
                    getter: function () {
                        return 1;
                    }
                }
            }
        });

        var B = A.extend({}, {
            ATTRS: {
                x: {
                    value: 2
                }
            }
        });

        var t = new B();

        expect(t.get('x')).to.be(1);
    });

    it('support validator', function () {
        var A = Base.extend({}, {
            ATTRS: {
                tt: {
                    validator: function (v) {
                        return v > 1;
                    }
                }
            }
        });

        var t = new A();

        expect(t.set('tt', 10)).not.to.be(false);

        expect(t.get('tt')).to.be(10);

        expect(t.set('tt', 0)).to.be(false);

        expect(t.get('tt')).to.be(10);
    });

    it('support validators', function () {

        var validatorCalled = 0;

        var A = Base.extend({}, {
            ATTRS: {
                tt: {
                    validator: function (v, name, all) {
                        validatorCalled++;
                        if (all && (v > all.t)) {
                            return 'tt>t!';
                        }
                    }
                },
                t: {
                    validator: function (v) {
                        if (v < 0) {
                            return 't<0!';
                        }
                    }
                }

            }
        });

        var t = new A(),
            e1;

        validatorCalled = 0;
        expect(t.set('t', -1, {
            error: function (v) {
                e1 = v;
            }
        })).to.be(false);
        expect(validatorCalled).to.be(0);
        expect(e1).to.be('t<0!');
        expect(t.get('t')).not.to.be(-1);

        var e2;

        validatorCalled = 0;
        expect(t.set({
            tt: 2,
            t: -1
        }, {
            error: function (v) {
                e2 = v;
            }
        })).to.be(false);
        expect(validatorCalled).to.be(1);
        expect(e2.sort()).to.eql(['t<0!', 'tt>t!'].sort());
        expect(t.get('t')).not.to.be(-1);
        expect(t.get('tt')).not.to.be(2);

        var e3;
        expect(t.set({
            tt: 3,
            t: 4
        }, {
            error: function (v) {
                e3 = v;
            }
        })).not.to.be(false);

        expect(e3).to.be(undefined);
        expect(t.get('t')).to.be(4);
        expect(t.get('tt')).to.be(3);
    });

    it('support sub attribute name', function () {
        var A = Base.extend({}, {
            ATTRS: {
                tt: {
                    // do not  use this in real world code
                    // forbid changing value in getter
                    getter: function (v) {
                        this.__getter = 1;
                        return v;
                    },
                    setter: function (v) {
                        v.x.y++;
                        return v;
                    }
                }
            }
        });

        var t = new A({
            tt: {
                x: {
                    y: 1
                }
            }
        });

        var ret = [];

        t.on('beforeTtChange', function (e) {
            ret.push(e.prevVal.x.y);
            ret.push(e.newVal.x.y);
        });

        t.on('afterTtChange', function (e) {
            ret.push(e.prevVal.x.y);
            ret.push(e.newVal.x.y);
        });

        // only can when tt is  a object (not custom object newed from custom clz)
        expect(t.get('tt.x.y')).to.be(2);

        expect(t.__getter).to.be(1);

        t.set('tt.x.y', 3);
        t.__getter = 0;
        expect(t.get('tt.x.y')).to.be(4);
        expect(t.__getter).to.be(1);

        expect(ret).to.eql([2, 3, 2, 4]);
    });

    it('set sub attr even if not exist attr', function () {
        var A = Base.extend();

        var a = new A();

        a.set('x.y', 1);

        expect(a.get('x')).to.eql({y: 1});

        expect(a.get('x.y')).to.be(1);
    });

    it('validator works for subAttrs', function () {
        (function () {
            var A = Base.extend({}, {
                ATTRS: {
                    'x': {
                        validator: function (v) {
                            return v > 1;
                        }
                    }
                }
            });

            var a = new A();

            a.set('x', 2);

            expect(a.get('x')).to.be(2);

            a.set('x', -1);

            expect(a.get('x')).to.be(2);


            a = new A();

            a.set({'x': 2});

            expect(a.get('x')).to.be(2);

            a.set({'x': -1});

            expect(a.get('x')).to.be(2);
        })();

        (function () {
            var A = Base.extend({}, {
                ATTRS: {
                    'x': {
                        validator: function (v) {
                            return v.y > 10;
                        }
                    }
                }
            });

            var a = new A();

            a.set('x.y', 20);

            expect(a.get('x.y')).to.be(20);

            a = new A();

            a.set({
                'x.y': 20
            });

            expect(a.get('x.y')).to.be(20);

            a.set({'x.y': 9});

            expect(a.get('x.y')).to.be(20);
        })();
    });

    it('should fire *Change once for set({})', function () {
        var A = Base.extend();

        var aa = new A({x: 1, y: {z: 1}}),
            ok = 0,
            afterAttrChange = {};

        aa.on('*Change', function (e) {
            expect(e.newVal).to.eql([11, {z: 22}]);
            expect(e.prevVal).to.eql([1, {z: 1}]);
            expect(e.attrName).to.eql(['x', 'y']);
            expect(e.subAttrName).to.eql(['x', 'y.z']);
            ok++;
        });
        aa.on('afterXChange', function (e) {
            expect(e.attrName).to.be('x');
            expect(e.newVal).to.be(11);
            expect(e.prevVal).to.be(1);
            expect(e.subAttrName).to.be('x');
            afterAttrChange.x = 1;
        });
        aa.on('afterYChange', function (e) {
            expect(e.attrName).to.be('y');
            expect(e.newVal).to.eql({z: 22});
            expect(e.prevVal).to.eql({z: 1});
            expect(e.subAttrName).to.be('y.z');
            afterAttrChange.y = 1;
        });

        aa.set({
            x: 11,
            'y.z': 22
        });

        expect(aa.get('x')).to.be(11);
        expect(aa.get('y.z')).to.be(22);
        expect(ok).to.be(1);

        expect(afterAttrChange.x).to.be(1);
        expect(afterAttrChange.y).to.be(1);
    });
});
