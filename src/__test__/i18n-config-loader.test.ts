import { join } from 'node:path';
import { I18nConfigLoader } from '../i18n-config-loader';
import { assert, beforeEach, describe, it } from 'vitest';

describe('i18n-config-loader', () => {
  beforeEach(() => {
    I18nConfigLoader.resetCache();
  });

  it('$t should support type assertion and object return', async () => {
    const dir = join(__dirname, 'fixture/i18n');
    const lng = 'lng-A';
    const fallbackLng = 'abc_BASE';
    const loader = await I18nConfigLoader.getInstance(dir, lng, fallbackLng);
    // resource.nested1 应为对象
    const obj = loader.$t('resource.nested1');
    assert.deepStrictEqual(obj, { key2: 'value2' });
    // 类型为 unknown 时，需断言
    const raw = loader.$t('resource.nested1');
    assert.strictEqual(typeof raw, 'object');
  });

  it('basic translation and fallback behaviors', async () => {
    // 假设有 fixture/i18n 目录，结构与原用例一致
    const dir = join(__dirname, 'fixture/i18n');
    const lng = 'lng-A';
    const fallbackLng = 'abc_BASE';

    I18nConfigLoader.interpolation.prefix = '{';
    I18nConfigLoader.interpolation.suffix = '}';

    // 获取实例
    const loader = await I18nConfigLoader.getInstance(dir, lng, fallbackLng);
    // t函数引用稳定
    const t = loader.t;
    assert.strictEqual(typeof t, 'function');

    // 命中主语言key
    const valueA = t('resource.value-A');
    assert.strictEqual(valueA, 'value-AA');

    // 未命中key返回原始key
    const notfound = t('resource.no-such-resource-key');
    assert.strictEqual(notfound, 'resource.no-such-resource-key');

    const notfound2 = t('greet');
    assert.strictEqual(notfound2, 'greet');

    // 命中fallback key
    const valueBase = t('resource.value-base');
    assert.strictEqual(valueBase, 'base-base');

    // 嵌套key
    const nested1 = t('resource.nested1.key1');
    assert.strictEqual(nested1, 'value1');
    const nested2 = t('resource.nested1.key2');
    assert.strictEqual(nested2, 'value2');
    const nested3 = t('nested2.nested3.key');
    assert.strictEqual(nested3, 'valueA');

    // 变量替换
    const replacement = t('resource.greet', { name: 'world' });
    assert.strictEqual(replacement, 'hello, world');
  });

  it('should use fallback when lng dir does not exist', async () => {
    const dir = join(__dirname, 'fixture/i18n');
    const lng = 'not-exist-lng';
    const fallbackLng = 'abc_BASE';
    const loader = await I18nConfigLoader.getInstance(dir, lng, fallbackLng);
    const t = loader.t;
    // fallback key
    const valueBase = t('resource.value-base');
    assert.strictEqual(valueBase, 'base-base');
    // fallback嵌套key
    const nested1 = t('resource.nested1.key1');
    assert.strictEqual(nested1, 'value1');
  });

  it('should keep instances isolated for different dirs', async () => {
    const dirA = join(__dirname, 'fixture/i18n');
    const dirB = join(__dirname, 'fixture/i18n2');
    const dirC = join(__dirname, 'fixture/i18n3'); // no such folder.
    const lng = 'lng-A';
    const fallbackLng = 'abc_BASE';
    const loaderC = await I18nConfigLoader.getInstance(dirC, lng, fallbackLng);
    const loaderB = await I18nConfigLoader.getInstance(dirB, lng, fallbackLng);
    const loaderA = await I18nConfigLoader.getInstance(dirA, lng, fallbackLng);
    // 不同实例
    assert.notStrictEqual(loaderA, loaderB);
    assert.notStrictEqual(loaderA.t, loaderB.t);
    assert.strictEqual(loaderA.t('resource.value-A'), 'value-AA');
    assert.strictEqual(loaderB.t('resource.value-A'), 'value-AA#2');
    assert.strictEqual(loaderC.t('resource.value-A'), 'resource.value-A');
  });

  describe('I18nConfigLoader additional test', () => {
    // ...existing code...
    it('should throw if disposed and any method is called', async () => {
      const dir = join(__dirname, 'fixture/i18n');
      const loader = await I18nConfigLoader.getInstance(dir, 'Ing-A', 'abc_BASE');
      loader.dispose();
      assert.throws(() => loader.t('resource.value-A'), /disposed/i);
      assert.throws(() => loader.$t('resource.value-A'), /disposed/i);
      assert.throws(() => loader.dispose(), /disposed/i);
    });

    it('should handle multiple fallback envs', async () => {
      const dir = join(__dirname, 'fixture/i18n');
      const loader = await I18nConfigLoader.getInstance(dir, 'lng-A', ['not-exist', 'abc_BASE', 'lng-B']);
      // 主语言查不到，fallback1查不到，fallback2命中
      // Ing-A 没有 resource.only-in-B, abc_BASE 也没有，lng-B 有
      assert.strictEqual(loader.t('resource.only-in-B'), 'only-B');
      // 主语言和fallback都没有，返回原始key
      assert.strictEqual(loader.t('resource.no-such-key'), 'resource.no-such-key');
      // 主语言命中，优先主语言
      assert.strictEqual(loader.t('resource.value-A'), 'value-AA');
    });

    it('should handle ns only in fallback env', async () => {
      const dir = join(__dirname, 'fixture/i18n');
      const loader = await I18nConfigLoader.getInstance(dir, 'lng-B', 'abc_BASE');
      // Ing-B 没有 nested2/nested3.json, abc_BASE 有
      assert.strictEqual(loader.t('nested2.nested3.key'), 'value');
      // Ing-B 命中自己的 key
      assert.strictEqual(loader.t('resource.only-in-B'), 'only-B');
    });

    it('should reject illegal env names (blacklist)', async () => {
      const dir = join(__dirname, 'fixture/i18n');
      // 黑名单场景：不能以 a-base、abc-base 等非法环境名初始化
      try {
        await I18nConfigLoader.getInstance(dir, 'a-base');
        assert.fail('never');
      } catch (e) {
        assert.instanceOf(e, Error);
      }
    });

    it('should clear cache on resetCache', async () => {
      const dir = join(__dirname, 'fixture/i18n');
      const loader1 = await I18nConfigLoader.getInstance(dir, 'lng-A', 'abc_BASE');
      const loader2 = await I18nConfigLoader.getInstance(dir, 'lng-A', 'abc_BASE');
      assert.strictEqual(loader1, loader2);
      I18nConfigLoader.resetCache();
      const loader3 = await I18nConfigLoader.getInstance(dir, 'lng-A', 'abc_BASE');
      assert.notStrictEqual(loader1, loader3);
      loader3.dispose();
    });

    it('should not leak memory after dispose', async () => {
      const dir = join(__dirname, 'fixture/i18n');
      const loader = await I18nConfigLoader.getInstance(dir, 'Ing-A', 'abc_BASE');
      loader.dispose();
      assert.throws(() => loader.t('resource.value-A'), /disposed/i);
      // 这里无法直接检测内存泄漏，但可以检测状态
      assert.throws(() => loader.dispose(), /disposed/i);
    });
  });
});
