---
title: My effective C++
date: 2024-06-02 16:35:48 +0800
image: /images/post/post-9.jpg
project: project_ccpp
tags: reading

---

 _tags: c++, constructing, reading notes


## My effective C++

### 1. effective C++
#### 1.1 视C++ 为一个语言联邦
* C
* 面向对象编程
* 泛型编程
* STL
  
因此当这四个子语言相互切换的时候，可以更多地考虑高效编程，例如pass-by-value和pass-by-reference在不同语言中效率不同

#### 1.2 enum hack
应该让编译器代替预处理器定义，因为预处理器定义的变量并没有进入到symbol table里面。编译器有时候会看不到预处理器定义

```c++
// c11前
class MyClass {
public:
    enum { MaxSize = 100 };
    // ...
};

//////////////////////
// c11及以后
class MyClass {
public:
    static constexpr int MaxSize = 100;
    // ...
};
```
在 C++11 之前，"enum hack" 是一种常用的创建类常量的方法，有三个特点常量，编译器确定，所有类只有一份。
在 C++11 及其后续版本中，我们可以直接在类中定义静态常量整数，这种方法更直观，也更符合 C++ 的风格。因此，"enum hack" 在现代 C++ 代码中的使用已经变得不那么常见。

#### 1.3 多用const
应该让编译器代替预处理器定义，因为预处理器定义的变量并没有进入到symbol table里面。编译器有时候会看不到预处理器定义
* const出现在星号左边， 被指物是常量
* const出现在星号右边，指针自身是常量

#### 1.4 如何在C++中正确处理非局部静态对象的初始化顺序问题？
在 C++ 中，非局部静态对象的初始化顺序问题可以通过 "Initialization on Demand Idiom" 或 "Singleton Pattern" 来解决。这种方法的基本思想是将非局部静态对象封装在函数内部，这样可以确保它们在首次使用时被初始化。

以下是一个示例：

```c++
class FileSystem {
public:
    std::size_t numDisks() const;
    // 其他成员...
};

// 将非局部静态对象封装在函数内部
FileSystem& tfs() {
    static FileSystem fs; // 在首次使用时初始化
    return fs; // 返回引用
}
```

在这个例子中，`tfs` 函数包含了一个静态的 `FileSystem` 对象 `fs`。这个对象只有在 `tfs` 函数首次被调用时才会被初始化。因此，我们可以确保 `fs` 在首次使用前已经被正确初始化。

这种方法的一个优点是它可以确保非局部静态对象的初始化顺序。因为这些对象是在它们所在的函数首次被调用时初始化的，所以我们可以通过控制函数调用的顺序来控制对象的初始化顺序。

此外，这种方法还可以避免 "static deinitialization order fiasco"。这是因为在程序结束时，静态对象的析构函数会按照与构造函数相反的顺序被调用。如果一个对象的析构函数依赖于另一个对象，而那个对象已经被析构，就会出现问题。但是，如果我们将静态对象封装在函数内部，就可以确保它们在程序结束时仍然存在。

#### 1.5 初始化比赋值快
* 为内置型对象进行手工初始化，因为C++不保证初始化他们
* 构造函数最好使用初始化列初始化而不是复制，并且他们初始化时有顺序的
* 为了免除跨文件编译的初始化次序问题，应该以local static对象替换non-local static对象

#### 1.6 了解C++ 那些自动生成和调用的函数
编译器自动生成的默认构造函数/拷贝构造函数/拷贝赋值操作符和析构函数对成员变量的处理方式如下:

1. 默认构造函数:如果你没有为类定义一个构造函数,编译器会生成一个默认构造函数.这个默认构造函数不会对成员变量进行任何初始化操作.对于内置类型的成员变量,如果你没有在类体中显式初始化它们,它们的值将是未定义的.对于类类型的成员变量,它们将使用其类的默认构造函数进行初始化.

2. 拷贝构造函数:如果你没有为类定义一个拷贝构造函数,编译器会生成一个默认拷贝构造函数.这个默认拷贝构造函数会对每个成员变量进行拷贝初始化.对于内置类型的成员变量,它们的值将被直接拷贝.对于类类型的成员变量,它们将使用其类的拷贝构造函数进行初始化.

3. 拷贝赋值操作符:如果你没有为类定义一个拷贝赋值操作符,编译器会生成一个默认拷贝赋值操作符.这个默认拷贝赋值操作符会对每个成员变量进行拷贝赋值.对于内置类型的成员变量,它们的值将被直接拷贝.对于类类型的成员变量,它们将使用其类的拷贝赋值操作符进行赋值.

4. 析构函数:如果你没有为类定义一个析构函数,编译器会生成一个默认析构函数.这个默认析构函数不会对成员变量进行任何操作.但是,当对象被销毁时,它的成员变量也会被销毁.对于类类型的成员变量,它们将使用其类的析构函数进行销毁.

#### 1.7 绝不在构造和析构过程中调用virtual函数

在C++中,构造函数和析构函数中调用虚函数时,不会有动态绑定.也就是说,调用的虚函数是当前正在执行的构造函数或析构函数所在的类版本,而不是对象的动态类型版本.

这是因为在构造函数和析构函数中,对象的动态类型是正在构造或析构的类.在构造函数中,派生类的部分尚未被构造,在析构函数中,派生类的部分已经被析构.因此,如果在构造函数或析构函数中调用虚函数,那么将会调用基类版本的虚函数,而不是派生类版本的虚函数.

这可能会导致意外的行为,因为通常我们期望虚函数调用的是对象的动态类型版本的函数.因此,应该避免在构造函数和析构函数中调用虚函数.

在C++中,当创建一个派生类的对象时,构造过程是从基类开始,然后逐步向下构造派生类的部分.在基类的构造函数执行期间,派生类的部分还没有被构造,因此虚函数表(vtable)还没有被设置为派生类的虚函数表.这就是为什么在构造函数中调用虚函数时,会调用基类版本的虚函数,而不是派生类版本的虚函数.

同样,在析构过程中,也是从派生类开始,然后逐步向上析构基类的部分.在派生类的析构函数执行后,虚函数表已经被设置回基类的虚函数表.因此,在析构函数中调用虚函数时,也会调用基类版本的虚函数,而不是派生类版本的虚函数.

#### 1.8 return this和return *this的区别是什么
`return this` 和 `return *this` 的主要区别在于它们返回的类型:

- `return this` 返回的是一个指向当前对象的指针.这意味着,如果你有一个对象 `obj`,并且你有一个函数 `func` 返回 `this`,那么 `obj.func()` 将返回一个指向 `obj` 的指针.

- `return *this` 返回的是当前对象的一个引用.这意味着,如果你有一个对象 `obj`,并且你有一个函数 `func` 返回 `*this`,那么 `obj.func()` 将返回一个引用到 `obj`.

在某些情况下,你可能希望返回一个指向当前对象的指针,例如,如果你正在实现一个链式调用.在其他情况下,你可能希望返回一个引用,例如,如果你正在实现一个赋值运算符,通常你会希望返回一个引用,以便支持连续赋值(例如 `a = b = c`).

#### 1.9 复制对象时勿忘其每一个成分
+ 当编写一个copy或者拷贝构造函数,应该确保复制成员里面的所有变量,以及所有基类的成员
+ 不要尝试用一个拷贝构造函数调用另一个拷贝构造函数,如果想要精简代码的话,应该把所有的功能机能放到第三个函数里面,并且由两个拷贝构造函数共同调用
+ 当新增加一个变量或者继承一个类的时候,很容易出现忘记拷贝构造的情况,所以每增加一个变量都需要在拷贝构造里面修改对应的方法

#### 1.10 设计class犹如设计type

如何设计class:
+ 新的class对象应该被如何创建和构造
+ 对象的初始化和赋值应该有什么样的差别(不同的函数调用,构造函数和赋值操作符)
+ 新的class如果被pass by value(以值传递),意味着什么(copy构造函数)
+ 什么是新type的"合法值"(成员变量通常只有某些数值是有效的,这些值决定了class必须维护的约束条件)
+ 新的class需要配合某个继承图系么(会受到继承类的约束)
+ 新的class需要什么样的转换(和其他类型的类型变换)
+ 什么样的操作符和函数对于此type而言是合理的(决定声明哪些函数,哪些是成员函数)
+ 什么样的函数必须为private的 
+ 新的class是否还有相似的其他class,如果是的话就应该定义一个class template
+ 你真的需要一个新type么?如果只是定义新的derived class或者为原来的class添加功能,说不定定义non-member函数或者templates更好


#### 1.11 为多态基类声明virtual析构函数

+ 如果一个函数是多态性质的基类，应该有virtual 析构函数
+ 如果一个class带有任何virtual函数，他就应该有一个virtual的析构函数
+ 如果一个class不是多态基类，也没有virtual函数，就不应该有virtual析构函数

**8. 别让异常逃离析构函数（Prevent exceptions from leaving destructors)**

这里主要是因为如果循环析构10个Widgets，如果每一个Widgets都在析构的时候抛出异常，就会出现多个异常同时存在的情况，这里如果把每个异常控制在析构的话就可以解决这个问题：解决方法为：

因为C++标准规定程序必须立即调用 std::terminate 函数来终止程序.这是因为C++不允许在同一时间处理两个异常.

**9. 绝不在构造和析构过程中调用virtual函数（Never call virtual functions during construction or destruction)**

主要是因为有继承的时候会调用错误版本的函数，例如

**10. 令operator= 返回一个reference to *this （Have assignment operators return a reference to *this)**

主要是为了支持连读和连写，例如：
    
    class Widget{
    public:
        Widget& operator=(int rhs){return *this;}
    }
    a = b = c;

**11. 在operator= 中处理“自我赋值” （Handle assignment to self in operator=)**

主要是要处理 a[i] = a[j] 或者 *px = *py这样的自我赋值。有可能会出现一场安全性问题，或者在使用之前就销毁了原来的对象，例如

**12. 复制对象时勿忘其每一个成分 （Copy all parts of an object)**

#### 三、资源管理 (Resource Management)

**14. 在资源管理类中小心copying行为 （Think carefully about copying behavior in resource-managing classes)**

总结;
+ 复制RAII对象（Resource Acquisition Is Initialization）必须一并复制他所管理的资源（deep copy）
+ 普通的RAII做法是：禁止拷贝，使用引用计数方法

**15. 在资源管理类中提供对原始资源的访问（Provide access to raw resources in resource-managing classes)**

例如：shared_ptr<>.get()这样的方法，或者->和*方法来进行取值。但是这样的方法可能稍微有些麻烦，有些人会使用一个隐式转换，但是经常会出错：
    
    class Font; class FontHandle;
    void changeFontSize(FontHandle f, int newSize){    }//需要调用的API
    
    Font f(getFont());
    int newFontSize = 3;
    changeFontSize(f.get(), newFontSize);//显式的将Font转换成FontHandle
    
    class Font{
        operator FontHandle()const { return f; }//隐式转换定义
    }
    changeFontSize(f, newFontSize)//隐式的将Font转换成FontHandle
    但是容易出错，例如
    Font f1(getFont());
    FontHandle f2 = f1;就会把Font对象换成了FontHandle才能复制

总结：
+ 每一个资源管理类RAII都应该有一个直接获得资源的方法
+ 隐式转换对客户比较方便，显式转换比较安全，具体看需求

**17. 以独立语句将new的对象置入智能指针 （Store newed objects in smart pointers in standalone statements)**

主要是会造成内存泄漏，考虑下面的代码：
    
    int priority();
    void processWidget(shared_ptr<Widget> pw, int priority);
    processWidget(new Widget, priority());// 错误，这里函数是explicit的，不允许隐式转换（shared_ptr需要给他一个普通的原始指针
    processWidget(shared_ptr<Widget>(new Widget), priority()) // 可能会造成内存泄漏
    
    内存泄漏的原因为：先执行new Widget，再调用priority， 最后执行shared_ptr构造函数，那么当priority的调用发生异常的时候，new Widget返回的指针就会丢失了。当然不同编译器对上面这个代码的执行顺序不一样。所以安全的做法是：
    
    shared_ptr<Widget> pw(new Widget)
    processWidget(pw, priority())

总结：
+ 凡是有new语句的，尽量放在单独的语句当中，特别是当使用new出来的对象放到智能指针里面的时候

**21. 必须返回对象时，别妄想返回其reference  （Don't try to return a reference when you must return an object)**

