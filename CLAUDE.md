# Team Share Platform - 团队资源共享平台

## 项目概述

构建一个企业级团队资源共享平台，用于统一管理团队的公共资源资产（提示词、Skill、组件、MCP、自定义协议等），支持独立环境配置、一键部署工作流和完整的版本管理能力。

**核心价值**：让团队资产可复用、可追踪、可协作、可部署。

---

## 技术栈

### 前端
| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18 | 优先选择，生态更成熟 |
| UI 库 | 自建组件库（Apple Design 风格） | 不使用 Ant Design，完全自定义 |
| 状态管理 | Zustand | 轻量级，支持持久化 |
| 路由 | React Router 6 | 文件系统路由 |
| 构建 | Vite 5 | 快速构建 |
| 样式 | Tailwind CSS + CSS Modules | 原子化 + 模块化 |
| 动画 | Framer Motion | Apple 风格动效 |
| 图标 | Lucide Icons + 自定义 SF Symbols | Apple 风格图标 |
| 图表 | Recharts | 数据可视化 |
| 代码编辑 | Monaco Editor | 代码/配置编辑 |
| 流程图 | ReactFlow | 工作流可视化编排 |

### 后端
| 技术 | 选型 | 说明 |
|------|------|------|
| 运行时 | Node.js 20 | LTS 版本 |
| 框架 | NestJS | 企业级框架，支持模块化 |
| ORM | Prisma | 类型安全的数据库访问 |
| 数据库 | PostgreSQL 16 | 主数据库 |
| 缓存 | Redis 7 | 会话/缓存/队列 |
| 对象存储 | MinIO | S3 兼容，本地部署 |
| 消息队列 | BullMQ | 异步任务处理 |
| API 规范 | RESTful + OpenAPI | 自动生成文档 |

### 基础设施
| 技术 | 选型 | 说明 |
|------|------|------|
| 容器 | Docker + Docker Compose | 本地开发 |
| 编排 | Kubernetes | 生产部署 |
| CI/CD | GitHub Actions | 自动化流水线 |
| 监控 | Prometheus + Grafana | 指标收集与展示 |
| 日志 | ELK Stack | 日志聚合分析 |

---

## Apple Design System（设计系统）

### 设计哲学

严格遵循 Apple Human Interface Guidelines (HIG) 核心原则：

1. **清晰性 (Clarity)**
   - 文字在任何尺寸下都清晰可读
   - 图标精确且易于理解
   - 装饰元素克制且有意义
   - 通过留白和层级传达重要性

2. **一致性 (Consistency)**
   - 使用系统提供的控件和交互模式
   - 保持统一的视觉语言
   - 遵循平台惯例，让用户感到熟悉

3. **深度 (Depth)**
   - 通过层级和阴影建立视觉深度
   - 使用毛玻璃效果创造空间感
   - 动画增强对内容关系的理解

### 布局系统

```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar (工具栏)                                    48px    │
├──────────┬──────────────────────────────────────────────────┤
│          │  Header (标题栏)                          52px    │
│          ├──────────────────────────────────────────────────┤
│ Sidebar  │                                                  │
│ (侧边栏) │          Content Area (内容区)                    │
│  240px   │                                                  │
│          │                                                  │
│          │                                                  │
│          ├──────────────────────────────────────────────────┤
│          │  Inspector (检查器/详情面板)  [可选]       320px   │
└──────────┴──────────────────────────────────────────────────┘
```

#### 布局规范

```css
/* 主布局 */
.layout {
  display: grid;
  grid-template-columns: 240px 1fr 320px;  /* 侧边栏 | 内容 | 检查器 */
  grid-template-rows: 48px 52px 1fr;        /* 工具栏 | 标题栏 | 内容 */
  height: 100vh;
  overflow: hidden;
}

/* 工具栏 - 类似 macOS 窗口顶部 */
.toolbar {
  grid-column: 1 / -1;
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(246, 246, 246, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* 侧边栏 - 类似 Finder / Xcode */
.sidebar {
  width: 240px;
  background: rgba(246, 246, 246, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 8px;
}

/* 内容区 */
.content {
  background: #ffffff;
  overflow-y: auto;
  padding: 20px 24px;
}

/* 检查器面板 - 类似 Xcode Inspector */
.inspector {
  width: 320px;
  background: rgba(246, 246, 246, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 16px;
}
```

### 色彩系统

#### 浅色模式 (Light Mode)

```
背景色 (Background Colors)：
├── Primary:    #FFFFFF          主背景
├── Secondary:  #F2F2F7          次级背景（分组内容）
├── Tertiary:   #FFFFFF          三级背景（卡片）
├── Elevated:   #FFFFFF          浮层背景（带阴影）
└── Grouped:    #F2F2F7          分组表格背景

填充色 (Fill Colors)：
├── Primary:    rgba(120, 120, 128, 0.2)    主填充
├── Secondary:  rgba(120, 120, 128, 0.16)   次级填充
├── Tertiary:   rgba(120, 120, 128, 0.12)   三级填充
└── Quaternary: rgba(120, 120, 128, 0.08)   四级填充

文字色 (Text Colors)：
├── Primary:    #000000          主文字（不透明度 85%）
├── Secondary:  rgba(60, 60, 67, 0.6)       次级文字
├── Tertiary:   rgba(60, 60, 67, 0.3)       三级文字
└── Quaternary: rgba(60, 60, 67, 0.18)      四级文字

分隔线 (Separator)：
├── Default:    rgba(60, 60, 67, 0.12)      默认分隔线（含不透明度）
└── Opaque:     #C6C6C8          不透明分隔线

系统颜色 (System Colors)：
├── Blue:       #007AFF          链接、选中、主操作
├── Green:      #34C759          成功、开启、在线
├── Indigo:     #5856D6          辅助强调色
├── Orange:     #FF9500          警告、注意
├── Pink:       #FF2D55          错误、删除（慎用）
├── Purple:     #AF52DE          创意、高级功能
├── Red:        #FF3B30          错误、危险操作
├── Teal:       #5AC8FA          信息、提示
└── Yellow:     #FFCC00          警告、收藏
```

#### 深色模式 (Dark Mode)

