# What's k8s
容器编排平台，用于自动化部署、扩展和管理**容器化应用**
![[Pasted image 20250311150813.png]]
- 核心层：Kubernetes 最核心的功能，对外提供 API 构建高层的应用，对内提供插件式应用执行环境
- 应用层：部署（无状态应用、有状态应用、批处理任务、集群应用等）和路由（服务发现、DNS 解析等）
- 管理层：系统度量（如基础设施、容器和网络的度量），自动化（如自动扩展、动态 Provision 等）以及策略管理（RBAC、Quota、PSP、NetworkPolicy 等）
- 接口层：kubectl 命令行工具、客户端 SDK 以及集群联邦
- 生态系统：在接口层之上的庞大容器集群管理调度的生态系统，可以划分为两个范畴
    - Kubernetes 外部：日志、监控、配置管理、CI、CD、Workflow、FaaS、OTS 应用、ChatOps 等
    - Kubernetes 内部：CRI、CNI、CVI、镜像仓库、Cloud Provider、集群自身的配置和管理等
## **核心功能：**
- **自动扩展**：根据工作负载需求，自动增加或减少运行的容器数量。
- **自愈能力**：通过重新启动失败的容器或重新调度到健康节点，确保高可用性。    
- **服务发现与负载均衡**：自动为容器分配 IP 并通过负载均衡维持性能。   
- **配置管理**：使用 ConfigMaps 和 Secrets 安全管理应用配置。
- **存储编排**：为有状态应用动态分配存储，支持多种存储后端。
---
# 核心概念：
Kubernetes 集群由一个控制平面（control plane）和一组运行容器化应用程序的工作机器（称为节点）组成。每个集群至少需要一个 worker 节点才能运行 Pod。
worker 节点托管作为应用程序工作负载组件的 Pod。控制平面管理集群中的 worker 节点和 Pod。在生产环境中，控制平面通常跨多台计算机运行，一个集群通常运行多个节点，从而提供容错和高可用性。
![[Pasted image 20250310192516.png]]
## 组件
### Control plane：
可以在集群中的任何计算机上运行。但是，为简单起见，通常在同一台机器上设置脚本启动所有 control plane 组件，并且不会在此机器上运行用户容器。
- kube-apiserver：水平扩展，用于公开 Kubernetes API，是control plane的前端
- etcd：一致且高可用性的键值存储，用作 Kubernetes 所有集群数据的后备存储
- kube-scheduler：监视新创建且未分配的Pod，选择一个节点供它们运行。调度决策考虑的因素包括：单个和集体资源要求、硬件/软件/策略约束、关联性和反关联性规范、数据局部性、工作负载间干扰和截止日期。
- kube-controller-manager：包括多个不同类型，每个都以单一进程方式运行：
	- 节点控制器：负责在节点宕机时进行通知和响应。
	- Job 控制器：监视代表一次性任务的 Job 对象，然后创建 Pod 来运行这些任务直到完成。
	- EndpointSlice 控制器：填充 EndpointSlice 对象（以提供 Service 和 Pod 之间的链接）。
	- ServiceAccount 控制器：为新命名空间创建默认 ServiceAccount。
部署方式：传统部署、静态Pod、自托管、托管 Kubernetes 服务
### Node：
维护正在运行的 Pod 并提供 Kubernetes 运行时环境。
- kubelet：agent，提供PodeSpec(定义与配置Pod,包括容器信息、网络等资源)，
- kube-proxy：代理维护节点上的网络规则，允许网络从内部或外部的网络会话与 Pod 的通信；系统数据包过滤层；亦可自己使用插件进行数据转发
- Container runtime：管理容器的执行和生命周期
## 对象
通过两个嵌套的字段来**设置其内容并描述其预期状态（Spec）**、**描述其当前状态(Status)**
### 描述对象
创建 Kubernetes 对象时，必须提供对象的 `spec`，用来描述该对象的期望状态， 以及关于对象的一些基本信息（例如名称）
当spec和status存在不一致时Kubernetes 系统会通过执行修正操作来响应 `spec` 和 `status` 间的不一致 —— 意味着它会启动一个新的实例来替换。