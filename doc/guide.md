### 使用说明

base 是组件模块基类，模块通过继承Base可以以拥有一种统一的方式创建属性与事件的能力。

base 依赖于 [attribute](https://github.com/kissyteam/attribute)。

kissy 所有的组件必须继承于Base。

有如下几点好处：

* api风格统一的类创建方式
* 拥有强大的属性操作能力
* 拥有自定义对象事件的能力
* 方便拓展和复用

### 基本使用例子

以封装一个简单的提示组件为例：

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
    
initializer() 方法 会在 new 组件会默认执行。
 
初始化 Tip 组件：

     //省略 tip 模块的require
        
     //初始化组件   
     var tip = new Tip();
    
注入二个组件方法 show() 与 hide()：

    var Tip = Base.extend({
        initializer: function(){

        },
        show: function(){
            //省略逻辑...
        },
        hide: function(){
            //省略逻辑...        
        }
    });	
    
### 给类注入属性

javascript 是缺少对象存取器属性的，即没有getter与setter（ECMAScript5后才增加了对象存取器属性,低版本IE并不支持）,使用base，就拥有了统一属性存取的能力，可以无视浏览器的差异。

    var c={
        _name:'kissy',
        get name(){
            return this._name;
        },
        set name(value){
            this._name=value;
        } 
    };
    
    console.log(c.name);
    c.name = "javascript";
    console.log(c._name);
    
当获取object的字段时自动触发get函数，赋值时自动触发set函数。

使用kissy也可以实现类似的功能。

继承于Base的类，请只使用get()和set()来获取/设置属性，免得引起混乱。

我们给 Tip 类注入 $target 属性，用于配置目标元素：

    var Tip = Base.extend({
        initializer: function(){
            var self = this;
            var $target = self.get('$target');
            S.log($target.length);
        }
    },{
         ATTRS:{
            $target:{
                value:'body',
                getter:function(v){
                    return $(v);
                }
            }
         }
     });
     
extend() 参数(object类型)使用ATTRS字段，这是属性添加的关键字。

ATTRS 的值为一个object，每対键值就是一个属性，比如 $target:{} ，就添加了个 $target 属性。

特别留意，属性的值也是个 object ，value 字段设置属性的默认值，经常有粗心的同学，会直接写成 $target: 'body'，这样设置默认值是无效的。

当你设置了 $target:{value:'body'} ，类里面的方法就可以通过 this.get("$target")，来获取此属性。

除了设置属性的默认值外，还可以设置属性的getter方法。比如我们希望 this.get("$target") 获取一个NodeList的对象，如何做呢？

    $target:{
        value:'body',
        getter:function(v){
            return $(v);
        }
    }
 
我们的Tip组件注入的属性，就是暴露给外部配置的参数。

比如：new Tip({$target:"header"});

外部传参会覆盖类的属性默认值。

既然有getter方法，自然有setter方法，同理setter方法，会在设置属性时执行。

    visible:{
        value: false,
        setter: function(v){
            var self = this;
            var $target = self.get('$target');
            if(!v){
                $target.removeClass('tip-show');
            }else{
                S.later(function(){
                    $target.addClass('tip-show');
                });
            }
            return v;
        }
    }
    
当 this.set('visible',true)时，会触发setter方法，demo中我们利用setter这个特性，可以很方便的将样式的改变跟属性的改变联系起来,setter方法也依旧请加返回值。

setter和getter方法内部的this上下文指向类的实例。

实例可以很方便的获取/设置属性

    var tip = new Tip();
    tip.set('visible',true);
    
### change 事件

Base的强大之处在于，当属性值改变前后，会自动触发change事件：

在visible属性值改变前触发：

    tip.on('beforeVisibleChange',function(ev){
        $('body').append('<p>beforeVisibleChange ' + ev.attrName + ': ' + ev.prevVal + ' --> ' + ev.newVal+"</p>");
    });
    
在visible属性值改变后触发：

    tip.on('afterVisibleChange',function(ev){
        $('body').append('<p>afterVisibleChange ' + ev.attrName + ': ' + ev.prevVal + ' --> ' + ev.newVal+"</p>");
    });
    
事件对象中:

* attrName 属性名称
* prevVal 旧的属性值
* newVal 新的属性值

### 添加自定义事件

有时我们需要暴露类的事件给外部监听，Base拥有Event.Target的所有特性。

所以可以很方便地向外广播事件。

    show:function(msg){
        var self = this;
        //...
        
        self.fire('show',{msg: msg});
    }
    
this.fire('show',{msg: msg}) 广播一个show事件，将msg内容传递出去。

外部监听：

    var tip = new Tip();
    tip.on('show',function(ev){
        $('body').append('show事件：' + ev.msg)
    });
    
### 插件机制

base 拥有强大的拓展性，体现在其内置了插件机制。

该特性在复杂组件设计中非常有用，比如kissy的editor编辑器组件和uploader异步上传组件。

我们定义个插件模块，用途是但提示层隐藏后，直接删除节点。

    var Base = require('base');
    var TipRemove = Base.extend({
        pluginInitializer: function(tip){
            if(!tip) return false;
            tip.on('afterVisibleChange',function(ev){
                var $target = tip.get('$target');
                //当提示层隐藏后，直接删除
                if(!ev.newVal){
                    S.later(function(){
                        $target.remove();
                    },2000);
                }
            });
        }
    },{
        ATTRS:{
            pluginId:{
                value:'tip-remove'
            }
        }
    });

    module.exports = TipRemove;
    
pluginInitializer(host) 插件初始化方法，是插件与宿主约定的方法，参数是宿主实例。

插件使用方式：

    //省略 TipRemove 插件的 require()
        
    var tip = new Tip();
    tip.plug(new TipRemove());
    
使用plug()方法，向宿主实例注入插件实例。
