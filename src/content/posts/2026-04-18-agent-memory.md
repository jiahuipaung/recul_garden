---
title: "Agent Memory 小记 1"
date: "2026-04-18"
excerpt: "Agent Memory 不是一个研究问题，是一束问题。这篇文章基于近一个月读的 9 篇Agent Memory论文，梳理一下相关工作（综述 + A-Mem / AtomMem / MemAgent / XSKILL / TA-Mem / LoongRL / AdaMem / MemFactory）。"
tags: "tech, Agent, LLM"
---

## 为什么想写这个

我是在给组会备 Week 1 的时候第一次意识到：**"Agent Memory"不是一个问题，是一束问题**。"怎么存"、"怎么取"、"怎么更新"、"怎么忘"、"能不能被学出来"——每一个都可以是一篇博士论文的题目。而这个方向发论文的速度又极快，三周 9 篇下来，脑子里已经变成一团毛线。

所以我想做一件事：**搭一个骨架，把我读过的东西挂上去**。将来再读新的工作，直接往里加就行。以下是我目前用的骨架——来自综述论文（arXiv:2512.13564）那张我觉得很好用的三维分类图。

## 一、骨架：Forms × Functions × Dynamics

综述作者把 Agent Memory 拆成三个正交的维度，我觉得这个拆法很值。它把"记忆长什么样"和"记忆做什么用"和"记忆怎么活"区分开，避免各种论文互相打架——因为它们根本在谈不同维度的事情。

**Forms（载体）—— 记忆长什么样？**

- **Token-level**：人能读的文字。再细分成 1D 扁平（对话历史）、2D 平面（Graph / Tree）、3D 分层（多级抽象）。
- **Parametric**：直接烧进模型权重里。Fine-tuning 是 Internal，LoRA / Adapter 是 External。
- **Latent**：隐藏状态 / KV Cache 这种"看不见摸不着但 forward 一下就有"的东西。

**Functions（功能）—— 记忆做什么用？**

- **Factual**：陈述性知识。用户的偏好、承诺、环境里的文档、系统状态。
- **Experiential**：经验性知识。从成功失败里攒出来的案例、策略、技能。
- **Working**：当下在想什么。临时的、容量有限的活动空间。

**Dynamics（生命周期）—— 记忆怎么活？**

- **Formation**：怎么把原始交互变成一条记忆（摘要、蒸馏、结构化）。
- **Evolution**：融合、更新、遗忘。
- **Retrieval**：触发、重写、检索、重排、压缩。

这个骨架的好处：读一篇论文的时候，先问三个问题——你动的是哪个 Form？服务哪个 Function？重点优化了哪个 Dynamics 环节？这么一过，所有论文都能干净地落到一个象限里去。

下面我把读过的另外 8 篇按这个骨架串起来。

## 二、Formation 和 Evolution：让记忆"活"起来

### A-Mem：LLM 当 Memory Manager

A-Mem 的灵感来自 Zettelkasten（卡片盒笔记法）。核心思路：**LLM 不仅仅是 Retriever，还可以是 Writer、Linker 和 Evolver**。

流程分三步：

1. **Note Construction**：每次新交互，LLM 生成结构化卡片——原始内容 + 时间戳 + Keywords + Tags + 语义摘要 + Embedding。
2. **Link Generation**：向量相似度粗筛 Top-k，再让 LLM 分析逻辑 / 因果关联，自动生成 Links。
3. **Memory Evolution**：这个是我觉得最有意思的——新记忆进来后，**回溯更新旧记忆的 Context、Keywords 和 Tags**。模拟人类"温故而知新"。

实验上它在多跳推理任务（LoCoMo）上 ROUGE-L 从 18 跳到 44，Token 用量从 ~16,900 降到 ~1,200。

**我的看法**：Evolution 这一步在今天大部分 RAG 系统里是完全缺失的。大家都在做"写入时就定型"的静态记忆库，没人回头更新。A-Mem 戳中了这个痛点。但代价是每次写入都要调 LLM——成本不低，而且链接质量依赖 LLM 判断，有幻觉风险。

### AtomMem：让 RL 自己学"什么时候做什么"

A-Mem 回答了"记忆怎么组织"，AtomMem 回答了另一个问题：**"什么时候做什么操作"**。

它把记忆管理解构成四个 CRUD 原子操作：

- **Create**：存新记忆
- **Read**：检索
- **Update**：按 ID 修改
- **Delete**：按 ID 删除

然后配一个 **Scratchpad**（工作记忆），每步强制读取，记录全局任务状态。

最核心的训练策略：**SFT 学格式 + RL（GRPO）学策略**。答对 → Reward，答错 → Penalty，完全让模型自己摸索最优组合。

训练之后涌现出一个反直觉的策略——**Read 频率主动下降，Create + Update 频率大幅增加**。消融实验更有趣：去掉 Update 性能断崖式下跌。

