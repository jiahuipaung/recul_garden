---
title: "从Docker-agent看Agent架构"
date: "2026-04-16"
excerpt: "参考docker官方开源的Agent框架，拆解通用agent架构设计"
tags: "tech, Agent, LLM"
---

# 从 Docker Agent 看通用 Agent 架构

> 一个能跑、能扩展、能在生产环境下使用的 Agent 由什么组成？
> 本文以 [Docker Agent](https://github.com/docker/docker-agent)（Docker 官方开源的声明式 AI Agent 框架）为参照，把一个完整 Agent 拆解成 7 个组件 + 3 个运行时机制，作为通用 Agent 架构的设计蓝图。

## 为什么以 Docker Agent 为参照

目前开源 Agent 框架不少——LangGraph、AutoGen、CrewAI、OpenAI Agents SDK……。选 Docker Agent 作为拆解对象，是因为它具备几个特性：

1. **声明式 YAML 配置**：把一个 Agent 必须回答的问题显式化成 schema，天然就是一份"Agent 定义清单"。
2. **多模型 + Fallback + per-tool 路由**：生产级模型调度的完整样貌。
3. **多 Agent 三种协作模式**：transfer_task、handoff、background_agent，覆盖主流场景。
4. **完整的人在环、权限、Hook、压缩机制**：不是玩具示例，而是真正跑过业务的工程实现。
5. **Go 实现，没有 Python 的 ORM 胶水**：源码读起来直截了当，容易看清架构意图。

把它当成"参考实现"读，能反推出一个通用 Agent 必须具备的所有部件。

---

## 一、什么是 Agent？一个可工作的定义

先给 Agent 一个操作性定义，避免后面讨论发散：

> **Agent = 一个带有身份、工具、记忆的实体，通过循环调用 LLM 来完成人类交给的开放式任务。**

这个定义里有四个关键词：

- **身份**：有自己的名字、自我描述、行为准则（system prompt）
- **工具**：能对世界产生副作用（读文件、发 HTTP、调 API）
- **记忆**：有对话历史，可能还有外部知识
- **循环**：不是一次问答，是"思考→行动→观察→再思考"直到任务完成

把 Agent 和"聊天机器人"区分开的关键是**循环**和**工具**。没有循环的是 Chatbot，没有工具的是 RAG QA。

---

## 二、Agent 的 7 个组件

任何一个生产级 Agent，都能拆成这 7 块——无论你用哪个框架。

```
┌───────────────────────────────────────────────────────────────┐
│                        AGENT                                  │
├───────────────────────────────────────────────────────────────┤
│  1. 身份     2. 模型     3. 工具集                              │
│  Identity   Model       Toolsets                              │
│                                                               │
│  4. 记忆     5. 协作     6. 护栏                                │
│  Memory     Collab      Guardrails                            │
│                                                               │
│  7. 扩展点 Hooks                                                │
└───────────────────────────────────────────────────────────────┘
```

### 组件 1：身份（Identity）

Agent 的"人设"。包含三个关键字段：

| 字段 | 谁看 | 作用 |
|---|---|---|
| **name** | 其他 Agent / 路由系统 | 唯一标识，如 `transfer_task(agent="coder")` 中的 coder |
| **description** | 其他 Agent | 对外自我介绍，Router Agent 靠这个决定要不要把任务派给它 |
| **instruction** | 自己的 LLM | 行为准则 / 工作流程 / 边界约束 |

Docker Agent 的 `dev-team.yaml` 里，每个子 Agent 的 instruction 都是几十行的"执行手册"，明确规定：

- **做什么**：`为每个 feature 创建 wireframe 和 mockup`
- **按什么顺序**：`Step 1: 读设计规范 → Step 2: 拆分组件 → Step 3: 实现`
- **不做什么**：`不要在 .dev-team 目录外写非代码文件`
- **如何交接**：`完成后写入 dev-team.md 供下一个 Agent 读取`

**设计原则**：Instruction 不是文档，是"执行手册"。要明确**边界**（不做什么）、**顺序**（先后关系）、**产出格式**（怎么交付）。模型没有这些约束就会凭感觉跳步、瞎发挥。

---

### 组件 2：模型（Model）

单模型 Agent 是玩具。生产级 Agent 至少要考虑 4 个维度：

**① 主模型**：日常推理的 brain
**② Fallback 链**：主模型挂了、限流、超载时的兜底顺序
**③ Per-tool 路由**：某些工具返回后指定下一轮用便宜模型
**④ 参数**：max_tokens、reasoning_effort、温度等

Docker Agent 的 Fallback 机制有个细节设计值得学：**cooldown**。一旦 fallback 成功了，接下来一段时间继续用它，不要马上切回主模型——否则会在主副之间高频抖动。

```yaml
models:
  primary:
    provider: anthropic
    model: claude-opus-4-7
  cheap:
    provider: openai
    model: gpt-5-mini

agents:
  root:
    model: primary
    fallback_models: [cheap]
    fallback_cooldown: 5m
```

**设计原则**：任何单一模型都会间歇性失败。便宜模型处理简单事，贵模型处理关键决策。没有 fallback 的 Agent 上生产就是定时炸弹。

---

### 组件 3：工具集（Toolsets）

工具是 Agent 与世界交互的唯一方式。Docker Agent 内置工具按用途分成 7 类：

| 类别 | 代表 | 用途 |
|---|---|---|
| **思考类** | `think`, `todo` | 让模型"自言自语"、规划任务，无副作用 |
| **记忆类** | `memory`, `rag` | 跨会话持久化、外部知识检索 |
| **系统类** | `filesystem`, `shell` | 读写文件、执行命令 |
| **网络类** | `fetch`, `openapi` | HTTP、REST API |
| **协作类** | `transfer_task`, `handoff`, `agent` | 在 Agent 之间路由任务 |
| **MCP 类** | 任意外部 MCP server | 插件化无限扩展（GitHub、Docker、DB...） |
| **元工具** | `change_model`, `run_skill` | 动态改变 Agent 自身行为 |

**一个经常被忽视的细节：工具注解（Annotations）**。Docker Agent 的每个工具声明时带一组布尔标记：

- `ReadOnlyHint`：只读工具（如 `list_files`）→ 自动批准
- `DestructiveHint`：破坏性工具（如 `rm`）→ 强制确认
- `IdempotentHint`：幂等工具 → 失败可以安全重试

有了这些注解，权限系统可以自动化，不需要人列穷举白名单。这是"好工具设计"和"糟糕工具设计"的分水岭。

**设计原则**：写一个工具之前先问：它是 read-only 吗？幂等吗？需要用户确认吗？失败时返回什么？**工具的设计质量直接决定 Agent 的可靠性上限。**

---

### 组件 4：记忆（Memory）

Agent 有 **三层记忆**，时间尺度完全不同：

**① Session 短期记忆（对话内，秒~分钟）**

就是消息列表本身，存在内存 + SQLite。
问题：会塞爆 context window。
解决：**Compaction**——触发阈值（通常 90% context）时，用 LLM 把旧消息压缩成摘要，替换进消息列表。

Docker Agent 的 compaction 有两种触发：
- **被动触发**：下一轮 LLM 请求前预检，token 快溢出了就压
- **主动触发**：工具返回大结果（如 `cat` 大文件）后立刻估算，超过 90% 立刻压
- **兜底**：如果真溢出了才发现（模型返回 ContextOverflowError），自动压一次并重试

**② 跨会话持久记忆（用户/项目级，天~月）**

Docker Agent 的 `memory` 工具：一个 SQLite 文件，Agent 主动调用 `remember()` / `recall()` 读写。
本质：让 Agent 拥有"私人笔记本"，记住用户偏好、项目约定、过去的决策。

**③ 知识库检索（外部语料，任意时长）**

RAG 工具：大量文档做索引，Agent 按需搜索。
Docker Agent 用 BM25 + 语义搜索混合（hybrid search），tree-sitter 做代码感知的分块（按函数边界切，不按字符数乱切）。

**设计原则**：别把所有东西塞 system prompt。短期对话用 session、用户偏好用 memory 工具、文档知识用 RAG——**三者各司其职**。混用会导致 context 爆炸且模型注意力分散。

---

### 组件 5：协作（Collaboration）

单 Agent 有 context 上限和能力边界。Docker Agent 提供 3 种协作模式：

#### ① transfer_task（父→子，同步）

父 Agent 发起一个独立子任务，子 Agent 在**全新 session** 中执行，子完成后结果返还父 Agent。

```
父 Agent                     子 Agent
 │                             │
 │─ transfer_task ────────────→│
 │                             │ (独立 session，
 │                             │  独立 context，
 │                             │  专属工具集)
 │←──── 最终结果 ───────────────│
 │
 继续推理
```

**适用**：任务有明确边界、需要专门 prompt 或工具集的子任务。
**好处**：子 Agent 不会被父 Agent 的冗余对话污染 context。

#### ② handoff（平行切换）

把**当前对话**整个交给另一个 Agent，不 fork 新 session。

```
Agent A                     Agent B
 │                             │
 │─ handoff(B) ───────────────→│
 │                             │ (同一个 session，
                               │  但用 B 的 prompt
                               │  和工具集)
```

**适用**：工作流有明确阶段（设计 → 开发 → 测试），每阶段需要不同人格。
**坑点**：B 能看到 A 的对话历史（包括 A 的工具调用），容易"幻觉"出 A 的工具——Docker Agent 专门在 handoff 返回一段话告诉 B："**你只能用自己的工具，不要用历史中看到的其他工具**"。

#### ③ run_background_agent（父→子，异步）

父 Agent 派出并行任务，自己不等结果继续工作。

**适用**：多任务并行、研究类长耗时任务。
**代价**：后台 Agent 默认 `ToolsApproved=true`（没人在旁边点确认）——这是一个**明确的安全权衡**，Docker Agent 在代码注释里直接写了："prompt injection in the sub-agent's context could exploit this gate-bypass"。

**设计原则**：多 Agent 不是"越多越好"。先问自己——为什么一个 Agent 做不了？是 context 太满？工具集冲突？prompt 互相干扰？**基于具体瓶颈选模式**，而不是无脑拆。

---

### 组件 6：护栏（Guardrails）

LLM 会失控。Docker Agent 设了 **5 层护栏**，每一层都是独立兜底：

**① 迭代上限（max_iterations）**
N 轮后暂停，让用户决定继续 +10 轮还是终止。不是硬杀，而是"中断 + 用户拍板"。

**② 循环检测（Tool Loop Detector）**
连续 5 次相同工具调用且参数完全一样 → 判定退化，直接终止会话。
这防的是模型"卡住"——比如反复 `ls` 同一个不存在的目录。

**③ 权限系统（4 级决策）**
```
Deny > ForceAsk > Allow > Ask（默认）
```
支持会话级 + 团队级叠加规则，按模式匹配（如 `shell:rm *` 一律 Deny）。

**④ 工具审批（Tool Approval）**
非只读工具默认弹确认，用户有 4 档选择：
- 本次批准
- 整个会话批准所有工具（等于 `--yolo`）
- 永久批准此工具（加入会话白名单）
- 拒绝（可附理由，传回给模型让它自我纠正）

**⑤ 上下文溢出自动压缩**
最多连续尝试 1 次（`maxOverflowCompactions = 1`）——防止"压缩也救不了"的死循环。

**设计原则**：Agent 的可靠性不是靠"更好的 prompt"堆出来的，是靠**护栏兜底**。每加一个工具能力，就想一下"如果它疯了会怎样"。

---

### 组件 7：扩展点（Hooks）

不想改代码、又想在关键节点干预？Hooks。Docker Agent 提供 5 个时机：

| Hook | 时机 | 典型用途 |
|---|---|---|
| `session_start` | 会话开始 | 注入额外上下文、打印环境信息 |
| `pre_tool_use` | 工具执行前 | **可拦截、可改参数** — 最强大的钩子 |
| `post_tool_use` | 工具执行后 | 审计日志、敏感数据脱敏 |
| `stop` | 会话结束 | 保存产物、发通知 |
| `notification` | 错误/警告 | 上报外部系统 |

`pre_tool_use` 特别值得说：它能返回"是否允许执行" + "修改后的参数"。于是可以：
- 禁止访问某些路径
- 自动给所有 `rm` 加 `-i`
- 在参数里自动替换环境变量

**设计原则**：Hook 是 Agent 的 **AOP 切面**。横切关注点（日志、校验、脱敏、通知）放 hooks 里，不要污染 instruction。

---

## 三、3 个运行时机制

7 个组件是"静态结构"。让它们跑起来的是 3 个运行时机制。

### 机制 A：推理循环（Reasoning Loop）

这是发动机。伪代码：

```
loop:
    messages ← session 的历史消息
    如果 context 快满 → 压缩
    response, tool_calls ← LLM(instruction + messages + tools)
    如果 tool_calls 非空:
        for 每个 tool_call:
            权限审批 → pre-hook → 执行 → post-hook
            把结果写回 session
    否则:
        break  # 模型停了
```

每一轮 = 一次 LLM 调用 + 它触发的所有工具执行。

**关键细节**：

- **工具是顺序执行的**（至少在 Docker Agent 的实现里）。并行工具调用需要小心处理依赖和事件顺序。
- **工具结果作为 role=tool 的消息**追加进 session，下一轮 LLM 能看到。
- **空输出要替换成 `"(no output)"`**——某些 API 拒绝空字符串的工具结果。
- **退出条件有多个**：模型 stop、iterations 超限、循环检测触发、context 取消、所有 fallback 失败。

### 机制 B：事件流（Event Stream）

Agent 的可观测性要求所有状态变化都通过**统一的事件管道**发出：

```
StreamStarted
  ↓
AgentInfo / ToolsetInfo
  ↓
AgentChoice (文本 token)
AgentChoiceReasoning (思考 token)
PartialToolCall (工具调用增量参数)
  ↓
ToolCallConfirmation (等用户批准)
  ↓
ToolCall / ToolCallResponse
  ↓
MessageAdded
  ↓
TokenUsage
  ↓
StreamStopped
```

UI、日志、遥测、API 全都订阅这条流，互不耦合。

**设计原则**：一开始就把"内部状态"和"外部展示"分开。事件是契约，UI 只是其中一个消费者。将来上 Grafana、接 Slack、对接 Web 都不用改核心循环。

### 机制 C：人在环（Human-in-the-Loop）

Agent 不是"一键全自动"。关键节点必须能让人介入：

- **工具调用前审批**（破坏性操作）
- **超出迭代上限时的继续/终止决定**
- **Elicitation**（工具反问用户补充信息，比如 OAuth、MFA 验证码）
- **模型选择**（切换更贵/更便宜的模型）

Docker Agent 用 Go channel 实现阻塞式等待：Runtime 发 `ToolCallConfirmation` 事件，然后在 `resumeChan` 上 block 住，UI 把用户决定发回 channel，循环继续。

**设计原则**：别怕打断用户，怕的是 Agent 偷偷做了破坏性操作。合理的"打扰"是信任的基础。

---

## 四、从组件到 YAML：Docker Agent 是如何把这些落地的

理解了组件，再看 Docker Agent 的 YAML 就会发现——**它不是拍脑袋设计的，而是上面 7 个组件的完整映射**：

```yaml
models:                          # 组件 2：模型
  primary:
    provider: anthropic
    model: claude-sonnet-4-6
    max_tokens: 64000

agents:
  root:
    # 组件 1：身份
    description: Product Manager - Leads the dev team
    instruction: |
      You are the PM leading a team of ...
      Step 1: ...
      Step 2: ...

    # 组件 2：模型
    model: primary
    fallback_models: [cheap_backup]

    # 组件 3：工具集
    toolsets:
      - type: filesystem
      - type: shell
      - type: think
      - type: memory           # 组件 4：记忆（跨会话）
        path: dev_memory.db
      - type: mcp              # 外部 MCP 工具
        ref: docker:context7

    # 组件 5：协作
    sub_agents: [designer, engineer]

    # 组件 6：护栏
    max_iterations: 50
    permissions:
      deny:
        - "shell:rm -rf *"

    # 组件 7：扩展点
    hooks:
      pre_tool_use:
        - command: audit.sh
```

这份 YAML 里每一个字段都能对应到前面 7 个组件中的某一个。**这就是"声明式 Agent"的本质：把一个 Agent 必须回答的所有问题，显式化成 schema。**

---

## 五、给 Agent 开发者的设计清单

当你要从零开发一个新 Agent，按这 7+3 的结构逐项自问：

**组件层面（7 个）：**

1. **身份** — 它是谁？对外一句话讲清楚能做什么？instruction 写明了边界、顺序、产出格式？
2. **模型** — 主模型是什么？有没有 fallback？哪些任务可以降级？
3. **工具** — 需要读什么、写什么、调什么外部系统？哪些是只读的？破坏性的？
4. **记忆** — 有需要跨会话记住的东西吗？有大量外部知识要检索吗？
5. **协作** — 一个 Agent 还是一个团队？如果是团队，用 transfer / handoff / background 哪种？为什么？
6. **护栏** — 最坏情况是什么？需要哪些硬限制？哪些工具要强制审批？
7. **扩展** — 有哪些横切需求（日志/审计/脱敏）可以用 hook 做？

**机制层面（3 个）：**

1. **一轮推理的预期结构是什么**？（用什么工具、产出什么）
2. **需要让用户看到/干预哪些事件**？
3. **哪些节点需要人类拍板**？

如果这 10 个问题你都能回答——你就有了一份完整的 Agent 设计。

---

## 六、结语：Agent 框架的共性

读完 Docker Agent 再回看其他框架，会发现它们解决的是**同一组问题**，只是表达方式不同：

| 问题 | Docker Agent | LangGraph | OpenAI Agents SDK |
|---|---|---|---|
| 身份 | `instruction` | node 的 prompt | `instructions` |
| 模型 Fallback | 一等公民 | 自己实现 | 需要用 `RetryPolicy` |
| 工具 | toolsets + MCP | `tools` + ToolNode | `tools` |
| 记忆 | session + memory + RAG | `MemorySaver` | `Runner` context |
| 多 Agent | sub_agents + handoffs | 子图 | handoffs |
| 护栏 | permissions + approvals | interrupt | guardrails |
| 流式事件 | events channel | `astream_events` | streaming |
| Hook | lifecycle hooks | `pre_model_hook` | 无 |

**任何 Agent 框架都绕不开这 7+3。** 区别只是：

- 谁把这些做成"一等公民"（schema 级）
- 谁让你"自己去拼"

Docker Agent 的价值在于它**把全部 10 个问题都做成了 schema 级一等公民**，这就是为什么它适合作为学习通用 Agent 架构的参照物——它把隐含的设计决策全部摊开在 YAML 上。

> 下次当你设计一个 Agent，无论用哪个框架，都按这 7+3 的清单过一遍。
> 缺的那几项，就是你 Agent 在生产环境会出事的地方。

---

## 附录：延伸阅读

- [Docker Agent 源码](https://github.com/docker/docker-agent)
- 核心文件导航：
  - 推理循环：`pkg/runtime/loop.go`
  - 工具执行：`pkg/runtime/tool_dispatch.go`
  - 多 Agent 协作：`pkg/runtime/agent_delegation.go`
  - 流式处理：`pkg/runtime/streaming.go`
  - Agent 定义：`pkg/agent/agent.go`
  - 配置 schema：`pkg/config/latest/types.go`
  - 示例 Agent：`examples/` 目录下 90+ 个 YAML