```
背景色 (Background Colors)：
├── Primary:    #000000          主背景
├── Secondary:  #1C1C1E          次级背景
├── Tertiary:   #2C2C2E          三级背景
├── Elevated:   #2C2C2E          浮层背景
└── Grouped:    #000000          分组背景

填充色 (Fill Colors)：
├── Primary:    rgba(120, 120, 128, 0.36)
├── Secondary:  rgba(120, 120, 128, 0.32)
├── Tertiary:   rgba(120, 120, 128, 0.24)
└── Quaternary: rgba(120, 120, 128, 0.18)

文字色 (Text Colors)：
├── Primary:    #FFFFFF          主文字（不透明度 85%）
├── Secondary:  rgba(235, 235, 245, 0.6)
├── Tertiary:   rgba(235, 235, 245, 0.3)
└── Quaternary: rgba(235, 235, 245, 0.18)

分隔线 (Separator)：
├── Default:    rgba(84, 84, 88, 0.65)
└── Opaque:     #38383A

系统颜色 (System Colors) - 深色模式下更明亮：
├── Blue:       #0A84FF
├── Green:      #30D158
├── Indigo:     #5E5CE6
├── Orange:     #FF9F0A
├── Pink:       #FF375F
├── Purple:     #BF5AF2
├── Red:        #FF453A
├── Teal:       #64D2FF
└── Yellow:     #FFD60A
```

### 字体系统

```
字体族 (Font Family)：
├── 中文：-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei"
├── 英文：-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue"
└── 代码："SF Mono", "Fira Code", "JetBrains Mono", "Cascadia Code", monospace

字体尺寸 (Font Size) - 基于 Apple 规范：
├── 大标题 (Large Title):     34px / 41px / Bold
├── 标题1 (Title 1):          28px / 34px / Bold
├── 标题2 (Title 2):          22px / 28px / Bold
├── 标题3 (Title 3):          20px / 25px / Semibold
├── 标题4 (Headline):         17px / 22px / Semibold（中文）/ Bold（英文）
├── 正文 (Body):              17px / 22px / Regular
├── 副标题 (Callout):         16px / 21px / Regular
├── 脚注 (Footnote):          13px / 18px / Regular
├── 说明1 (Caption 1):        12px / 16px / Regular
└── 说明2 (Caption 2):        11px / 13px / Regular

行高 (Line Height)：
├── 标题类：1.2-1.3
├── 正文类：1.4-1.5
└── 代码类：1.6

字间距 (Letter Spacing)：
├── 大标题：0.37px
├── 标题：0.35px
├── 正文：-0.41px（SF Pro 特性）
└── 代码：0px
```

### 间距系统

```
基于 8px 网格系统：

基础间距：
├── 2px   微间距（图标与文字）
├── 4px   极小间距
├── 8px   小间距（相关元素间）
├── 12px  中小间距
├── 16px  中间距（标准间距）
├── 20px  中大间距
├── 24px  大间距（区块间）
├── 32px  超大间距
├── 40px  特大间距
└── 48px  最大间距

组件内间距：
├── 按钮：水平 16px，垂直 8px
├── 输入框：水平 12px，垂直 10px
├── 卡片：16px（内边距）
├── 列表项：水平 16px，垂直 12px
├── 表头：12px
└── 单元格：8px 12px

组件间距：
├── 紧凑：8px
├── 标准：16px
├── 宽松：24px
└── 分离：32px
```

### 圆角系统

```
圆角半径 (Border Radius)：
├── 4px   小组件（标签、小按钮）
├── 6px   中小组件（输入框、选择器）
├── 8px   中组件（卡片、弹窗）
├── 10px  按钮（标准按钮）
├── 12px  大组件（模态框、大卡片）
├── 14px  iOS 风格圆角（底部弹窗）
├── 16px  特大圆角（全屏卡片）
├── 20px  超大圆角（特色卡片）
└── 9999px 胶囊形状（药丸按钮、标签）

组件圆角规范：
├── 按钮：10px
├── 输入框：8px
├── 卡片：10px
├── 模态框：12px
├── 头像：圆形 (50%)
├── 图标背景：8px
├── 工具提示：6px
├── 标签：6px
└── 分段控制器：8px
```

### 阴影系统

```
阴影层级 (Shadow Levels)：

层级 0 - 无阴影：
  box-shadow: none;

层级 1 - 微妙阴影（卡片、浮层）：
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08),
              0 1px 2px rgba(0, 0, 0, 0.06);

层级 2 - 轻阴影（下拉菜单、弹出框）：
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07),
              0 2px 4px rgba(0, 0, 0, 0.06);

层级 3 - 中阴影（模态框、浮窗）：
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
              0 4px 6px rgba(0, 0, 0, 0.05);

层级 4 - 重阴影（全屏模态、重要浮层）：
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1),
              0 10px 10px rgba(0, 0, 0, 0.04);

层级 5 - 最重阴影（拖拽元素）：
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);

暗色模式阴影 - 使用更亮的阴影色：
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
```

### 毛玻璃效果 (Blur Effects)

```
毛玻璃效果规范：

标准毛玻璃（侧边栏、工具栏）：
  background: rgba(246, 246, 246, 0.78);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);

深色毛玻璃：
  background: rgba(30, 30, 30, 0.78);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);

超薄毛玻璃（浮层、提示）：
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: saturate(180%) blur(20px);

厚毛玻璃（模态背景）：
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: saturate(100%) blur(40px);
```

### 动画系统

```
动画时长 (Duration)：
├── 瞬间：100ms    微交互（颜色变化、透明度）
├── 快速：200ms    按钮状态、小展开
├── 标准：300ms    页面切换、弹窗
├── 慢速：500ms    复杂动画、大面积变化
└── 特殊：自定义   弹簧动画、物理效果

缓动函数 (Easing)：
├── 标准：cubic-bezier(0.25, 0.1, 0.25, 1.0)    通用
├── 进入：cubic-bezier(0.0, 0.0, 0.2, 1.0)      元素进入
├── 退出：cubic-bezier(0.4, 0.0, 1.0, 1.0)      元素退出
├── 强调：cubic-bezier(0.0, 0.0, 0.2, 1.0)      重点动画
└── 弹性：spring(1, 80, 10)                       弹性效果

常用动画模式：

淡入淡出 (Fade)：
  初始：opacity: 0
  结束：opacity: 1
  时长：200ms

滑入滑出 (Slide)：
  初始：transform: translateY(8px); opacity: 0
  结束：transform: translateY(0); opacity: 1
  时长：300ms

缩放 (Scale)：
  初始：transform: scale(0.95); opacity: 0
  结束：transform: scale(1); opacity: 1
  时长：200ms

展开 (Expand)：
  初始：max-height: 0; opacity: 0
  结束：max-height: 500px; opacity: 1
  时长：300ms
  缓动：cubic-bezier(0.25, 0.1, 0.25, 1.0)

弹簧效果 (Spring) - 用于强调：
  类型：spring
  阻尼：0.8
  刚度：100
  质量：1
```

