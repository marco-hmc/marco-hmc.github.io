---
layout: post
title: （一）函数式那些事儿：什么是函数式？
categories: C++
related_posts: True
tags: Functional
toc:
  sidebar: right
---

## 函数式编程：从命令式到声明式的编程范式革命

**历史背景：** 计算机编程经历了从机器码到高级语言的演进，每一次范式革新都是为了解决当时面临的核心问题：

```
编程范式演进：
1940s: 机器码 → 解决：直接控制硬件
1950s: 汇编语言 → 解决：可读性和可维护性
1960s: 结构化编程 → 解决：goto语句的混乱
1970s: 面向对象编程 → 解决：大型软件的复杂性
1990s: 函数式编程复兴 → 解决：并发和状态管理问题
```

**现代挑战：** 随着多核处理器普及和大数据处理需求激增，传统编程范式面临新的挑战：

1. **并发编程的复杂性**：共享状态导致的竞态条件和死锁
2. **状态管理的困难**：全局状态使程序行为难以预测
3. **代码复用性不足**：命令式代码难以组合和重用
4. **测试和调试困难**：副作用使程序行为不确定

**函数式编程的价值主张：** 函数式编程通过**数学化的函数概念**，为这些现代挑战提供了优雅的解决方案。

---

### 1. 函数式编程的核心概念

#### 1.1 函数作为"一等公民"：编程的新视角

**理论基础：** λ演算（Lambda Calculus）

函数式编程的理论基础可追溯到1930年代阿隆佐·邱奇（Alonzo Church）提出的λ演算。在λ演算中，**一切皆为函数**，这为现代函数式编程奠定了数学基础。

**"一等公民"的含义：**

```cpp
// 在函数式编程中，函数享有与基本数据类型相同的权利：

// 1. 可以赋值给变量
auto add = [](int a, int b) { return a + b; };

// 2. 可以作为参数传递
void apply_operation(std::vector<int>& data, std::function<int(int)> operation) {
    std::transform(data.begin(), data.end(), data.begin(), operation);
}

// 3. 可以作为返回值
std::function<int(int)> create_multiplier(int factor) {
    return [factor](int x) { return x * factor; };
}

// 4. 可以存储在数据结构中
std::vector<std::function<int(int, int)>> operations = {
    [](int a, int b) { return a + b; },
    [](int a, int b) { return a - b; },
    [](int a, int b) { return a * b; }
};
```

#### 1.2 函数作为参数：策略模式的函数式实现

**问题场景：** 传统面向对象的策略模式实现

```cpp
// 传统OOP方式：需要定义接口和多个类
class SortStrategy {
public:
    virtual ~SortStrategy() = default;
    virtual void sort(std::vector<int>& data) = 0;
};

class BubbleSort : public SortStrategy {
public:
    void sort(std::vector<int>& data) override {
        // 冒泡排序实现
        for (size_t i = 0; i < data.size(); ++i) {
            for (size_t j = 0; j < data.size() - 1 - i; ++j) {
                if (data[j] > data[j + 1]) {
                    std::swap(data[j], data[j + 1]);
                }
            }
        }
    }
};

class QuickSort : public SortStrategy {
public:
    void sort(std::vector<int>& data) override {
        if (data.size() <= 1) return;
        quicksort_impl(data, 0, data.size() - 1);
    }

private:
    void quicksort_impl(std::vector<int>& arr, int low, int high) {
        if (low < high) {
            int pivot = partition(arr, low, high);
            quicksort_impl(arr, low, pivot - 1);
            quicksort_impl(arr, pivot + 1, high);
        }
    }

    int partition(std::vector<int>& arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; ++j) {
            if (arr[j] <= pivot) {
                ++i;
                std::swap(arr[i], arr[j]);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        return i + 1;
    }
};

// 使用策略模式
class DataProcessor {
    std::unique_ptr<SortStrategy> strategy;
public:
    void set_strategy(std::unique_ptr<SortStrategy> new_strategy) {
        strategy = std::move(new_strategy);
    }

    void process(std::vector<int>& data) {
        strategy->sort(data);
    }
};
```

