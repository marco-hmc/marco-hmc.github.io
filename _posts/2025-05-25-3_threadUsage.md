---
layout: post
title: （三）多线程那些事儿：怎么用好
categories: cpp
related_posts: True
tags: cpp threads
toc:
  sidebar: right
---

## （三）多线程那些事儿：怎么用好

多线程的意义首先如何正确性，然后才是性能。本文将围绕线程安全和多线程性能展开。

### 1. 线程安全陷阱

#### 1.1 线程让出后的虚假检查

```c++
void Foo(std::vector<Foo> arr, int size) {
    for(auto foo: arr){
        if(!foo.is_valid())
            continue;
        {
            std::lock_guard<std::mutex> lock(mtx);
        // Do something with foo.
        }
    }
}
```

当因为占不到锁让出 cpu，再回来的时候`foo`难保就失效了。因此`foo`的有效性检查也得受`mutex`的保护。

### 2. 怎么用好多线程？

#### 2.1 什么是多线程加速比？

- **如果说单核耗时是单位`1`，n 核使用多线程期望耗时应该是`1/n`，但实际却差很远，是什么原因限制了？**

  - `线程切换开销`：操作系统在多个线程之间进行切换时需要保存和恢复线程的上下文信息，这会消耗一定的时间和 CPU 资源。如果线程切换过于频繁，那么这些开销就会显著增加，导致实际耗时比理想情况差很多。
  - `资源竞争`：多个线程可能会竞争共享资源，如内存、文件句柄、数据库连接等。当一个线程正在访问共享资源时，其他线程可能需要等待，这就会导致线程阻塞，从而增加了整体的执行时间。
  - `同步开销`：存在一些子任务之间存在依赖关系，必须按顺序执行，这就限制了并行度；为了保证共享资源的一致性，常常需要使用锁来保护临界区。然而，锁的使用会导致线程的阻塞和唤醒，这会降低多线程的性能；多核处理器中，每个核心都有自己的缓存。当多个线程同时访问共享数据时，可能会导致缓存一致性问题，即不同核心的缓存中的数据不一致。为了保证数据的一致性，处理器需要进行额外的操作，这会增加访问共享数据的延迟。
  - `硬件瓶颈`： CPU 核心数限制并行度，超线程技术（SMT）仅提升单核利用率，实际吞吐量增幅有限。

- **如果取加速比定义为：原来耗时/现在耗时，如何尽可能提升多核加速比，使之接近`n`？**

  - `合理利用缓存`：通过合理的数据布局和访问模式，尽量让每个线程访问的数据都能在自己的 CPU 缓存中命中，减少缓存未命中的次数。例如，将经常一起访问的数据放在连续的内存空间中，利用 CPU 缓存的空间局部性原理。
  - `减少锁的使用`：尽量使用无锁数据结构或者乐观锁机制来代替传统的锁。如果必须使用锁，要尽量减小锁的粒度，只保护必要的临界区。例如，使用读写锁来区分读操作和写操作，允许多个读线程同时访问共享资源，只有写线程需要独占资源。
  - `平衡负载`：确保每个核心上的任务负载均衡，避免出现某些核心过于繁忙，而其他核心闲置的情况。可以采用动态负载均衡算法，根据每个核心的运行状态动态分配任务。
  - `减少线程切换`：通过调整线程的优先级、绑定线程到特定的核心等方式，减少不必要的线程切换。例如，对于一些实时性要求较高的线程，可以将其优先级设置得较高，使其能够优先获得 CPU 资源，减少被其他线程抢占的可能性。

  在我个人 12 核的电脑中，我测试过无竞争数据，数据错开缓存行的任务，测试加速比也不过是 6 左右。原因可能就是，任务太小，线程本身调度开销是能够和任务耗时比较的；也许在某个不清楚硬件特性，如访存问题、cache miss 等情况影响了加速比；也许 12 核不是同一性能，存在大小核等等；也许我电脑是笔记本，电源比较渣，即单核能跑满功率，多核情况下跑不满功率。

- **为什么加速比距离理论上限差这么远？** 达到理想加速比的前提是独立的计算资源，和独立的存储资源，以及独立的数据。实际上多线程在跑的时候可以认为只有计算资源是独立的，而存储资源不是独立的，只有每一个核上的 cache 是独立的，L3 和内存都是共享的；而数据可能也不是共享的，多个线程可能需要操作同一份数据。共享的存储资源在硬件层面上会有影响，而共享的数据一般会带来数据的同步开销。因此，n 核机器的性能是很难做到单核机器的 n 倍，但如何让性能接近 n 倍却是一件有挑战且有意义的事情。