### 图标系统

```
图标规范：

尺寸：
├── 12px  极小（内联标签）
├── 14px  小（按钮内图标）
├── 16px  标准（列表、菜单）
├── 20px  中（工具栏、导航）
├── 24px  大（功能入口）
├── 32px  特大（空状态）
└── 48px  巨大（引导页）

描边粗细：
├── 1.5px 标准（16-24px 图标）
├── 2px   加粗（强调状态）
└── 1px   细线（小图标）

图标风格：
├── 线性图标 (Outline)：默认状态
├── 填充图标 (Filled)：选中/激活状态
└── 双色图标 (Duotone)：强调状态

常用图标映射：
├── 资源类型
│   ├── Prompt：message-square
│   ├── Skill：puzzle
│   ├── Component：box
│   ├── MCP：plug
│   ├── Protocol：file-code
│   ├── Workflow：git-branch
│   ├── Template：layout-template
│   └── Snippet：code
├── 操作
│   ├── 新建：plus
│   ├── 编辑：pencil
│   ├── 删除：trash-2
│   ├── 搜索：search
│   ├── 筛选：filter
│   ├── 排序：arrow-up-down
│   ├── 下载：download
│   ├── 上传：upload
│   ├── 分享：share
│   ├── 复制：copy
│   ├── 刷新：refresh-cw
│   └── 更多：more-horizontal
├── 状态
│   ├── 成功：check-circle
│   ├── 警告：alert-triangle
│   ├── 错误：x-circle
│   ├── 信息：info
│   ├── 加载：loader
│   └── 空状态：inbox
└── 导航
    ├── 首页：home
    ├── 资源：layers
    ├── 环境：server
    ├── 工作流：workflow
    ├── 版本：git-branch
    ├── 监控：activity
    ├── 设置：settings
    └── 用户：user
```

---

## 组件设计规范

### 按钮 (Button)

```
类型：
├── Primary（主按钮）
│   ├── 背景：系统蓝 #007AFF
│   ├── 文字：白色
│   ├── 圆角：10px
│   ├── 高度：36px
│   └── 用途：主操作（提交、确认、创建）
│
├── Secondary（次按钮）
│   ├── 背景：填充色 Primary
│   ├── 文字：系统蓝
│   ├── 圆角：10px
│   └── 用途：次要操作（取消、返回）
│
├── Tertiary（三级按钮）
│   ├── 背景：透明
│   ├── 文字：系统蓝
│   └── 用途：轻量操作（查看更多）
│
├── Danger（危险按钮）
│   ├── 背景：系统红 #FF3B30
│   ├── 文字：白色
│   └── 用途：危险操作（删除、重置）
│
└── Ghost（幽灵按钮）
    ├── 背景：透明
    ├── 文字：次级文字色
    ├── 悬停：显示填充色背景
    └── 用途：工具栏操作

状态：
├── Default：默认状态
├── Hover：背景变深 10%
├── Active：背景变深 20%，scale(0.98)
├── Focus：显示 4px 蓝色外发光
├── Disabled：不透明度 40%
└── Loading：显示加载指示器

尺寸：
├── Small：高度 28px，字号 13px，内边距 8px 12px
├── Medium：高度 36px，字号 15px，内边距 10px 16px
└── Large：高度 44px，字号 17px，内边距 12px 20px
```

### 输入框 (Input)

```
类型：
├── Text Input（文本输入）
│   ├── 高度：36px
│   ├── 内边距：8px 12px
│   ├── 边框：1px solid separator
│   ├── 圆角：8px
│   └── 聚焦：边框变系统蓝，显示 4px 蓝色外发光
│
├── Search Input（搜索输入）
│   ├── 左侧图标：search
│   ├── 圆角：10px
│   └── 背景：填充色 Secondary
│
├── Textarea（文本域）
│   ├── 最小高度：80px
│   ├── 可调整：垂直可调
│   └── 字体：等宽字体（代码输入）
│
└── Select（选择器）
    ├── 样式：类似 iOS 选择器
    ├── 下拉：圆角 12px，阴影层级 3
    └── 动画：200ms 展开动画

状态：
├── Default：默认边框
├── Focus：蓝色边框 + 外发光
├── Error：红色边框 + 错误提示
├── Disabled：灰色背景，不可交互
└── ReadOnly：正常样式，不可编辑

标签 (Label)：
├── 位置：输入框上方
├── 字号：13px（Caption 1）
├── 颜色：次级文字色
└── 间距：标签与输入框 6px

辅助文字 (Helper Text)：
├── 位置：输入框下方
├── 字号：12px（Caption 2）
├── 颜色：三级文字色
└── 错误时：变为红色
```

### 卡片 (Card)

```
类型：
├── Resource Card（资源卡片）
│   ┌────────────────────────────┐
│   │  [图标]  资源名称     [···] │
│   │  描述文字...               │
│   │  [标签1] [标签2]           │
│   │  ─────────────────────────│
│   │  👤 作者   ⭐ 4.8   📥 128 │
│   └────────────────────────────┘
│   ├── 圆角：10px
│   ├── 内边距：16px
│   ├── 阴影：层级 1
│   └── 悬停：阴影提升到层级 2，微上移 2px
│
├── Stat Card（统计卡片）
│   ┌────────────────────────────┐
│   │  指标名称                  │
│   │  1,234                     │
│   │  ↑ 12% 较上周              │
│   └────────────────────────────┘
│   ├── 数字字号：34px（大标题）
│   └── 趋势颜色：绿涨红跌
│
├── Action Card（操作卡片）
│   ├── 大图标 + 标题 + 描述
│   ├── 整个卡片可点击
│   └── 点击效果：scale(0.98)
│
└── Preview Card（预览卡片）
    ├── 内容预览区域
    ├── 底部操作栏
    └── 支持全屏展开

动画效果：
├── 进入：依次淡入（stagger 50ms）
├── 悬停：阴影过渡 200ms
└── 点击：scale(0.98) 100ms
```