**函数式解决方案：** 将策略抽象为函数

```cpp
// 函数式方式：策略就是函数
class FunctionalDataProcessor {
public:
    using SortFunction = std::function<void(std::vector<int>&)>;

    static void bubble_sort(std::vector<int>& data) {
        for (size_t i = 0; i < data.size(); ++i) {
            for (size_t j = 0; j < data.size() - 1 - i; ++j) {
                if (data[j] > data[j + 1]) {
                    std::swap(data[j], data[j + 1]);
                }
            }
        }
    }

    static void quick_sort(std::vector<int>& data) {
        if (data.size() <= 1) return;
        std::sort(data.begin(), data.end());  // 使用标准库实现
    }

    void process(std::vector<int>& data, SortFunction sort_strategy) {
        sort_strategy(data);
    }
};

// 使用示例
void demonstrate_functional_strategy() {
    FunctionalDataProcessor processor;
    std::vector<int> data1 = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> data2 = {64, 34, 25, 12, 22, 11, 90};

    // 直接传递函数作为策略
    processor.process(data1, FunctionalDataProcessor::bubble_sort);
    processor.process(data2, FunctionalDataProcessor::quick_sort);

    // 甚至可以传递lambda表达式作为自定义策略
    processor.process(data1, [](std::vector<int>& data) {
        std::sort(data.rbegin(), data.rend());  // 降序排列
    });
}
```

**优势对比：**

```
传统OOP策略模式：
❌ 需要定义接口和多个类（代码冗余）
❌ 运行时多态开销（虚函数调用）
❌ 难以组合多个策略
❌ 扩展需要新增类

函数式策略模式：
✅ 直接使用函数（代码简洁）
✅ 编译时优化（内联优化）
✅ 易于组合和扩展
✅ 支持即时定义策略（lambda）
```

#### 1.3 纯函数：程序可靠性的数学保证

**数学背景：** 纯函数的概念来源于数学中的函数定义

在数学中，函数 f(x) = x² 具有以下性质：

- **确定性**：相同输入必定产生相同输出
- **无副作用**：函数计算不会改变外部世界的状态

**纯函数的严格定义：**

```cpp
// ✅ 纯函数示例
namespace PureFunctions {

// 数学运算：纯函数
int square(int x) {
    return x * x;  // 1. 仅依赖输入参数
}                  // 2. 不修改任何外部状态
                   // 3. 相同输入总是产生相同输出

// 字符串处理：纯函数
std::string to_uppercase(const std::string& str) {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(), ::toupper);
    return result;  // 返回新对象，不修改原对象
}

// 数组变换：纯函数
std::vector<int> map_double(const std::vector<int>& input) {
    std::vector<int> result;
    result.reserve(input.size());
    std::transform(input.begin(), input.end(), std::back_inserter(result),
                  [](int x) { return x * 2; });
    return result;  // 不修改输入数组
}

}
```

**非纯函数的问题：**

```cpp
// ❌ 非纯函数示例
namespace ImpureFunctions {

// 全局状态依赖
int global_counter = 0;
int impure_increment() {
    return ++global_counter;  // 依赖并修改全局状态
}

// 副作用：修改输入参数
void impure_sort(std::vector<int>& data) {
    std::sort(data.begin(), data.end());  // 直接修改输入
}

// 不确定输出：依赖系统状态
std::string impure_timestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    return std::ctime(&time_t);  // 输出依赖调用时间
}

}

// 问题演示
void demonstrate_impurity_problems() {
    // 问题1：不可预测的行为
    std::cout << ImpureFunctions::impure_increment() << std::endl;  // 输出：1
    std::cout << ImpureFunctions::impure_increment() << std::endl;  // 输出：2（不一致！）

    // 问题2：副作用导致原始数据丢失
    std::vector<int> original_data = {3, 1, 4, 1, 5};
    std::vector<int> backup = original_data;  // 必须备份原始数据
    ImpureFunctions::impure_sort(original_data);
    // original_data已被修改，无法恢复原始顺序

    // 问题3：难以测试
    // 如何为impure_timestamp()编写可靠的单元测试？
}
```