#### 2.2 怎么用无锁编程？

实测数据显示，单线程下连续对锁进行一百万次的上锁和解锁操作，总耗时也仅为 2 毫秒。单次耗时为 3 纳秒。这意味着在业务场景中，锁的基础性能开销几乎可以忽略不计。

无锁编程虽能规避锁竞争带来的阻塞，但引入了更复杂的内存模型挑战。若未正确使用严格内存序（如`std::memory_order_seq_cst`），极易引发数据竞争与内存乱序问题。这类问题具有极强的偶发性，依赖特定的线程调度时序触发，导致 bug 难以复现和定位。即使采用了内存序约束，开发者也需对 CPU 缓存一致性协议、指令重排序规则有深刻理解，调试过程往往涉及汇编级分析与多线程并发验证，成本极高。

对于业务开发而言，当性能加速比不理想时，首要排查的应是锁竞争导致的线程阻塞，而非锁操作本身的开销。在此类场景下，单纯改用无锁编程也没有从从根本上解决问题，因为无锁技术仅优化了锁的执行成本，无法消除因资源竞争产生的等待时间。

相反，锁机制具备清晰的同步语义，出现问题时可通过日志记录、线程状态监控等常规手段快速定位；而无锁程序一旦出现内存序错误，可能导致数据不一致、程序崩溃等严重后果，修复难度呈指数级上升。如果要使用无锁编程，也最好都使用严格内存序，但如果都使用了严格内存序，可能性能也完全等价于有锁。用了其他内存序，调试又很困难，所以最好还是别用了。

**结论建议**：除非对性能有极致要求且具备深厚并发编程经验，否则应优先选择锁机制，并合理设计锁粒度以减少竞争。若必须使用无锁方案，则务必配合详尽的单元测试与静态分析工具，降低潜在风险，有些无锁的问题可能在压力测试下才会暴露。

#### 2.3 如何减小锁的粒度？

**锁的粒度尽量细化**。以下是一个例子如何减少锁的粒度。比如说我有一个任务，在一个容器里面找到满足要求的元素。

```c++
ThreadSafeVector vec{}; // vec.size() == 32
ThreadSafeVector ret{};

// 使用parallel操作vector，每4个element是1个task
// function是做到valid元素，拷贝到ret
tbb::parallel_for(policy:_4_element_per_task,
  function:[](size_t taskIdx){
      for(i=taskIdx * 4; i<(taskIdx+1) * 4); i++){
          if (valid(vec[i]))
              ret.push_back(ret);
      }
  }
)
```

ret 是线程安全的，内部通过锁实现。上面这个实现看上去没问题，但一般不如下面这种好。

```c++
ThreadSafeVector vec{}; // vec.size() == 32
ThreadSafeVector ret{};

tbb::parallel_for(policy:_4_element_per_task,
  function:[](){
      std::thread local_vec;
      for(i=0; i<4; i++){
          if (valid(vec[i]))
              local_vec.push_back(ret);
      }
      ret.insert(ret.end(), local_vec.begin(), local_vec.end());
  }
)
```

简单来说，优化的地方在于有多个结果后再上锁，批量提交，减少上锁次数。

#### 2.4 线程数开多少合适？

线程数量的设置对程序性能有着重要影响。一般而言，当线程数超过 CPU 核心数时，并不会带来性能提升。这是因为 CPU 核心数量决定了同一时刻能够真正并行执行的线程上限。过多的线程会导致操作系统线程调度变得更为复杂，增加了上下文切换的开销。每次上下文切换时，操作系统需要保存当前线程的运行状态（如寄存器值、程序计数器等），并恢复即将执行线程的状态，这一过程会消耗 CPU 时间和资源，从而降低了整体性能。

唯独有一种需要关注的情况是线程饥饿问题。例如，当父任务创建若干子任务，若父任务占据了所有可用线程，使得子任务无法分配到线程资源。这个时候，子任务就在线程池的任务队列等待分配线程。而父任务又阻塞等待子任务完成。在这种情况下，动态创建线程是一种有效的解决办法之一。让父线程继续阻塞，而子任务则被分配到新增的线程中去。因此，线程数量不能一刀切定死，也不能无限制放开。而任务管理器，其实可以看当前线程数量的。在本机正常使用的时候往往有`3-4000`。所以不要随意滥用，其实也还行。