主要是很容易返回一个已经销毁的局部变量，如果想要在堆上用new创建的话，则用户无法delete，如果想要在全局空间用static的话，也会出现大量问题,所以正确的写法是：

    inline const Rational operator * (const Rational &lhs, const Rational &rhs){
        return Rational(lhs.n * rhs.n, lhs.d * rhs.d);
    }
当然这样写的代价就是成本太高，效率会比较低

**23. 以non-member、non-friend替换member函数  （Prefer non-member non-friend functions to member functions)**

区别如下：
    
    class WebBrowser{
        public:
        void clearCache();
        void clearHistory();
        void removeCookies();
    }
    
    member 函数：
    class WebBrowser{
        public:
        ......
        void clearEverything(){ clearCache(); clearHistory();removeCookies();}
    }
    
    non-member non-friend函数：
    void clearBrowser(WebBrowser& wb){
        wb.clearCache();
        wb.clearHistory();
        wb.removeCookies();
    }

这里的原因是：member可以访问class的private函数，enums，typedefs等，但是non-member函数则无法访问上面这些东西，所以non-member non-friend函数更好

这里还提到了namespace的用法，namespace可以用来对某些便利函数进行分割，将同一个命名空间中的不同类型的方法放到不同文件中(这也是C++标准库的组织方式，例如：
    
    "webbrowser.h"
    namespace WebBrowserStuff{
        class WebBrowser{...};
        //所有用户需要的non-member函数
    }
    
    "webbrowserbookmarks.h"
    namespace WebBrowserStuff{
        //所有与书签相关的便利函数
    }

#### 1.12 若所有参数皆需类型转换，请为此采用non-member函数 
在C++中,当你定义一个类的成员函数时,只有第一个参数(在这个例子中是`rhs`)可以进行隐式类型转换.这是因为成员函数的第一个参数实际上是`this`指针,它指向调用该成员函数的对象.

例如,假设你有一个`Rational`类,它有一个成员函数`operator*`:

```cpp
class Rational {
public:
    const Rational operator* (const Rational& rhs) const;
};
```

然后,你试图使用一个`int`和一个`Rational`对象进行乘法运算:

```cpp
Rational oneHalf;
result = oneHalf * 2;  // 正确,2被隐式转换为Rational
result = 2 * oneHalf;  // 错误,因为没有int转Rational函数
```

在这个例子中,`oneHalf * 2`是正确的,因为`2`可以被隐式转换为`Rational`.然而,`2 * oneHalf`是错误的,因为`2`(即`this`指针指向的对象)不能被隐式转换为`Rational`.

为了解决这个问题,你可以定义一个non-member函数(也就是一个普通的函数,不是类的成员函数)来进行乘法运算.在non-member函数中,所有参数都可以进行隐式类型转换.

例如:

```cpp
class Rational {};
const Rational operator*(const Rational& lhs, const Rational& rhs);
```

在这个例子中,`operator*`函数可以接受两个`Rational`对象作为参数.当你使用一个`int`和一个`Rational`对象进行乘法运算时,`int`可以被隐式转换为`Rational`,无论它是第一个参数还是第二个参数.所以,`2 * oneHalf`和`oneHalf * 2`都是正确的.

#### 1.12 考虑写出一个不抛异常的swap函数

写出一个高效、不容易发生误会、拥有一致性的swap是比较困难的，下面是对比代码：

    修改前代码：
    class Widget{
        public:
        Widget& operator=(const Widget& rhs){
            *pImpl = *(rhs.pImpl);//低效
        }
        private:
        WidgetImpl* pImpl;
    }
    
    修改后代码：
    namespace WidgetStuff{
        template<typename T>
        class Widget{
            void swap(Widget& other){
                using std::swap;      //此声明是std::swap的一个特例化，
                swap(pImpl, other.pImpl);
            }
        };
        ...
        template<typename T>           //non-member swap函数
        void swap(Widget<T>& a, Widget<T>& b){//这里并不属于 std命名空间
            a.swap(b);
        }    
    }

总结：
+ 当std::swap对我们的类型效率不高的时候，应该提供一个swap成员函数，且保证这个函数不抛出异常（因为swap是要帮助class提供强烈的异常安全性的）
+ 如果提供了一个member swap，也应该提供一个non-member swap调用前者，对于classes（而不是templates），需要特例化一个std::swap
+ 调用swap时应该针对std::swap使用using std::swap声明，然后调用swap并且不带任何命名空间修饰符
+ 不要再std内加对于std而言是全新的东西（不符合C++标准）

#### 五、实现 (Implementations)

**28. 避免返回handles指向对象内部成分  （Avoid returning "handles" to object internals)**

主要是为了防止用户误操作返回的值：
    
    修改前代码：
    class Rectangle{
        public:
        Point& upperLeft() const { return pData->ulhc; }
        Point& lowerRight() const { return pData->lrhc; }
    }
    如果修改成：
    class Rectangle{
        public:
        const Point& upperLeft() const { return pData->ulhc; }
        const Point& lowerRight() const { return pData->lrhc; }
    }
    则仍然会出现悬吊的变量，例如：
    const Point* pUpperLeft = &(boundingBox(*pgo).upperLeft());
boundingBox会返回一个temp的新的，暂时的Rectangle对象，在这一整行语句执行完以后，temp就变成空的了，就成了悬吊的变量

总结：
+ 尽量不要返回指向private变量的指针引用等
+ 如果真的要用，尽量使用const进行限制，同时尽量避免悬吊的可能性

**29. 为“异常安全”而努力是值得的  （Strive for exception-safe code)**

异常安全函数具有以下三个特征之一：
+ 如果异常被抛出，程序内的任何事物仍然保持在有效状态下，没有任何对象或者数据结构被损坏，前后一致。在任何情况下都不泄露资源，在任何情况下都不允许破坏数据，一个比较典型的反例：
+ 如果异常被抛出，则程序的状态不被改变，程序会回到调用函数前的状态
+ 承诺绝不抛出异常

    原函数：
    class PrettyMenu{
        public:
        void changeBackground(std::istream& imgSrc); //改变背景图像
        private:
        Mutex mutex; // 互斥器
    };

    void changeBackground(std::istream& imgSrc){
        lock(&mutex);               //取得互斥器
        delete bgImage;             //摆脱旧的背景图像
        ++imageChanges;             //修改图像的变更次数
        bgImage = new Image(imgSrc);//安装新的背景图像
        unlock(&mutex);             //释放互斥器
    }
当异常抛出的时候，这个函数就存在很大的问题：
+ 不泄露任何资源：当new Image(imgSrc)发生异常的时候，对unlock的调用就绝不会执行，于是互斥器就永远被把持住了
+ 不允许数据破坏：如果new Image(imgSrc)发生异常，bgImage就是空的，而且imageChanges也已经加上了
  
    修改后代码：
    void PrettyMenu::changeBackground(std::istream& imgSrc){
        Lock ml(&mutex);    //Lock是第13条中提到的用对象管理资源的类
        bgImage.reset(new Image(imgSrc));
        ++imageChanges; //放在后面
    }

总结：
+ 异常安全函数的三个特征
+ 第二个特征往往能够通过copy-and-swap实现出来，但是并非对所有函数都可实现或具备现实意义
+ 函数提供的异常安全保证，通常最高只等于其所调用各个函数的“异常安全保证”中最弱的那个。即函数的异常安全保证具有连带性

**31. 将文件间的编译依存关系降至最低  （Minimize compilation dependencies between files)**

这个关系其实指的是一个文件包含另外一个文件的类定义等

那么如何实现解耦呢,通常是将实现定义到另外一个类里面，如下：
    
    原代码：
    class Person{
    private
        Dates m_data;
        Addresses m_addr;
    }
    
    添加一个Person的实现类，定义为PersonImpl，修改后的代码：
    class PersonImpl;
    class Person{
        private:
        shared_ptr<PersonImpl> pImpl;
    }

在上面的设计下,就实现了解耦，即“实现和接口分离”

与此相似的接口类还可以使用全虚函数
    
    class Person{
        public:
        virtual ~Person();
        virtual std::string name() const = 0;
        virtual std::string birthDate() const = 0;
    }
然后通过继承的子类来实现相关的方法

这种情况下这些virtual函数通常被成为factory工厂函数

总结：
+ 应该让文件依赖于声明而不依赖于定义，可以通过上面两种方法实现
+ 程序头文件应该有且仅有声明

#### 六、继承与面向对象设计 (Inheritance and Object-Oriented Design)

**32. 确定你的public继承塑模出is-a关系  （Make sure public inheritance models "is-a.")**

public类继承指的是单向的更一般化的，例如：
    
    class Student : public Person{...};

其意义指的是student是一个person，但是person不一定是一个student。

这里经常会出的错误是，将父类可能不存在的功能实现出来，例如：
    
    class Bird{
        virtual void fly();
    }
    class Penguin:public Bird{...};//企鹅是不会飞的

这个时候就需要通过设计来排除这种错误，例如通过定义一个FlyBird

总结：
+ public继承中，意味着每一个Base class的东西一定适用于他的derived class

**33. 避免遮掩继承而来的名称  （Avoid hiding inherited names)**

举例：
    class Base{
        public:
        virtual void mf1() = 0;
        virtual void mf1(int);
        virtual void mf2();
        void         mf3();
        void         mf3(double);
    }
    class Derived:public Base{
        public:
        virtual void mf1();
        void         mf3();
    }

这种问题可以通过 
    
    using Base::mf1;
    或者
    virtual void mf1(){//转交函数
        Base::mf1();
    }
    来解决，但是尽量不要出现这种遮蔽的行为

总结：
+ derived class 会遮蔽Base class的名称
+ 可以通过using 或者转交函数来解决

**34. 区分接口继承和实现继承  （Differentiate between inheritance of interface and inheritance of implementation)**

pure virtual 函数式提供了一个接口继承，当一个函数式pure virtual的时候，意味着所有的实现都在子类里面实现。不过pure virtual也是可以有实现的，调用他的实现的方法是在调用前加上基类的名称：
    
    class Shape{
        virtual void draw() const = 0;
    }
    ps->Shape::draw();
总结：
+ 接口继承和实现继承不同，在public继承下，derived classes总是继承base的接口
+ pure virtual函数只具体指定接口继承
+ 简朴的（非纯）impure virtual函数具体指定接口继承以及缺省实现继承
+ non-virtual函数具体指定接口继承以及强制性的实现继承

**35. 考虑virtual函数以外的其他选择  （Consider alternatives to virtual functions)**

NVI手法：通过public non-virtual成员函数间接调用private virtual函数，即所谓的template method设计模式：

    class GameCharacter{
    public:
        int healthValue() const{
            //做一些事前工作
            int retVal = doHealthValue();
            //做一些事后工作
            return retVal;
        }
    private:
        virtual int doHealthValue() const{
            ...                   //缺省算法，计算健康函数
        }
    }
这种方法的优点在于事前工作和事后工作，这些工作能够保证virtual函数在真正工作之前之后被单独调用

但是这种方法只是一种替代方法，另外的方法还有：函数指针（strategy设计模式

    class GameCharacter; // 前置声明
    int defaultHealthCalc(const GameCharacter& gc);
    class GameCharacter{
    public:
        typedef int (*HealthCalcFunc)(const GameCharacter&);//函数指针
        explicit GameCHaracter(HealthCalcFunc hcf = defaultHealthCalc):healthFunc(hcf){}//可以换一个函数的
        int healthValue()const{return healthFunc(*this);}
    private:
        HealthCalcFunc healthFunc;
    }
    
    如果将函数指针换成函数对象的话，会有更具有弹性的效果：
    
    typedef std::tr1::function<int (const GameCharacter&)> HealthCalcFunc;
    在这种情况下，HealthCalcFunc是一个typedef，他的行为更像一个函数指针，表示“接受一个reference指向const GameCharacter，并且返回int*”，

总结：这一节表示当我们为了解决问题而寻找某个特定设计方法时，不妨考虑virtual函数的替代方案
+ 使用NVI手法，他是用public non-virtual成员函数包裹较低访问性（private和protected）的virtual函数
+ 将virtual函数替换成“函数指针成员变量”，这是strategy设计模式的一种表现形式
+ 以tr1::function成员变量替换virtual函数，因而允许使用任何可调用物（callable entity）搭配一个兼容与需求的签名式
+ 将继承体系内的virtual函数替换成另一个继承体系内的virtual函数

