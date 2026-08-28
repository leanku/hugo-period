#!/usr/bin/env node
/**
 * Period 主题单篇加密工具（作者侧）
 *
 * 算法（与前端 assets/js/encrypt.js 完全一致，保证浏览器可解密）：
 *   PBKDF2-SHA256(密码, salt 16B, 迭代 100000) → AES-256-GCM key
 *   密文格式：base64( salt(16B) + iv(12B) + ciphertext + authTag(16B) )
 *   同一密码每次加密结果不同（随机 salt/iv），密文不可重复比对。
 *
 * 用法：
 *   1) 文章内标记加密（推荐，方案 A）：
 *       在 Markdown 中用「protect 开头标记」与「/protect 结尾标记」包裹明文
 *       （即 {{ 百分号斜杠 protect 百分号 }}，避免在注释中书写以免解析冲突），
 *       发布前执行：
 *         node scripts/encrypt.mjs --lock content/post/xxx.md      # 交互输入密码，原地替换为密文
 *         node scripts/encrypt.mjs --lock content/post/xxx.md 密码 # 或直接给密码
 *         node scripts/encrypt.mjs --lock content/post/            # 支持目录批量
 *       修改已加密文章：
 *         node scripts/encrypt.mjs --unlock content/post/xxx.md    # 密文还原为明文标记，改完再 --lock
 *
 *   2) 命令行管道（简单场景）：
 *         node scripts/encrypt.mjs 密码 < plain.txt > cipher.txt   # 加密
 *         node scripts/encrypt.mjs --decrypt 密码 < cipher.txt     # 解密验证
 *
 *   3) 交互模式：
 *         node scripts/encrypt.mjs                                  # 交互输入密码和明文
 */
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from "node:crypto";
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const ITERATIONS = 100000;
const KEY_LEN = 32; // AES-256
const SALT_LEN = 16;
const IV_LEN = 12;

// 文章内明文标记（Hugo 短代码转义写法，Markdown 编辑器友好）
const MARK_OPEN = "{{%/* protect */%}}";
const MARK_CLOSE = "{{%/* /protect */%}}";

async function promptPassword() {
  const rl = readline.createInterface({ input, output });
  const pass = await new Promise((resolve) => {
    rl.question("Password: ", (ans) => resolve(ans));
  });
  rl.close();
  return pass;
}

function deriveKey(password, salt) {
  return pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, "sha256");
}

function encrypt(plaintext, password) {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(password, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, enc, tag]).toString("base64");
}

function decrypt(payload, password) {
  const buf = Buffer.from(payload, "base64");
  const salt = buf.subarray(0, SALT_LEN);
  const iv = buf.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(SALT_LEN + IV_LEN, buf.length - 16);
  const key = deriveKey(password, salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ---- 文章原地加密/解密 ----

function isMarkdownFile(p) {
  return /\.md$/.test(p);
}

function collectMarkdownFiles(path) {
  const st = statSync(path);
  if (st.isFile()) return isMarkdownFile(path) ? [path] : [];
  if (st.isDirectory()) {
    const out = [];
    for (const name of readdirSync(path)) {
      const full = join(path, name);
      if (statSync(full).isDirectory()) out.push(...collectMarkdownFiles(full));
      else if (isMarkdownFile(full)) out.push(full);
    }
    return out;
  }
  return [];
}

/** 扫描文件中的明文标记块，返回 [{start, end, plaintext}] */
function findPlainBlocks(content) {
  const blocks = [];
  let pos = 0;
  while (true) {
    const open = content.indexOf(MARK_OPEN, pos);
    if (open === -1) break;
    const close = content.indexOf(MARK_CLOSE, open + MARK_OPEN.length);
    if (close === -1) {
      console.warn(`  警告：第 ${open} 处有 ${MARK_OPEN} 但缺少闭合标记，已跳过`);
      break;
    }
    const plaintext = content.slice(open + MARK_OPEN.length, close);
    blocks.push({ start: open, end: close + MARK_CLOSE.length, plaintext });
    pos = close + MARK_CLOSE.length;
  }
  return blocks;
}

/** 扫描文件中的密文 shortcode 块，返回 [{start, end, payload}] */
function findCipherBlocks(content) {
  const blocks = [];
  let pos = 0;
  while (true) {
    const open = content.indexOf("{{< protected >}}", pos);
    if (open === -1) break;
    const close = content.indexOf("{{< /protected >}}", open);
    if (close === -1) {
      console.warn(`  警告：第 ${open} 处有 {{< protected >}} 但缺少闭合标记，已跳过`);
      break;
    }
    const payload = content.slice(open + "{{< protected >}}".length, close).trim();
    blocks.push({ start: open, end: close + "{{< /protected >}}".length, payload });
    pos = close;
  }
  return blocks;
}

function lockFile(path, password) {
  const original = readFileSync(path, "utf8");
  const blocks = findPlainBlocks(original);
  if (!blocks.length) {
    console.log(`  ${path}: 无明文标记，跳过`);
    return 0;
  }
  let content = original;
  // 从后往前替换，避免索引错位
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (!b.plaintext.trim()) {
      console.warn(`  警告：${path} 有空的加密块，跳过`);
      continue;
    }
    const cipher = encrypt(b.plaintext, password);
    const replacement = `{{< protected >}}\n${cipher}\n{{< /protected >}}`;
    content = content.slice(0, b.start) + replacement + content.slice(b.end);
  }
  writeFileSync(path, content, "utf8");
  console.log(`  ${path}: 已加密 ${blocks.length} 个块`);
  return blocks.length;
}

function unlockFile(path, password) {
  const original = readFileSync(path, "utf8");
  const blocks = findCipherBlocks(original);
  if (!blocks.length) {
    console.log(`  ${path}: 无密文块，跳过`);
    return 0;
  }
  let content = original;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    try {
      const plain = decrypt(b.payload, password);
      const replacement = `${MARK_OPEN}\n${plain}\n${MARK_CLOSE}`;
      content = content.slice(0, b.start) + replacement + content.slice(b.end);
    } catch (e) {
      console.error(`  失败：${path} 第 ${b.start} 处解密失败（密码错误？）`);
      throw e;
    }
  }
  writeFileSync(path, content, "utf8");
  console.log(`  ${path}: 已还原 ${blocks.length} 个块为明文标记`);
  return blocks.length;
}

