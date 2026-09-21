/**
 * @vyline/plugin-sdk — Vyline プラグインの型定義と definePlugin
 *
 * 設計方針（README「Plugin System」参照）:
 * - プラグインはコアコードを変更せず拡張だけを行う
 * - 権限は明示宣言し、アカウントスコープで実行される
 * - 無効化されたプラグインのランタイムコストはほぼゼロ
 * - クラッシュしたプラグインが Vyline 本体を落とさない
 *
 * この SDK は型のみを提供する。実行基盤は backend 側の plugin manager。
 */

/**
 * プラグインが要求できる権限。
 *
 * ここに含める権限は backend の PluginContext が実際に提供・強制する
 * capability と一致させる。未実装の権限を型だけで公開すると、プラグインは
 * 有効化されたと誤認し、ランタイムでは黙って無視されるため許可しない。
 * raw token / session / filesystem 等も意図的に含めない。
 */
export type PluginPermission =
  | "messages:read"
  | "settings:read"
  | "settings:write";

export interface PluginLogger {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

export interface PluginMessageSnapshot {
  id: string;
  chatId: string;
  /** 送信者 MID。permissions の messages:read が必要 */
  authorId?: string;
  text?: string | null;
  contentType: string;
  createdAt: number;
}

export interface PluginContext {
  /** このプラグインが動作するアカウントスコープ */
  accountId: string;
  logger: PluginLogger;

  messages: {
    on(event: "message", handler: (message: PluginMessageSnapshot) => void): () => void;
  };

  settings: {
    get<T>(key: string, fallback: T): Promise<T>;
    set<T>(key: string, value: T): Promise<void>;
  };
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  permissions?: PluginPermission[];
}

export interface VylinePlugin {
  manifest: PluginManifest;
  activate(ctx: PluginContext): void | Promise<void>;
  deactivate(ctx: PluginContext): void | Promise<void>;
}

/** プラグイン作者向けのヘルパー。型補完のためだけに存在する */
export function definePlugin(plugin: VylinePlugin): VylinePlugin {
  return plugin;
}