+ 将机能从成员函数移到class外部函数，带来的一个缺点是：非成员函数无法访问class的non-public成员
+ tr1::function对象就像一般函数指针，这样的对象可接纳“与给定之目标签名式兼容”的所有可调用物（callable entities）

**36. 绝不重新定义继承而来的non-virtual函数  （Never redefine an inherited non-virtual function)**

主要是考虑一下的代码：
    class B{
    public:
        void mf();
    }
    class D : public B{
    public:
        void mf();
    };

    D x;
    
    B *pB = &x; pB->mf(); //调用B版本的mf
    D *pD = &x; pD->mf(); // 调用D版本的mf

即使不考虑这种代码层的差异，如果这样重定义的话，也不符合之前的“每一个D都是一个B”的定义

**37. 绝不重新定义继承而来的缺省参数值  （Never redefine a function's inherited default parameter value)**

原代码：
    
    class Shape{
    public:
        enum ShapeColor {Red, Green, Blue};
        virtual void draw(ShapeColor color=Red)const = 0;
    };
    class Rectangle : public Shape{
    public:
        virtual void draw(ShapeColor color=Green)const;//和父类的默认参数不同
    }
    Shape* pr = new Rectangle; // 注意此时pr的静态类型是Shape，但是他的动态类型是Rectangle
    pr->draw(); //virtual函数是动态绑定，而缺省参数值是静态绑定，所以会调用Red

**38. 通过复合塑模出has-a或"根据某物实现出"  （Model "has-a" or "is-implemented-in-terms-of" through composition)**

复合：一个类里面有另外一个类的成员，那么这两个类的成员关系就叫做复合（或称聚合，内嵌，内含等）。
我们认为复合的关系是“has a”的概念，

例如：set并不是一个list，但是set可以has a list：
    
    template<class T>
    class Set{
    public: 
        void insert();
        //.......
    private:
        std::list<T> rep;
    }

总结：
+ 复合（composition）的意义和public继承完全不同
+ 在应用域（application domain），复合意味着has a，在实现域（implementation domain），复合意味着 is implemented-in-terms-of

**39. 明智而审慎地使用private继承  （Use private inheritance judiciously)**

因为private继承并不是is-a的关系，即有一部分父类的private成员是子类无法访问的，而且经过private继承以后，子类的所有成员都是private的，意思是is implemented in terms of（根据某物实现出），有点像38条的复合。所以大部分时间都可以用复合代替private继承。

当我们需要两个并不存在“is a”关系的类，同时一个类需要访问另一个类的protected成员的时候，我们可以使用private继承

总结：
+ private 继承意味着is implemented in terms of， 通常比复合的级别低，但是当derived class 需要访问protect base class 的成员，或者需要重新定义继承而来的virtual函数时，这么设计是合理的。
+ 和复合不同，private继承可以造成empty base最优化，这对致力于“对象尺寸最小化”的程序库开发者而言，可能很重要

**40. 明智而审慎地使用多重继承  （Use multiple inheritance judiciously)**

多重继承很容易造成名字冲突：
    
    class BorrowableItem{
        public:
        void checkOut();
    };
    class ElectronicGadget{
        bool checkOut()const;
    };
    class MP3Player:public BorrowableItem, public ElectronicGadget{...};
    MP3Player mp;
    mp.checkOut();//歧义，到底是哪个类的函数
    只能使用：
    mp.BorrowableItem::checkOut();

在实际应用中, 经常会出现两个类继承与同一个父类，然后再有一个类多继承这两个类：
    
    class Parent{...};
    class First : public Parent(...);
    class Second : public Parent{...};
    class last:public First, public Second{...};
当然，多重继承也有他合理的用途，例如一个类刚好继承自两个类的实现。

总结：
+ 多重继承容易产生歧义
+ virtual继承会增加大小、速度、初始化复杂度等成本，如果virtual base class不带任何数据，将是最具使用价值的情况
+ 多重继承的使用情况：当一个类是“public 继承某个interface class”和“private 继承某个协助实现的class”两个相结合的时候。

#### 七、模板与泛型编程 (Templates and Generic Programming)

**41. 了解隐式接口和编译期多态 （Understand implicit interfaces and compile-time polymorphism)**

对于面向对象编程：以显式接口（explicit interfaces）和运行期多态（runtime polymorphism）解决问题：
    
    class Widget {
    public:
        Widget();
        virtual ~Widget();
        virtual std::size_t size() const;
        void swap(Widget& other); //第25条
    }
    
    void doProcessing(Widget& w){
        if(w.size()>10){...}
    }

+ 在上面这段代码中，由于w的类型被声明为Widget，所以w必须支持Widget接口，我们可以在源码中找出这个接口，看看他是什么样子（explicit interface），也就是他在源码中清晰可见
+ 由于Widget的某些成员函数是virtual，w对于那些函数的调用将表现运行期多态，也就是运行期间根据w的动态类型决定调用哪一个函数

在templete编程中：隐式接口（implicit interface）和编译器多态（compile-time polymorphism）更重要：
    
    template<typename T>
    void doProcessing(T& w)
    {
        if(w.size()>10){...}
    }
+ 在上面这段代码中，w必须支持哪一种接口，由template中执行于w身上的操作来决定，例如T必须支持size等函数。这叫做隐式接口
+ 凡涉及到w的任何函数调用，例如operator>，都有可能造成template具现化，使得调用成功，根据不同的T调用具现化出来不同的函数，这叫做编译期多态

**42. 了解typename的双重意义 （Understand the two meanings of typename)**

下面一段代码：
    
    template<typename C>
    void print2nd(const C& container){
        if(container.size() >=2)
            typename C::const_iterator iter(container.begin());//这里的typename表示C::const_iterator是一个类型名称，
                                                               //因为有可能会出现C这个类型里面没有const_iterator这个类型
                                                               //或者C这个类型里面有一个名为const_iterator的变量
    }
所以，在任何时候想要在template中指定一个嵌套从属类型名称（dependent names，依赖于C的类型名称），前面必须添加typename

+ 声明template参数时，前缀关键字class和typename是可以互换的
+ 需要使用typename标识嵌套从属类型名称，但不能在base class lists（基类列）或者member initialization list（成员初始列）内以它作为base class修饰符 
  
    template<typename T>
    class Derived : public typename Base<T> ::Nested{}//错误的！！！！！

**43. 学习处理模板化基类内的名称 （Know how to access names in templatized base classes)**

原代码：
    
    class CompanyA{
    public:
        void sendCleartext(const std::string& msg);
        ....
    }
    class CompanyB{....}
    
    template <typename Company>
    class MsgSender{
    public:
        void sendClear(const MsgInfo& info){
            std::string msg;
            Company c;
            c.sendCleartext(msg);
        }
    }
    template<typename Company>//想要在发送消息的时候同时写入log，因此有了这个类
    class LoggingMsgSender:public MsgSender<Company>{
        public:
        void sendClearMsg(const MsgInfo& info){
            //记录log
            sendClear(info);//无法通过编译，因为找不到一个特例化的MsgSender<company>
        }
    }

解决方法1（认为不是特别好）：

    template <> // 生成一个全特例化的模板
    class MsgSender<CompanyZ>{  //和一般的template，但是没有sendClear,当Company==CompanyZ的时候就没有sendClear了
    public:
        void sendSecret(const MsgInfo& info){....}
    }

解决方法2（使用this）：

    template<typename Company>
    class LoggingMsgSender:public MsgSender<Company>{
        public:
        void sendClearMsg(const MsgInfo& info){
            //记录log
            this->sendClear(info);//假设sendClear将被继承
        }
    }

解决方法3（使用using）：

    template<typename Company>
    class LoggingMsgSender:public MsgSender<Company>{
        public:
    
        using MsgSender<Company>::sendClear; //告诉编译器，请他假设sendClear位于base class里面
    
        void sendClearMsg(const MsgInfo& info){
            //记录log
            sendClear(info);//假设sendClear将被继承
        }
    }

解决方法4（指明位置）：

    template<typename Company>
    class LoggingMsgSender:public MsgSender<Company>{
        public:
        void sendClearMsg(const MsgInfo& info){
            //记录log
            MsgSender<Company>::sendClear(info);//假设sendClear将被继承
        }
    }

上面那些做法都是对编译器说：base class template的任何特例化版本都支持其一般版本所提供的接口

**44. 将与参数无关的代码抽离templates （Factor parameter-independent code out of templates)**

主要是会让编译器编译出很长的臃肿的二进制码，所以要把参数抽离，看以下代码：
    
    template<typename T, std::size_t n>
    class SquareMatrix{
        public:
        void invert();    //求逆矩阵
    }
    
    SquareMatrix<double, 5> sm1;
    SquareMatrix<double, 10> sm2;
    sm1.invert(); 
    sm2.invert(); //会具现出两个invert并且基本完全相同

修改后的代码：
    
    template<typename T>
    class SquareMatrixBase{
        protected:
        void invert(std::size_t matrixSize);
    }
    
    template<typename T, std::size_t n>
    class SquareMatrix:private SquareMatrixBase<T>{
        private:
        using SquareMatrixBase<T>::invert;  //避免遮掩base版的invert
        public:
        void invert(){ this->invert(n); }   //一个inline调用，调用base class版的invert
    }

当然因为矩阵数据可能会不一样，例如5x5的矩阵和10x10的矩阵计算方式会不一样，输入的矩阵数据也会不一样，采用指针指向矩阵数据的方法会比较好：
    
    template<typename T, std::size_t n>
    class SquareMatrix:: private SquareMatrixBase<T>{
        public:
        SquareMatrix():SquareMatrixBase<T>(n, 0), pData(new T[n*n]){
            this->setDataPtr(pData.get());
        }
        private:
        boost::scoped_array<T> pData; //存在heap里面
    };

总结：
+ templates生成多个classes和多个函数，所以任何template代码都不该与某个造成膨胀的template参数产生依赖关系
+ 因非类型模板参数（non-type template parameters）而造成的代码膨胀，往往可以消除，做法是以函数参数后者class成员变量替换template参数
+ 因类型参数（type parameters）而造成的代码膨胀，往往可以降低，做法是让带有完全相同的二进制表述的具现类型，共享实现码

**45. 运用成员函数模板接受所有兼容类型 （Use member function templates to accept "all compatible types.")**

    Top* pt2 = new Bottom; //将Bottom*转换为Top*是很容易的
    template<typename T>
    class SmartPtr{
        public:
        explicit SmartPtr(T* realPtr);
    };
    SmartPtr<Top> pt2 = SmartPtr<Bottom>(new Bottom);//将SmartPtr<Bottom>转换成SmartPtr<Top>是有些麻烦的

但是我们只是希望SmartPtr<Bottom>转换成SmartPtr<Top>，而不希望SmartPtr<Top>转换成SmartPtr<Bottom>
这种需求可以通过构造模板来实现：
    
    template<typename T>
    class SmartPtr{
    public:
        template<typename U>
        SmartPtr(const SmartPtr<U>& other)  //为了生成copy构造函数
            :heldPtr(other.get()){....}
        T* get() const { return heldPtr; }
    private:
        T* heldPtr;                        //这个SmartPtr持有的内置原始指针
    };

总结:
+ 使用成员函数模板生成“可接受所有兼容类型”的函数
+ 如果还想泛化copy构造函数、操作符重载等，同样需要在前面加上template

**46. 需要类型转换时请为模板定义非成员函数 （Define non-member functions inside templates when type conversions are desired)**

像第24条一样，当我们进行混合类型算术运算的时候，会出现编译通过不了的情况
    
    template<typename T>
    const Rational<T> operator* (const Rational<T>& lhs, const Rational<T>& rhs){....}
    
    Rational<int> oneHalf(1, 2);
    Rational<int> result = oneHalf * 2; //错误，无法通过编译

解决方法：使用friend声明一个函数,进行混合式调用
    
    template<typename T>
    class Rational{
        public:
        friend const Rational operator*(const Rational& lhs, const Rational& rhs){
            return Rational(lhs.numerator()*rhs.numerator(), lhs.denominator() * rhs.denominator());
        }
    };
    template<typename T>
    const Rational<T> operator*(const Rational<T>& lhs, const Rational<T>&rhs){....}

总结：
+ 当我们编写一个class template， 而他所提供的“与此template相关的”函数支持所有参数隐形类型转换时，请将那些函数定义为classtemplate内部的friend函数

