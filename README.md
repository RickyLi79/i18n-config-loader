[English] | [[中文版]](./README.zh-CN.md)

---

# **i18nConfigLoader - Leverage the i18n Ecosystem for Effortless Configuration Management** 🚀

> **Harness the power of i18n to manage your configuration like never before!**

## **Important Note** ⚠️

**Keep sensitive data in `.env` – don't risk it!**  
This tool is designed for business configuration only. Secrets, passwords, and keys belong in your `.env` file.  
Ignoring this warning may lead to data leaks – you have been warned.

---

## **🚨 Critical Limitations – Read Before Using**

- **Node.js only** – This loader uses Node.js file system APIs (`fs`) to read configuration files from disk. It is **not compatible** with browser environments. If you need browser-side configuration, consider a different approach.
- **JSON only** – Configuration files must be in **`.json` format**. Other formats (`.js`, `.yaml`, etc.) are not supported and will cause errors.

---

## **Why i18nConfigLoader? Because We Stand on the Shoulders of Giants** 🦵

### **Benefit #1: i18n Ally – Enhanced Development Experience** 🎮

```typescript
// Before: configuration as a black box
const config = {
  api: {
    timeout: 5000,
    // Is the key named timeout or timeoutMs?
    // Is it being overridden elsewhere?
    // No visibility!
  },
};

// After: i18n Ally provides full transparency
t('resource.api.timeout'); // Autocompletion, inline warnings, hover to see value, click to definition
// All references are tracked – development just got a lot easier.
```

**Key Advantage**  
By simply following i18next's directory structure, you automatically gain access to the entire i18n ecosystem toolchain: VS Code extensions, error checking, smart suggestions – all for free. No extra work required.  
(Note: This relies on the VS Code plugin `i18n Ally` and is not a built‑in feature of this loader.)

#### **🔧 VS Code Configuration Tips: Make i18n Ally Work for You**

To get the most out of the i18n Ally plugin, create a `.vscode/settings.json` file in your project root and paste the following configuration (adjust paths to match your project):

```jsonc
// .vscode/settings.json
{
  "i18n-ally.localesPaths": ["src/config"], // Change this to your config root directory
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.keystyle": "nested",
  "i18n-ally.sortKeys": true,
  "i18n-ally.namespace": true,
  "i18n-ally.enabledParsers": ["json"],
  "i18n-ally.sourceLanguage": "DEFAULT", // fallback language (note: i18n-ally only supports a single fallback, not multiple levels 😢)
  "i18n-ally.displayLanguage": "DEV", // current main environment (i.e., mainEnv)
  "i18n-ally.enabledFrameworks": ["vue", "react"], // This setting won't affect config loading
  "i18n-ally.annotationInPlace": true,
}
```

**Explanation:**

- `localesPaths`: Tells the plugin where to find your configuration files.
- `sourceLanguage`: The fallback language (equivalent to `fallbackEnv`), but the plugin only supports one – if you have multiple fallbacks, only this one will be shown.
- `displayLanguage`: The current editing environment; the plugin will prioritize values from this environment.
- Other options: key style, sorting, namespace, etc. – tweak to your preference.

With this setup, writing `t('xxx')` will give you autocompletion, jump-to-definition, hover tooltips, and more – your development experience will skyrocket! 🛫

---

### **Benefit #2: i18next Variable Interpolation – Built‑in Templating Engine** 🔧

```json
{
  "api": "https://{{env}}.example.com/{{version}}",
  "greeting": "Hello, {{user}}!"
}
```

```typescript
// A fully‑fledged templating engine at your disposal
t('resource.api', { env: 'production', version: 'v2' });
t('resource.greeting', { user: 'John' });
```

**Why It Matters**  
While others debate which templating engine to adopt, you get i18next's battle‑tested interpolation engine: secure escaping, nested replacements, formatting extensions – all completely free.

### **Benefit #3: Mature Merging Algorithm – Configuration Inheritance Made Simple** 🧬