#### 2.5 什么是线程饥饿问题？

```C++
std::vector<std::future<void>> futures;
for (int i = 0; i < parent_task; ++i) {
    // add parentTask
    futures.emplace_back(gPool.submitTask([child_task]() {
        std::vector<std::future<void>> childFutures;
        childFutures.reserve(child_task);
        for (int j = 0; j < child_task; ++j) {
            // add subTask.
            childFutures.emplace_back(
                gPool.submitTask([]() { return taskNear100ms(); }));
        }
        // wait subTask finish.
        for (auto& future : childFutures) {
            future.get();
        }
    }));
}
// wait parentTask finish.
for (auto& future : futures) {
    future.get();
}
```

当`parent_task`取值为 5 时，程序运行顺畅，全程耗时约 5 秒；然而，一旦`parent_task`的值超过`coreNum`，程序便陷入卡死状态，实际测试发现，等待 5 分钟后仍未结束运行。为何任务量仅增加两倍，就会导致程序卡死呢？

这一现象的根源在于线程池采用的是固定大小设计，无法动态扩展。当`parent_task`数量过多，占用了线程池的全部线程资源后，`subTask`便无法再获取到可用线程。这些`subTask`只能滞留在任务队列中，无法执行。而`parent_task`又必须等待`subTask`执行完毕才能释放其所占用的线程，如此一来，`subTask`因缺乏线程资源无法运行，`parent_task`也因等待`subTask`而无法释放线程，最终形成死锁，导致程序卡死。

这种因线程资源分配不均，导致部分任务无法获取线程的问题，在业界被统称为**线程饥饿**。上述示例充分证明了线程池动态扩展能力的重要性。那么，该如何实现线程的动态增长呢？实践表明，在单一线程池中实现动态线程增长颇具挑战。我曾尝试过相关方案，但最终未能成功——新增的线程往往无法被父任务及时调用和使用。因此，更为可行的解决思路是，为子任务单独创建线程池。若创建新线程池的开销过大，也可考虑采用静态线程池方案。

由此，我们再回顾“线程数设置多少合适”这一问题，便能更好地理解：当线程存在 IO 阻塞时，为确保任务高效执行，线程池的线程数量最好大于系统核心数。当然，在现代技术领域，针对 IO 阻塞问题，更多会推荐使用协程方案。不过，这已属于另一个技术话题，在此暂不深入探讨。

#### 2.6 如何理解多线程的缓存？

多线程的缓存失效，是线程上下文切换开销的主要组成之一。而理解多线程的缓存利用率，可以从指令缓存和数据缓存入手。

- **流水线和指令缓存** 我们可以从 CPU 单核的简单模型切入，探究指令执行的具体过程。通常情况下，一条汇编代码可能对应一条或多条机器指令，而一条指令的完整执行流程，涵盖取指令（IF）、指令译码（ID）、指令执行（EX）、访存取数（MEM）和结果写回（WB）这 5 个子过程（过程段） 。每个子过程至少需要一个时钟周期，实际指令执行耗时往往在几个到十几个周期不等。

那么，执行一条指令是否至少需要 5 个时钟周期呢？答案是否定的。现代 CPU 采用流水线技术，当第一条指令完成取指令（IF）阶段，进入指令译码（ID）阶段时，第二条指令便可以立即进入取指令（IF）阶段。这意味着，如果仅执行单条指令，确实至少需要 5 个时钟周期；但当执行多条指令时，执行效率会大幅提升。例如，执行十条指令，可能仅需 15 个时钟周期。

这种流水线技术极大地提升了 CPU 的指令执行效率，但也带来了新的挑战，其中**分支预测**的重要性尤为凸显。由于 CPU 会在当前指令尚未执行完毕时，提前预取下一条指令并执行，当遇到条件判断（如`if`语句）等具有分支逻辑的指令时，若分支预测错误，提前执行的指令结果将无效，需要被丢弃并重新执行正确分支的指令。