### 列表 (List)

```
类型：
├── Simple List（简单列表）
│   ├── 行高：44px
│   ├── 内边距：0 16px
│   ├── 分隔线：左侧对齐 16px
│   └── 选中：蓝色背景 10%
│
├── Grouped List（分组列表）
│   ├── 分组标题：大写，字号 13px，颜色次级
│   ├── 分组间距：35px（标题到内容）
│   ├── 圆角：10px
│   └── 背景：Secondary 背景色
│
├── Inset List（内嵌列表）
│   ├── 左右内边距：16px
│   ├── 圆角：10px
│   └── 背景：白色
│
└── Editable List（可编辑列表）
    ├── 左滑操作：删除、标记
    ├── 长按：进入编辑模式
    └── 拖拽排序：拖拽把手

列表项：
├── 左侧：图标/头像（可选）
├── 中间：标题 + 副标题（可选）
├── 右侧：辅助信息 + 箭头
└── 交互：点击有按压效果
```

### 弹窗 (Modal / Sheet)

```
类型：
├── Alert（警告弹窗）
│   ├── 样式：iOS 风格居中弹窗
│   ├── 圆角：14px
│   ├── 宽度：270px
│   ├── 按钮：最多两个，垂直排列
│   └── 动画：缩放淡入
│
├── Modal（模态框）
│   ├── 样式：居中卡片
│   ├── 圆角：12px
│   ├── 最大宽度：640px
│   ├── 阴影：层级 4
│   ├── 背景遮罩：黑色 40% + 毛玻璃
│   └── 动画：从中心缩放展开
│
├── Sheet（底部弹出）
│   ├── 样式：iOS 风格底部弹出
│   ├── 圆角：顶部 14px
│   ├── 拖拽条：顶部 36x5px，灰色
│   ├── 可拖拽关闭
│   └── 动画：从底部滑入
│
├── Drawer（侧边抽屉）
│   ├── 样式：从右侧滑入
│   ├── 宽度：400px
│   ├── 圆角：左侧 12px
│   └── 用途：详情面板、编辑器
│
└── Popover（气泡弹出）
    ├── 样式：小浮层
    ├── 圆角：10px
    ├── 箭头：8px 三角
    ├── 阴影：层级 3
    └── 用途：工具提示、菜单

动画：
├── 进入：300ms，缓动 cubic-bezier(0.0, 0.0, 0.2, 1.0)
├── 退出：200ms，缓动 cubic-bezier(0.4, 0.0, 1.0, 1.0)
└── 遮罩：同步淡入淡出
```

### 导航栏 (Navigation)

```
侧边栏 (Sidebar)：
├── 宽度：240px
├── 背景：毛玻璃效果
├── 项目高度：36px
├── 图标尺寸：20px
├── 文字字号：15px
├── 选中状态：蓝色背景 10% + 蓝色文字
├── 悬停状态：灰色背景
├── 分组标题：大写，11px，灰色
└── 展开/折叠：动画 200ms

标签栏 (Tab Bar)：
├── 高度：44px
├── 背景：毛玻璃效果
├── 选中指示器：底部 2px 蓝色条
├── 间距：32px
└── 动画：指示器滑动 200ms

面包屑 (Breadcrumb)：
├── 分隔符：/ 或 >
├── 当前项：粗体
├── 可点击项：蓝色
└── 字号：15px
```

### 表格 (Table)

```
规范：
├── 行高：44px
├── 表头：粗体，灰色背景
├── 分隔线：1px，separator 颜色
├── 悬停行：灰色背景
├── 选中行：蓝色背景 10%
├── 排序：点击表头，显示排序箭头
├── 固定表头：滚动时固定
└── 斑马纹：可选，间隔灰色背景

单元格：
├── 内边距：8px 12px
├── 文字对齐：左对齐（文本），右对齐（数字）
├── 空状态：灰色横线
└── 编辑态：点击变为输入框

操作列：
├── 位置：最右侧
├── 图标按钮：hover 显示
└── 宽度：自适应
```

---

## 核心功能模块

### 1. 资源管理中心

#### 1.1 资源类型定义

| 资源类型 | 标识 | 说明 | 存储格式 | 元数据 |
|---------|------|------|---------|--------|
| Prompt | prompt | 提示词模板 | Markdown | 模型、温度、参数 |
| Skill | skill | 可复用技能包 | YAML + 代码 | 依赖、权限、入口 |
| Component | component | UI 组件 | NPM 包 / 源码 | 框架、版本、Demo |
| MCP | mcp | Model Context Protocol | JSON + 实现 | 端点、认证、能力 |
| Protocol | protocol | 自定义协议定义 | JSON Schema | 版本、兼容性 |
| Workflow | workflow | 工作流模板 | DAG JSON | 节点、边、配置 |
| Template | template | 项目模板 | 压缩包 | 框架、依赖、脚本 |
| Snippet | snippet | 代码片段 | 源码 | 语言、标签 |

#### 1.2 资源 CRUD 操作

```typescript
interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  slug: string;           // URL 友好的标识
  description: string;
  content: any;           // 根据类型不同结构不同
  metadata: Record<string, any>;
  tags: string[];
  category: string;
  visibility: 'public' | 'team' | 'private';
  owner: User;
  collaborators: User[];
  version: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  downloads: number;
  stars: number;
}
```

#### 1.3 资源浏览与搜索

- **列表视图**：卡片网格 / 列表切换
- **筛选器**：类型、标签、作者、状态、日期范围
- **搜索**：全文搜索 + 语义搜索（Spotlight 风格）
- **排序**：最新、最热、评分最高、下载最多
- **分类**：多级分类树 + 标签云

#### 1.4 资源详情页

```
布局结构（三栏布局）：
├── 左侧导航（240px）
│   ├── 资源信息
│   ├── 版本列表
│   └── 相关资源
│
├── 中间内容
│   ├── Header：资源名称、版本、作者、操作按钮
│   ├── 内容预览/编辑区
│   └── Markdown 渲染
│
└── 右侧检查器（320px）
    ├── 元数据信息
    ├── 依赖关系
    ├── 使用统计
    └── 快捷操作
```