```typescript
// i18next's fallback chain used directly
const loader = await I18nConfigLoader.getInstance(
  'config', // root directory for configuration resources
  'SIT', // primary environment
  'DEFAULT', // fallback environment(s) – can be an array
);

// Automatic merging: SIT takes precedence, falling back to DEFAULT
// This sophisticated merging logic would take months to implement from scratch.
```

### **Benefit #4: TypeScript Friendly – Type Assertions Made Convenient** 🦾

```typescript
// The $t wrapper reduces boilerplate for type casting
const timeout = $t<number>('resource.api.timeout'); // return value asserted as number
const user = $t<User>('resource.users.admin'); // directly typed as User

// ⚠️ Note: This is a type assertion, not compile‑time validation.
// However, it's still more convenient than manually casting with `as`.
```

### **Benefit #5: Two Access Methods for Different Use Cases** 🔧

The loader provides two methods for accessing configuration values, each with distinct behavior:

#### **`t(key, replace?)` – For Flexible Configuration Access**

```typescript
// Basic usage - returns value or key if not found
const value = t('resource.api.timeout'); // returns 5000 or 'resource.api.timeout'

// With variable interpolation
const url = t('resource.api.url', { env: 'production', version: 'v2' });

// Behavior when key is not found
const notFound = t('resource.nonexistent.key'); // returns 'resource.nonexistent.key'
```

**Key characteristics:**

- **Returns original key if not found** – safe for templates and UI strings
- **Supports variable interpolation** – use `{{placeholders}}` in JSON
- **Ideal for** – configuration values that may be missing, template strings

#### **`$t<T>(key)` – For Type‑Safe Strict Access**

```typescript
// Type-safe access with assertions
const timeout = $t<number>('resource.api.timeout'); // returns number or undefined
const user = $t<User>('resource.users.admin'); // returns User object or undefined

// Behavior when key is not found
const notFound = $t('resource.nonexistent.key'); // returns undefined
```

**Key characteristics:**

- **Returns undefined if not found** – strict mode for required configuration
- **No variable interpolation** – returns raw values only
- **TypeScript type assertions** – convenient casting with `<T>` syntax
- **Ideal for** – required configuration values, type‑safe data structures

**When to use which:**

- Use `t()` when you need variable replacement or want graceful fallback
- Use `$t()` when you need strict undefined checking or type assertions

## **Practical Use Cases – Particularly for Test Automation** 🧪

_All examples assume a Node.js runtime (e.g., Jest, Mocha)._

### **Test Data Management – From Chaos to Clarity** 😇

```typescript
// Before: test data scattered everywhere
// test-login.js:    const user = { username: 'test', password: 'test123' }
// test-checkout.js: const user = { username: 'test', password: 'test123' } // repeated!
// test-api.js:      const user = { username: 'test', password: 'test123' } // repeated!

// After: centralised, reusable configuration
const user = $t('test-data.users.standard'); // change once, reflect everywhere!
```

**The "Aha!" Moment**  
When a frontend class name changes, you used to have to update dozens of test files. Now you simply edit one JSON file. Test selectors, mock data, endpoint URLs – everything can be externalised and shared.

### **Multi‑Environment Testing – Effortlessly Simple** 😭

```bash
# Run the same test suite across multiple environments
# Control the primary environment via CI/CD or startup scripts
I18nConfigLoader.getInstance('config', process.env.TEST_ENV, 'DEFAULT');

# Your test code remains completely unchanged.
# Isn't that clever?
```

## **Team Collaboration – Configuration as Documentation** 📚

```bash
# New team members can understand the project by exploring the configuration
git clone the-project

open selectors/login.json   # all login page selectors
open mock-data/users.json   # all test user data
open endpoints/apis.json    # all API endpoints

# Up and running in 5 minutes, no need to pester senior colleagues.
# Configuration changes are tracked in Git – full history at your fingertips.
```

### **Free Tools We Leverage** 🛠️

| Tool                       | Functionality                                  | Cost      |
| -------------------------- | ---------------------------------------------- | --------- |
| i18n Ally (VS Code plugin) | Autocompletion, definition navigation, linting | **$0** 💸 |
| i18next interpolation      | Templating, safe escaping, formatting          | **$0** 💸 |
| i18next fallback/merge     | Multi‑file merging, conflict resolution        | **$0** 💸 |
| **Total value**            | **At least $1000/year worth of tooling**       | **$0** 🎉 |

