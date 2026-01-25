# 阻塞主进程并等待相应信号
```go
sigs := make(chan os.Signal, 1)  
signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)  
  
go func() {  
    <-sigs  
    logrus.Info("Exit signal received")  
    os.Exit(0)  
}()  
logrus.Println("Press Ctrl+C  to exit")  
select {}
```


### **闭包捕获的坑**

如果 `defer` 中使用了闭包，可能会导致意外的结果，因为闭包捕获的是变量的地址，而不是值。

go

复制代码

`package main  import "fmt"  func main() { 	for i := 0; i < 3; i++ { 		defer func() { 			fmt.Println(i) 		}() 	} }`

输出：

复制代码

`3 3 3`

- **原因**：
    
    - 闭包捕获的是循环变量 `i` 的地址，`i` 的值在循环结束后为 `3`。
    - 因此，所有的 `defer` 执行时，打印的都是 `3`。
- **解决办法**：将变量传递给闭包，避免捕获外部变量。
    

go

复制代码

`package main  import "fmt"  func main() { 	for i := 0; i < 3; i++ { 		defer func(val int) { 			fmt.Println(val) 		}(i) // 将当前的 i 作为参数传递 	} }`

输出：

复制代码

`2 1 0`

### **最佳实践**

1. **避免在循环中滥用 `defer`**：
    - 如果资源需要在每次迭代后立即释放，不要使用 `defer`，而是显式调用释放方法。
2. **传值而不是捕获变量**：
    - 在循环中使用闭包时，传递循环变量的副本，避免捕获外部变量的地址。
3. **注意性能开销**：
    - 大量 `defer` 会增加栈的开销，影响性能。
    - 在性能关键的代码中，尽量减少 `defer` 的使用。