### 2. 环境配置管理

#### 2.1 环境模型

```typescript
interface Environment {
  id: string;
  name: string;           // dev, staging, prod
  displayName: string;
  description: string;
  variables: EnvironmentVariable[];
  secrets: Secret[];
  dependencies: Dependency[];
  resources: ResourceReference[];
  status: 'active' | 'inactive' | 'error';
  health: HealthStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
  description: string;
  scope: 'global' | 'service' | 'resource';
}

interface Secret {
  id: string;
  name: string;
  encryptedValue: string;
  rotationPolicy: RotationPolicy;
  expiresAt: Date;
}

interface Dependency {
  name: string;
  version: string;
  type: 'npm' | 'pip' | 'go' | 'docker' | 'system';
  locked: boolean;
}
```

#### 2.2 环境操作

- **创建环境**：从模板创建 / 空白创建 / 克隆现有环境
- **环境快照**：保存当前环境状态，支持恢复
- **环境同步**：跨环境同步配置差异
- **环境变量管理**：批量导入/导出、变量引用、继承覆盖
- **密钥管理**：加密存储、自动轮换、访问审计
- **依赖锁定**：生成 lock 文件，确保一致性

#### 2.3 环境模板

```yaml
# environment-template.yaml
name: "Node.js 开发环境"
version: "1.0.0"
description: "适用于 Node.js 项目的标准开发环境"

variables:
  NODE_ENV: "development"
  PORT: "3000"
  LOG_LEVEL: "debug"

dependencies:
  node: ">=20.0.0"
  pnpm: ">=8.0.0"

services:
  - name: postgres
    image: postgres:16
    port: 5432
    variables:
      POSTGRES_DB: "app_dev"
      POSTGRES_USER: "dev"
      
  - name: redis
    image: redis:7-alpine
    port: 6379

resources:
  - type: mcp
    name: "filesystem"
    version: "latest"
```

### 3. 工作流引擎

#### 3.1 工作流定义

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  timeout: number;
  retryPolicy: RetryPolicy;
  notifications: NotificationConfig[];
  status: 'draft' | 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'condition' | 'parallel' | 'loop' | 'subprocess';
  name: string;
  config: NodeConfig;
  position: { x: number; y: number };
  inputs: NodeInput[];
  outputs: NodeOutput[];
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;    // 条件表达式
  label?: string;
}

// 节点类型配置
interface TaskNodeConfig {
  action: string;        // 执行的动作
  resource?: string;     // 关联的资源
  environment?: string;  // 执行环境
  command?: string;      // 执行命令
  script?: string;       // 脚本内容
  timeout?: number;
  retries?: number;
}
```

#### 3.2 内置工作流模板

| 模板名称 | 说明 | 节点 |
|---------|------|------|
| 一键部署 | 完整的部署流程 | 构建 → 测试 → 部署 → 验证 |
| 资源发布 | 资源版本发布 | 验证 → 打包 → 发布 → 通知 |
| 环境初始化 | 新环境搭建 | 检查 → 安装 → 配置 → 测试 |
| 数据迁移 | 数据库迁移 | 备份 → 迁移 → 验证 → 清理 |
| 定时任务 | 定期执行任务 | 触发 → 执行 → 记录 → 通知 |

#### 3.3 工作流执行引擎

```typescript
interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  trigger: string;
  startedAt: Date;
  finishedAt?: Date;
  duration?: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  nodeExecutions: NodeExecution[];
  logs: ExecutionLog[];
}

interface NodeExecution {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt?: Date;
  finishedAt?: Date;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  error?: string;
  retryCount: number;
}
```

#### 3.4 工作流可视化编排器

- **拖拽式编排**：从节点库拖拽节点到画布
- **连线操作**：点击端口自动连线，支持条件分支
- **节点配置**：点击节点打开配置面板（右侧检查器）
- **实时预览**：执行时高亮当前节点和数据流
- **调试模式**：断点、单步执行、变量查看

### 4. 版本控制系统

#### 4.1 版本模型

```typescript
interface Version {
  id: string;
  resourceId: string;
  version: string;        // 语义化版本：major.minor.patch
  tag?: string;           // 版本标签：latest, beta, rc
  changelog: string;      // 变更说明
  content: any;           // 版本内容快照
  contentHash: string;    // 内容哈希，用于去重
  dependencies: DependencySnapshot[];
  author: User;
  reviewers: User[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected';
  publishedAt?: Date;
  createdAt: Date;
}

interface VersionDiff {
  from: string;
  to: string;
  changes: Change[];
  summary: DiffSummary;
}

interface Change {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}
```

#### 4.2 版本管理功能

- **自动版本号**：根据变更类型自动递增版本号
- **版本对比**：可视化 Diff 视图，支持逐行对比
- **版本分支**：支持维护多个版本分支（如 v1.x, v2.x）
- **发布流程**：草稿 → 审核 → 批准 → 发布
- **版本回退**：一键回退到指定版本
- **版本标签**：latest, stable, beta, rc 等标签管理
- **变更日志**：自动生成 CHANGELOG

#### 4.3 发布审批流程

```
提交发布申请
    ↓
自动检查
├── 语法检查
├── 依赖检查
├── 安全扫描
└── 兼容性检查
    ↓
人工审核
├── 代码审核
├── 文档审核
└── 测试报告
    ↓
审批决策
├── 批准 → 发布
├── 拒绝 → 退回修改
└── 搁置 → 等待
    ↓
发布执行
├── 打包
├── 部署
├── 通知
└── 记录
```

### 5. 服务器/资源监控

#### 5.1 监控指标

```typescript
interface MonitoringMetrics {
  // 系统指标
  system: {
    cpu: number;           // CPU 使用率
    memory: number;        // 内存使用率
    disk: number;          // 磁盘使用率
    network: {
      inbound: number;     // 入站流量
      outbound: number;    // 出站流量
    };
  };
  
  // 应用指标
  application: {
    requests: number;      // 请求数
    latency: number;       // 响应时间
    errors: number;        // 错误数
    activeUsers: number;   // 活跃用户数
  };
  
