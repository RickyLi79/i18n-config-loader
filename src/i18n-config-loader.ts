import { createInstance, type i18n as I18NextInstance, type InterpolationOptions } from 'i18next';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

class SyncFsBackend {
  public static type = 'backend';
  private options: any = {};
  init(services: any, backendOptions: any) {
    this.options = backendOptions || {};
  }

  read(language: string, namespace: string, callback: (err: any, data: any) => void) {
    try {
      const loadPath = this.options.loadPath.replace('{{lang}}', language).replace('{{ns}}', namespace);
      const json = readFileSync(loadPath, 'utf-8');
      callback(null, JSON.parse(json));
    } catch (e) {
      callback(e, false);
    }
  }
}

// Recursively traverse all json files in the directory to generate namespace list
function getNamespaces(dir: string, prefix = ''): string[] {
  const result: string[] = [];
  let files: string[] = [];

  try {
    files = readdirSync(dir);
  } catch {
    // If directory does not exist, return empty
    return result;
  }

  for (const file of files) {
    const fullPath = join(dir, file);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      result.push(...getNamespaces(fullPath, prefix ? `prefix + '/` + file : file));
    } else if (/\.json$/.test(file)) {
      const ns = prefix ? prefix + '/' + file.replace(/\.json$/i, '') : file.replace(/\.json$/i, '');
      result.push(ns);
    }
  }

  return result;
}

export class I18nConfigLoader {
  protected static readonly _instancePromiseMap: Record<string, Promise<I18nConfigLoader>> = {};
  protected static readonly _instanceMap: Record<string, I18nConfigLoader> = {};

  static interpolation: InterpolationOptions = {};

  public static resetCache() {
    Object.values(this._instanceMap).forEach((i) => i.dispose());
  }

  protected static getCacheKey(dir: string, mainEnv: string, fallbackEnv: string[]) {
    return JSON.stringify([dir, mainEnv, ...fallbackEnv]);
  }

  public static getInstance(dir: string, mainEnv: string, fallbackEnv: string | string[] = []) {
    if (!Array.isArray(fallbackEnv)) {
      fallbackEnv = [fallbackEnv].filter(Boolean);
    }

    const cacheKey = this.getCacheKey(dir, mainEnv, fallbackEnv);
    let instPromise = this._instancePromiseMap[cacheKey];
    if (!instPromise) {
      instPromise = new Promise<I18nConfigLoader>(async (resolve, reject) => {
        const inst = new this();
        this._instanceMap[cacheKey] = inst;
        try {
          await inst.create(dir, mainEnv, fallbackEnv);
          resolve(inst);
        } catch (e) {
          reject(e);
        }
      });
      this._instancePromiseMap[cacheKey] = instPromise;
    }
    return instPromise;
  }

  protected constructor() {}

  protected _main?: I18NextInstance;
  protected _nsList: Set<string> = new Set();
  protected _dir!: string;
  protected _mainEnv!: string;
  protected _fallbackEnv!: string[];
  protected _allEnvs!: string[];
  protected _isDispose = false;

  protected async create(dir: string, mainEnv: string, fallbackEnv: string | string[] = []) {
    this.throwIfDisposed();
    if (!Array.isArray(fallbackEnv)) {
      fallbackEnv = [fallbackEnv].filter(Boolean);
    }
    this._dir = dir;
    this._mainEnv = mainEnv;
    this._fallbackEnv = fallbackEnv;
    const main = await this._initI18n(dir, mainEnv, fallbackEnv);

    const actualLangs = main.languages || [];
    const expectLangs = [mainEnv, ...fallbackEnv];
    for (const lang of expectLangs) {
      if (!actualLangs.includes(lang)) {
        throw new Error('i18next failed to register language "${lang}". languages: ${JSON.stringify(actualLangs)}');
      }
    }

    this._main = main;

    this._allEnvs = [mainEnv, ...fallbackEnv];
  }

  protected async _initI18n(dir: string, mainEnv: string, fallbackEnv: string[]) {
    this.throwIfDisposed();
    const nsSet = new Set<string>();
    const envs = [mainEnv, ...fallbackEnv];
    for (const env of envs) {
      const langDir = join(dir, env);
      getNamespaces(langDir).forEach((ns) => nsSet.add(ns));
    }
    const _nsList = Array.from(nsSet);

    const main = createInstance();
    await main.use(SyncFsBackend as any).init({
      lng: mainEnv,
      debug: false,
      ns: _nsList,
      backend: {
        loadPath: join(dir, '{{lang}}', '{{ns}}.json'),
      },
      interpolation: {
        escapeValue: false,
        ...(I18nConfigLoader.interpolation ?? {}),
      },
      fallbackLng: fallbackEnv,
      supportedLngs: [mainEnv, ...fallbackEnv],
    });
    _nsList.forEach((i) => {
      this._nsList.add(i);
    });
    return main;
  }

  public getRawValue(ns: string, key: string) {
    this.throwIfDisposed();
    if (!this._main) return undefined;
    for (const iEnv of this._allEnvs) {
      const rawValue = this._main.getResource(iEnv, ns, key);
      if (rawValue !== undefined) {
        return rawValue;
      }
    }
    return undefined;
  }

  public t = (key: string, replace?: Record<string, any>) => {
    this.throwIfDisposed();
    let ns = '';
    let subKey = key;
    for (const n of this._nsList) {
      const nsDot = n.replace(/\//g, '.');
      if (key.startsWith(nsDot + '.')) {
        ns = n;
        subKey = key.slice(nsDot.length + 1);
        break;
      }
    }
    if (!ns) {
      ns = this._nsList.values().next().value || '';
      subKey = key;
    }
    let value = this.getRawValue(ns, subKey);
    if (value === undefined) return key;
    if (typeof value === 'string' && replace && this._main) {
      value = (this._main as any).services.interpolator.interpolate(value, replace, this._mainEnv, this._main.options);
    }
    return value;
  };

  public $t = <T = any>(key: string) => {
    this.throwIfDisposed();
    return this.t(key) as T;
  };

  public dispose() {
    if (this._isDispose) {
      throw new Error('I18nConfigLoader instance has been disposed and cannot be reused.');
    }

    const cacheKey = I18nConfigLoader.getCacheKey(this._dir, this._mainEnv, this._fallbackEnv);
    delete I18nConfigLoader._instancePromiseMap[cacheKey];
    delete I18nConfigLoader._instanceMap[cacheKey];
    this._main = undefined;
    this._nsList.clear();
    this._dir = '';
    this._mainEnv = '';
    this._fallbackEnv = [];
    this._allEnvs = [];
    this._isDispose = true;
  }

  protected throwIfDisposed() {
    if (this._isDispose) {
      throw new Error('I18nConfigLoader instance has been disposed and cannot be reused.');
    }
  }
}
