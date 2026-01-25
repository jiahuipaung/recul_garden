通过整合容器构建(或者函数)、工作负载管理(和动态扩缩)以及事件模型这三者来实现的这一 Serverless 标准
业务代码部署到 Serverless 平台上就离不开源码的编译、部署和事件的管理。然而无论是开源的解决方案还是各公有云的 FAAS 产品大家的实现方式大家都各不相同，缺乏统一的标准导致市场呈现碎片化。因此无论选择哪一个方案都面临供应商绑定的风险。
![[Pasted image 20250310205720.png]]
## 核心组件
Knative 主要由 Serving 和 Eventing 核心组件构成。除此之外使用 Tekton 作为CI/CD构建工具。下面让我们来分别介绍一下这三个核心组件。
### Serving
Knative 作为 Severless 框架最终是用来提供服务的， Knative Serving 构建于 Kubernetes 和 Istio 之上，为 Serverless 应用提供部署和服务支持。
- 快速部署 Serverless 容器
- 支持自动扩缩容和缩到 0 实例
- 基于 Istio 组件，提供路由和网络编程
- 支持部署快照
Serving 中定义了以下 [[#CRD]]资源：
- Service: 自动管理工作负载整个生命周期。负责创建 Route、Configuration 以及 Revision 资源。通过 Service 可以指定路由流量使用最新的 Revision 还是固定的 Revision
- Route：负责映射网络端点到一个或多个 Revision。可以通过多种方式管理流量。包括灰度流量和重命名路由
- Configuration: 负责保持 Deployment 的期望状态，提供了代码和配置之间清晰的分离，并遵循应用开发的 12 要素。修改一次 Configuration 产生一个 Revision
- Revision：Revision 资源是对工作负载进行的每个修改的代码和配置的时间点快照。Revision 是不可变对象，可以长期保留
![undefined](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/11378/1551788277363-60c608df-37e4-4fa3-9b28-f048ff6f3c64.png)
### Eventing
Knative Eventing 旨在满足云原生开发中通用需求, 以提供可组合的方式**绑定事件源和事件消费者**。其设计目标：
- Knative Eventing 提供的服务是松散耦合，可独立开发和部署。服务可跨平台使用（如 Kubernetes, VMs, SaaS 或者 FaaS）
- 事件的生产者和事件的消费者是相互独立的。任何事件的生产者（事件源）可以先于事件的消费者监听之前产生事件，同样事件的消费者可以先于事件产生之前监听事件
- 支持第三方的服务对接该 Eventing 系统
- 确保跨服务的互操作性
![[Pasted image 20250310211232.png]]
主要由事件源（Event Source）、事件处理（Flow）以及事件消费者（Event Consumer）三部分构成
#### Event Source
当前支持以下几种类型的事件源：
- ApiserverSource：每次创建或更新 Kubernetes 资源时，ApiserverSource 都会触发一个新事件
- GitHubSource：GitHub 操作时，GitHubSource 会触发一个新事件
- GcpPubSubSource： GCP 云平台 Pub/Sub 服务会触发一个新事件
- AwsSqsSource：Aws 云平台 SQS 服务会触发一个新事件
- ContainerSource: ContainerSource 将实例化一个容器，通过该容器产生事件
- CronJobSource: 通过 CronJob 产生事件
- KafkaSource: 接收 Kafka 事件并触发一个新事件
- CamelSource: 接收 Camel 相关组件事件并触发一个新事件
#### Flow
当前 Knative 支持如下事件接收处理：
- 直接事件接收 通过事件源直接转发到单一事件消费者。支持直接调用 Knative Service 或者 Kubernetes Service 进行消费处理。这样的场景下，如果调用的服务不可用，事件源负责重试机制处理。
- 通过事件通道(Channel)以及事件订阅(Subscriptions)转发事件处理 这样的情况下，可以通过 Channel 保证事件不丢失并进行缓冲处理，通过 Subscriptions 订阅事件以满足多个消费端处理。
- 通过 brokers 和 triggers 支持事件消费及过滤机制
从 v0.5 开始，Knative Eventing 定义 Broker 和 Trigger 对象，实现了对事件进行过滤（亦如通过 ingress 和 ingress controller 对网络流量的过滤一样）。 通过定义 Broker 创建 Channel，通过 Trigger 创建 Channel 的订阅（subscription），并产生事件过滤规则。
#### Event Consumer
为了满足将事件发送到不同类型的服务进行消费， Knative Eventing 通过多个 k8s 资源定义了两个通用的接口：
- Addressable 接口提供可用于事件接收和发送的 HTTP 请求地址，并通过`status.address.hostname`字段定义。作为一种特殊情况，Kubernetes Service 对象也可以实现 Addressable 接口
- Callable 接口接收通过 HTTP 传递的事件并转换事件。可以按照处理来自外部事件源事件的相同方式，对这些返回的事件做进一步处理
当前 Knative 支持通过 Knative Service 或者 Kubernetes Service 进行消费事件。 另外针对事件消费者，如何事先知道哪些事件可以被消费？ Knative Eventing 在最新的 0.6 版本中提供 **Registry 事件注册机制**, 这样事件消费者就可以事先通过 Registry 获得哪些 Broker 中的事件类型可以被消费。
### Tekton
Kubernetes原生CI/CD开源框架。通过抽象底层实现细节，用户可以跨多云平台和本地系统进行构建、测试和部署。具有组件化、声明式、可复用及云原生的特点。
- Tekton 是云原生的 - Cloud Native
    - 在Kubernetes上运行
    - 将Kubernetes集群作为第一选择
    - 基于容器进行构建
- Tekton 是解耦的 - Decoupled
    - Pipeline 可用于部署到任何k8s集群
    - 组成 Pipeline 的Tasks 可以轻松地独立运行
    - 像 git repos这 样的 Resources 可以在运行期间轻松切换
- Tekton 是类型化的 - Typed
    - 类型化资源的概念意味着对于诸如的资源 Image，可以轻松地将实现切换（例如，使用 kaniko vs buildkit进行构建）
# 附录
## CRD
Custom Resource Definition，扩展 Kubernetes 功能时使用到
CRD 允许用户在 Kubernetes 集群中定义新的资源类型。这使得开发者能够创建符合其特定需求的资源，而不仅限于 Kubernetes 内置的资源（如 Pod、Service 等）。
##### **功能与目的**： 
通过使用 CRD，用户可以定义新的 API 对象，进而使得 Kubernetes 更加灵活，能够支持多种不同的应用场景。CRD 实际上为开发人员提供了一种在 Kubernetes 上扩展其功能的方式，使得 Kubernetes 不再仅仅局限于它最初设计的用途
##### **与 Knative 的关系**：
在 Knative 的背景下，CRD 资源扮演着至关重要的角色。Knative 使用 CRD 来定义其核心组件和功能。例如，Knative 的服务、路由、配置等均通过 CRD 来实现。这样，开发人员可以在 Kubernetes 环境中直接管理 Knative 服务，并利用 Kubernetes 的强大特性（如调度、扩展）来优化 Serverless 工作负载。