  // 资源指标
  resources: {
    total: number;         // 资源总数
    published: number;     // 已发布数
    downloads: number;     // 下载次数
    storage: number;       // 存储使用量
  };
}
```

#### 5.2 监控面板

- **概览面板**：关键指标一览（类似 macOS 活动监视器）
- **资源面板**：资源使用统计
- **性能面板**：系统性能趋势
- **告警面板**：告警规则和历史

#### 5.3 告警配置

```typescript
interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number;        // 持续时间（秒）
  severity: 'info' | 'warning' | 'critical';
  notifications: NotificationChannel[];
  enabled: boolean;
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
}
```

### 6. 用户与权限系统

#### 6.1 用户模型

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  teams: Team[];
  permissions: Permission[];
  preferences: UserPreferences;
  lastLoginAt: Date;
  createdAt: Date;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  resources: string[];      // 团队资源 ID
  environments: string[];   // 团队环境 ID
  settings: TeamSettings;
}

interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}
```

#### 6.2 权限模型

```typescript
interface Permission {
  id: string;
  resource: string;        // 资源类型或具体资源 ID
  actions: Action[];       // 允许的操作
  conditions?: Condition[]; // 额外条件
}

type Action = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'publish' | 'approve' | 'deploy'
  | 'manage_members' | 'manage_settings';

// 预设角色
const ROLES = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  DEVELOPER: '开发者',
  VIEWER: '查看者',
};
```

---

## 数据库设计

### 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 团队表
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 资源表
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,
  content JSONB,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  visibility VARCHAR(20) DEFAULT 'team',
  owner_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  version VARCHAR(20) DEFAULT '1.0.0',
  status VARCHAR(20) DEFAULT 'draft',
  downloads INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(type, slug)
);

-- 版本表
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  tag VARCHAR(50),
  changelog TEXT,
  content JSONB,
  content_hash VARCHAR(64),
  dependencies JSONB DEFAULT '[]',
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id, version)
);

-- 环境表
CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  team_id UUID REFERENCES teams(id),
  variables JSONB DEFAULT '{}',
  secrets JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  health JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工作流表
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  trigger_config JSONB DEFAULT '{}',
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  variables JSONB DEFAULT '{}',
  timeout INTEGER DEFAULT 3600,
  retry_policy JSONB DEFAULT '{}',
  team_id UUID REFERENCES teams(id),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工作流执行记录表
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(20) DEFAULT 'pending',
  trigger VARCHAR(50),
  inputs JSONB DEFAULT '{}',
  outputs JSONB DEFAULT '{}',
  node_executions JSONB DEFAULT '[]',
  logs JSONB DEFAULT '[]',
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志表
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_owner ON resources(owner_id);
CREATE INDEX idx_resources_team ON resources(team_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_versions_resource ON versions(resource_id);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## API 设计

### RESTful API 规范

```
基础路径：/api/v1

资源管理：
├── GET    /resources                    # 获取资源列表
├── POST   /resources                    # 创建资源
├── GET    /resources/:id                # 获取资源详情
├── PUT    /resources/:id                # 更新资源
├── DELETE /resources/:id                # 删除资源
├── GET    /resources/:id/versions       # 获取版本列表
├── POST   /resources/:id/versions       # 创建版本
├── POST   /resources/:id/publish        # 发布资源
└── POST   /resources/:id/star           # 收藏资源

环境管理：
├── GET    /environments                 # 获取环境列表
├── POST   /environments                 # 创建环境
├── GET    /environments/:id             # 获取环境详情
├── PUT    /environments/:id             # 更新环境
├── DELETE /environments/:id             # 删除环境
├── POST   /environments/:id/snapshot    # 创建快照
├── POST   /environments/:id/restore     # 恢复快照
└── GET    /environments/:id/health      # 健康检查

工作流管理：
├── GET    /workflows                    # 获取工作流列表
├── POST   /workflows                    # 创建工作流
├── GET    /workflows/:id                # 获取工作流详情
├── PUT    /workflows/:id                # 更新工作流
├── DELETE /workflows/:id                # 删除工作流
├── POST   /workflows/:id/execute        # 执行工作流
├── GET    /workflows/:id/executions     # 获取执行记录
└── GET    /workflows/:id/executions/:eid # 获取执行详情

用户管理：
├── GET    /users/me                     # 获取当前用户
├── PUT    /users/me                     # 更新个人信息
├── GET    /users/:id                    # 获取用户信息
└── GET    /users/:id/resources          # 获取用户资源

团队管理：
├── GET    /teams                        # 获取团队列表
├── POST   /teams                        # 创建团队
├── GET    /teams/:id                    # 获取团队详情
├── PUT    /teams/:id                    # 更新团队
├── GET    /teams/:id/members            # 获取成员列表
├── POST   /teams/:id/members            # 添加成员
└── DELETE /teams/:id/members/:uid       # 移除成员

系统管理：
├── GET    /system/metrics               # 系统指标
├── GET    /system/health                # 健康检查
└── GET    /system/alerts                # 告警信息
```

### 响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  code: 0;
  message: 'success';
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// 错误响应
interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// 常用错误码
enum ErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
}
```

---

## 项目结构

```
team-share/
├── apps/
│   ├── web/                          # 前端应用
│   │   ├── src/
│   │   │   ├── app/                  # 应用入口和布局
│   │   │   │   ├── layout/           # 布局组件
│   │   │   │   ├── providers/        # 全局 Provider
│   │   │   │   └── routes.tsx        # 路由配置
│   │   │   ├── components/           # 通用组件
│   │   │   │   ├── ui/               # 基础 UI 组件
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── Card/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   ├── Table/
│   │   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Toolbar/
│   │   │   │   │   └── ...
│   │   │   │   ├── common/           # 业务通用组件
│   │   │   │   └── icons/            # 图标组件
│   │   │   ├── features/             # 功能模块
│   │   │   │   ├── resources/        # 资源管理
│   │   │   │   ├── environments/     # 环境管理
│   │   │   │   ├── workflows/        # 工作流
│   │   │   │   ├── versions/         # 版本管理
│   │   │   │   ├── monitoring/       # 监控面板
│   │   │   │   ├── settings/         # 系统设置
│   │   │   │   └── auth/             # 认证
│   │   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── stores/               # Zustand Stores
│   │   │   ├── services/             # API 服务
│   │   │   ├── utils/                # 工具函数
│   │   │   ├── types/                # 类型定义
│   │   │   └── styles/               # 全局样式
│   │   │       ├── tokens/           # 设计令牌
│   │   │       ├── themes/           # 主题配置
│   │   │       └── global.css        # 全局样式
│   │   ├── public/                   # 静态资源
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── api/                          # 后端服务
│       ├── src/
│       │   ├── modules/              # 功能模块
│       │   │   ├── auth/             # 认证模块
│       │   │   ├── users/            # 用户模块
│       │   │   ├── teams/            # 团队模块
│       │   │   ├── resources/        # 资源模块
│       │   │   ├── environments/     # 环境模块
│       │   │   ├── workflows/        # 工作流模块
│       │   │   ├── versions/         # 版本模块
│       │   │   ├── monitoring/       # 监控模块
│       │   │   └── notifications/    # 通知模块
│       │   ├── common/               # 公共模块
│       │   │   ├── decorators/       # 自定义装饰器
│       │   │   ├── filters/          # 异常过滤器
│       │   │   ├── guards/           # 认证守卫
│       │   │   ├── interceptors/     # 拦截器
│       │   │   ├── pipes/            # 管道
│       │   │   └── utils/            # 工具函数
│       │   ├── config/               # 配置
│       │   ├── database/             # 数据库
│       │   │   ├── migrations/       # 迁移文件
│       │   │   ├── seeds/            # 种子数据
│       │   │   └── prisma/           # Prisma Schema
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/                     # 测试
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                         # 共享包
│   ├── shared/                       # 共享类型和常量
│   │   ├── src/
│   │   │   ├── types/                # 类型定义
│   │   │   ├── constants/            # 常量
│   │   │   ├── utils/                # 工具函数
│   │   │   └── validators/           # 验证器
│   │   └── package.json
│   │
│   ├── ui/                           # UI 组件库
│   │   ├── src/
│   │   │   ├── components/           # 组件
│   │   │   ├── hooks/                # Hooks
│   │   │   └── styles/               # 样式
│   │   └── package.json
│   │
│   └── config/                       # 共享配置
│       ├── eslint/                   # ESLint 配置
│       ├── typescript/               # TypeScript 配置
│       └── package.json
│
├── docker/                           # Docker 配置
│   ├── docker-compose.yml            # 开发环境
│   ├── docker-compose.prod.yml       # 生产环境
│   ├── web.Dockerfile                # 前端 Dockerfile
│   ├── api.Dockerfile                # 后端 Dockerfile
│   └── nginx/                        # Nginx 配置
│
├── scripts/                          # 脚本
│   ├── setup.sh                      # 环境初始化
│   ├── build.sh                      # 构建脚本
│   ├── deploy.sh                     # 部署脚本
│   └── seed.sh                       # 种子数据
│
├── docs/                             # 文档
│   ├── api/                          # API 文档
│   ├── guides/                       # 使用指南
│   └── architecture/                 # 架构文档
│
├── .github/                          # GitHub 配置
│   ├── workflows/                    # CI/CD 流水线
│   ├── ISSUE_TEMPLATE/               # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md      # PR 模板
│
├── .env.example                      # 环境变量示例
├── .gitignore
├── .editorconfig
├── pnpm-workspace.yaml               # pnpm 工作区配置
├── turbo.json                        # Turborepo 配置
├── package.json
├── LICENSE
└── README.md
```

---

## 开发规范

### 代码规范

- **语言**：TypeScript 严格模式
- **格式化**：Prettier（2 空格缩进，单引号，无分号）
- **Lint**：ESLint + Airbnb 规范
- **Git**：Conventional Commits 规范
- **测试**：Jest + Testing Library，覆盖率 > 80%

### 命名规范

```
文件命名：
├── 组件：PascalCase（如 ResourceCard.tsx）
├── Hook：camelCase，use 前缀（如 useResource.ts）
├── Store：camelCase，use 前缀（如 useAuthStore.ts）
├── Service：camelCase（如 resourceService.ts）
├── 类型：PascalCase（如 ResourceType.ts）
├── 常量：UPPER_SNAKE_CASE（如 API_ENDPOINTS.ts）
└── 工具：camelCase（如 formatDate.ts）