**47. 请使用traits classes表现类型信息 （Use traits classes for information about types)**

traits是一种允许你在编译期间取得某些类型信息的技术，或者受是一种协议。这个技术的要求之一是：他对内置类型和用户自定义类型的表现必须是一样的。
    
    template<typename T>
    struct iterator_traits;  //迭代器分类的相关信息
                             //iterator_traits的运作方式是，针对某一个类型IterT，在struct iterator_traits<IterT>内一定声明//某个typedef名为iterator_category。这个typedef 用来确认IterT的迭代器分类
    一个针对deque迭代器而设计的class大概是这样的
    template<....>
    class deque{
        public:
        class iterator{
            public:
            typedef random_access_iterator_tag iterator_category;
        }
    }
    对于用户自定义的iterator_traits，就是有一种“IterT说它自己是什么”的意思
    template<typename IterT>
    struct iterator_traits{
        typedef typename IterT::iterator_category iterator_category;
    }
    //iterator_traits为指针指定的迭代器类型是：
    template<typename IterT>
    struct iterator_traits<IterT*>{
        typedef random_access_iterator_tag iterator_category;
    }

综上所述，设计并实现一个traits class：
+ 确认若干你希望将来可取得的类型相关信息，例如对迭代器而言，我们希望将来可取得其分类
+ 为该信息选择一个名称（例如iterator_category）
+ 提供一个template和一组特化版本（例如iterator_traits)，内含你希望支持的类型相关信息

在设计实现一个traits class以后，我们就需要使用这个traits class：
    
    template<typename IterT, typename DistT>
    void doAdvance(IterT& iter, DistT d, std::random_access_iterator_tag){ iter += d; }//用于实现random access迭代器
    template<typename IterT, typename DistT>
    void doAdvance(IterT& iter, DistT d, std::bidirectional_iterator_tag){ //用于实现bidirectional迭代器
        if(d >=0){
            while(d--)
                ++iter;
        }
        else{
            while(d++)
                --iter;
        }
    }
    
    template<typename IterT, typename DistT>
    void advance(IterT& iter, DistT d){
        doAdvance(iter, d, typename std::iterator_traits<IterT>::iterator_category());
    }
使用一个traits class:
+ 建立一组重载函数（像劳工）或者函数模板（例如doAdvance），彼此间的差异只在于各自的traits参数，令每个函数实现码与其接受traits信息相应
+ 建立一个控制函数（像工头）或者函数模板（例如advance），用于调用上述重载函数并且传递traits class所提供的信息

**48. 认识template元编程 （Be aware of template metaprogramming)**

Template metaprogramming是编写执行于编译期间的程序，因为这些代码运行于编译器而不是运行期，所以效率会很高，同时一些运行期容易出现的问题也容易暴露出来
    
    template<unsigned n>
    struct Factorial{
        enum{
            value = n * Factorial<n-1>::value
        };
    };
    template<>
    struct Factorial<0>{
        enum{ value = 1 };
    };                       //这就是一个计算阶乘的元编程


#### 八、定制new和delete (Customizing new and delete)

**49. 了解new-handler的行为 （Understand the behavior of the new-handler)**

当new无法申请到新的内存的时候，会不断的调用new-handler，直到找到足够的内存,new_handler是一个错误处理函数：
    namespace std{
        typedef void(*new_handler)();
        new_handler set_new_handler(new_handler p) throw();
    }

一个设计良好的new-handler要做下面的事情：
+ 让更多内存可以被使用
+ 安装另一个new-handler，如果目前这个new-handler无法取得更多可用内存，或许他知道另外哪个new-handler有这个能力，然后用那个new-handler替换自己
+ 卸除new-handler
+ 抛出bad_alloc的异常
+ 不返回，调用abort或者exit

new-handler无法给每个class进行定制，但是可以重写new运算符，设计出自己的new-handler
此时这个new应该类似于下面的实现方式：
    
    void* Widget::operator new(std::size_t size) throw(std::bad_alloc){
        NewHandlerHolder h(std::set_new_handler(currentHandler));      // 安装Widget的new-handler
        return ::operator new(size);                                   //分配内存或者抛出异常，恢复global new-handler
    }

总结：
+ set_new_handler允许客户制定一个函数，在内存分配无法获得满足时被调用
+ Nothrow new是一个没什么用的东西

**50. 了解new和delete的合理替换时机 （Understand when it makes sense to replace new and delete)**

+ 用来检测运用上的错误，如果new的内存delete的时候失败掉了就会导致内存泄漏，定制的时候可以进行检测和定位对应的失败位置
+ 为了强化效率（传统的new是为了适应各种不同需求而制作的，所以效率上就很中庸）
+ 可以收集使用上的统计数据
+ 为了增加分配和归还内存的速度
+ 为了降低缺省内存管理器带来的空间额外开销
+ 为了弥补缺省分配器中的非最佳对齐位
+ 为了将相关对象成簇集中起来

**51. 编写new和delete时需固守常规（Adhere to convention when writing new and delete)**

+ 重写new的时候要保证49条的情况，要能够处理0bytes内存申请等所有意外情况
+ 重写delete的时候，要保证删除null指针永远是安全的

**52. 写了placement new也要写placement delete（Write placement delete if you write placement new)**

如果operator new接受的参数除了一定会有的size_t之外还有其他的参数，这个就是所谓的palcement new

void* operator new(std::size_t, void* pMemory) throw(); //placement new
static void operator delete(void* pMemory) throw();     //palcement delete，此时要注意名称遮掩问题

## More Effective C++

#### 区分指针和引用

引用必须指向一个对象，而不是空值，下面是一个危险的例子：
    
    char* pc = 0;  //设置指针为空值
    char& rc = *pc;//让引用指向空值，很危险！！！

下面的情况下使用指针：
+ 存在不指向任何对象的可能
+ 需要能够在不同的时刻指向不同的对象
其他情况应该使用引用

#### ??决不要把多态用于数组

主要是考虑以下写法：
    
    class BST{...}
    class BalancedBST : public BST{...}
    
    void printBSTArray(const BST array[]){
        for(auto i : array){
            std::cout << *i;
        }
    }
    
    BalancedBST bBSTArray[10];
    printBSTArray(bBSTArray);

由于我们之前说的，这种情况下编译器是毫无警告的，而对象在传递过程中是按照声明的大小来传递的，所以每一个元素的间隔是sizeof(BST)此时指针就指向了错误的地方

**4. 避免不必要的默认构造函数**

这里主要是为了防止出现有了对象但是却没有必要的数据，例如：没有id的人
但是主要还是在关键词 *不必要* 上面，必要的默认构造函数，不会造成数据出现遗漏的话，还是可以用的
当然，如果不提供缺省构造函数的话，例如：
    
    class EP{
    public:
        EP(int ID);
    }

这样的代码会让使用者在某些时候非常的难受，特别是当EP类是虚类的时候。

这时可以通过让用户使用

    EP bestP[] = {
        EP(ID1),
        EP(ID2),
        ......
    }
函数数组的方法，或者是指针：
    
    typedef EP* PEP;
    PEP bestPieces[10];
    PEP *bestPieces = new PEP[10];然后使用的时候再重新new来进行初始化

#### 二、运算符

**5. 小心用户自定义的转换函数**

因为可能会出现一些无法理解的并且也是无能为力的运算，而且在不需要这些类型转换函数的时候，仍然可能会调用这些转换，例如下面的代码：
    
    // 有理数类
    class Rational{
    public:
        Rational(int numerator = 0, int denominator = 1)
        operator double() const;
    }
    
    Rational r(1, 2);
    double d = 0.5 * r; //将r转换成了double进行计算
    
    cout << r; //会调用最接近的类型转换函数double，将r转换成double打印出来，而不是想要的1/2，

上面问题的解决方法是，把double变成
    
    double asDouble() const;这样就可以直接用了

但是即使这样做还有可能会出现隐式转换的现象：
    
    template<class T>
    class Array{
    public:
        Array(int size);
        T& operator[](int index);
    };
    
    bool operator==(const Array<int> &lhs, const Array<int> & rhs);
    Array<int> a(10), b(10);
    if(a == b[3]) //想要写 a[3] == b[3]，但是这时候编译器并不会报错，解决方法是使用explicit关键字
    
    explicit Array(int size); 
    if(a == b[3]) // 错误，无法进行隐式转换

其实还有一种很骚的操作：

    class Array { 
    public:  
        class ArraySize {                    // 这个类是新的 
            public: 
            ArraySize(int numElements):theSize(numElements){}
            int size() const { return theSize;}
        private: 
            int theSize;
        };
        Array(int lowBound, int highBound); 
        Array(ArraySize size);                  // 注意新的声明
        ... 
    }; 

这样写的代码在Array<int> a(10);的时候，编译器会先通过类型转换转换成ArraySize，然后再进行构造，虽然麻烦很多，效率也低了很多，但是在一定程度上可以避免隐式转换带来的问题

**8. 理解new和delete在不同情形下的含义**

两种new: new 操作符（new operator）和new操作（operator new）的区别

    string *ps = new string("Memory Management"); //使用的是new操作符，这个操作符像sizeof一样是内置的，无法改变
    
    void* operator new(size_t size); // new操作，可以重写这个函数来改变如何分配内存

一般不会直接调用operator new，但是可以像调用其他函数一样调用他：

    void* rawMemory = operator new(sizeof(String));

placement new : placement new 是有一些已经被分配但是没有被处理的内存，需要在这个内存里面构造一个对象，使用placement new 可以实现这个需求，实现方法：
    
    class Widget{
        public:
            Widget(int widgetSize);
        ....
    };
    
    Widget* constructWidgetInBuffer(void *buffer, int widgetSize){
        return new(buffer) Widget(widgetSize);
    }

这样就返回一个指针，指向一个Widget对象，对象在传递给函数的buffer里面分配

同样的道理：
    delete buffer; //指的是先调用buffer的析构函数，然后再释放内存
    operator delete(buffer); //指的是只释放内存，但是不调用析构函数

而placement new 出来的内存，就不应该直接使用delete操作符，因为delete操作符使用operator delete来释放内存，但是包含对象的内存最初不是被operator new分配的，而应该显示调用析构函数来消除构造函数的影响

new[]和delete[]就相当于对每一个数组元素调用构造和析构函数

#### 三、异常

**10. 防止构造函数里的资源泄漏**

这一条主要是防止在构造函数中出现异常导致资源泄露：
    
    BookEntry::BookEntry(){
        theImage     = new Image(imageFileName);
        theAudioClip = new AudioClip(audioClipFileName);
    }
    BookEntry::~BookEntry(){
        delete theImage;
    }

如果在构造函数new AudioClip里面出现异常的话，那么~BookEntry析构函数就不会执行，那么NewImage就永远不会被删除，而且因为new BookEntry失败，导致delete BookEntry也无法释放theImage，那么只能在构造函数里面使用异常来避免这个问题
    
    BookEntry::BookEntry(){
        try{
            theImage     = new Image(imageFileName);
            theAudioClip = new AudioClip(audioClipFileName);
        }
        catch(...){
            delete theImage;
            delete theAudioClip;
            //上面一段代码和析构函数里面的一样，所以可以直接封装成一个成员函数cleanup：
            cleanup();
            throw;
        }
    }

更好的做法是将theImage和theAudioClip做成成员来进行封装：
    
    class BookEntry{
    public:......
    private:
        const auto_ptr<Image> theImage;
        const auto_ptr<AudioClip> theAudioClip;
    }


**11. 阻止异常传递到析构函数以外**

如果析构函数抛出异常的话，会导致程序直接调用terminate函数，中止程序而不释放对象，所以不应该让异常传递到析构函数外面，而是应该在析构函数里面直接catch并且处理掉

另外，如果析构函数抛出异常的话，那么析构函数就不会完全运行，就无法完成希望做的一些其他事情例如：
    
    Session::~Session(){
        logDestruction(this);
        endTransaction(); //结束database transaction,如果上面一句失败的话，下面这句就没办法正确执行了
    }

**12. 理解“抛出异常”，“传递参数”和“调用虚函数”之间的不同**

传递参数的函数：

    void f1(Widget w);
catch子句：    

    catch(widget w)... 

上面两行代码的相同点：传递函数参数与异常的途径可以是传值、传递引用或者传递指针