- **数据缓存**
  - **避免虚假共享**：当多个线程访问不同的变量，但这些变量恰好位于同一个缓存行中时，就会发生虚假共享问题。这会导致一个线程对缓存行的修改会使其他线程的缓存行失效，从而降低缓存命中率。可以通过将不同线程访问的变量分配到不同的缓存行中来避免虚假共享。例如，在 C 语言中，可以使用`alignas`关键字来指定变量的对齐方式，确保其独占一个缓存行。
  - **优化线程调度**：尽量让访问相同数据的线程在同一 CPU 核心上执行，这样可以利用 CPU 核心的本地缓存，减少跨核心的数据传输和缓存同步开销。可以通过设置线程的亲和性来实现，即将线程绑定到特定的 CPU 核心上。
  - **同步开销**：当多个线程同时拥有一份会被修改的数据的时候，如果这个数据会被频繁修改，多核就需要频繁同步这些数据。这个保证不同缓存一致性的协议，叫`mesi`协议。

* 铺垫完流水线、指令缓存、数据缓存的概念后，举一个例子。方法 A:

  ```c++
    void FuncA() {
      size_t n = 1<<11;
      std::vector<Data> dats(n);

      TICK(process);
      tbb::parallel_for_each(dats.begin(), dats.end(), [&] (Data &dat) {
          dat.step1();
          dat.step2();
          dat.step3();
          dat.step4();
      });
      TOCK(process);
    }

    void FuncB() {
      size_t n = 1<<11;
      std::vector<Data> dats(n);

      TICK(process);
      tbb::parallel_for_each(dats.begin(), dats.end(), [&] (Data &dat) {
          dat.step1();
      });
      tbb::parallel_for_each(dats.begin(), dats.end(), [&] (Data &dat) {
          dat.step2();
      });
      tbb::parallel_for_each(dats.begin(), dats.end(), [&] (Data &dat) {
          dat.step3();
      });
      tbb::parallel_for_each(dats.begin(), dats.end(), [&] (Data &dat) {
          dat.step4();
      });
      TOCK(process);
    }

    void FuncC() {
      size_t n = 1<<11;

      std::vector<Data> dats(n);

      TICK(process);
      auto it = dats.begin();
      tbb::parallel_pipeline(8,
        tbb::make_filter<void, Data *>(tbb::filter_mode::serial_in_order,
        [&] (tbb::flow_control &fc) -> Data * {
            if (it == dats.end()) {
                fc.stop();
                return nullptr;
            }
            return &*it++;
        })
        , tbb::make_filter<Data *, Data *>(tbb::filter_mode::parallel,
        [&] (Data *dat) -> Data * {
            dat->step1();
            return dat;
        })
        , tbb::make_filter<Data *, Data *>(tbb::filter_mode::parallel,
        [&] (Data *dat) -> Data * {
            dat->step2();
            return dat;
        })
        , tbb::make_filter<Data *, Data *>(tbb::filter_mode::parallel,
        [&] (Data *dat) -> Data * {
            dat->step3();
            return dat;
        })
        , tbb::make_filter<Data *, void>(tbb::filter_mode::parallel,
        [&] (Data *dat) -> void {
            dat->step4();
        })
      );
      TOCK(process);
    }
    int main() {
        return 0;
    }
  ```

  在性能对比实验中，方法 B 较方法 A 实现了约 5%的性能提升，而方法 C 的处理效率更是达到前两者的两倍之多。其核心优化逻辑在于采用类流水线作业模式：将多核并行中每个核心独立执行全流程任务（如原料接收、加工处理、成品转运）的方式，调整为多核分工协作——核 A 专职原料接收，核 B 专注加工处理，核 C 负责成品转运。这种设计显著提升了指令缓存的利用率，减少了重复计算开销。

  不过，需要明确的是，这种流水线优化与分支预测属于时钟周期级别的优化手段，其优化效果以纳秒为单位计量。然而需要辩证看待这类优化方案的普适性。在实际业务场景中，若任务存在强同步性要求，或任务本身耗时大，上述缓存优化带来的效率增益可被完全忽略。

  因此，该案例的价值在于给出多线程极致优化的思考方向之一，更在于警示开发者：在多线程编程实践中，需始终保持审慎态度，充分评估技术方案与业务场景的适配性，避免陷入理论性能陷阱。

#### 2.7 多线程的乒乓缓存/ 伪共享问题