**纯函数在实际开发中的价值：**

**1. 并发安全示例：**

```cpp
// 数据并行处理：纯函数版本
namespace ConcurrentProcessing {

// 纯函数：线程安全
double expensive_calculation(double input) {
    // 复杂的数学计算，不依赖外部状态
    double result = input;
    for (int i = 0; i < 1000; ++i) {
        result = std::sin(result) + std::cos(result);
    }
    return result;
}

void parallel_processing() {
    std::vector<double> input_data(10000);
    std::iota(input_data.begin(), input_data.end(), 1.0);

    std::vector<double> results(input_data.size());

    // 安全的并行处理：纯函数无竞态条件
    std::transform(std::execution::par_unseq,
                  input_data.begin(), input_data.end(),
                  results.begin(),
                  expensive_calculation);  // 纯函数，完全并行安全
}

}
```

**2. 测试友好示例：**

```cpp
// 纯函数的单元测试
namespace Testing {

// 被测试的纯函数
std::vector<int> filter_even_numbers(const std::vector<int>& numbers) {
    std::vector<int> result;
    std::copy_if(numbers.begin(), numbers.end(), std::back_inserter(result),
                [](int n) { return n % 2 == 0; });
    return result;
}

// 简单、可靠的测试
void test_filter_even_numbers() {
    // 测试用例1：基本功能
    {
        std::vector<int> input = {1, 2, 3, 4, 5, 6};
        std::vector<int> expected = {2, 4, 6};
        std::vector<int> actual = filter_even_numbers(input);
        assert(actual == expected);
    }

    // 测试用例2：边界情况
    {
        std::vector<int> empty_input = {};
        std::vector<int> empty_expected = {};
        assert(filter_even_numbers(empty_input) == empty_expected);
    }

    // 测试用例3：全奇数
    {
        std::vector<int> odd_input = {1, 3, 5, 7};
        std::vector<int> empty_expected = {};
        assert(filter_even_numbers(odd_input) == empty_expected);
    }

    // 无需模拟外部依赖，无需设置复杂的测试环境
    std::cout << "All tests passed!" << std::endl;
}

}
```

#### 1.4 高阶函数：函数组合的艺术

##### 1.4.1 Map-Reduce模式的C++实现

```cpp
// 现代数据处理的基础模式
namespace MapReduce {

// 通用map函数：将函数应用到每个元素
template<typename InputContainer, typename OutputType, typename Transform>
auto map(const InputContainer& input, Transform transform)
    -> std::vector<OutputType> {
    std::vector<OutputType> result;
    result.reserve(input.size());

    std::transform(input.begin(), input.end(), std::back_inserter(result), transform);
    return result;
}

// 通用filter函数：筛选满足条件的元素
template<typename Container, typename Predicate>
auto filter(const Container& input, Predicate predicate)
    -> std::vector<typename Container::value_type> {
    std::vector<typename Container::value_type> result;

    std::copy_if(input.begin(), input.end(), std::back_inserter(result), predicate);
    return result;
}

// 通用reduce函数：将集合聚合为单一值
template<typename Container, typename T, typename BinaryOp>
T reduce(const Container& input, T initial_value, BinaryOp binary_op) {
    return std::accumulate(input.begin(), input.end(), initial_value, binary_op);
}

// 实际应用：销售数据分析
struct Sale {
    std::string product;
    double amount;
    std::string region;
};

void analyze_sales_data() {
    std::vector<Sale> sales = {
        {"Laptop", 1200.0, "North"},
        {"Mouse", 25.0, "North"},
        {"Laptop", 1200.0, "South"},
        {"Keyboard", 75.0, "North"},
        {"Monitor", 300.0, "South"}
    };

    // 函数式数据处理管道
    auto north_sales = filter(sales, [](const Sale& s) {
        return s.region == "North";
    });

    auto amounts = map<std::vector<Sale>, double>(north_sales, [](const Sale& s) {
        return s.amount;
    });

    double total = reduce(amounts, 0.0, std::plus<double>{});

    std::cout << "Total North region sales: $" << total << std::endl;

    // 等价的命令式代码需要更多行且可读性差：
    /*
    double total_imperative = 0.0;
    for (const auto& sale : sales) {
        if (sale.region == "North") {
            total_imperative += sale.amount;
        }
    }
    */
}

}
```