> 高效记忆的核心是"勤于修正和整合"，而不是"读得多"。

这句话我当时看到直接把它抄到自己的笔记里了。我们做 RAG 系统的默认直觉是"检索越多越准"，但 AtomMem 用 RL 自发找到了相反的策略：**写清楚比读得多更重要**。

## 三、Working Memory 的硬核路线：MemAgent

如果 A-Mem / AtomMem 的记忆偏"知识"，MemAgent 做的就是"当下的 scratchpad"。

它要解决的问题是：8K 窗口的 base model，怎么处理 3.5M token 的输入？

方法简单粗暴到漂亮：**类人阅读 + 固定长度的流式记忆**。

1. 超长文本切成固定长度 chunk。
2. Context-Processing 模块逐 chunk 更新一个**固定长度的 token 级记忆**。
3. Answer-Generation 基于最终记忆回答。

训练用的是 Multi-Conv DAPO（DAPO 的多轮版本）——每一轮记忆更新是独立对话，用最终 QA 结果的奖励反哺所有中间更新步骤。

**效果**：8K 原生窗口训出来的模型，3.5M token 任务性能损失 < 5%；复杂度是严格的 O(N) 线性。对比基线在 896K 就已经是 0 分。

**我的看法**：MemAgent 的精妙之处是它没有碰 Transformer 的任何架构。所有"扩窗口"的工作都在改 attention，它直接从范式上跳出了这个问题——**把长文本问题变成长交互问题**。这个转换有点像当年 RNN 变 Transformer 那种"换一个角度就打开一扇门"的感觉。

## 四、Retrieval 的两条新路

### TA-Mem：把检索变成 Tool Use

传统 RAG 的问题：固定 Top-K，不看问题类型。TA-Mem 的解法是把数据库的不同查询方式抽象成工具：

- 字符串精确匹配
- 向量 Top-K
- 人物画像查询

然后让 Agent 在 loop 里自主选。97.73% 的问题在 4 轮内自主终止，平均 2.71 轮。LoCoMo 时序题 F1 做到 55.95，比 Mem0 高 7 个点，Token 用量只有 3,755（vs 传统的 ~16,900）。

**关键洞察**：记忆的"写"（结构化提取）和"读"（工具路由）完全解耦了。这让系统的每一个模块都可以独立替换——我觉得这才是 Agentic Memory 真正 production-ready 的样子。

### AdaMem：四层记忆 + 问题条件化检索

AdaMem 干脆做了一个完整的类人记忆系统：

- **Working Memory**（容量 20 的 FIFO 队列）
- **Episodic Memory**（事件、事实、属性，可以 ADD/UPDATE/IGNORE）
- **Persona Memory**（从 Episodic 蒸馏出来的用户画像）
- **Graph Memory**（异构图，关系感知检索）

检索阶段用问题条件化路由——先判断问题指向谁，再决定用哪层记忆、多大的图扩展深度、融合权重。

实验上 LoCoMo 整体 F1 44.65，**时序推理提升最大（+13.6 点）**。消融里去掉 Graph Memory 掉得最多——证明异构图的关系结构在长对话里确实比单纯向量重要。

## 五、持续学习：XSKILL

XSKILL 做的是多模态 agent 的 **无参数更新持续学习**——整个学习过程都发生在外部知识库里，模型权重不动。

核心是 **双流知识**：

- **Skill**：任务级标准流程（像说明书）。
- **Experience**：动作级触发条件和建议（像踩坑笔记）。

整个流程全程 **视觉锚定**——知识提取、检索、适配都和当前视觉上下文绑定，避免文本-视觉脱节。

实验上在 5 个多模态基准上都 SOTA，而且可以跨模型迁移（Gemini 累积的知识可以直接被 GPT-5-mini 用）。

**我的看法**：XSKILL 是这批工作里"最不 RL"的一个——它完全靠 prompt engineering + 外部知识库。这也提醒我：在 RL 之外，**好的数据结构本身就是一种学习算法**。

## 六、RL 和数据：LoongRL

LoongRL 有一个很"狠"的观察——**数据质量 > 数据长度**。

他们用 16K 上下文训练，结果泛化到 128K。核心是 **KeyChain 数据合成**：在长上下文里插入 UUID 键值对链，模型必须从起始 UUID 出发，逐步追踪正确链 → 找到真实问题 → 在长上下文中推理作答。

训练之后模型自发涌现出 **plan → retrieve → reason → recheck** 四步循环，而且这个模式在 128K 时依然有效。

最妙的是奖励函数——**Two-way Substring Exact Match**：预测包含真值 **或** 真值包含预测都给满分。比严格匹配宽容，比 LLM-as-judge 不易被 hack。

**我的看法**：这篇跟 Memory 直接相关度不高，但它给我提了一个很重要的醒——**做 Memory-RL 的时候，数据的设计比算法选择重要得多**。很多时候不是 GRPO 不够强，是我们的训练数据没逼模型涌现出真正需要的行为。

