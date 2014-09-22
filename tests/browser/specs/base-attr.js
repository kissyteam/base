/**
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */

var Base = require('base');
describe('base attr', function () {
    it('拥有 EventTarget 上的方法', function () {
        var A = Base.extend();

        var a = new A();

        var fired = false;
        a.on('xxx', function () {
            fired = true;
        });
        a.fire('xxx');
        expect(fired).to.be.ok();
    });

    it('拥有 Attribute 上的方法', function () {
        var A = Base.extend();

        var a = new A();

        // 属性的正常设置和获取
        a.set('xxx', 2);
        expect(a.get('xxx')).to.be(2);

        // 获取不存在的属性
        expect(a.get('non-exist')).to.be(undefined);

        // addAttr
        a.addAttr('attr1', {
            value: 1,
            setter: function (v) {
                return parseInt(v, 10);
            }
        });
        expect(a.get('attr1')).to.be(1);
        a.set('attr1', '2');
        expect(a.get('attr1')).to.be(2);

        // hasAttr
        expect(a.hasAttr('attr1')).to.be.ok();
        expect(a.hasAttr('non-exist')).not.to.be.ok();

        //reset
        a.reset('attr1');
        expect(a.get('attr1')).to.be(1);

        // removeAttr
        a.removeAttr('attr1');
        expect(a.hasAttr('attr1')).not.to.be.ok();

        // 原子性
        expect(a.hasAttr('toString')).not.to.be.ok();
    });

    it('能解析 ATTRS 和 config', function () {
        var A = Base.extend({}, {
            ATTRS: {
                attr1: {
                    value: 0
                }
            }
        });

        var a = new A({ attr1: 1, attr2: 2 });
        expect(a.get('attr1')).to.be(1);
        expect(a.get('attr2')).to.be(2);

        // 多重继承
        var B = A.extend({}, {
            ATTRS: {
                'b-attr': {
                    value: 'b'
                }
            }
        });

        var b = new B({ 'b-attr': 3 });
        expect(b.get('b-attr')).to.be(3);
        expect(b.get('attr1')).to.be(0);
        expect(b.hasAttr('attr2')).not.to.be.ok();
    });

    it('能正确触发 Attribute 的事件', function () {
        var A = Base.extend();

        var a = new A();

        // normal
        var firedCount = 0;
        a.on('beforeAttr1Change afterAttr1Change', function () {
            firedCount++;
        });
        a.set('attr1', 1);
        expect(firedCount).to.be(2);

        // use 'return false' to cancel set
        a.set('attr2', 2);
        a.on('beforeAttr2Change', function () {
            return false;
        });
        a.set('attr2', 3);
        expect(a.get('attr2')).to.be(2);

        // check event object
        a.set('attr3', 3);
        a.on('beforeAttr3Change', function (ev) {
            expect(ev.attrName).to.be('attr3');
            expect(ev.prevVal).to.be(3);
            expect(ev.newVal).to.be(4);
        });
        a.set('attr3', 4);
    });

    it('can preventDefault beforeChange to prevent set', function () {
        var A = Base.extend();

        var a = new A();

        // use 'return false' to cancel set
        a.set('attr2', 2);
        a.on('beforeAttr2Change', function (e) {
            e.preventDefault();
        });
        a.set('attr2', 3);
        expect(a.get('attr2')).to.be(2);
    });

    it('can stopImmediatePropagation beforeChange', function () {
        var A = Base.extend();

        var a = new A();

        // use 'return false' to cancel set
        a.set('attr2', 2);
        a.on('beforeAttr2Change', function (e) {
            e.stopImmediatePropagation();
        });
        a.on('beforeAttr2Change', function (e) {
            e.preventDefault();
        });
        a.set('attr2', 3);
        expect(a.get('attr2')).to.be(3);
    });

    it('transfer default value to value', function () {
        var A = Base.extend({}, {
            ATTRS: {
                a: {
                    value: 9
                }
            }
        });

        var a = new A();

        a.get('a');

        expect(a.__attrVals.a).to.be(9);

        expect(a.__attrs.a.value).to.be(9);

        a.set('a', 7);

        expect(a.__attrVals.a).to.be(7);

        expect(a.__attrs.a.value).to.be(9);
    });
});