##### 1.4.2 函数组合与管道模式

```cpp
// 函数组合：构建复杂操作
namespace FunctionComposition {

// 基础变换函数
auto add_ten = [](int x) { return x + 10; };
auto multiply_by_two = [](int x) { return x * 2; };
auto to_string = [](int x) { return std::to_string(x); };

// 函数组合工具
template<typename F, typename G>
auto compose(F f, G g) {
    return [f, g](auto x) { return f(g(x)); };
}

// 管道操作符（C++23风格）
template<typename T, typename F>
auto operator|(T&& value, F&& func) -> decltype(func(std::forward<T>(value))) {
    return func(std::forward<T>(value));
}

void demonstrate_composition() {
    // 方式1：嵌套调用（难以阅读）
    auto result1 = to_string(multiply_by_two(add_ten(5)));

    // 方式2：函数组合
    auto complex_transform = compose(to_string, compose(multiply_by_two, add_ten));
    auto result2 = complex_transform(5);

    // 方式3：管道操作（最直观）
    auto result3 = 5 | add_ten | multiply_by_two | to_string;

    std::cout << "Results: " << result1 << ", " << result2 << ", " << result3 << std::endl;
    // 输出：Results: 30, 30, 30
}

// 实际应用：文本处理管道
namespace TextProcessing {

auto to_lowercase = [](std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    return s;
};

auto remove_spaces = [](std::string s) {
    s.erase(std::remove(s.begin(), s.end(), ' '), s.end());
    return s;
};

auto add_prefix = [](const std::string& prefix) {
    return [prefix](std::string s) { return prefix + s; };
};

void process_user_input() {
    std::string user_input = "  Hello World  ";

    // 清晰的处理管道
    auto processed = user_input
                   | to_lowercase
                   | remove_spaces
                   | add_prefix("processed_");

    std::cout << "Processed: " << processed << std::endl;
    // 输出：Processed: processed_helloworld
}
}
}
```

### 2. 函数式编程的实际价值

#### 2.1 代码简洁性：声明式vs命令式

**问题场景：** 学生成绩管理系统

考虑一个常见的数据处理任务：从学生列表中找出数学成绩超过90分的学生，计算他们的平均成绩。

```cpp
struct Student {
    std::string name;
    int math_score;
    int english_score;
    std::string grade;
};

// 命令式方式：关注"如何做"
namespace Imperative {

double calculate_high_math_scores_average(const std::vector<Student>& students) {
    std::vector<Student> high_scorers;

    // 步骤1：筛选高分学生
    for (const auto& student : students) {
        if (student.math_score > 90) {
            high_scorers.push_back(student);
        }
    }

    // 步骤2：检查是否有符合条件的学生
    if (high_scorers.empty()) {
        return 0.0;
    }

    // 步骤3：累加成绩
    int total_score = 0;
    for (const auto& student : high_scorers) {
        total_score += student.math_score;
    }

    // 步骤4：计算平均值
    return static_cast<double>(total_score) / high_scorers.size();
}

}

// 函数式方式：关注"做什么"
namespace Functional {

// 完成代码看附录
double calculate_high_math_scores_average(const std::vector<Student>& students) {
    auto scoreHighEnough = [](const Student& s) { return s.math_score > 90; };
    auto getScore = [](const Student& s) { return s.math_score; };

    auto high_math_scores = students
        | filter(scoreHighEnough)
        | map(getScore);

    return high_math_scores.empty()
        ? 0.0
        : reduce(high_math_scores, 0, std::plus<int>{}) / static_cast<double>(high_math_scores.size());
}
}
```

**可读性对比：**

```
命令式代码特点：
❌ 15行代码，包含大量样板代码
❌ 需要手动管理临时变量
❌ 循环和条件判断混杂
❌ 业务逻辑被实现细节掩盖

函数式代码特点：
✅ 6行代码，直接表达业务意图
✅ 无需临时变量管理
✅ 操作链式组合，逻辑清晰
✅ 业务逻辑一目了然：筛选→提取→聚合
```

