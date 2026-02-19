[[English]](./README.md) | [中文版]

---

# **i18nConfigLoader - 抱紧i18n大腿，配置管理爽到飞起** 🚀

> **哎呀，我抱上大腿了！用i18n生态搞配置管理，真香！** 😍

## **悄悄告诉你** 🤫

**敏感数据请留在 `.env` ，别作死！** 🔐  
我的工具只管理业务配置，密码密钥什么的还请乖乖放 `.env` 。  
不听劝？到时候数据泄露别怪我没事先提醒！ 😈

---

## **🚨 重要限制：先看再使！**

- **Node.js only** 💻 – 本工具基于 Node.js 文件系统（`fs`）实现，直接从磁盘读取 JSON 配置文件，**浏览器端想都别想**。
- **JSON only** 📄 – 配置文件必须是 **`.json` 格式**，别放 `.js`、`.yaml` 之类的，会炸。

---

## **为什么这么爽？因为我抱对大腿了！** 🦵

### **抱大腿姿势一：i18n Ally - 开发体验开挂** 🎮

```typescript
// 以前写配置：瞎子摸象 🦯
const config = {
  api: {
    timeout: 5000,
    // 这键名到底叫timeoutMs还是timeout?
    // 到底有没有被其他文件覆盖？
    // 鬼知道！ 👻
  },
};

// 现在：i18n Ally给我开天眼！ 👁️
t('resource.api.timeout'); // 输入时自动补全，红色波浪线防错
// 悬停显示实际值，点击跳转定义
// 哪里被引用一目了然，哎呀真爽！
```

**亮点** ✨  
我啥都没干，就白嫖了i18n生态的完整工具链！VS Code 插件、错误检查、智能提示……全是现成的！别人还在苦哈哈写文档，我已经享受上了！  
（注：这得益于项目结构符合 i18next 规范，插件自动生效，并非本工具内置功能）

#### **🔧 VS Code 配置小贴士：让 i18n Ally 更懂你**

想让 i18n Ally 插件发挥最大威力？在项目根目录创建 `.vscode/settings.json`，贴入以下配置（根据实际情况调整路径）：

```jsonc
// .vscode/settings.json
{
  "i18n-ally.localesPaths": ["src/config"], // 这里改成你的配置文件根目录
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.keystyle": "nested",
  "i18n-ally.sortKeys": true,
  "i18n-ally.namespace": true,
  "i18n-ally.enabledParsers": ["json"],
  "i18n-ally.sourceLanguage": "DEFAULT", // fallback 语言（注意：i18n-ally 只支持一层 fallback，多了它认不出来 😢）
  "i18n-ally.displayLanguage": "DEV", // 当前主环境，也就是 mainEnv
  "i18n-ally.enabledFrameworks": ["vue", "react"], // 这样设就行，不会影响配置加载
  "i18n-ally.annotationInPlace": true,
}
```

**解释一下：**

- `localesPaths`：告诉插件去哪找你的配置文件。
- `sourceLanguage`：回退语言（相当于 fallbackEnv），但插件只认一个，所以如果你有多级 fallback，它只显示这一层的值。
- `displayLanguage`：当前编辑环境，插件会优先显示这个环境的值。
- 其他选项：键风格、排序、命名空间等，看个人喜好。

有了这个配置，写 `t('xxx')` 时自动补全、跳转、悬停提示全都有了，开发体验直接起飞！🛫

---

### **抱大腿姿势二：i18next变量替换 - 自带的模板引擎** 🔧

```json
{
  "api": "https://{{env}}.example.com/{{version}}",
  "greeting": "你好，{{user}}！"
}
```

```typescript
// 免费模板引擎，香不香？ 😋
t('resource.api', { env: 'production', version: 'v2' });
t('resource.greeting', { user: '张三' });
```

**嗨点：** 🤯  
别人还在纠结选哪个模板引擎，我已经用上i18next十年磨一剑的变量替换了！转义安全、嵌套支持、格式化扩展... 全免费！💰

### **抱大腿姿势三：成熟的合并算法 - 配置继承不用愁** 🧬

```typescript
// i18next的fallback链，我直接拿来用！
const loader = await I18nConfigLoader.getInstance(
  'config', // 资源根目录
  'SIT', // 主环境
  'DEFAULT', // 回退环境，可以传多个
);

// 自动合并，SIT 优先，没有就去 DEFAULT 找
// 这算法我写一年也写不出来，现在白拿！ 🎁
```

### **抱大腿姿势四：TypeScript友好 - 类型断言爽歪歪** 🦾

```typescript
// 我封装的 $t 方法，让你少写一行类型转换！
const timeout = $t<number>('resource.api.timeout'); // 返回值被断言为 number
const user = $t<User>('resource.users.admin'); // 直接当作 User 类型使用

// ⚠️ 注意：这是类型断言，不是编译时校验
// 但至少比裸用 t 然后 as 要爽，对吧？ 😏
```

## **我在自动化测试项目里用，真香！** 🧪

_以下示例均在 Node.js 环境下运行（比如 Jest、Mocha）。_

### **测试数据管理 - 从地狱到天堂** 😇

```typescript
// 以前：测试数据散落各处 📝
// test-login.js: const user = { username: 'test', password: 'test123' }
// test-checkout.js: const user = { username: 'test', password: 'test123' } // 重复!
// test-api.js: const user = { username: 'test', password: 'test123' } // x 重复!

// 现在：一处定义，处处使用 🎯
const user = $t('test-data.users.standard'); // 改一处，全生效！
```

