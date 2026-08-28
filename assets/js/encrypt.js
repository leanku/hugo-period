/* Period 主题单篇加密：浏览器端解密（Web Crypto，零依赖）
 * 与 scripts/encrypt.mjs 算法一致：PBKDF2-SHA256(100000 次) → AES-256-GCM
 * 密文格式：base64( salt(16B) + iv(12B) + ciphertext + authTag(16B) )
 * 页面加载时扫描 .protected 块 → 渲染密码输入框 → 输入密码解密 → 展示正文
 */
(function () {
  "use strict";

  var ITERATIONS = 100000;
  var SALT_LEN = 16;
  var IV_LEN = 12;

  // 检测是否支持 Web Crypto（需 HTTPS 或 localhost）
  function cryptoAvailable() {
    return typeof crypto !== "undefined" && crypto.subtle;
  }

  function base64ToBytes(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function bytesToBase64(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  // 兼容旧浏览器：把 ArrayBuffer 拼进 Uint8Array（subarray 处理）
  function concatBytes(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  function deriveKey(password, saltBytes) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]).then(function (key) {
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: saltBytes, iterations: ITERATIONS, hash: "SHA-256" },
        key,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
    });
  }

  function decrypt(payload, password) {
    var bytes = base64ToBytes(payload.trim());
    var salt = bytes.subarray(0, SALT_LEN);
    var iv = bytes.subarray(SALT_LEN, SALT_LEN + IV_LEN);
    var tag = bytes.subarray(bytes.length - 16);
    var data = bytes.subarray(SALT_LEN + IV_LEN, bytes.length - 16);
    return deriveKey(password, salt).then(function (key) {
      // 注意：WebCrypto 的 AesGcmParams 不接受 additionalData: null，必须省略该字段
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv, tagLength: 128 }, key, concatBytes(data, tag));
    }).then(function (plain) {
      return new TextDecoder().decode(plain);
    });
  }

  function renderLock(container, payload) {
    // 已有界面则跳过（避免重复渲染）
    if (container.querySelector(".protected-ui")) return;

    var isZh = (document.documentElement.lang || "zh-cn").toLowerCase().indexOf("zh") === 0;
    var texts = {
      title: isZh ? "此内容已加密" : "This content is protected",
      hint: isZh ? "输入密码解锁查看" : "Enter the password to view",
      placeholder: isZh ? "密码" : "Password",
      unlock: isZh ? "解锁" : "Unlock",
      wrong: isZh ? "密码错误" : "Wrong password",
      missing: isZh ? "请输入密码" : "Please enter a password",
      nosupport: isZh ? "当前环境不支持解密（需 HTTPS 或 localhost）" : "Decryption unavailable (HTTPS or localhost required)"
    };

    var ui = document.createElement("div");
    ui.className = "protected-ui";

    var title = document.createElement("p");
    title.className = "protected-title";
    title.textContent = texts.title;

    var hint = document.createElement("p");
    hint.className = "protected-hint";
    hint.textContent = texts.hint;

    var input = document.createElement("input");
    input.type = "password";
    input.className = "protected-input";
    input.placeholder = texts.placeholder;
    // 阻止浏览器"保存密码"提示：autocomplete=new-password 告知密码管理器这不是登录表单
    input.setAttribute("autocomplete", "new-password");
    input.name = "protected-code";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "protected-submit";
    button.textContent = texts.unlock;

    var status = document.createElement("p");
    status.className = "protected-status";
    status.setAttribute("role", "status");

    var body = document.createElement("div");
    body.className = "protected-body";
    body.hidden = true;

    ui.appendChild(title);
    ui.appendChild(hint);
    ui.appendChild(input);
    ui.appendChild(button);
    ui.appendChild(status);
    ui.appendChild(body);

    container.innerHTML = "";
    container.appendChild(ui);

    function doUnlock() {
      var pass = input.value;
      status.textContent = "";
      if (!pass) {
        status.textContent = texts.missing;
        status.className = "protected-status error";
        return;
      }
      if (!cryptoAvailable()) {
        status.textContent = texts.nosupport;
        status.className = "protected-status error";
        return;
      }
      button.disabled = true;
      decrypt(payload, pass).then(function (plain) {
        body.innerHTML = plain; // 内容来自作者自加密，可信
        body.hidden = false;
        // 用 body 替换整个 ui（密码界面），保留解密内容
        ui.replaceWith(body);
      }).catch(function () {
        status.textContent = texts.wrong;
        status.className = "protected-status error";
        button.disabled = false;
        input.select();
      });
    }

    button.addEventListener("click", doUnlock);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doUnlock();
    });
  }

  function init() {
    var blocks = document.querySelectorAll(".protected");
    // 无加密块则跳过
    if (!blocks.length) return;
    Array.prototype.forEach.call(blocks, function (block) {
      // 密文在 .protected-cipher span 内（shortcode 输出），只读取该元素避免混入 noscript 等
      var cipherEl = block.querySelector(".protected-cipher");
      if (!cipherEl) return;
      var payload = cipherEl.textContent.trim();
      if (!payload) return;
      renderLock(block, payload);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