#### 2.2 测试和维护优势：可预测性带来的好处

**案例研究：** 电商系统的订单处理

```cpp
// 传统方式：全局状态和副作用
namespace TraditionalApproach {

// 全局状态
class OrderProcessor {
private:
    static int order_id_counter;
    static std::vector<Order> processed_orders;
    static double total_revenue;

public:
    // 有副作用的方法
    bool process_order(const OrderRequest& request) {
        // 修改全局状态
        Order order;
        order.id = ++order_id_counter;
        order.amount = calculate_order_amount(request);

        // 依赖外部系统状态
        if (!payment_service.charge(request.payment_info, order.amount)) {
            return false;  // 失败时状态不一致
        }

        // 修改更多全局状态
        processed_orders.push_back(order);
        total_revenue += order.amount;

        // 副作用：发送邮件
        email_service.send_confirmation(request.customer_email, order);

        return true;
    }

private:
    double calculate_order_amount(const OrderRequest& request) {
        // 依赖全局折扣状态
        return request.base_amount * (1.0 - global_discount_rate);
    }
};

// 测试困难
void test_order_processing() {
    // 需要复杂的setup
    // 1. 重置全局状态
    OrderProcessor::reset_global_state();

    // 2. 模拟外部服务
    MockPaymentService mock_payment;
    MockEmailService mock_email;
    dependency_injector.replace_payment_service(&mock_payment);
    dependency_injector.replace_email_service(&mock_email);

    // 3. 设置外部状态
    set_global_discount_rate(0.1);

    // 4. 执行测试
    OrderRequest request = create_test_request();
    bool success = OrderProcessor{}.process_order(request);

    // 5. 验证复杂状态
    assert(success);
    assert(OrderProcessor::get_processed_orders().size() == 1);
    assert(OrderProcessor::get_total_revenue() == expected_amount);

    // 6. 清理状态
    OrderProcessor::reset_global_state();
}

}

// 函数式方式：纯函数和不可变数据
namespace FunctionalApproach {

// 不可变数据结构
struct OrderResult {
    bool success;
    std::optional<Order> order;
    std::string error_message;
    std::vector<SideEffect> side_effects;  // 将副作用建模为数据
};

// 纯函数
class PureOrderProcessor {
public:
    // 纯函数：计算订单金额
    static double calculate_order_amount(const OrderRequest& request, double discount_rate) {
        return request.base_amount * (1.0 - discount_rate);
    }

    // 纯函数：验证订单
    static ValidationResult validate_order(const OrderRequest& request) {
        ValidationResult result;
        result.is_valid = true;

        if (request.base_amount <= 0) {
            result.is_valid = false;
            result.errors.push_back("Invalid amount");
        }

        if (request.customer_email.empty()) {
            result.is_valid = false;
            result.errors.push_back("Email required");
        }

        return result;  // 不修改任何外部状态
    }

    // 纯函数：创建订单（不执行副作用）
    static OrderResult create_order(const OrderRequest& request,
                                   int next_order_id,
                                   double discount_rate) {
        auto validation = validate_order(request);
        if (!validation.is_valid) {
            return {false, std::nullopt, validation.errors[0], {}};
        }

        Order order;
        order.id = next_order_id;
        order.amount = calculate_order_amount(request, discount_rate);
        order.customer_email = request.customer_email;

        // 将副作用建模为数据而非立即执行
        std::vector<SideEffect> effects = {
            PaymentSideEffect{request.payment_info, order.amount},
            EmailSideEffect{request.customer_email, order}
        };

        return {true, order, "", effects};
    }
};

// 简单、可靠的测试
void test_pure_order_processing() {
    // 无需复杂setup，直接测试
    OrderRequest request;
    request.base_amount = 100.0;
    request.customer_email = "test@example.com";

    // 测试订单计算
    double amount = PureOrderProcessor::calculate_order_amount(request, 0.1);
    assert(amount == 90.0);  // 简单、确定的断言

    // 测试订单验证
    auto validation = PureOrderProcessor::validate_order(request);
    assert(validation.is_valid);

    // 测试订单创建
    auto result = PureOrderProcessor::create_order(request, 1001, 0.1);
    assert(result.success);
    assert(result.order->id == 1001);
    assert(result.order->amount == 90.0);
    assert(result.side_effects.size() == 2);

    // 无需清理状态，测试之间完全独立
}

}
```