**真香时刻：** 🤤  
前端改了个CSS类名，以前要改N个测试文件，现在只需改一个JSON配置文件！测试选择器、Mock数据、端点URL... 全部可以配置化！

### **多环境测试 - 简单到哭** 😭

```bash
# 一套测试代码，多个环境运行
# 在 CI/CD 或启动脚本里控制 mainEnv 参数
I18nConfigLoader.getInstance('config', process.env.TEST_ENV, 'DEFAULT');

# 你的测试代码一行都不用改
# 哎呀，我怎么这么聪明！ 🧠
```

## **团队协作 - 配置即文档** 📚

```bash
# 新人入职，看配置就知道怎么用
git clone 项目

打开 selectors/login.json # 所有登录页面选择器
打开 mock-data/users.json # 所有测试用户数据
打开 endpoints/apis.json # 所有API端点

# 5分钟上手，不用问老员工
# 配置改了？Git历史一目了然 🔍
```

### 白嫖的生态工具列表 🛠️

| 工具                     | 功能                             | 我花了多少钱 |
| ------------------------ | -------------------------------- | ------------ |
| i18n Ally (VS Code 插件) | 智能补全、跳转定义、错误检查     | **0元** 💸   |
| i18next变量替换引擎      | 模板渲染、安全转义、格式化       | **0元** 💸   |
| i18next合并算法          | 多文件合并、冲突解决、fallback链 | **0元** 💸   |
| **总计价值**             | **至少值$1000/年的工具链**       | **0元** 🎉   |

**得瑟总结：** 我写了个薄薄的外壳，然后白嫖了i18n生态十年的积累！这就叫站在巨人肩膀上！ 🏔️

## 谁用谁爽（特别是测试工程师） 👥

- **测试工程师** 🧪：测试数据、选择器、端点URL全配置化，维护成本降为0
- **Node.js开发** 🚀：不用在代码里硬编码配置，开发体验提升100倍（本来就是为你量身定做的）
- **SaaS架构师** 🏗️：多租户配置管理简单到没朋友
- **全栈工程师** 🌐：后端配置管理告别重复劳动
- **团队新人** 🌱：配置即文档，上手速度让老员工震惊

## 最后警告（听不听随你） ⚠️

1. **敏感数据放 `.env`** 🚫，别作死往配置里写密码密钥！
2. 这工具**不支持热切换** 🔥，配置加载完就不变了，别来问为什么
3. **Node.js only** 💻（我已经说了三遍了，你要是还想着在浏览器用，那我只能说你头铁）
4. **JSON only** 📄（再重复一遍，只认 .json，别的格式别来沾边）
5. **别求我加功能** 🙅，我觉得够用了，你爱用不用

---

## **安装即爽** 📦

```bash
npm install @rickyli79/i18n-config-loader i18next
# 安装完记得感谢i18n生态，是他们让我这么爽的 🙏
```

### **得瑟的结尾** 🥳

**我就是个配置加载器，但我抱对了大腿！**  
i18n生态十年积累的工具链，我直接拿来用，开发体验碾压一切竞争对手！

**你现在有两个选择：** 🤔

1. 继续用你那土掉渣的配置方案，每天痛苦 😫
2. 跟我一起抱i18n大腿，享受开挂的开发体验 🚀

**聪明人都知道怎么选，对吧？** 😎

---

**在犹豫？看看这些数字：** 📊

- 开发效率提升：**300%**（保守估计）📈
- 配置错误减少：**90%**（工具链辅助 + 类型断言）✅
- 团队上手时间：**从5小时降到5分钟** ⏱️
- 维护成本：**几乎为0** 💰

**不试试？那你亏大了！** 💸

**用了之后别忘了回来感谢我...哦不，感谢i18n生态！** ❤️

## 未来计划？（看心情） 🔮

有人问我为啥不支持 `.js` 或 `.yaml` 文件。讲真，不是不能做，但会引入新的依赖和复杂性，比如 `js-yaml`。

**最主要的是，我现在用 JSON 已经够爽了，暂时懒得搞。** 😴

如果你们呼声很高，让我看到足够多的 Star 和 Issue，没准哪天我心情一好就给加上了。所以，想要新功能？你懂的。 😉

---

## 已知天坑（持续更新） 🕳️

**`i18n-ally` 的一个坑：别用 `BASE` 或 `xxx-base` 作为资源文件夹名！** 🚩

我踩过一个雷：如果你把环境文件夹命名为 `abc-base`、`my-BASE` 或者直接叫 `BASE`，`i18n Ally` 插件可能会罢工（据说是它的 bug）。更坑的是，`i18next` 自己对这些名字也有特殊处理，导致语言注册失败——文件夹明明存在，初始化后却找不到该语言。 😵

**本工具虽然不主动拦截这类名字，但会在初始化后检查每个环境是否真的注册成功。如果因为用了 `-base` 导致注册失败，工具会直接抛出异常，让你提前发现问题，而不是等运行时一脸懵。** 🛡️

**解决方法很简单：换个名字，比如把 `BASE` 改成 `DEFAULT`，把 `staging-base` 改成 `staging` 就好了。** 🔧

i18n-ally 可能还有别的坑，但我暂时只踩到这个。你们要是还发现了别的，记得提个 Issue 告诉我，我好更新文档，让大家一起绕开这些天坑。 🕳️

## License 📄

MIT
