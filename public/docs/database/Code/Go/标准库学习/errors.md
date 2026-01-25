Go 语言标准库 `errors` 主要用于创建和处理错误（`error` 类型）。从底层原理出发，我们可以从 `errors` 包的源码分析其实现，并理解它在 Go 语言中的作用和设计哲学。

---
## 1. `errors` 包的基本结构
`errors` 包的源码位于 `src/errors/errors.go`，其核心功能主要包括：
- **创建错误**：`errors.New`
- **错误的类型定义**：`error` 接口
- **错误的包装**：`errors.Join`、`errors.Unwrap`、`errors.Is`、`errors.As`
### 1.1 `error` 接口定义
在 Go 语言中，`error` 是一个内置接口：
```go
type error interface {
    Error() string
}
```
任何实现了 `Error() string` 方法的类型，都可以被认为是一个 `error`。

---
## 2. `errors.New` 的实现
`errors.New` 是 `errors` 包最基础的函数，用于创建一个新的错误：
```go
func New(text string) error {
    return &errorString{text}
}
```
其中，`errorString` 是 `errors` 包内部的一个结构体：
```go
type errorString struct {
    s string
}
func (e *errorString) Error() string {
    return e.s
}
```
### **底层原理**
1. `New` 返回的是 `errorString` 结构体的指针，这个结构体实现了 `error` 接口，因此可以作为 `error` 类型使用。
2. `errorString` 内部仅存储错误信息字符串 `s`。
3. 当 `Error()` 方法被调用时，它直接返回 `s`。
### **示例**

```go
package main
import (
    "errors"
    "fmt"
)
func main() {
    err := errors.New("this is an error")
    fmt.Println(err)  // 输出: this is an error
}
```

---
## 3. 错误的包装和解包
Go 1.13 之后，`errors` 包新增了一些方法用于处理错误链，支持错误的**包装、解包、匹配**。
### **3.1 `fmt.Errorf` 结合 `%w` 进行错误包装**
Go 1.13 之后，`fmt.Errorf` 提供了 `%w` 语法，用于**包装**错误：
```go
err := fmt.Errorf("operation failed: %w", someError)
```
这里的 `%w` 用于包装 `someError`，并且 `err` 仍然是 `error` 类型。
`fmt.Errorf` 结合 `%w` 的底层实现如下：
```go
func Errorf(format string, a ...interface{}) error {
    return fmt.Sprintf(format, a...)
}
```
当 `format` 包含 `%w` 时，`fmt.Sprintf` 会把 `a` 里的 `error` 类型变量转换为 `*wrappedError` 结构体：
```go
type wrappedError struct {
    msg string
    err error
}

func (e *wrappedError) Error() string {
    return e.msg
}

func (e *wrappedError) Unwrap() error {
    return e.err
}
```
### **3.2 `errors.Unwrap`**
用于获取被包装的原始错误：
```go
func Unwrap(err error) error {
    u, ok := err.(interface{ Unwrap() error })
    if !ok {
        return nil
    }
    return u.Unwrap()
}
```
如果 `err` 实现了 `Unwrap()` 方法，就返回其内部的 `error`，否则返回 `nil`。
### **3.3 `errors.Is`**

用于判断某个错误是否等于目标错误：

```go
func Is(err, target error) bool {
    if err == target {
        return true
    }
    if x, ok := err.(interface{ Is(error) bool }); ok {
        return x.Is(target)
    }
    for {
        if err = Unwrap(err); err == nil {
            return false
        } else if err == target {
            return true
        }
    }
}
```

工作原理：

1. **直接比较**：如果 `err == target`，则返回 `true`。
    
2. **调用 `Is()` 方法**：如果 `err` 实现了 `Is(error) bool` 方法，则调用这个方法。
    
3. **递归展开 `err`**：通过 `errors.Unwrap` 递归检查底层错误是否等于 `target`。
    

示例：

```go
package main

import (
    "errors"
    "fmt"
)

var ErrNotFound = errors.New("not found")

func main() {
    wrappedErr := fmt.Errorf("query failed: %w", ErrNotFound)
    
    fmt.Println(errors.Is(wrappedErr, ErrNotFound)) // true
}
```

### **3.4 `errors.As`**

用于将错误转换为特定类型：

```go
func As(err error, target interface{}) bool {
    if err == nil {
        return false
    }
    if target == nil {
        panic("errors: target cannot be nil")
    }
    if e, ok := err.(interface{ As(interface{}) bool }); ok {
        return e.As(target)
    }
    for {
        if err = Unwrap(err); err == nil {
            return false
        } else if reflect.TypeOf(err) == reflect.TypeOf(target).Elem() {
            reflect.ValueOf(target).Elem().Set(reflect.ValueOf(err))
            return true
        }
    }
}
```

- `errors.As` 允许将 `error` 转换为特定的自定义错误类型。
    
- 适用于检查是否是某种具体类型的错误。
    

示例：

```go
package main

import (
    "errors"
    "fmt"
)

type MyError struct {
    msg string
}

func (e *MyError) Error() string {
    return e.msg
}

func main() {
    myErr := &MyError{"custom error"}
    wrappedErr := fmt.Errorf("operation failed: %w", myErr)

    var targetErr *MyError
    if errors.As(wrappedErr, &targetErr) {
        fmt.Println("Matched MyError:", targetErr.msg) // 输出: Matched MyError: custom error
    }
}
```

---

## 4. `errors.Join` 处理多个错误

Go 1.20 引入了 `errors.Join`，用于合并多个错误：

```go
func Join(errs ...error) error {
    var nonNilErrs []error
    for _, err := range errs {
        if err != nil {
            nonNilErrs = append(nonNilErrs, err)
        }
    }
    if len(nonNilErrs) == 0 {
        return nil
    }
    return joinError(nonNilErrs)
}
```

`joinError` 结构体：

```go
type joinError []error

func (e joinError) Error() string {
    var b strings.Builder
    for i, err := range e {
        if i > 0 {
            b.WriteString("; ")
        }
        b.WriteString(err.Error())
    }
    return b.String()
}

func (e joinError) Unwrap() []error {
    return []error(e)
}
```

示例：

```go
err1 := errors.New("error 1")
err2 := errors.New("error 2")
err := errors.Join(err1, err2)

fmt.Println(err) // "error 1; error 2"
```

---
## errors.Cause
获取错误根因
## 5. 总结

1. **基础错误创建**：`errors.New` 只是创建一个 `errorString` 结构体。
2. **错误包装**：`fmt.Errorf("%w", err)` 生成 `wrappedError`，支持 `errors.Unwrap`。
    
3. **错误判断**：
    
    - `errors.Is` 递归检查是否匹配目标错误。
        
    - `errors.As` 递归尝试转换错误类型。
        
4. **错误合并**：`errors.Join` 支持多个错误合并。
    

这些机制使得 Go 的错误处理既轻量级又灵活，可扩展性强。