上面两行代码的不同点：系统所需要完成操作的过程是完全不同的。调用函数时程序的控制权还会返回到函数的调用处，但是抛出一个异常时，控制权永远都不会回到抛出异常的地方
三种捕获异常的方法：
    
    catch(Widget w);
    catch(Widget& w);
    catch(const Widget& w);

一个被抛出的对象可以通过普通的引用捕获，它不需要通过指向const对象的引用捕获，但是在函数调用中不允许传递一个临时对象到一个非const引用类型的参数里面
同时异常抛出的时候实际上是抛出对象创建的临时对象的拷贝，

另外一个区别就是在try语句块里面，抛出的异常不会进行类型转换（除了继承类和基类之间的类型转换，和类型化指针转变成无类型指针的变换），例如：
    
    void f(int value){
        try{
            throw value; //value可以是int也可以是double等其他类型的值
        }
        catch(double d){
            ....         //这里只处理double类型的异常，如果遇到int或者其他类型的异常则不予理会
        }
    }

最后一个区别就是，异常catch的时候是按照顺序来的，即如果两个catch并且存在的话，会优先进入到第一个catch里面，但是函数则是匹配最优的

**13. 通过引用捕获异常**

使用指针方式捕获异常：不需要拷贝对象，是最快的,但是，程序员很容易忘记写static，如果忘记写static的话，会导致异常在抛出后，因为离开了作用域而失效：
    
    void someFunction(){
        static exception ex;
        throw &ex;
    }
    void doSomething(){
        try{
            someFunction();
        }
        catch(exception *ex){...}
    }
创建堆对象抛出异常：new exception 不会出现异常失效的问题，但是会出现在捕捉以后是否应该删除他们接受的指针，在哪一个层级删除指针的问题
通过值捕获异常：不会出现上述问题，但是会在被抛出时系统将异常对象拷贝两次，而且会出现派生类和基类的slicing problem，即派生类的异常对象被作为基类异常对象捕获时，会把派生类的一部分切掉，例如：
    
    class exception{
    public:
        virtual const char *what() throw();
    };
    class runtime_error : public exception{...};
    void someFunction(){
        if(true){
            throw runtime_error();
        }
    }
    void doSomething(){
        try{
            someFunction();
        }
        catch(exception ex){
            cerr << ex.what(); //这个时候调用的就是基类的what而不是runtime_error里面的what了，而这个并不是我们想要的
        }
    }

通过引用捕获异常：可以避免上面所有的问题，异常对象也只会被拷贝一次：
    
    void someFunction(){...} //和上面一样
    void doSomething(){
        try{...}             //和上面一样
        catch(exception& ex){
            cerr << ex.what(); //这个时候就是调用的runtime_error而不是基类的exception::what()了，其他和上面其实是一样的
        }
    }

**14. 审慎地使用异常规格（exception specifications）**

异常规格指的是函数指定只能抛出异常的类型：
    
    extern void f1();    //f1可以抛出任意类型的异常
    void f2() throw(int);//f2只能抛出int类型的异常
    void f2() throw(int){ 
         f1();           //编译器会因为f1和f2的异常规格不同而在发出异常的时候调用unexpected
    }

在用模板的时候，会让这种情况更为明显：
    
    template<class T>
    bool operator==(const T& lhs, const T&rhs) throw(){
        return &lhs == &rhs;
    }
这个模板为所有的类型定义了一个操作符函数operator==对于任意一对相同类型的对象，如果有一样的地址，则返回true，否则返回false，单单这么一个函数可能不会抛出异常，但是如果有operator&重载时，operator&可能会抛出异常，这样就违反了异常规则，让程序跳转到unexpected

阻止程序跳转到unexpected的三种方法：
将所有的unexpected异常都替换成UnexpectedException对象：
    
    class UnexpectedException{}; //所有的unexpected异常对象都被替换成这种对象
    void convertUnexpected(){       //如果一个unexpected异常被抛出，这个函数就会被调用
        throw UnexpectedException();
    }
    set_unexpected(convertUnexpected);
替换unexpected函数：

    void convertUnexpected(){ //如果一个unexpected异常被抛出，这个函数被调用
        throw;                //只是重新抛出当前的异常
    }
    set_unexpected(convertUnexpected);//安装convertUnexpected作为unexpected的替代品，此方法应该在所有的异常规格里面包含bad_exception

总结：异常规格应该在加入之前谨慎的考虑它带来的行为是否是我们所希望的


**15. 理解异常处理所付出的代价**

编译器带来的开销（很难消除，因为所有的编译器都是支持异常的
try块语句的开销：大概会降低5%-10%的速度和增加相应的代码尺寸

#### 2.1 记住80-20准则**

分别有20%的代码耗用了80%的程序资源，运行时间，内存，磁盘，有80%的维护投入到20%的代码上
用profiler工具来对程序进行分析

**17. 考虑使用延迟计算**

一个延迟计算的例子：

    class String{....}
    String s1 = "Hello";
    String s2 = s1;  //在正常的情况下，这一句需要调用new操作符分配堆内存，然后调用strcpy将s1内的数据拷贝到s2里面。但是我们此时s2并没有被使用，所以我们不需要s2，这个时候如果让s2和s1共享一个值，就可以减小这些开销

使用延迟计算进行读操作和写操作：

    String s = "Homer's Iliad";
    cout << s[3];
    s[3] = 'x';
首先调用operator[] 用来读取string的部分值，但是第二次调用该函数式为了完成写操作。读取效率较高，写入因为需要拷贝，所以效率较低，这个时候可以推迟作出是读操作还是写操作的决定。

延迟策略进行数据库操作：有点类似之前写web 的时候，把数据放在内存和数据库两份，更新的时候只更新内存，然后隔一段时间（或者等到使用的时候）去更新数据库。
在effective c++里面，则是更加专业的将这个操作封装成了一个类，然后把是否更新数据库弄成一个flag。以及使用了mutable关键字，来修改数据

延迟表达式：
    
    Matrix<int> m1(1000, 1000), m2(1000, 1000);
    m3 = m1 + m2;
    因为矩阵的加法计算量太大（1000*1000）次计算，所以可以先用表达式表示m3是m1和m2的和，然后真正需要计算出值的时候再真的进行计算（甚至计算的时候也只计算m3[3][2]这样某一个位置的值）

**18. 分期摊还预期的计算开销（提前计算法）**

例如对于max， min函数，如果被频繁调用的话，就可以专门将min和max缓存城一个m_min成员或者mmax成员，这样就在每次调用的时候直接返回就行了，不需要每次调用的时候就重新计算，这个方法叫做cache

prefetching是另一种方法，例如从磁盘读取数据的时候，一次读取一整块或者整个扇区的数据，因为一次读取一大块要比不同时间读取几个小块要快

**19. 了解临时对象的来源**

通常意义的临时对象指的是 temp = a; a = b; b = temp;中的temp
但是在C++中的临时对象指的是那些看不见的东西，例如：

    size_t countChar(const string& str, char ch);
    char buffer[MAX_STRING_LEN];
    cout << countChar(buffer, c);

对于countChar的调用来说，buffer是一个char的数据，但是其形参是const string，那么就需要建立一个string类型的临时对象，然后用buffer作为参数对这个临时对象进行初始化

另外再如operator+重载函数中，函数的返回值是临时的，因为它没有被命名。

所以在任何时候只要见到函数中的常量引用参数，就存在建立临时对象的可能性

**20. 协助编译器实现返回值优化**