变量命名：
├── 组件：PascalCase
├── 函数/变量：camelCase
├── 常量：UPPER_SNAKE_CASE
├── 类型/接口：PascalCase
└── 枚举：PascalCase，成员 UPPER_SNAKE_CASE
```

### Git 规范

```
分支策略：
├── main：主分支，稳定版本
├── develop：开发分支
├── feature/*：功能分支
├── bugfix/*：Bug 修复分支
├── release/*：发布分支
└── hotfix/*：紧急修复分支

Commit 格式：
<type>(<scope>): <subject>

type：
├── feat：新功能
├── fix：修复
├── docs：文档
├── style：格式
├── refactor：重构
├── test：测试
├── chore：构建/工具
└── perf：性能

示例：
feat(resource): add resource search functionality
fix(auth): resolve token refresh issue
docs(api): update API documentation
```

---

## 启动指令

当用户要求初始化项目时，按以下顺序执行：

1. **初始化 monorepo**
   ```bash
   pnpm init
   # 配置 pnpm-workspace.yaml
   # 配置 turbo.json
   ```

2. **初始化前端项目**
   ```bash
   cd apps/web
   pnpm create vite . --template react-ts
   # 安装依赖：zustand, react-router-dom, tailwindcss, framer-motion, lucide-react 等
   # 配置 vite.config.ts
   # 配置 tailwind.config.js
   # 创建 Apple Design 组件库
   ```

3. **初始化后端项目**
   ```bash
   cd apps/api
   nest new .
   # 安装依赖：prisma, @nestjs/config, passport 等
   # 初始化 Prisma
   # 创建基础模块
   ```

4. **初始化共享包**
   ```bash
   cd packages/shared
   pnpm init
   # 创建类型定义
   
   cd packages/ui
   pnpm init
   # 创建基础组件
   ```

5. **配置开发环境**
   ```bash
   # 创建 docker-compose.yml
   # 配置 PostgreSQL, Redis, MinIO
   # 配置环境变量
   ```

6. **创建数据库 Schema**
   ```bash
   cd apps/api
   npx prisma migrate dev --init
   # 创建种子数据
   ```

7. **实现核心功能模块**
   - 按优先级实现：认证 → 资源管理 → 环境管理 → 工作流 → 版本管理 → 监控

---

## 附录

### 快捷键设计（macOS 风格）

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 全局搜索 | Cmd + K | Spotlight 风格搜索 |
| 命令面板 | Cmd + Shift + P | 快速执行命令 |
| 新建资源 | Cmd + N | 创建新资源 |
| 保存 | Cmd + S | 保存当前内容 |
| 切换主题 | Cmd + Shift + L | 深色/浅色切换 |
| 切换侧边栏 | Cmd + B | 显示/隐藏侧边栏 |
| 切换检查器 | Cmd + I | 显示/隐藏检查器 |
| 关闭面板 | Cmd + W | 关闭当前面板 |
| 切换标签 | Cmd + 1-9 | 切换到第 N 个标签 |
| 返回 | Cmd + [ | 导航返回 |
| 前进 | Cmd + ] | 导航前进 |
| 刷新 | Cmd + R | 刷新当前页面 |
| 开发者工具 | Cmd + Option + I | 打开 DevTools |

### Spotlight 搜索设计

```
┌─────────────────────────────────────────────────────────┐
│  🔍 搜索资源、命令、设置...                    ⌘K       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  最近访问                                               │
│  ├── 📄 React 组件库 v2.1                              │
│  ├── 🔄 一键部署工作流                                  │
│  └── 🖥️ 生产环境                                       │
│                                                         │
│  资源                                                   │
│  ├── 📝 API 提示词模板                                  │
│  ├── 🧩 通用表单组件                                    │
│  └── 🔌 文件系统 MCP                                    │
│                                                         │
│  命令                                                   │
│  ├── ➕ 新建资源                                        │
│  ├── 🚀 执行工作流                                      │
│  └── ⚙️ 打开设置                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 主题配置

```typescript
// theme/tokens.ts
export const lightTheme = {
  // 背景色
  bg: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
    elevated: '#FFFFFF',
    grouped: '#F2F2F7',
  },
  
  // 填充色
  fill: {
    primary: 'rgba(120, 120, 128, 0.2)',
    secondary: 'rgba(120, 120, 128, 0.16)',
    tertiary: 'rgba(120, 120, 128, 0.12)',
    quaternary: 'rgba(120, 120, 128, 0.08)',
  },
  
  // 文字色
  text: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(60, 60, 67, 0.6)',
    tertiary: 'rgba(60, 60, 67, 0.3)',
    quaternary: 'rgba(60, 60, 67, 0.18)',
  },
  
  // 分隔线
  separator: {
    default: 'rgba(60, 60, 67, 0.12)',
    opaque: '#C6C6C8',
  },
  
  // 系统颜色
  system: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
  },
};

export const darkTheme = {
  bg: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    elevated: '#2C2C2E',
    grouped: '#000000',
  },
  
  fill: {
    primary: 'rgba(120, 120, 128, 0.36)',
    secondary: 'rgba(120, 120, 128, 0.32)',
    tertiary: 'rgba(120, 120, 128, 0.24)',
    quaternary: 'rgba(120, 120, 128, 0.18)',
  },
  
  text: {
    primary: 'rgba(255, 255, 255, 0.85)',
    secondary: 'rgba(235, 235, 245, 0.6)',
    tertiary: 'rgba(235, 235, 245, 0.3)',
    quaternary: 'rgba(235, 235, 245, 0.18)',
  },
  
  separator: {
    default: 'rgba(84, 84, 88, 0.65)',
    opaque: '#38383A',
  },
  
  system: {
    blue: '#0A84FF',
    green: '#30D158',
    indigo: '#5E5CE6',
    orange: '#FF9F0A',
    pink: '#FF375F',
    purple: '#BF5AF2',
    red: '#FF453A',
    teal: '#64D2FF',
    yellow: '#FFD60A',
  },
};
```

### CSS 变量定义

```css
:root {
  /* 背景色 */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F2F2F7;
  --bg-tertiary: #FFFFFF;
  --bg-elevated: #FFFFFF;
  
  /* 填充色 */
  --fill-primary: rgba(120, 120, 128, 0.2);
  --fill-secondary: rgba(120, 120, 128, 0.16);
  --fill-tertiary: rgba(120, 120, 128, 0.12);
  
  /* 文字色 */
  --text-primary: rgba(0, 0, 0, 0.85);
  --text-secondary: rgba(60, 60, 67, 0.6);
  --text-tertiary: rgba(60, 60, 67, 0.3);
  
  /* 分隔线 */
  --separator: rgba(60, 60, 67, 0.12);
  
  /* 系统颜色 */
  --system-blue: #007AFF;
  --system-green: #34C759;
  --system-red: #FF3B30;
  --system-orange: #FF9500;
  
  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 14px;
  
  /* 阴影 */
  --shadow-1: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-2: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-3: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-4: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  
  /* 毛玻璃 */
  --backdrop-blur: saturate(180%) blur(20px);
  --bg-toolbar: rgba(246, 246, 246, 0.78);
  --bg-sidebar: rgba(246, 246, 246, 0.9);
  
  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  --font-mono: "SF Mono", "Fira Code", "JetBrains Mono", "Cascadia Code", monospace;
  
  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #000000;
    --bg-secondary: #1C1C1E;
    --bg-tertiary: #2C2C2E;
    --bg-elevated: #2C2C2E;
    
    --fill-primary: rgba(120, 120, 128, 0.36);
    --fill-secondary: rgba(120, 120, 128, 0.32);
    --fill-tertiary: rgba(120, 120, 128, 0.24);
    
    --text-primary: rgba(255, 255, 255, 0.85);
    --text-secondary: rgba(235, 235, 245, 0.6);
    --text-tertiary: rgba(235, 235, 245, 0.3);
    
    --separator: rgba(84, 84, 88, 0.65);
    
    --system-blue: #0A84FF;
    --system-green: #30D158;
    --system-red: #FF453A;
    --system-orange: #FF9F0A;
    
    --bg-toolbar: rgba(30, 30, 30, 0.78);
    --bg-sidebar: rgba(30, 30, 30, 0.9);
  }
}
```
