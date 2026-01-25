主要用于将 Go 的数据类型（如结构体、map、slice、基本类型等）序列化为 JSON 格式，以及将 JSON 数据反序列化为 Go 数据结构。

核心函数：
- `json.Marshal(v interface{}) ([]byte, error)`：将数据结构序列化为 JSON 字节数组。
- `json.Unmarshal(data []byte, v interface{}) error`：将 JSON 数据解析为对应的 Go 数据结构。
- `json.MarshalIndent`：用于格式化输出，更适合人类阅读。

## 内部工作原理
### Marshal 的调用链
- **入口函数：**  
    `json.Marshal(v)` 会创建一个内部的 `encodeState` 对象（即**编码器**），然后调用 `encodeState.marshal(v, encOpts{})` 递归处理数据。
- **递归序列化：**  
    根据传入数据的类型，`marshal` 会调用不同的方法：
    - **结构体**：调用 `marshalStruct`，利用反射读取字段，并解析字段标签（如 `json:"name,omitempty"`）。
    - **切片/数组**：调用 `marshalSlice`，逐个处理元素。
    - **Map**：调用 `marshalMap`，遍历键值对进行递归序列化。
    - **基本类型**：直接转换为 JSON 格式字符串（例如字符串、数字、布尔值）。
### 结构体与字段标签处理
- **字段标签解析：**  
```go
type User struct {
    Name  string `json:"name"`
    Age   int    `json:"age"`
    Email string `json:"email,omitempty"`
}
```
- `json:"name"` 指定了序列化时的 JSON 键名。
- `omitempty` 标记当字段值为空（如零值、nil）时不输出该字段。
- 标签 `json:"-"` 表示完全跳过该字段，不进行序列化。
- **源码关键逻辑：**  
    在 `marshalStruct()` 内部，通过反射遍历结构体的每个字段，检查字段标签，决定是否序列化或跳过该字段。
### 处理其他数据类型
- **Map 类型：**  
    遍历 `map` 的所有键值对，键作为 JSON 的 key，值递归序列化为 JSON 格式。
- **切片和数组：**  
    按顺序遍历每个元素，调用 `marshal` 方法对每个元素进行处理。
- **指针：**  
    **自动解引用**，将指针指向的值进行序列化。
- **特殊类型（如时间）：**  
    不会自动处理时间类型，默认时间类型会被转换为 RFC3339 格式。如果需要自定义格式，可以为结构体实现 `MarshalJSON()` 方法。
### 自定义JSON序列化
- **实现 `MarshalJSON` 方法：**  
    如果默认的序列化方式不满足需求，可以为自定义类型实现 `MarshalJSON()` 接口。例如自定义时间格式：
```go
type Event struct {
    Time time.Time `json:"time"`
}

func (e Event) MarshalJSON() ([]byte, error) {
    formatted := e.Time.Format("2006-01-02 15:04:05")
    return json.Marshal(formatted)
}
```
- **格式化输出：**  
    使用 `json.MarshalIndent` 来生成格式化、易读的 JSON 字符串，便于调试和日志输出。