一个返回一整个对象的函数，效率是很低的，因为需要调用对象的析构和构造函数。但是有时候编译器会帮助优化我们的实现：
    
    inline const Rational operator*(const Rational& lhs, const Rational& rhs{
        return Rational(lhs.numerator() * rhs.numerator(), lhs.denominator() * rhs.denominator());
    }

上面这个操作实在是太骚了，初看起来好像是会创建一个Rational的临时对象，但是实际上编译器会把这个临时对象给优化掉，所以就免除了析构和构造的开销，而inline还可以减少函数的调用开销

**21. 通过函数重载避免隐式类型转换**

改代码之前：

    class UPInt{
        public:
        UPInt();
        UPInt(int value);
    }
    const UPInt operator+(const UPInt& lhs, const UPInt& rhs);
    upi3 = upi1 + upi2;
    upi3 = 10 + upi1;  // 会产生隐式类型转换，转换过程中会出现临时对象
    upi3 = upi1 + 10;

改代码之后：
    
    const UPInt operator+(const UPInt& lhs, const UPInt& rhs);
    const UPInt operator+(const UPInt& lhs, int rhs);
    const UPInt operator+(int lhs, const UPInt& rhs);

**22. 考虑使用op=来取代单独的op运算符**

operator+ 和operator+=是不一样的，所以如果想要重载+号，就最好重载+=，那么一个比较好的方法就是把+号用+=来实现，当然如果可以的话，可以使用模板编写：
    
    template<class T>
    const T operator+(const T& lhs, const T& rhs)
    {
        return T(lhs) += rhs;
    }
    template<class T>
    const T operator-(const T& lhs, const T& rhs){
        return T(lhs) -= rhs; 
    }


**23. 考虑使用其他等价的程序库**

例如stdio和iostream两个程序库都有输入输出的功能，但是stdio库则速度更快，iostream则写起来更安全。需要合理的选择应用的替代库

**24. 理解虚函数、多重继承、虚基类以及RTTI所带来的开销**

C++的特性和编译器会很大程度上影响程序的效率，所以我们有必要知道编译器在一个C++特性后面做了些什么事情。

例如虚函数，指向对象的指针或者引用的类型是不重要的，大多数编译器使用的是virtual table(vtbl)和virtual table pointers(vptr)来进行实现

vtbl:  

    class C1{
    public:
        C1();
        virtual ~C1();
        virtual void f1();
        virtual int f2(char c)const;
        virtual void f3(const string& s);
        void f4()const
    }

vtbl的虚拟表类似于下面这样,只有虚函数在里面，非虚函数的f4不在里面：

     ___
    |___| → ~C1()
    |___| → f1()
    |___| → f2()
    |___| → f3()

如果按照上面的这种，每一个虚函数都需要一个地址空间的话，那么如果拥有大量虚函数的类，就会需要大量的地址存储这些东西，这个vtbl放在哪里根据编译器的不同而不同

vptr：

     __________
    |__________| → 存放类的数据
    |__________| → 存放vptr

每一个对象都只存储一个指针，但是在对象很小的时候，多于的vptr将会看起来非常占地方。在使用vptr的时候，编译器会先通过vptr找到对应的vtbl，然后通过vtbl开始找到指向的函数
事实上对于函数：
    
    pC1->f1();
他的本质是：

    (*pC1->vptr[i])(pC1);

在使用多继承的时候，vptr会占用很大的地方，并且非常恶心，所以不要用多继承

RTTI：能够让我们在runtime找到对象的类信息，那么就肯定有一个地方存储了这些信息，这个特性也可以使用vtbl实现，把每一个对象，都添加一个隐形的数据成员type_info，来存储这些东西，从而占用很大的空间

#### 五、技巧

**25. 使构造函数和非成员函数具有虚函数的行为**

    class NewsLetter{
    private:
        static NLComponent *readComponent(istream& str);
        virtual NLComponent *clone() const = 0;
    };
    NewsLetter::NewsLetter(istream& str){
        while(str){
            components.push_back(readComponent(str));
        }
    }
    class TextBlock: public NLComponent{
    public:
        virtual TextBlock*clone()const{
            return new TextBlock(*this);
        }
    }
在上面那段代码当中，readComponent就是一个具有构造函数行为（因为能够创建出新的对象）的函数，我们叫做虚拟构造函数

clone() 叫做虚拟拷贝构造函数,相当于拷贝一个新的对象

通过这种方法，我们上面的NewsLetter构造函数就可以这样：

    NewsLetter::NewsLetter(const NewsLetter& rhs){
        while(str){
            for(list<NLComponent*>::const_iterator it=rhs.component.begin(); it!=rhs.component.end();it++){
                components.push_back((*it)->clone());
            }
        }
    }
这样每一个TextBlock都可以调用他自己的clone，其他的子类也可以调用他们自己对应的clone()

**26. 限制类对象的个数**

比如某个类只应该有一个对象，那么最简单的限制这个个数的方法就是把构造函数放在private域里面，这样每个人都没有权力创建对象

或者做一个约束，每次创建的时候都返回static的对象：
    
    class Printer{
    public:
        friend Printer& thePrinter();或者static Printer& thePrinter();
    private:
        Printer();
        Printer(const Printer& rhs);
    };
    Printer& thePrinter(){
        static Printer p;
        return p;
    }
上面这段代码中，Printer类的构造函数是private，可以阻止建立对象，全局函数thePrinter被声明为类的友元，让thePrinter避免私有构造函数引起的限制

创建对象的环境：
当然还有一个直观的方法来限制对象的个数，就是添加一个名为numObjects的static变量，来记录对象的个数，当然这种方法在出现继承的时候会出现问题（一个Printer和一个继承自Printer的colorPrinter同时存在的时候，就会超出numObjects个数，这个时候就需要限制继承

允许对象来去自由：
如果使用伪构造函数的话，会导致对象销毁后，无法创建新的对象，解决方法就是一起使用上面的伪构造函数和计数器。

一个具有对象计数功能的基类：
如果拥有大量像Printer这样的类需要进行计数，那么较好的方法就是一次性封装所有的计数功能,需要确保每个进行实例计数的类都有一个相互隔离的计数器，所以模板会比较好:
    
    template <class BeingCounted>
    class Counted{
    public:
        class TooManyObjects{};
        static int objectCount(){return numObjects;}
    protected:
        Counted();
        Counted(const Counted& rhs);
        ~Counted(){ --numObjects; }
    private:
        static int numObjects;
        static const size_t maxObjects;
        void init();                 //避免构造函数的代码重复
    };
    
    template<class BeingCounted>
    Counted<BeingCounted>::Counted(){init();}
    
    template<class BeingCounted>
    Counted<BeingCounted>::Counted(const Counted<BeingCounted>&){init();}
    
    template<class BeingCounted>
    void Counted<BeingCounted>::init(){
        if(numObjects >= maxObjects)throw TooManyObjects();
        ++numObjects;
    }
    
    class Printer:private Counted<Printer>{
    public:
        static Printer* makePrinter(); // 伪构造函数
        using Counted<Printer>::objectCount;
        using Counted<Printer>::TooManyObjects;
    }
**27. 要求或禁止对象分配在堆上**

必须在堆中建立对象（程序有自我管理对象的需求）：
禁用隐式的构造函数和析构函数，例如声明成private，或者仅仅让析构函数成为private（副作用小一些），然后创建一个public的destory()方法来调用析构。
遇到继承析构的问题的话(现在的做法无法继承)，也可以将析构函数声明成protected的

判断一个对象是否在堆中：
在构造函数中无法区分是否在堆中，但是在new里面可以做些事情：
    
    class UPNumber{
    public:
        class HeapConstraintViolation{};
        static void* operator new(size_t size);
        UPNumber();
    private:
        static bool onTheHeap;
    };
实际上上面这段代码是跑不了的，因为如果使用new[]创造数组的话就没有办法用了

另一种方法是判断变量所在的地址，因为stack是从高位地址向下的，heap是从地位地址向上的：
    
    bool onHeap(const void *address) { 
        char onTheStack; // 局部栈变量，因为他是新的变量，所以比他小的都在堆或者静态空间里面，比他大的都在栈里面
        return address < &onTheStack; 
    }

禁止堆对象：
重写operator new就行了，例如弄成private

**28. 智能(smart)指针**

auto_ptr：会把值给传出去，原来的指针作废掉
实现dereference（取出指针所指东西的内容）：
    template<class T>
    T& SmartPtr<T>::operaotr*()const{
        return *pointee;
    }

    template<class T>
    T* SmartPtr<T>::operator->()const{
        return pointee;
    }

测试smart pointer是否是NULL：
如果直接使用下面的代码是错误的：
    
    SmartPtr<TreeNode> ptn;
    if(ptn == 0)... //error
    if(ptn)... //error
    if(!ptn)... //error
所以需要进行隐式类型转换操作符，才能够进行上面的操作
    
    template<class T>
    class SmartPtr{
    public:
        operator void*();
    };
    SmartPtr<TreeNode> ptn;
    if(ptn == 0) //现在正确
    if(ptn) //现在正确
    if(!ptn) //现在正确

smart pointer 和继承类/基类的类型转换:

    class MusicProduct{....};
    class Cassette:public MusicProduct{....};
    class CD:public MusicProduct{....};
    displayAndPlay(const SmartPtr<MusicProduct>& pmp, int numTimes);
    
    SmartPtr<Cassette> funMusic(new Cassette("1234"));
    SmartPtr<CD> nightmareMusic(new CD("143"));
    displayAndPlay(funMusic, 10); // 错误!
    displayAndPlay(nightmareMusic, 0); // 错误!
我们可以看到的是，如果没有隐式转换操作符的话，是没有办法进行转换的，那么解决方法就是添加一个操作符,：
    
    class SmartPtr<Cassette>{//或者用模板来代替
    public:
        operator SmartPtr<MusicProduct>(){
            return SmartPtr<MusicProduct>(pointee);
        }
    };
smart pointer 和 const：
    
    SmartPtr<CD> p; //non-const 对象 non-const 指针
    SmartPtr<const CD> p; //const 对象 non-const 指针
    const SmartPtr<CD> p = &goodCD; //non-const 对象 const 指针
    const SmartPtr<const CD> p = &goodCD; //const 对象 const 指针
    
    template<class T>      // 指向const对象的
    class SmartPtrToConst{ //灵巧指针
        ...                // 灵巧指针通常的成员函数
    protected:
        union {
            const T* constPointee; // 让 SmartPtrToConst 访问
            T* pointee; // 让 SmartPtr 访问
        };
    };
    
    template<class T> // 指向 non-const 对象的灵巧指针
    class SmartPtr: public SmartPtrToConst<T> {
        ... // 没有数据成员
    };


**29. 引用计数**
就是一个smart pointer，不讨论了
**30. 代理类**

例子：实现二维数组类：
    
    template<class T>
    class Array2D{
    public:
        Array2D(int dim1, int dim2);
        class Array1D{
        public:
            T& operator[](int index);
            const T& operator[](int index) const;
        };
        Array1D operator[](int index);
        const Array1D operator[](int index) const;
    };
    Array2D<int> data(10, 20);
    cout << data[3][6] //这里面的[][]运算符是通过两次重载实现的

例子：代理类区分[]操作符的读写：

采用延迟计算方法，修改operator[]让他返回一个（代理字符的）proxy对象而不是字符对象本身，并且判断之后这个代理字符怎么被使用，从而判断是读还是写操作
    
    class String{
    public:
        class CharProxy{
        public:
            CharProxy(String& str, int index);
            CharProxy& operator=(const CharProxy& rhs);
            CharProxy& operator=(char c);
            operator char() const;
        private:
            String& theString;
            int charIndex;
        };
        const CharProxy operator[](int index) const;//对于const的Strings
        CharProxy operator[](int index);            //对于non-const的Strings
    
        friend class CharProxy;
    private:
        RCPtr<StringValue> value;
    };

**31. 基于多个对象的虚函数**

考虑两个对象碰撞的问题：
    
    class GameObject{....};
    class SpaceShip : public GameObject{....};
    class SpaceStation : public GameObject{....};
    class Asteroid : public GameObject{....};
    
    void checkForCollision(GameObject& object1, GameObject& object2){
        processCollision(object1, object2);
    }

当我们调用processCollision的时候，该函数取决于两个不同的对象，但是这个函数并不知道其object1和object2的真实类型，这个时候就要基于多个对象设计虚函数 

解决方法有很多：
    
使用虚函数+RTTI：

    class GameObject{
    public:
        virtual void collide(GameObject& otherObject) = 0;
    };
    class SpaceShip:public GameObject{
    public:
        virtual void collide(GameObject& otherObject);
    };
    
    void SpaceShip:collide(GameObject& otherObject){
        const type_info& objectType = typeid(otherObject);
        if(objectType == typeid(SpaceShip)){
            SpaceShip& ss = static_cast<SpaceShip&>(otherObject);
        }
        else if(objectType == typeid(SpaceStation)).......
    }
只使用虚函数：
    
    class SpaceShip; // forward declaration
    class SpaceStation;
    class Asteroid;
    class GameObject { 
    public:
        virtual void collide(GameObject&   otherObject) = 0;
        virtual void collide(SpaceShip&    otherObject) = 0;
        virtual void collide(SpaceStation& otherObject) = 0;
        virtual void collide(Asteroid&     otherObject) = 0;
        ...
    };
模拟虚函数表（对继承体系中的函数做一些修改）：

    class SpaceShip : public GameObject { 
    public:
        virtual void collide(GameObject&   otherObject);
        virtual void hitSpaceShip(SpaceShip&    otherObject);
        virtual void hitSpaceStation(SpaceStation& otherObject);
        virtual void hitAsteroid(Asteroid&     otherObject);
        ...
    };
初始化模拟虚函数表：
    
    class GameObject { // this is unchanged 
    public: 
        virtual void collide(GameObject& otherObject) = 0;
        ...
    };
    
    class SpaceShip: public GameObject {
    public:
        virtual void collide(GameObject& otherObject);
        // these functions now all take a GameObject parameter
        virtual void hitSpaceShip(GameObject& spaceShip);
        virtual void hitSpaceStation(GameObject& spaceStation);
        virtual void hitAsteroid(GameObject& asteroid);
        ...
    };
    
    SpaceShip::HitMap * SpaceShip::initializeCollisionMap(){
        HitMap *phm = new HitMap;
        (*phm)["SpaceShip"] = &hitSpaceShip;
        (*phm)["SpaceStation"]= &hitSpaceStation;
        (*phm)["Asteroid"] = &hitAsteroid;
        return phm; 
    }


#### 六、杂项

**33. 将非尾端类设计为抽象类**

如果采用这样的代码：

    class Animal{
    public:
        virtual Animal& operator=(const Animal& rhs);
        ....
    };
    class Lizard:public Animal{
    public:
        virtual Lizard& operator=(const Animal& rhs);
    };
    class Chicken:public Animal{
    public:
        virtual Chicken& operator=(const Animal& rhs);
    }
则会出现我们不愿意出现的类型转换和赋值：
    
    Animal *pAnimal1 = &liz;
    Animal *pAnimal2 = &chick;
    *pAnimal1 = *pAnimal2;      //把一个chick赋值给了一个lizard

但是我们又希望下面的操作是可行的：
    Animal *pAnimal1 = &liz1;
    Animal *pAnimal2 = &liz2;
    *pAnimal1 = *pAnimal2;      //正确，把一个lizard赋值给了一个lizard

解决这个问题最简单的方法是使用dynamic_cast进行类型检测，但是还有一个方法就是把Animal设成抽象类或者创建一个抽象Animal类：

    class AbstractAnimal{
    protected:
        AbstractAnimal& operator=(const AbstractAnimal& rhs);
    public:
        virtual ~AbstractAnimal() = 0;
    };
    
    class Animal: public AbstractAnimal{
    public:
        Animal& operator=(const Animal& rhs);
    };
    class Lizard:public AbstractAnimal{
    public:
        virtual Lizard& operator=(const Animal& rhs);
    };
    class Chicken:public AbstractAnimal{
    public:
        virtual Chicken& operator=(const Animal& rhs);
    }

感觉这个方法以后会非常有用。。。。

**34. 理解如何在同一程序中混合使用C**

名字变换：就是在编译器分别给C++和C不同的前缀，在C语言中，因为没有函数重载，所以编译器没有专门给函数改变名字，但是在C++里面，编译器是要给函数不同的名字的。

C++的extern‘C’可以禁止进行名字变换，例如：
    
    extern 'C'
    void drawLine(int x1, int y1, int x2, int y2);

静态初始化：在C++中，静态的类对象和定义会在main执行前执行。
在编译器中，这种处理方法通常是在main里面默认调用某个函数：
    
    int main(int argc, char *argv[]){
        performStaticInitialization();
    
        realmain();
    
        performStaticDestruction();
    }
动态内存分配：C++时候new和delete，C是malloc和free

数据结构的兼容性：C无法知道C++的特性

总结下来就是：确保C++和C编译器产生兼容的obj文件，将在两种语言下都是用的函数声明为extern'C'，只要可能，应该用C++写main(),delete，new成对使用，malloc和free成对使用，

## Effective Modern C++

some note copy from [EffectiveModernCppChinese](https://github.com/racaljk/EffectiveModernCppChinese)

#### 一、类型推导

**2. 理解auto类型推导**

auto关键字的类型推倒和模板差不多，auto就相当于模板中的T，所以：

    auto x = 27; // 情况3（x既不是指针也不是引用）
    const auto cx = x; // 情况3（cx二者都不是）
    const auto& rx = x; // 情况1（rx是一个非通用的引用）
    
    auto&& uref1 = x; // x是int并且是左值，所以uref1的类型是int&
    auto&& uref2 = cx; // cx是int并且是左值，所以uref2的类型是const int&
    auto&& uref3 = 27; // 27是int并且是右值， 所以uref3的类型是int&&
在花括号初始化的时候，推倒的类型是std::initializer_list的一个实例，但是如果把相同的类型初始化给模板，则是失败的，

    auto x = { 11, 23, 9 }; // x的类型是std::initializer_list<int>
    template<typename T> void f(T param); // 和x的声明等价的模板
    f({ 11, 23, 9 }); // 错误的！没办法推导T的类型
    
    template<typename T> void f(std::initializer_list<T> initList);
    f({ 11, 23, 9 }); // T被推导成int，initList的类型是std::initializer_list<int>

**3. 理解decltype**

    template<typename Container, typename Index> // works, but requires refinements
    auto authAndAccess(Container& c, Index i) -> decltype(c[i])
    {
        authenticateUser();
        return c[i];
    }
    在上面的这段代码里面，C++14可以把后面的->decltype(c[i])删掉，但是auto实际推倒的类型是container而不带引用。因为 authAndAccess(d, 5) = 10这样是编译器不允许的情况。
如果想要返回引用的话，需要将上面的那一段代码重写成下面的样子：
    
    template<typename Container, typename Index> // works, but still requires refinements
    decltype(auto) authAndAccess(Container& c, Index i)
    {
        authenticateUser();
        return c[i];
    }
如果想要这个函数既返回左值（可以修改）又可以返回右值（不能修改）的话，可以用下面的写法：
    
    template<typename Container, typename Index>
    decltype(auto) authAndAccess(Container&& c, Index i){//C++14
        authenticateUser();
        return std::forward<Container>(c)[i];
    }
decltype的一些让人意外的应用：
    
    decltype(auto) f2(){
        int x = 0 ;
        return x;     // 返回的是int;
    }
    decltype(auto) f2(){
        int x = 0;
        return (x);   //返回的是int&
    }

#### 二、auto

**6. auto推导若非己愿，使用显式类型初始化惯用法**

    std::vector<bool> features(const Widget& w);
    Widget w;
    auto highPriority = features(w)[5]
    
    processWidget(w, highPriority); // 未定义的行为，因为这个时候highPriority已经不是bool类型的了，这个时候返回的是一个std::vector<bool>::reference对象（内嵌在std::vector<bool>中的对象）
如果用：
    
    bool highPriority = features(w)[5];的时候，因为编译器看到bool，所以会发生隐式转换，将reference转换成bool类型
当然也有强制变成bool 的方法：
    
    auto highPriority = static_cast<bool>(features(w)[5]);


#### 三、移步现代C++

**7. 区别使用()和{}创建对象**

大括号{}，更像是一种通用的，什么时候初始化都能用的东西，但是大括号会进行类型检查：
    
    double x, y, z;
    int sum1{x+y+z}; //错误，因为double之和可能无法用int表达（超出int范围）

小括号()和等于号=在更多时候是无法使用的，并且小括号很容易被认为是一个函数。但是这两个不会进行类似上面的类型检查：
    
    class Widget{
        int x{0}; //right
        int y = 0;//right
        int z(0); //错！
    };
    
    std::atomic<int> ai2(0); //right
    std::atomic<int> ai3 = 0; //错！
    
    Widget w1(10); //调用w1的构造函数

大括号和小括号的另一个区别是带有std::initializer_list<long double> 的时候，会自动调用大括号，反之没区别：
    
    class Widget{
    public:
        Widget(int i, bool b);
        Widget(std::initializer_list<long double> il);
    };
    
    Widget w1(10, true); //调用第一个构造函数
    Widget w2{10, true}; //调用第二个构造函数

**9. 优先考虑别名声明而非typedefs**

别名声明可以让函数指针变得更容易理解：

    // FP等价于一个函数指针，这个函数的参数是一个int类型和
    // std::string常量类型，没有返回值
    typedef void (*FP)(int, const std::string&); // typedef
    // 同上
    using FP = void (*)(int, const std::string&); // 声明别名
并且类型别名可以实现别名模板，而typedef不行：
    
    template<typname T> // MyAllocList<T>
    using MyAllocList = std::list<T, MyAlloc<T>>; // 等同于std::list<T,MyAlloc<T>>
    MyAllocList<Widget> lw; // 终端代码
模板别名还避免了::type的后缀，在模板中，typedef还经常要求使用typename前缀：
    
    template<class T>
    using remove_const_t = typename remove_const<T>::type

**15. 尽可能的使用constexpr**

constexpr：表示的值不仅是const，而且在编译阶段就已知其值了，他们因为这样的特性就会被放到只读内存里面，并且因为这个特性，constexpr的值可以用在数组规格，整形模板实参中：
    
    constexpr auto arraySize = 10;
    std::array<int, arraySize> data2;

但是对于constexpr的函数来说，如果所有的函数实参都是已知的，那这个函数也是已知的，如果所有实参都是未知的，编译无法通过，
在调用constexpr函数时，入股传入的值有一个或多个在编译期未知，那这个函数就是个普通函数，如果都是已知的，那这个函数也是已知的。

**16. 确保const成员函数线程安全**

    class Polynomial{
    public:
        using RootsType = std::vector<double>;
        RootsType roots() const{
            if(!rootAreValid){
                rootsAreValid = true;
            }
            return rootVals;
        }
    private:
        mutable bool rootsAreValid{false};
        mutable RootsType rootVals{};
    }

在上面那段代码中，虽然roots是const的成员函数，但是成员变量是mutable的，是可以在里面改的，如果这样做的话，就无法做到线程安全，并且编译器在看到const的时候还认为他是安全的。这个时候只能加上互斥量 std::lock_guard<std::mutex> g(m); mutable std::mutex m;

当然，除了上面添加互斥量的做法以外，成本更低的做法是进行std::atomic的操作（但是仅适用于对单个变量或内存区域的操作）：
    
    class Point{
    public:
        double distanceFromOrigin() const noexcept{
            ++callCount;
            return std::sqrt((x*x) + (y * y));
        }    
    private:
        mutable std::atomic<unsigned> callCount{0};
        double x, y;
    };

**17. 理解特殊成员函数函数的生成**

特殊成员函数包括默认构造函数，析构函数，拷贝构造函数，拷贝赋值运算符（这些函数只有在需要的时候才会生成），以及最新的移动构造函数和移动赋值运算符

三大律：如果你声明了拷贝构造函数，赋值运算符重载，析构函数中的任何一个，都需要把其他几个补全，如果不想自己写的话，也要写上=default（如果不声明的话，编译器很有可能不会生成另外几个函数的默认函数）

对于成员函数模板来说，在任何情况下都不会抑制特殊成员函数的生成

#### 四、智能指针

**18. 对于占有性资源使用std::unique_ptr**

资源是独占的，不允许拷贝，允许进行move
std::unique_ptr是一个具有开销小，速度快，move-only特定的智能指针，使用独占拥有方式来管理资源

默认情况下，释放资源由delete来完成，也可以指定自定义的析构函数来替代，但是具有丰富状态的deleters和以函数指针作为deleters增大了std::unique_ptr的存储开销

很容易将一个std::unique_ptr转化为std::shared_ptr

**19. 对于共享性资源使用std::shared_ptr**

+ std::shared_ptr是原生指针的两倍大小，因为他们内部除了包含一个原生指针以外，还包含了一个引用计数
+ 引用计数的内存必须被动态分配，当然用make_shared来创建shared_ptr会避免动态内存的开销。
+ 引用计数的递增和递减必须是原子操作。
+ std::shared_ptr为了管理任意资源的共享式内存管理，提供了自动垃圾回收的便利
+ std::shared_ptr 是 std::unique_ptr 的两倍大，除了控制块，还有需要原子引用计数操作引起的开销
+ 资源的默认析构一般通过delete来进行，但是自定义的deleter也是支持的。deleter的类型对于 std::shared_ptr 的类型不会产生影响
+ 避免从原生指针类型变量创建 std::shared_ptr

**20. 对于类似于std::shared_ptr的指针使用std::weak_ptr可能造成悬置**

weak_ptr通常由一个std::shared_ptr来创建，他们指向相同的地方，但是weak_ptr并不会影响到shared_ptr的引用计数：
    
    auto spw = std::make_shared<Widget>();//spw 被构造之后被指向的Widget对象的引用计数为1(欲了解std::make_shared详情，请看Item21)
    std::weak_ptr<Widget> wpw(spw);//wpw和spw指向了同一个Widget,但是RC(这里指引用计数，下同)仍旧是1
    spw = nullptr;//RC变成了0，Widget也被析构，wpw现在处于悬挂状态
    if(wpw.expired())... //如果wpw悬挂...
那么虽然weak_ptr看起来没什么用，但是他其实也有一个应用场合（用来做缓存）：
    
    std::unique_ptr<const Widget> loadWidget(WidgetID id); //假设loadWidget是一个很繁重的方法，需要对这个方法进行缓存的话，就需要用到weak_ptr了：
    
    std::shared_ptr<const Widget> fastLoadWidget(WidgetId id){
        static std::unordered_map<WidgetID,
        std::weak_ptr<const Widget>> cache;
        auto objPtr = cache[id].lock();//objPtr是std::shared_ptr类型指向了被缓存的对象(如果对象不在缓存中则是null)
        if(!objPtr){
            objPtr = loadWidget(id);
            cache[id] = objPtr;
        }   //如果不在缓存中，载入并且缓存它
        return objPtr;
    }
+ std::weak_ptr 用来模仿类似std::shared_ptr的可悬挂指针
+ 潜在的使用 std::weak_ptr 的场景包括缓存，观察者列表，以及阻止 std::shared_ptr 形成的环

**21. 优先考虑使用std::make_unique和std::make_shared而非new**

+ 和直接使用new相比，使用make函数减少了代码的重复量，提升了异常安全度，并且，对于std::make_shared以及std::allocate_shared来说，产生的代码更加简洁快速
+ 也会存在使用make函数不合适的场景：包含指定自定义的deleter,以及传递大括号initializer的需要
+ 对于std::shared_ptr来说，使用make函数的额外的不使用场景还包含

    (1)带有自定义内存管理的class
    (2)内存非常紧俏的系统，非常大的对象以及比对应的std::shared_ptr活的还要长的std::weak_ptr

**22. 当使用Pimpl惯用法，请在实现文件中定义特殊成员函数**

impl类的做法：之前写到过，就是把对象的成员变量替换成一个指向已经实现的类的指针，这样可以减少build的次数
    
    class Widget{ //still in header "widget.h"
    public:
        Widget();
        ~Widget(); //dtor is needed-see below
    private:
        struct Impl; //declare implementation struct and pointer to it
        std::unique_ptr<Impl> pImpl;
    }
    
    #include "widget.h" //in impl,file "widget.cpp"
    #include "gadget.h"
    #include <string>
    #include <vector>
    struct Widget::Impl{
        std::string name; //definition of Widget::Impl with data members formerly in Widget
        std::vector<double> data;
        Gadget g1,g2,g3;
    }
    Widget::Widget():pImpl(std::make_unique<Impl>())
    Widget::~Widget(){} //~Widget definition，必须要定义，如果不定义的话会报错误，因为在执行Widget w的时候，会调用析构，而我们并没有声明，所以unique_ptr会有问题

+ Pimpl做法通过减少类的实现和类的使用之间的编译依赖减少了build次数
+ 对于 std::unique_ptr pImpl指针，在class的头文件中声明这些特殊的成员函数，在class
的实现文件中定义它们。即使默认的实现方式(编译器生成的方式)可以胜任也要这么做
+ 上述建议适用于 std::unique_ptr ,对 std::shared_ptr 无用


#### 五、右值引用，移动语意，完美转发

**23. 理解std::move和std::forward**

首先move不move任何东西，forward也不转发任何东西，在运行时，不产生可执行代码，这两个只是执行转换的函数（模板），std::move无条件的将他的参数转换成一个右值，forward只有当特定的条件满足时才会执行他的转换，下面是std::move的伪代码：
    
    template<typename T>
    typename remove_reference<T>::type&& move(T&& param){
        using ReturnType = typename remove_reference<T>::type&&; //see Item 9
        return static_cast<ReturnType>(param);
    }

**24. 区别通用引用和右值引用**

    void f(Widget&& param);       //rvalue reference
    Widget&& var1 = Widget();     //rvalue reference
    auto&& var2 = var1;           //not rvalue reference
    template<typename T>
    void f(std::vector<T>&& param) //rvalue reference
    template<typename T>
    void f(T&& param);             //not rvalue reference

+ 如果一个函数的template parameter有着T&&的格式，且有一个deduce type T.或者一个对象被生命为auto&&,那么这个parameter或者object就是一个universal reference.
+ 如果type的声明的格式不完全是type&&,或者type deduction没有发生，那么type&&表示的是一个rvalue reference.
+ universal reference如果被rvalue初始化，它就是rvalue reference.如果被lvalue初始化，他就是lvaue reference.

**25. 对于右值引用使用std::move，对于通用引用使用std::forward**

右值引用仅会绑定在可以移动的对象上，如果形参类型是右值引用，则他绑定的对象应该是可以移动的

+ 通用引用在转发的时候，应该进行向右值的有条件强制类型转换（用std::forward）
+ 右值引用在转发的时候，应该使用向右值的无条件强制类型转换（用std::move)
+ 如果上面两个方法使用反的话，可能会导致很麻烦的事情（代码冗余或者运行期错误）

在书中一直在强调“move”和"copy"两个操作的区别，因为move在一定程度上会效率更高一些

但是在局部对象中这种想法是错误的：
    
    Widget MakeWidget(){
        Widget w;
        return w; //复制，需要调用一次拷贝构造函数
    }
    
    Widget MakeWidget(){
        Widget w;
        return std::move(w);//错误！！！！！！！会造成负优化
    }

因为在第一段代码中，编译器会启用返回值优化（return value optimization RVO）,这个优化的启动需要满足两个条件：
+ 局部对象类型和函数的返回值类型相同
+ 返回的就是局部对象本身

而下面一段代码是不满足RVO优化的，所以会带来负优化

所以：如果局部对象可以使用返回值优化的时候，不应该使用std::move 和std:forward

**26. 避免重载通用引用**

主要是因为通用引用（特别是模板），会产生和调用函数精确匹配的函数，例如现在有一个：
    
    template<typename T>
    void log(T&& name){}
    
    void log(int name){}
    
    short a;
    log(a);

这个时候如果调用log的话，就会产生精确匹配的log方法，然后调用模板函数

而且在重载过程当中，通用引用模板还会和拷贝构造函数，复制构造函数竞争（这里其实有太多种情况了），只举书上的一个例子：
    
    class Person{
    public:
        template<typename T> explicit Person(T&& n): name(std::forward<T>(n)){} //完美转发构造函数
        explicit Person(int idx); //形参为int的构造函数
    
        Person(const Person& rhs) //默认拷贝构造函数（编译器自动生成）
        Person(Person&& rhs); //默认移动构造函数（编译器生成）
    };
    
    Person p("Nancy");
    auto cloneOfP(p);  //会编译失败，因为p并不是const的，所以在和拷贝构造函数匹配的时候，并不是最优解，而会调用完美转发的构造函数

**27. 熟悉重载通用引用的替代品**

这一条主要是为了解决26点的通用引用重载问题提的几个观点，特别是对构造函数（完美构造函数）进行解决方案

+ 放弃重载，采用替换名字的方案
+ 用传值来替代引用（可以提升性能但却不用增加一点复杂度
+ 采用impl方法：
  
    template<typename T>
    void logAndAdd(T&& name){
        logAndAddImpl(
            std::forward<T>(name), 
            std::is_integral<typename std::remove_reference<T>::type>() //这一句只是为了区分是否是整形
        ); 
    }
+ 对通用引用模板加以限制（使用enable_if）
  
    class Person{
    public:
        template<typename T,
                 typename = typename std::enable_if<condition>::type>//这里的condition只是一个代号，condition可以是：!std::is_same<Person, typename std::decay<T>::type>::value,或者是：!std::is_base_of<Person, typename std::decay<T>::type>::value&&!std::is_integral<std::remove_reference_t<T>>::value
        explicit Person(T&& n);
    }
//说实话这个代码的可读性emmmmmmmm，大概还是我太菜了。。。。

**28. 理解引用折叠**

在实参传递给函数模板的时候，推导出来的模板形参会把实参是左值还是右值的信息编码到结果里面：
    
    template<typename T>
    void func(T&& param);
    
    Widget WidgetFactory() //返回右值
    Widget w;
    
    func(w);               //T的推到结果是左值引用类型，T的结果推倒为Widget&
    func(WidgetFactory);   //T的推到结果是非引用类型（注意这个时候不是右值），T的结果推到为Widget
C++中，“引用的引用”是违法的，但是上面T的推到结果是Widget&时，就会出现 void func(Widget& && param);左值引用+右值引用

所以事实说明，编译器自己确实会出现引用的引用（虽然我们并不能用），所以会有一个规则（我记得C++ primer note里面也讲到过）
+ 如果任一引用是左值引用，则结果是左值引用，否则就是右值引用
+ 引用折叠会在四种语境中发生：模板实例化，auto类型生成、创建和运用typedef和别名声明，以及decltype

**29. 认识移动操作的缺点**

+ 假设移动操作不存在，成本高，未使用
+ 对于那些类型或对于移动语义的支持情况已知的代码，则无需做上述假定

原因在于C++11以下的move确实是低效的，但是C++11及以上的支持让move操作快了一些，但是更多时候编写代码并不知道代码对C++版本的支持，所以要做以上假定

**30. 熟悉完美转发失败的情况**

    template<typename T>
    void fwd(T&& param){           //接受任意实参
        f(std::forward<T>(param)); //转发该实参到f
    }
    
    template<typename... Ts>
    void fwd(Ts&&... param){        //接受任意变长实参
        f(std::forward<Ts>(param)...);
    }

完美转发失败的情况：
    
    （大括号初始化物）
    f({1, 2, 3}); //没问题，{1, 2, 3}会隐式转换成std::vector<int>
    fwd({1, 2, 3}) //错误，因为向为生命为std::initializer_list类型的函数模板形参传递了大括号初始化变量，但是之前说如果是auto的话，会推到为std::initializer_list,就没问题了。。。
    
    （0和NULL空指针）
    （仅仅有声明的整形static const 成员变量）：
    class Widget{
    public:
        static const std::size_t MinVals = 28; //仅仅给出了声明没有给出定义
    };
    fwd(Widget::MinVals);      //错误，应该无法链接，因为通常引用是当成指针处理的，而也需要指定某一块内存来让指针指涉
    
    （重载的函数名字和模板名字）
    void f(int (*fp)(int));
    int processValue(int value);
    int processValue(int value, int priority);
    fwd(processVal); //错误，光秃秃的processVal并没有类型型别
    
    （位域）
    struct IPv4Header{
        std::uint32_t version:4,
        IHL:4,
        DSCP:6,
        ECN:2,
        totalLength:16;
    };
    
    void f(std::size_t sz); IPv4Header h;
    fwd(h.totalLength); //错误
+ 最后，所有的失败情形实际上都归结于模板类型推到失败，或者推到结果是错误的。

#### 优先考虑基于任务的编程而非基于线程的编程
在C++中,std::async 提供了一种更高级别的并发抽象,它可以自动管理线程的生命周期,并且可以获取异步操作的结果.此外,如果异步操作抛出异常,std::async 也可以捕获并在主线程中重新抛出这个异常.这使得 std::async 在许多情况下比直接使用 std::thread 更加方便和安全.

然而,也有一些情况下你可能需要直接使用 std::thread,例如:

你需要访问底层线程实现的API(例如 pthread 或 Windows 线程库).
你需要并且有能力进行线程优化.
你需要实现 C++ 并发 API 中没有的技术.
总的来说,除非有特殊需求,否则通常建议优先使用 std::async 而不是直接使用 std::thread

* 如果有异步的必要请指定`std::launch::threads`
  * std::launch::async：指定的时候意味着函数f必须以异步方式进行，即在另一个线程上执行
  * std::launch::deferred 则指f只有在get或者wait函数调用的时候同步执行，如果get或者wait没有调用，则f不执行
  * 如果不指定策略的话（默认方法），则系统会按照自己的估计来推测需要进行什么样的策略（会带来不确定性），感觉还是很危险的！！！所以尽量在使用的时候指定是否是异步或者是同步
  
**37. 从各个方面使得std::threads unjoinable**

每一个std::thread类型的对象都处于两种状态：joinable和unjoinable

+ joinable：对应底层已运行、可运行或者运行结束的出于阻塞或者等待调度的线程
+ unjoinable： 默认构造的std::thread, 已move的std::thread, 已join的std::thread, 已经分离的std::thread
+ 如果某一个std::thread是joinable的，然后他被销毁了，会造成很严重的后果，（比如会造成隐式join（会造成难以调试的性能异常）和隐式detach（会造成难以调试的未定义行为）），所以我们要保证thread在所有路径上都是unjoinable的：
  
    class ThreadRAII{
    public:
        enum class DtorAction{join, detach};
        ThreadRAII(std::thread&& t, DtorAction a):action(a), t(std::move(t)){} //把线程交给ThreadRAII处理
        ~THreadRAII(){
            if(t.joinable()){
                if(action == DtorAction::join){
                    t.join();
                }
                else{
                    t.detach();                  //保证所有路径出去都是不可连接的
                }
            }
        }
    private:
        DtorAction action;
        std::thread t;    //成员变量最后声明thread
    }

**38. 知道不同线程句柄析构行为**

     _____           ___返回值___  std::promise _______
    |调用方|<--------|被调用方结果|<------------|被调用方|

因为被调用函数的返回值有可能在调用方执行get前就执行完毕了，所以被调用线程的返回值会保存在一个地方，所以会存在一个"共享状态"

所以在异步状态下启动的线程的共享状态的最后一个返回值是会保持阻塞的，知道该任务结束，返回值的析构函数在常规情况下，只会析构返回值的成员变量


#### volatile和线程安全无关
volatile的作用:告诉编译器正在处理的变量使用的是特殊内存,不要在这个变量上做任何优化,即让cpu每次都从内存去取.
和多线程无关,改用atomic就用atomic


#### 什么时候push_back比emplcae_back好?
在某些情况下,`push_back` 可能比 `emplace_back` 更好:

1. **已经有一个完全构造好的对象**:如果你已经有一个完全构造好的对象,并且你只需要将其添加到容器中,那么 `push_back` 可能会比 `emplace_back` 更好.因为 `emplace_back` 会尝试在容器内部构造一个新的对象,这可能会导致不必要的构造和析构操作.

```cpp
std::vector<std::string> vec;
std::string str = "Hello, World!";
vec.push_back(str);  // 直接将已经构造好的字符串添加到容器中
```

2. **需要明确的类型转换**:`emplace_back` 会尝试使用传递给它的参数直接在容器内部构造一个新的对象.如果这需要一个不明确的类型转换,那么 `emplace_back` 可能会失败.在这种情况下,`push_back` 可能会更好,因为你可以在调用 `push_back` 之前明确地进行类型转换.

```cpp
std::vector<int> vec;
double num = 3.14;
vec.push_back(static_cast<int>(num));  // 明确地将 double 转换为 int
```

3. **编译时间**:`emplace_back` 需要在编译时解析构造函数的重载,这可能会增加编译时间.如果你正在优化编译时间,那么 `push_back` 可能会更好.

总的来说,`push_back` 和 `emplace_back` 各有优势,你应该根据具体的情况选择使用哪一个.


#### ??考虑对于单次事件通信使用

对于我们在线程中经常使用的flag标志位:
    
    while(!flag){}

可以用线程锁来代替,这个时候等待,不会占用本该进行计算的某一个线程资源:
    
    bool flag(false);
    std::lock_guard<std::mutex> g(m);
    flag = true;

不过使用标志位的话也不太好,如果使用std::promise类型的对象的话就可以解决上面的问题,但是这个途径为了共享状态需要使用堆内存,而且只限于一次性通信
    
    std::promise<void> p;
    void react();    //反应任务
    void detect(){  //检测任务
        std::thread t([]{
            p.get_future().wait();
            react();           //在调用react之前t是暂停状态
        });
        p.set_value();  //取消暂停t
        t.join();       //把t置为unjoinable状态
    }   