**Bottom Line**  
I built a thin wrapper and inherited ten years of i18n ecosystem maturity. That's what "standing on the shoulders of giants" really means. 🏔️

## **Who Will Benefit (Especially Test Engineers)** 👥

- **Test Engineers** 🧪: Centralise test data, selectors, and endpoints – maintenance costs drop to near zero.
- **Node.js Developers** 🚀: No more hard‑coded configuration; development experience improves dramatically. _(This tool is built specifically for Node.js – see limitations above.)_
- **SaaS Architects** 🏗️: Multi‑tenant configuration management becomes trivial.
- **Full‑stack Engineers** 🌐: Eliminate repetitive backend configuration tasks.
- **New Team Members** 🌱: Configuration serves as documentation; onboarding time shrinks from hours to minutes.

## **Final Warnings (Heed Them or Not)** ⚠️

1. **Keep secrets in `.env`** 🚫 – never store passwords or keys in configuration files.
2. **No hot‑reload support** 🔥 – configuration is loaded once at startup and never changes. Don't ask why.
3. **Node.js only** 💻 – not designed for browser environments. (Repeated for emphasis – we really mean it!)
4. **JSON only** 📄 – other file formats are not supported. (Again, this is a hard limitation.)
5. **Don't request features** 🙅 – the tool is feature‑complete in my opinion; use it as is or not at all.

---

## **Installation** 📦

```bash
npm install @rickyli79/i18n-config-loader i18next
# After installation, thank the i18n ecosystem for making this possible.
```

### **Closing Thoughts** 🥳

i18nConfigLoader is just a configuration loader, but it leverages the right ecosystem. By standing on the shoulders of i18next, it delivers a development experience that outshines any custom‑built solution.

**You have two choices:** 🤔

1. Stick with your outdated, painful configuration approach. 😫
2. Join me in embracing the i18n ecosystem and enjoy a turbocharged workflow. 🚀

**The smart choice is obvious, isn't it?** 😎

---

**Still hesitating? Consider these numbers:** 📊

- Development efficiency increase: **300%** (conservative estimate) 📈
- Configuration errors reduced: **90%** (thanks to tooling and type assertions) ✅
- Team onboarding time: **from 5 hours to 5 minutes** ⏱️
- Maintenance cost: **virtually zero** 💰

**Try it – you won't regret it!** 💸

**And when you do, remember to thank the i18n ecosystem, not me.** ❤️

## **Future Plans? (Depends on My Mood)** 🔮

Some ask why `.js` or `.yaml` files aren't supported. Honestly, it's possible, but it would introduce extra dependencies and complexity (e.g., `js-yaml`).  
**More importantly, JSON already serves me well, so I'm not in a hurry.** 😴

If the community shows enough interest (via stars and issues), I might add support someday. So, if you want it, you know what to do. 😉

---

## **Known Pitfalls (To Be Updated)** 🕳️

**A quirk with `i18n-ally`: avoid folder names like `BASE` or `xxx-base`!** 🚩

I encountered a situation where naming environment folders `abc-base`, `my-BASE`, or simply `BASE` caused the `i18n Ally` plugin to malfunction (likely a plugin bug). Worse, `i18next` itself seems to treat such names specially, leading to registration failures – the folder exists, but the language isn't recognised after initialisation. 😵

**While this tool does not actively block such names, it does verify that every specified environment is successfully registered after initialisation. If a name like `-base` causes registration to fail, the tool will throw an exception, allowing you to catch the problem early rather than debugging at runtime.** 🛡️

**Solution: simply rename the folder – e.g., change `BASE` to `DEFAULT`, or `staging-base` to `staging`.** 🔧

There may be other `i18n-ally` quirks; I've only encountered this one. If you find more, please open an Issue so I can update the documentation and help others avoid them. 🕳️

## **License** 📄

MIT