async function main() {
  const args = process.argv.slice(2);
  let mode = "pipe";
  if (args[0] === "--lock") { mode = "lock"; args.shift(); }
  else if (args[0] === "--unlock") { mode = "unlock"; args.shift(); }
  else if (args[0] === "--decrypt") { mode = "decrypt"; args.shift(); }

  // 密码：优先命令行参数（--lock/--unlock 模式下是最后一个参数，若为文件路径则交互）
  let password = "";
  if (mode === "lock" || mode === "unlock") {
    const last = args[args.length - 1];
    const lastIsFile = last && (statSync(last, { throwIfNoEntry: false }) !== undefined);
    if (last && !lastIsFile) {
      password = last;
      args.pop();
    }
  }

  try {
    if (mode === "lock" || mode === "unlock") {
      if (!args.length) {
        console.error("用法：node scripts/encrypt.mjs --lock|--unlock <文件或目录> [密码]");
        process.exit(1);
      }
      if (!password) password = await promptPassword();
      const files = collectMarkdownFiles(args[0]);
      if (!files.length) {
        console.error(`未找到 Markdown 文件：${args[0]}`);
        process.exit(1);
      }
      console.log(`共 ${files.length} 个文件待处理（${mode === "lock" ? "加密" : "解密"}）`);
      let total = 0;
      for (const f of files) {
        try {
          total += mode === "lock" ? lockFile(f, password) : unlockFile(f, password);
        } catch (e) {
          // unlock 失败时中断，避免部分文件被改
          if (mode === "unlock") { console.error("已中断，未改动其余文件"); process.exit(1); }
          console.error(`  ${f}: ${e.message}`);
        }
      }
      console.log(`完成，共处理 ${total} 个块`);
      return;
    }

    // ---- 管道/交互模式 ----
    if (!password) password = args[0];
    if (!password) password = await promptPassword();

    let input = "";
    if (!process.stdin.isTTY) {
      input = readFileSync(0, "utf8");
    }

    if (mode === "decrypt") {
      const text = decrypt(input.trim(), password);
      process.stdout.write(text + "\n");
    } else {
      if (!input) {
        const rl = readline.createInterface({ input, output });
        input = await rl.question("Plaintext (Ctrl+D 结束):\n");
        rl.close();
      }
      if (!input.trim()) {
        console.error("错误：没有输入内容。用法见文件头注释。");
        process.exit(1);
      }
      process.stdout.write(encrypt(input, password) + "\n");
    }
  } catch (e) {
    console.error("失败：" + e.message);
    process.exit(1);
  }
}

main();