```c++
namespace {

    NO_OPTIMIZE void countNumber(int counter) {
        int value = 0;
        for (int i = 0; i < counter; ++i) {
            ++value;
        }
        assert(value == counter);
    }

    NO_OPTIMIZE void countNumberWithRef(int& value, int counter = 240'000'000) {
        for (int i = 0; i < counter; ++i) {
            ++value;
        }
        assert(value == counter);
    }

    NO_OPTIMIZE void taskNear100ms() { countNumber(240'000'000); }

}  // namespace

void A_single_thread_cost(benchmark::State& state) {
    for (auto _ : state) {
        for (int i = 0; i < std::thread::hardware_concurrency(); ++i) {
            taskNear100ms();
        }
    }
}

void B_multi_thread_falseSharing_cost(benchmark::State& state) {
    for (auto _ : state) {
        std::vector<int> nums(std::thread::hardware_concurrency());

        std::vector<std::thread> threads;
        threads.reserve(std::thread::hardware_concurrency());

        for (int i = 0; i < std::thread::hardware_concurrency(); ++i) {
            threads.emplace_back([&nums, i]() { countNumberWithRef(nums[i]); });
        }
        for (auto& thread : threads) {
            thread.join();
        }
    }
}

void C_multi_thread_no_falseSharing_cost(benchmark::State& state) {
    for (auto _ : state) {
        std::vector<std::thread> threads;
        threads.reserve(std::thread::hardware_concurrency());

        for (int i = 0; i < std::thread::hardware_concurrency(); ++i) {
            threads.emplace_back([]() { taskNear100ms(); });
        }
        for (auto& thread : threads) {
            thread.join();
        }
    }
}
```

- 方法 A（单线程执行）

  - **耗时**：1000ms
  - **原因**：  
    单线程顺序执行多个计算任务，每个任务耗时约 100ms。由于硬件通常支持 6-16 核并发，单线程无法利用多核优势，因此总耗时为任务数 × 单任务耗时（约 100ms × 10 核 ≈ 1000ms）。

- 方法 B（多线程+伪共享）

  - **耗时**：4905ms（显著高于方法 A 和 C）
  - **原因**：  
    多个线程共享一个连续内存数组`nums`，每个线程修改其中一个元素。由于 CPU 缓存以缓存行为单位（通常 64 字节）加载数据，相邻的数组元素可能被加载到同一缓存行。当不同线程修改同一缓存行中的不同变量时，会触发**缓存乒乓（Cache Ping-Pong）**：
    1. 线程 T1 修改元素`nums[0]`，导致缓存行被标记为脏（Dirty）并写回内存。
    2. 线程 T2 修改相邻元素`nums[1]`，发现缓存行已失效，必须从内存重新加载。
    3. 频繁的缓存行失效和同步操作（MESI 协议）导致大量额外开销，称为**伪共享（False Sharing）**。

- 方法 C（多线程+无伪共享）
  - **耗时**：323ms（性能最佳）
  - **原因**：  
    每个线程独立执行`taskNear100ms()`，不共享任何变量。由于无需访问共享内存，线程间无缓存一致性开销，各线程可充分利用本地缓存，实现真正的并行计算。多核 CPU 并行处理多个任务，总耗时接近单任务耗时（100ms），仅受线程创建和同步开销影响。

1. **乒乓缓存（Cache Ping-Pong）**  
   多个线程交替修改同一缓存行中的不同变量时，缓存行在 CPU 核心间频繁传输（类似乒乓球），导致性能下降。
2. **伪共享（False Sharing）**  
   当多个变量被放入同一缓存行，但不同线程分别修改这些变量时，尽管变量逻辑上独立，仍会因缓存行共享而相互影响，触发缓存失效。

#### 2.8 多线程程序中持有锁，然后时间片耗光，让出CPU，锁会释放吗？

不会。 这个时候线程状态会切换到`Running`状态。一直持有锁，哪怕没有持有时间片。
因此，锁的粒度需要精细控制，不要有多重的开销。

#### 2.9 双重检查

```c++
Foo& getFoo() {
    static std::unique_ptr<Foo> foo = nullptr;
    static std::mutex mtx;

    if (!foo) {
        std::lock_guard<std::mutex> lock(mtx);
        if (!foo) {
            // foo = std::make_unique<Foo>();
            foo.reset(new Foo());
        }
    }
    return *foo;
}
```

#### 2.10 如果是单核环境，多线程编程是否就不会出现数据竞争的情况呢？
