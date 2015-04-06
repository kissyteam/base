### extend()

extend() 继承方法（静态方法），快速创建个类，并拥有 base 的能力。

extend() 可以接受多个object作为参数，object 中的 函数，将注入到类的原型中。

{ATTRS:{}} 是特殊的 object ，可以用于配置类的属性。

也接受多个类(function)作为参数（必须是数组），表示类的继承。

继承于 base 的类，必须使用 new 进行初始化。

[Base 所有特性演示](https://jsfiddle.net/minghe36/dgqyxus5/)（demo比较复杂，可以看完下面的api内容，再看这个demo）。

#### 使用例子

通过传递 object ，扩展类的方法。

[demo](https://jsfiddle.net/minghe36/pkek1vcg/)

	var Base = require('base');
	//使用Base.extend() 类继承于 Base
    var Tip = Base.extend({
        //new 初始化时就会执行
        initializer: function(){
            var self = this;
            alert(2);
        }
    });	
    //将类暴露出去给外部使用
    module.exports = Tip;

通过传递 ATTRS object ，扩展类的属性。

[demo](https://jsfiddle.net/minghe36/438mx0tz/)

	 var Base = require('base');
     var DemoClass = Base.extend({},{
        ATTRS:{
            size: {
                value: 0,
                setter: function(v) {
                    return v/2;
                },
                getter: function(v) {
                    return v;
                }
            }
        }
    });
    module.exports = DemoClass;

可以继承其他类：

	 var Base = require('base');
     var DemoClass = Base.extend([Tip],{
        show: function(){
        
        }
     });
    module.exports = DemoClass;
    
留意是数组。

如果是简单继承一个类，可以使用如下写法：

[demo](https://jsfiddle.net/minghe36/Lqjskb3u/)

    var A = Base.extend({
        m: function (value) {
            return value;
        }
    });

    var B = A.extend({
        
    });

    var b = new B();
    console.log(b.m(1));

### initializer

initializer 是base内置的初始化方法，当执行类的构造函数，会自动执行 initializer 方法：

#### 使用例子

    var Tip = Base.extend({
        initializer: function(){
            var self = this;
            alert(2);
        }
    });
    
### destroy() 与 destructor

destructor 是base内置的析构方法，当执行实例的 destroy() 方法时，会自动执行 destructor 方法：

#### 使用例子

    var Tip = Base.extend({
        destructor: function(){
            S.log('析构逻辑写在这里');
        }
    });
    
destroy() ：

    var tip = new Tip();
    tip.destroy();

### callSuper

调用父类的对应方法，如果没有，则返回undefined。

    var A = Base.extend({
        m: function (value) {
            return 'am:' + value;
        }
    });

    var B = A.extend({
        m: function(value) {
            return 'bm:(' + this.callSuper(value) + ')';
        }
    });

    var b = new B();
    console.log(b.m(1));

#### 使用例子

    var Tip = Base.extend({
        destructor: function(){
            S.log('析构逻辑写在这里');
        }
    });

    
### ATTRS 配置

使用 {ATTRS:{}}可以用于配置类的属性。

### plug(Object)

安装指定插件：

### unplug(plugin)

卸载指定插件

### getPlugin(id)

根据指定的 id 获取对应的plugin实例。

### listeners 配置

配置组件的事件绑定

#### 使用例子

    var Tip = Base.extend({
        show: function(){
            this.fire('show');
        }
    });

    var tip = new Tip({
        listeners:{
            show: function(){
                alert(2);
            }
        }
    });
    tip.show();
    
### get('attr')/set('attr','xxx')

属性获取和配置文档请看[attribute]()文档。
