### **架构与技术细节**
Jaeger 主要由以下几个组件构成：
1. **Jaeger Client**：
    - 用于生成和发送追踪数据的 SDK，支持多种语言（如 Go、Java、Python）。
    - 将追踪数据打包为 **spans**（追踪片段）。
2. **Agent**：
    - 部署在主机上的守护进程，接收 Jaeger Client 发来的追踪数据。
3. **Collector**：
    - 接收来自 Agent 的追踪数据，解析后存储到后端（如 Elasticsearch、Cassandra 或 Kafka）。
4. **Query Service**：
    - 提供查询 API 和 UI，用于可视化和分析追踪数据。
5. **存储后端**：
    - 支持多种存储解决方案，常用的是 **Elasticsearch** 和 **Cassandra**。
6. **UI**：
    - 交互式界面，用于查看调用链和性能瓶颈。
### **Jaeger 的关键技术点**
1. **Spans 和 Traces**：
    - **Span**：一个服务中单次操作的追踪数据，记录了操作名称、开始时间、持续时间及标签等。
    - **Trace**：多个 spans 的集合，展示一个请求在整个系统中的传播路径。
2. **上下文传播**：
    - 在分布式系统中，Jaeger 通过在请求头中注入上下文数据（Trace ID 和 Span ID），实现追踪链路的跨服务传播。
3. **采样策略**：
    - **全量采样**：记录所有请求的追踪数据，适用于低流量环境。
    - **概率采样**：以一定比例采样，适用于高并发环境。
    - **自定义采样**：基于服务、路径或方法定义采样规则。
4. **OpenTelemetry 集成**：
    - Jaeger 是 OpenTelemetry 的实现之一，可以结合 OpenTelemetry SDK 进行扩展。
---