**测试复杂度对比：**

```
传统方式测试：
❌ 需要15+行setup代码
❌ 依赖外部服务模拟
❌ 状态管理容易出错
❌ 测试之间可能相互影响
❌ 难以测试边界情况

函数式方式测试：
✅ 3行核心测试代码
✅ 无外部依赖
✅ 测试结果完全可预测
✅ 测试完全独立
✅ 易于测试所有分支
```

#### 2.3 并发和性能优势：天然的并行性

**并发编程的挑战：** 传统的共享状态并发

```cpp
// 传统并发：共享状态的问题
namespace SharedStateConcurrency {

class BankAccount {
private:
    std::mutex mutex_;
    double balance_;

public:
    BankAccount(double initial_balance) : balance_(initial_balance) {}

    bool transfer(BankAccount& to_account, double amount) {
        std::unique_lock<std::mutex> lock1(mutex_, std::defer_lock);
        std::unique_lock<std::mutex> lock2(to_account.mutex_, std::defer_lock);
        std::lock(lock1, lock2);

        if (balance_ >= amount) {
            balance_ -= amount;
            to_account.balance_ += amount;
            return true;
        }
        return false;
    }

    double get_balance() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return balance_;
    }
};

// 复杂的并发代码
void concurrent_transfers() {
    BankAccount account1(1000.0);
    BankAccount account2(1000.0);

    std::vector<std::thread> threads;

    // 多线程转账：复杂的同步逻辑
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&account1, &account2]() {
            for (int j = 0; j < 100; ++j) {
                account1.transfer(account2, 10.0);
                account2.transfer(account1, 5.0);
            }
        });
    }

    for (auto& t : threads) {
        t.join();
    }

    std::cout << "Final balances: "
              << account1.get_balance() << ", "
              << account2.get_balance() << std::endl;
}

}

// 函数式并发：不可变数据的优势
namespace FunctionalConcurrency {

// 不可变的账户状态
struct AccountState {
    const std::string account_id;
    const double balance;

    AccountState(std::string id, double bal) : account_id(std::move(id)), balance(bal) {}
};

// 纯函数：转账操作
struct TransferResult {
    AccountState from_account;
    AccountState to_account;
    bool success;
    std::string error_message;
};

TransferResult transfer(const AccountState& from, const AccountState& to, double amount) {
    if (from.balance >= amount) {
        return {
            AccountState(from.account_id, from.balance - amount),
            AccountState(to.account_id, to.balance + amount),
            true,
            ""
        };
    } else {
        return {from, to, false, "Insufficient funds"};
    }
}

class TransactionProcessor {
private:
    std::map<std::string, AccountState> accounts_;
    std::mutex state_mutex_;  // 只需要一个锁

public:
    TransactionProcessor(std::initializer_list<AccountState> initial_accounts) {
        for (const auto& account : initial_accounts) {
            accounts_[account.account_id] = account;
        }
    }

    bool execute_transfer(const std::string& from_id, const std::string& to_id, double amount) {
        std::lock_guard<std::mutex> lock(state_mutex_);

        auto from_it = accounts_.find(from_id);
        auto to_it = accounts_.find(to_id);

        if (from_it == accounts_.end() || to_it == accounts_.end()) {
            return false;
        }

        // 使用纯函数计算新状态
        auto result = transfer(from_it->second, to_it->second, amount);

        if (result.success) {
            accounts_[from_id] = result.from_account;
            accounts_[to_id] = result.to_account;
        }

        return result.success;
    }

    double get_balance(const std::string& account_id) const {
        std::lock_guard<std::mutex> lock(state_mutex_);
        auto it = accounts_.find(account_id);
        return (it != accounts_.end()) ? it->second.balance : 0.0;
    }
};
// 简化的并发代码
void functional_concurrent_transfers() {
    TransactionProcessor processor{
        AccountState("ACC001", 1000.0),
        AccountState("ACC002", 1000.0)
    };

    std::vector<std::thread> threads;

    // 多线程转账：简单直接，无死锁风险
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&processor]() {
            for (int j = 0; j < 100; ++j) {
                processor.execute_transfer("ACC001", "ACC002", 10.0);
                processor.execute_transfer("ACC002", "ACC001", 5.0);
            }
        });
    }

    for (auto& t : threads) {
        t.join();
    }

    std::cout << "Final balances: "
              << processor.get_balance("ACC001") << ", "
              << processor.get_balance("ACC002") << std::endl;
}

// 并行数据处理：无需锁
void parallel_account_processing() {
    std::vector<AccountState> accounts = {
        AccountState("ACC001", 1000.0),
        AccountState("ACC002", 1500.0),
        AccountState("ACC003", 2000.0),
        AccountState("ACC004", 500.0)
    };

    // 并行计算利息：完全无锁
    std::vector<double> balances_with_interest(accounts.size());
    std::transform(std::execution::par_unseq,
                  accounts.begin(), accounts.end(),
                  balances_with_interest.begin(),
                  [](const AccountState& acc) {
                      return acc.balance * 1.05;  // 5%利息
                  });

    // 并行聚合：计算总余额
    double total_balance = std::transform_reduce(
        std::execution::par,
        accounts.begin(), accounts.end(),
        0.0,
        std::plus<double>{},
        [](const AccountState& acc) { return acc.balance; }
    );

    std::cout << "Total balance: " << total_balance << std::endl;
}

}

```