## 七、工程：MemFactory

如果说前面都在讲"怎么想"，MemFactory 讲的是"怎么做"。

它是第一个专门为 Memory Agent 设计的统一框架（作者自己类比 LLaMA-Factory）。分四层：

- **Module Layer**：Extractor / Updater / Retriever / Agent Module
- **Agent Layer**：乐高拼装
- **Environment Layer**：MemoryBankEnv（长期）/ LongcontextEnv（短期）
- **Trainer Layer**：GRPO

内置 GRPO 的原因很简单——**无 critic，省显存，天然适配记忆 agent 的有状态训练循环**。

它还做了一张我很喜欢的 Memory-RL 技术图谱：

| 工作 | 优化环节 | RL 算法 |
|---|---|---|
| Memory-R1 | 写入与更新 | PPO + GRPO |
| MemAgent | 压缩存储 | Multi-Conv DAPO |
| RMM | 检索优化 | REINFORCE |

看完这张表我的直觉是：**记忆生命周期 = 提取 → 更新 → 检索 → 回答，每个环节都有人用 RL 优化了，但没人做全链路联合优化**。这是下一步明显的方向。

## 八、把 9 篇串起来

把前面塞进三维骨架里：

| 论文 | Forms | Functions | Dynamics 重点 |
|---|---|---|---|
| A-Mem | 2D Planar Token-level | Factual + Experiential | Formation + **Evolution** |
| AtomMem | 1D Flat Token-level | Working | **RL 驱动的 Retrieval + Evolution** |
| MemAgent | 1D Flat Token-level | Working | **Formation（流式压缩）** |
| XSKILL | 2D 双流 Token-level | Experiential | Formation + Retrieval（多模态） |
| TA-Mem | 1D Flat + 多索引 | Factual | **Retrieval（tool-use）** |
| AdaMem | 分层 + Graph | Factual + Experiential + Working | 全链路（偏 Retrieval） |
| LoongRL | —— | —— | 模型层面，催生推理能力 |
| MemFactory | —— | —— | 基础设施 |

几个我观察到的趋势：

1. **Token-level 还是主流**——9 篇里 8 篇都在动 Token-level Memory。Parametric 和 Latent 几乎没人碰。这是一个明显的 Gap。
2. **Evolution 从被忽视变成主战场**——A-Mem、AtomMem、AdaMem 都花了大力气在"怎么让旧记忆升级"。"写完就不管"的时代结束了。
3. **RL 正在全面进场**——从 MemAgent 到 AtomMem 到 LoongRL，几乎都在讲"让模型自己学"。GRPO 几乎成了 Memory-RL 的事实标准。
4. **Retrieval 从 Top-K 向 Tool Use 演进**——TA-Mem 和 AdaMem 都不再迷信固定 Top-K，而是让 Agent 根据问题类型自主选策略。

还没被解决的几个问题：

- **遗忘机制**——大家都在加新东西，但"什么时候该忘掉什么"几乎没人系统研究。
- **记忆质量的内在评估**——现在所有评估都是"下游任务好就说明记忆好"，这是一个间接指标。
- **多智能体共享记忆**——9 篇里只有 AdaMem 多少沾了点边，但离真正的协同还远。
- **Parametric + Token-level 的混合架构**——没人在认真研究。

## 九、我自己接下来想做什么

读完这 9 篇我脑子里大概有两个方向在打转：

**方向 A：A-Mem 的结构 × AtomMem 的 RL 决策**。A-Mem 的 Note Construction 和 Link Generation 质量高但流程固定；AtomMem 的 CRUD 灵活但结构扁平。把 A-Mem 的语义链接塞进 AtomMem 的 RL 框架里，应该能兼顾"结构"和"效率"。

**方向 B：全链路 Memory-RL**。MemFactory 已经提供了基建，但没有工作把 Extractor + Updater + Retriever 放进同一个最终 QA 奖励下端到端训。我觉得这是 Memory-RL 的下一个大跃迁。

不过这都是研究方向。作为工程师，我其实还有一个更想验证的小问题：

> 在一个真实的 production 系统里——比如一个客服 agent 或者 coding assistant——A-Mem 那种 Evolution 机制的 ROI 真的划算吗？每次写入都调 LLM 的代价，到底能被多少"更聪明的记忆"收回来？

学术界在 benchmark 上把 ROUGE-L 从 18 拉到 44 很漂亮。但真正到了线上，延迟、成本、稳定性是另外一本账。我觉得这个"学术 vs 工程"的 gap，会是未来一两年 Agent Memory 领域最有意思的战场。

---

*这篇笔记的原型是三周组会 PPT。如果你对里面某一篇论文感兴趣，原文都能在 arXiv 上找到。有想一起讨论的欢迎来找我。*