### 99. appendix:

```cpp
#include <stdio.h>

#include <algorithm>
#include <iterator>
#include <numeric>
#include <string>
#include <type_traits>
#include <utility>
#include <vector>

template <typename Transform>
auto map(Transform transform) {
    return [transform](const auto& input) {
        using InputContainer = std::decay_t<decltype(input)>;
        using ValueType = typename InputContainer::value_type;
        using OutputType =
            std::decay_t<decltype(transform(std::declval<ValueType>()))>;
        std::vector<OutputType> result;
        result.reserve(input.size());
        std::transform(input.begin(), input.end(), std::back_inserter(result),
                       transform);
        return result;
    };
}

template <typename Predicate>
auto filter(Predicate predicate) {
    return [predicate](const auto& input) {
        using InputContainer = std::decay_t<decltype(input)>;
        using ValueType = typename InputContainer::value_type;
        std::vector<ValueType> result;
        result.reserve(input.size());
        std::copy_if(input.begin(), input.end(), std::back_inserter(result),
                     predicate);
        return result;
    };
}

template <typename Container, typename T, typename BinaryOp>
T reduce(const Container& input, T initial_value, BinaryOp binary_op) {
    return std::accumulate(input.begin(), input.end(), initial_value,
                           binary_op);
}

template <typename T, typename F>
auto operator|(T&& value, F&& func) -> decltype(func(std::forward<T>(value))) {
    return func(std::forward<T>(value));
}

struct Student {
    std::string name;
    int math_score;
    int english_score;
};

double calculate_high_math_scores_average(
    const std::vector<Student>& students) {
    auto scoreHighEnough = [](const Student& s) { return s.math_score > 90; };
    auto getScore = [](const Student& s) { return s.math_score; };
    auto high_math_scores = students | filter(scoreHighEnough) | map(getScore);
    return reduce(high_math_scores, 0, std::plus<int>{}) /
           static_cast<double>(high_math_scores.size());
}

int main() {
    std::vector<Student> students = { \
                                     {"Alice", 95, 88},
                                     {"Bob", 85, 92},
                                     {"Charlie", 98, 81},
                                     {"David", 76, 79},
                                     {"Eve", 91, 95}};
    double average = calculate_high_math_scores_average(students);
    printf("Average math score of students scoring above 90: %.2f\n", average);
    return 0;
};

```
