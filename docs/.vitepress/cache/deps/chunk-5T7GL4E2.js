// node_modules/@formkit/utils/dist/index.mjs
var explicitKeys = [
  "__key",
  "__init",
  "__shim",
  "__original",
  "__index",
  "__prevKey"
];
function token() {
  return Math.random().toString(36).substring(2, 15);
}
function dedupe(arr1, arr2) {
  const original = arr1 instanceof Set ? arr1 : new Set(arr1);
  if (arr2)
    arr2.forEach((item) => original.add(item));
  return [...original];
}
function has(obj, property) {
  return Object.prototype.hasOwnProperty.call(obj, property);
}
function eq(valA, valB, deep = true, explicit = ["__key"]) {
  if (valA === valB)
    return true;
  if (typeof valB === "object" && typeof valA === "object") {
    if (valA instanceof Map)
      return false;
    if (valA instanceof Set)
      return false;
    if (valA instanceof Date)
      return false;
    if (valA === null || valB === null)
      return false;
    if (Object.keys(valA).length !== Object.keys(valB).length)
      return false;
    for (const k of explicit) {
      if ((k in valA || k in valB) && valA[k] !== valB[k])
        return false;
    }
    for (const key in valA) {
      if (!(key in valB))
        return false;
      if (valA[key] !== valB[key] && !deep)
        return false;
      if (deep && !eq(valA[key], valB[key], deep, explicit))
        return false;
    }
    return true;
  }
  return false;
}
function empty(value) {
  const type = typeof value;
  if (type === "number")
    return false;
  if (value === void 0)
    return true;
  if (type === "string") {
    return value === "";
  }
  if (type === "object") {
    if (value === null)
      return true;
    for (const _i in value)
      return false;
    if (value instanceof RegExp)
      return false;
    if (value instanceof Date)
      return false;
    return true;
  }
  return false;
}
function escapeExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function regexForFormat(format) {
  const escaped = `^${escapeExp(format)}$`;
  const formats = {
    MM: "(0[1-9]|1[012])",
    M: "([1-9]|1[012])",
    DD: "([012][0-9]|3[01])",
    D: "([012]?[0-9]|3[01])",
    YYYY: "\\d{4}",
    YY: "\\d{2}"
  };
  const tokens = Object.keys(formats);
  return new RegExp(tokens.reduce((regex, format2) => {
    return regex.replace(format2, formats[format2]);
  }, escaped));
}
function isRecord(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function isObject(o) {
  return isRecord(o) || Array.isArray(o);
}
function isPojo(o) {
  if (isRecord(o) === false)
    return false;
  if (o.__FKNode__ || o.__POJO__ === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  const prot = ctor.prototype;
  if (isRecord(prot) === false)
    return false;
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function extend(original, additional, extendArrays = false, ignoreUndefined = false) {
  if (additional === null)
    return null;
  const merged = {};
  if (typeof additional === "string")
    return additional;
  for (const key in original) {
    if (has(additional, key) && (additional[key] !== void 0 || !ignoreUndefined)) {
      if (extendArrays && Array.isArray(original[key]) && Array.isArray(additional[key])) {
        merged[key] = original[key].concat(additional[key]);
        continue;
      }
      if (additional[key] === void 0) {
        continue;
      }
      if (isPojo(original[key]) && isPojo(additional[key])) {
        merged[key] = extend(original[key], additional[key], extendArrays, ignoreUndefined);
      } else {
        merged[key] = additional[key];
      }
    } else {
      merged[key] = original[key];
    }
  }
  for (const key in additional) {
    if (!has(merged, key) && additional[key] !== void 0) {
      merged[key] = additional[key];
    }
  }
  return merged;
}
function isQuotedString(str) {
  if (str[0] !== '"' && str[0] !== "'")
    return false;
  if (str[0] !== str[str.length - 1])
    return false;
  const quoteType = str[0];
  for (let p = 1; p < str.length; p++) {
    if (str[p] === quoteType && (p === 1 || str[p - 1] !== "\\") && p !== str.length - 1) {
      return false;
    }
  }
  return true;
}
function rmEscapes(str) {
  if (!str.length)
    return "";
  let clean = "";
  let lastChar = "";
  for (let p = 0; p < str.length; p++) {
    const char = str.charAt(p);
    if (char !== "\\" || lastChar === "\\") {
      clean += char;
    }
    lastChar = char;
  }
  return clean;
}
function nodeProps(...sets) {
  return sets.reduce((valid, props) => {
    const { value, name, modelValue, config, plugins, ...validProps } = props;
    return Object.assign(valid, validProps);
  }, {});
}
function parseArgs(str) {
  const args = [];
  let arg = "";
  let depth = 0;
  let quote = "";
  let lastChar = "";
  for (let p = 0; p < str.length; p++) {
    const char = str.charAt(p);
    if (char === quote && lastChar !== "\\") {
      quote = "";
    } else if ((char === "'" || char === '"') && !quote && lastChar !== "\\") {
      quote = char;
    } else if (char === "(" && !quote) {
      depth++;
    } else if (char === ")" && !quote) {
      depth--;
    }
    if (char === "," && !quote && depth === 0) {
      args.push(arg);
      arg = "";
    } else if (char !== " " || quote) {
      arg += char;
    }
    lastChar = char;
  }
  if (arg) {
    args.push(arg);
  }
  return args;
}
function except(obj, toRemove) {
  const clean = {};
  const exps = toRemove.filter((n) => n instanceof RegExp);
  const keysToRemove = new Set(toRemove);
  for (const key in obj) {
    if (!keysToRemove.has(key) && !exps.some((exp) => exp.test(key))) {
      clean[key] = obj[key];
    }
  }
  return clean;
}
function only(obj, include) {
  const clean = {};
  const exps = include.filter((n) => n instanceof RegExp);
  include.forEach((key) => {
    if (!(key instanceof RegExp)) {
      clean[key] = obj[key];
    }
  });
  Object.keys(obj).forEach((key) => {
    if (exps.some((exp) => exp.test(key))) {
      clean[key] = obj[key];
    }
  });
  return clean;
}
function camel(str) {
  return str.replace(/-([a-z0-9])/gi, (_s, g) => g.toUpperCase());
}
function kebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, (_s, trail, cap) => trail + "-" + cap.toLowerCase()).replace(" ", "-").toLowerCase();
}
function shallowClone(obj, explicit = explicitKeys) {
  if (obj !== null && typeof obj === "object") {
    let returnObject;
    if (Array.isArray(obj))
      returnObject = [...obj];
    else if (isPojo(obj))
      returnObject = { ...obj };
    if (returnObject) {
      applyExplicit(obj, returnObject, explicit);
      return returnObject;
    }
  }
  return obj;
}
function clone(obj, explicit = explicitKeys) {
  if (obj === null || obj instanceof RegExp || obj instanceof Date || obj instanceof Map || obj instanceof Set || typeof File === "function" && obj instanceof File)
    return obj;
  let returnObject;
  if (Array.isArray(obj)) {
    returnObject = obj.map((value) => {
      if (typeof value === "object")
        return clone(value, explicit);
      return value;
    });
  } else {
    returnObject = Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = typeof obj[key] === "object" ? clone(obj[key], explicit) : obj[key];
      return newObj;
    }, {});
  }
  for (const key of explicit) {
    if (key in obj) {
      Object.defineProperty(returnObject, key, {
        enumerable: false,
        value: obj[key]
      });
    }
  }
  return returnObject;
}
function cloneAny(obj) {
  return typeof obj === "object" ? clone(obj) : obj;
}
function getAt(obj, addr) {
  if (!obj || typeof obj !== "object")
    return null;
  const segments = addr.split(".");
  let o = obj;
  for (const i in segments) {
    const segment = segments[i];
    if (has(o, segment)) {
      o = o[segment];
    }
    if (+i === segments.length - 1)
      return o;
    if (!o || typeof o !== "object")
      return null;
  }
  return null;
}
function undefine(value) {
  return value !== void 0 && value !== "false" && value !== false ? true : void 0;
}
function init(obj) {
  return !Object.isFrozen(obj) ? Object.defineProperty(obj, "__init", {
    enumerable: false,
    value: true
  }) : obj;
}
function slugify(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, " ").trim().replace(/\s+/g, "-");
}
function applyExplicit(original, obj, explicit) {
  for (const key of explicit) {
    if (key in original) {
      Object.defineProperty(obj, key, {
        enumerable: false,
        value: original[key]
      });
    }
  }
  return obj;
}
function oncePerTick(fn) {
  let called = false;
  return (...args) => {
    if (called)
      return;
    called = true;
    queueMicrotask(() => called = false);
    return fn(...args);
  };
}

// node_modules/@formkit/core/dist/index.mjs
function createDispatcher() {
  const middleware = [];
  let currentIndex = 0;
  const use2 = (dispatchable) => middleware.push(dispatchable);
  const dispatch = (payload) => {
    const current = middleware[currentIndex];
    if (typeof current === "function") {
      return current(payload, (explicitPayload) => {
        currentIndex++;
        return dispatch(explicitPayload === void 0 ? payload : explicitPayload);
      });
    }
    currentIndex = 0;
    return payload;
  };
  use2.dispatch = dispatch;
  use2.unshift = (dispatchable) => middleware.unshift(dispatchable);
  use2.remove = (dispatchable) => {
    const index = middleware.indexOf(dispatchable);
    if (index > -1)
      middleware.splice(index, 1);
  };
  return use2;
}
function createEmitter() {
  const listeners = /* @__PURE__ */ new Map();
  const receipts2 = /* @__PURE__ */ new Map();
  let buffer = void 0;
  const emitter = (node, event) => {
    if (buffer) {
      buffer.set(event.name, [node, event]);
      return;
    }
    if (listeners.has(event.name)) {
      listeners.get(event.name).forEach((wrapper) => {
        if (event.origin === node || wrapper.modifiers.includes("deep")) {
          wrapper.listener(event);
        }
      });
    }
    if (event.bubble) {
      node.bubble(event);
    }
  };
  emitter.flush = () => {
    listeners.clear();
    receipts2.clear();
    buffer === null || buffer === void 0 ? void 0 : buffer.clear();
  };
  emitter.on = (eventName, listener) => {
    const [event, ...modifiers] = eventName.split(".");
    const receipt = listener.receipt || token();
    const wrapper = {
      modifiers,
      event,
      listener,
      receipt
    };
    listeners.has(event) ? listeners.get(event).push(wrapper) : listeners.set(event, [wrapper]);
    receipts2.has(receipt) ? receipts2.get(receipt).push(event) : receipts2.set(receipt, [event]);
    return receipt;
  };
  emitter.off = (receipt) => {
    var _a;
    if (receipts2.has(receipt)) {
      (_a = receipts2.get(receipt)) === null || _a === void 0 ? void 0 : _a.forEach((event) => {
        const eventListeners = listeners.get(event);
        if (Array.isArray(eventListeners)) {
          listeners.set(event, eventListeners.filter((wrapper) => wrapper.receipt !== receipt));
        }
      });
      receipts2.delete(receipt);
    }
  };
  emitter.pause = (node) => {
    if (!buffer)
      buffer = /* @__PURE__ */ new Map();
    if (node) {
      node.walk((child) => child._e.pause());
    }
  };
  emitter.play = (node) => {
    if (!buffer)
      return;
    const events = buffer;
    buffer = void 0;
    events.forEach(([node2, event]) => emitter(node2, event));
    if (node) {
      node.walk((child) => child._e.play());
    }
  };
  return emitter;
}
function emit$1(node, context, name, payload, bubble2 = true) {
  context._e(node, {
    payload,
    name,
    bubble: bubble2,
    origin: node
  });
  return node;
}
function bubble(node, _context, event) {
  if (isNode(node.parent)) {
    node.parent._e(node.parent, event);
  }
  return node;
}
function on(_node, context, name, listener) {
  return context._e.on(name, listener);
}
function off(node, context, receipt) {
  context._e.off(receipt);
  return node;
}
var errorHandler = createDispatcher();
errorHandler((error2, next) => {
  if (!error2.message)
    error2.message = String(`E${error2.code}`);
  return next(error2);
});
var warningHandler = createDispatcher();
warningHandler((warning, next) => {
  if (!warning.message)
    warning.message = String(`W${warning.code}`);
  const result = next(warning);
  if (console && typeof console.warn === "function")
    console.warn(result.message);
  return result;
});
function warn(code, data = {}) {
  warningHandler.dispatch({ code, data });
}
function error(code, data = {}) {
  throw Error(errorHandler.dispatch({ code, data }).message);
}
function createMessage(conf, node) {
  const m = {
    blocking: false,
    key: token(),
    meta: {},
    type: "state",
    visible: true,
    ...conf
  };
  if (node && m.value && m.meta.localize !== false) {
    m.value = node.t(m);
    m.meta.locale = node.config.locale;
  }
  return m;
}
var storeTraps = {
  apply: applyMessages,
  set: setMessage,
  remove: removeMessage,
  filter: filterMessages,
  reduce: reduceMessages,
  release: releaseBuffer,
  touch: touchMessages
};
function createStore(_buffer = false) {
  const messages = {};
  let node;
  let buffer = _buffer;
  let _b = [];
  const _m = /* @__PURE__ */ new Map();
  let _r = void 0;
  const store = new Proxy(messages, {
    get(...args) {
      const [_target, property] = args;
      if (property === "buffer")
        return buffer;
      if (property === "_b")
        return _b;
      if (property === "_m")
        return _m;
      if (property === "_r")
        return _r;
      if (has(storeTraps, property)) {
        return storeTraps[property].bind(null, messages, store, node);
      }
      return Reflect.get(...args);
    },
    set(_t, prop, value) {
      if (prop === "_n") {
        node = value;
        if (_r === "__n")
          releaseMissed(node, store);
        return true;
      } else if (prop === "_b") {
        _b = value;
        return true;
      } else if (prop === "buffer") {
        buffer = value;
        return true;
      } else if (prop === "_r") {
        _r = value;
        return true;
      }
      error(101, node);
      return false;
    }
  });
  return store;
}
function setMessage(messageStore, store, node, message) {
  if (store.buffer) {
    store._b.push([[message]]);
    return store;
  }
  if (messageStore[message.key] !== message) {
    if (typeof message.value === "string" && message.meta.localize !== false) {
      const previous = message.value;
      message.value = node.t(message);
      if (message.value !== previous) {
        message.meta.locale = node.props.locale;
      }
    }
    const e = `message-${has(messageStore, message.key) ? "updated" : "added"}`;
    messageStore[message.key] = Object.freeze(node.hook.message.dispatch(message));
    node.emit(e, message);
  }
  return store;
}
function touchMessages(messageStore, store) {
  for (const key in messageStore) {
    const message = { ...messageStore[key] };
    store.set(message);
  }
}
function removeMessage(messageStore, store, node, key) {
  if (has(messageStore, key)) {
    const message = messageStore[key];
    delete messageStore[key];
    node.emit("message-removed", message);
  }
  if (store.buffer === true) {
    store._b = store._b.filter((buffered) => {
      buffered[0] = buffered[0].filter((m) => m.key !== key);
      return buffered[1] || buffered[0].length;
    });
  }
  return store;
}
function filterMessages(messageStore, store, node, callback, type) {
  for (const key in messageStore) {
    const message = messageStore[key];
    if ((!type || message.type === type) && !callback(message)) {
      removeMessage(messageStore, store, node, key);
    }
  }
}
function reduceMessages(messageStore, _store, _node, reducer, accumulator) {
  for (const key in messageStore) {
    const message = messageStore[key];
    accumulator = reducer(accumulator, message);
  }
  return accumulator;
}
function applyMessages(_messageStore, store, node, messages, clear) {
  if (Array.isArray(messages)) {
    if (store.buffer) {
      store._b.push([messages, clear]);
      return;
    }
    const applied = new Set(messages.map((message) => {
      store.set(message);
      return message.key;
    }));
    if (typeof clear === "string") {
      store.filter((message) => message.type !== clear || applied.has(message.key));
    } else if (typeof clear === "function") {
      store.filter((message) => !clear(message) || applied.has(message.key));
    }
  } else {
    for (const address in messages) {
      const child = node.at(address);
      if (child) {
        child.store.apply(messages[address], clear);
      } else {
        missed(node, store, address, messages[address], clear);
      }
    }
  }
}
function createMessages(node, ...errors) {
  const sourceKey = `${node.name}-set`;
  const make = (error2) => createMessage({
    key: slugify(error2),
    type: "error",
    value: error2,
    meta: { source: sourceKey, autoClear: true }
  });
  return errors.filter((m) => !!m).map((errorSet) => {
    if (typeof errorSet === "string")
      errorSet = [errorSet];
    if (Array.isArray(errorSet)) {
      return errorSet.map((error2) => make(error2));
    } else {
      const errors2 = {};
      for (const key in errorSet) {
        if (Array.isArray(errorSet[key])) {
          errors2[key] = errorSet[key].map((error2) => make(error2));
        } else {
          errors2[key] = [make(errorSet[key])];
        }
      }
      return errors2;
    }
  });
}
function missed(node, store, address, messages, clear) {
  var _a;
  const misses = store._m;
  if (!misses.has(address))
    misses.set(address, []);
  if (!store._r)
    store._r = releaseMissed(node, store);
  (_a = misses.get(address)) === null || _a === void 0 ? void 0 : _a.push([messages, clear]);
}
function releaseMissed(node, store) {
  return node.on("child.deep", ({ payload: child }) => {
    store._m.forEach((misses, address) => {
      if (node.at(address) === child) {
        misses.forEach(([messages, clear]) => {
          child.store.apply(messages, clear);
        });
        store._m.delete(address);
      }
    });
    if (store._m.size === 0 && store._r) {
      node.off(store._r);
      store._r = void 0;
    }
  });
}
function releaseBuffer(_messageStore, store) {
  store.buffer = false;
  store._b.forEach(([messages, clear]) => store.apply(messages, clear));
  store._b = [];
}
function createLedger() {
  const ledger = {};
  let n;
  return {
    count: (...args) => createCounter(n, ledger, ...args),
    init(node) {
      n = node;
      node.on("message-added.deep", add(ledger, 1));
      node.on("message-removed.deep", add(ledger, -1));
    },
    merge: (child) => merge(n, ledger, child),
    settled(counterName) {
      return has(ledger, counterName) ? ledger[counterName].promise : Promise.resolve();
    },
    unmerge: (child) => merge(n, ledger, child, true),
    value(counterName) {
      return has(ledger, counterName) ? ledger[counterName].count : 0;
    }
  };
}
function createCounter(node, ledger, counterName, condition, increment = 0) {
  condition = parseCondition(condition || counterName);
  if (!has(ledger, counterName)) {
    const counter = {
      condition,
      count: 0,
      name: counterName,
      node,
      promise: Promise.resolve(),
      resolve: () => {
      }
      // eslint-disable-line @typescript-eslint/no-empty-function
    };
    ledger[counterName] = counter;
    increment = node.store.reduce((sum, m) => sum + counter.condition(m) * 1, increment);
    node.each((child) => {
      child.ledger.count(counter.name, counter.condition);
      increment += child.ledger.value(counter.name);
    });
  }
  return count(ledger[counterName], increment).promise;
}
function parseCondition(condition) {
  if (typeof condition === "function") {
    return condition;
  }
  return (m) => m.type === condition;
}
function count(counter, increment) {
  const initial = counter.count;
  const post = counter.count + increment;
  counter.count = post;
  if (initial === 0 && post !== 0) {
    counter.node.emit(`unsettled:${counter.name}`, counter.count, false);
    counter.promise = new Promise((r) => counter.resolve = r);
  } else if (initial !== 0 && post === 0) {
    counter.node.emit(`settled:${counter.name}`, counter.count, false);
    counter.resolve();
  }
  counter.node.emit(`count:${counter.name}`, counter.count, false);
  return counter;
}
function add(ledger, delta) {
  return (e) => {
    for (const name in ledger) {
      const counter = ledger[name];
      if (counter.condition(e.payload)) {
        count(counter, delta);
      }
    }
  };
}
function merge(parent, ledger, child, remove = false) {
  for (const key in ledger) {
    const condition = ledger[key].condition;
    if (!remove)
      child.ledger.count(key, condition);
    const increment = child.ledger.value(key) * (remove ? -1 : 1);
    if (!parent)
      continue;
    do {
      parent.ledger.count(key, condition, increment);
      parent = parent.parent;
    } while (parent);
  }
}
var registry = /* @__PURE__ */ new Map();
var reflected = /* @__PURE__ */ new Map();
var emit = createEmitter();
var receipts = [];
function register(node) {
  if (node.props.id) {
    registry.set(node.props.id, node);
    reflected.set(node, node.props.id);
    emit(node, {
      payload: node,
      name: node.props.id,
      bubble: false,
      origin: node
    });
  }
}
function deregister(node) {
  if (reflected.has(node)) {
    const id2 = reflected.get(node);
    reflected.delete(node);
    registry.delete(id2);
    emit(node, {
      payload: null,
      name: id2,
      bubble: false,
      origin: node
    });
  }
}
function getNode$1(id2) {
  return registry.get(id2);
}
function watchRegistry(id2, callback) {
  receipts.push(emit.on(id2, callback));
}
function configChange(node, prop, value) {
  let usingFallback = true;
  !(prop in node.config._t) ? node.emit(`config:${prop}`, value, false) : usingFallback = false;
  if (!(prop in node.props)) {
    node.emit("prop", { prop, value });
    node.emit(`prop:${prop}`, value);
  }
  return usingFallback;
}
function createConfig$1(options = {}) {
  const nodes = /* @__PURE__ */ new Set();
  const target = {
    ...options,
    ...{
      _add: (node) => nodes.add(node),
      _rm: (node) => nodes.delete(node)
    }
  };
  const rootConfig = new Proxy(target, {
    set(t, prop, value, r) {
      if (typeof prop === "string") {
        nodes.forEach((node) => configChange(node, prop, value));
      }
      return Reflect.set(t, prop, value, r);
    }
  });
  return rootConfig;
}
function submitForm(id2) {
  const formElement = document.getElementById(id2);
  if (formElement instanceof HTMLFormElement) {
    const event = new Event("submit", { cancelable: true, bubbles: true });
    formElement.dispatchEvent(event);
    return;
  }
  warn(151, id2);
}
function clearState(node) {
  const clear = (n) => {
    for (const key in n.store) {
      const message = n.store[key];
      if (message.type === "error" || message.type === "ui" && key === "incomplete") {
        n.store.remove(key);
      } else if (message.type === "state") {
        n.store.set({ ...message, value: false });
      }
    }
  };
  clear(node);
  node.walk(clear);
}
function reset(id2, resetTo) {
  const node = typeof id2 === "string" ? getNode$1(id2) : id2;
  if (node) {
    const initial = (n) => cloneAny(n.props.initial) || (n.type === "group" ? {} : n.type === "list" ? [] : void 0);
    node._e.pause(node);
    const resetValue2 = cloneAny(resetTo);
    if (resetTo && !empty(resetTo)) {
      node.props.initial = isObject(resetValue2) ? init(resetValue2) : resetValue2;
    }
    node.input(initial(node), false);
    node.walk((child) => child.input(initial(child), false));
    node.input(empty(resetValue2) && resetValue2 ? resetValue2 : initial(node), false);
    node._e.play(node);
    clearState(node);
    node.emit("reset", node);
    return node;
  }
  warn(152, id2);
  return;
}
var defaultConfig = {
  delimiter: ".",
  delay: 0,
  locale: "en",
  rootClasses: (key) => ({ [`formkit-${kebab(key)}`]: true })
};
var useIndex = Symbol("index");
var valueRemoved = Symbol("removed");
var valueMoved = Symbol("moved");
var valueInserted = Symbol("inserted");
function isList(arg) {
  return arg.type === "list" && Array.isArray(arg._value);
}
function isNode(node) {
  return node && typeof node === "object" && node.__FKNode__ === true;
}
var invalidSetter = (node, _context, property) => {
  error(102, [node, property]);
};
var traps = {
  _c: trap(getContext, invalidSetter, false),
  add: trap(addChild),
  addProps: trap(addProps),
  address: trap(getAddress, invalidSetter, false),
  at: trap(getNode),
  bubble: trap(bubble),
  clearErrors: trap(clearErrors$1),
  calm: trap(calm),
  config: trap(false),
  define: trap(define),
  disturb: trap(disturb),
  destroy: trap(destroy),
  extend: trap(extend2),
  hydrate: trap(hydrate),
  index: trap(getIndex, setIndex, false),
  input: trap(input),
  each: trap(eachChild),
  emit: trap(emit$1),
  find: trap(find),
  on: trap(on),
  off: trap(off),
  parent: trap(false, setParent),
  plugins: trap(false),
  remove: trap(removeChild),
  root: trap(getRoot, invalidSetter, false),
  reset: trap(resetValue),
  resetConfig: trap(resetConfig),
  setErrors: trap(setErrors$1),
  submit: trap(submit),
  t: trap(text),
  use: trap(use),
  name: trap(getName, false, false),
  walk: trap(walkTree)
};
function createTraps() {
  return new Map(Object.entries(traps));
}
function trap(getter, setter, curryGetter = true) {
  return {
    get: getter ? (node, context) => curryGetter ? (...args) => getter(node, context, ...args) : getter(node, context) : false,
    set: setter !== void 0 ? setter : invalidSetter.bind(null)
  };
}
function createHooks() {
  const hooks = /* @__PURE__ */ new Map();
  return new Proxy(hooks, {
    get(_, property) {
      if (!hooks.has(property)) {
        hooks.set(property, createDispatcher());
      }
      return hooks.get(property);
    }
  });
}
var nameCount = 0;
var idCount = 0;
function resetCount() {
  nameCount = 0;
  idCount = 0;
}
function createName(options) {
  var _a, _b;
  if (((_a = options.parent) === null || _a === void 0 ? void 0 : _a.type) === "list")
    return useIndex;
  return options.name || `${((_b = options.props) === null || _b === void 0 ? void 0 : _b.type) || "input"}_${++nameCount}`;
}
function createValue(options) {
  if (options.type === "group") {
    return init(options.value && typeof options.value === "object" && !Array.isArray(options.value) ? options.value : {});
  } else if (options.type === "list") {
    return init(Array.isArray(options.value) ? options.value : []);
  }
  return options.value;
}
function input(node, context, value, async = true) {
  context._value = validateInput(node, node.hook.input.dispatch(value));
  node.emit("input", context._value);
  if (node.isCreated && node.type === "input" && eq(context._value, context.value)) {
    node.emit("commitRaw", context.value);
    return context.settled;
  }
  if (context.isSettled)
    node.disturb();
  if (async) {
    if (context._tmo)
      clearTimeout(context._tmo);
    context._tmo = setTimeout(commit, node.props.delay, node, context);
  } else {
    commit(node, context);
  }
  return context.settled;
}
function validateInput(node, value) {
  switch (node.type) {
    case "input":
      break;
    case "group":
      if (!value || typeof value !== "object")
        error(107, [node, value]);
      break;
    case "list":
      if (!Array.isArray(value))
        error(108, [node, value]);
      break;
  }
  return value;
}
function commit(node, context, calm2 = true, hydrate2 = true) {
  context._value = context.value = node.hook.commit.dispatch(context._value);
  if (node.type !== "input" && hydrate2)
    node.hydrate();
  node.emit("commitRaw", context.value);
  node.emit("commit", context.value);
  if (calm2)
    node.calm();
}
function partial(context, { name, value, from }) {
  if (Object.isFrozen(context._value))
    return;
  if (isList(context)) {
    const insert = value === valueRemoved ? [] : value === valueMoved && typeof from === "number" ? context._value.splice(from, 1) : [value];
    context._value.splice(name, value === valueMoved || from === valueInserted ? 0 : 1, ...insert);
    return;
  }
  if (value !== valueRemoved) {
    context._value[name] = value;
  } else {
    delete context._value[name];
  }
}
function hydrate(node, context) {
  const _value = context._value;
  if (node.type === "list" && node.sync)
    syncListNodes(node, context);
  context.children.forEach((child) => {
    if (typeof _value !== "object")
      return;
    if (child.name in _value) {
      const childValue = child.type !== "input" || _value[child.name] && typeof _value[child.name] === "object" ? init(_value[child.name]) : _value[child.name];
      if (!child.isSettled || !isObject(childValue) && eq(childValue, child._value))
        return;
      child.input(childValue, false);
    } else {
      if (node.type !== "list" || typeof child.name === "number") {
        partial(context, { name: child.name, value: child.value });
      }
      if (!_value.__init) {
        if (child.type === "group")
          child.input({}, false);
        else if (child.type === "list")
          child.input([], false);
        else
          child.input(void 0, false);
      }
    }
  });
  return node;
}
function syncListNodes(node, context) {
  const _value = node._value;
  if (!Array.isArray(_value))
    return;
  const newChildren = [];
  const unused = new Set(context.children);
  const placeholderValues = /* @__PURE__ */ new Map();
  _value.forEach((value, i) => {
    if (context.children[i] && context.children[i]._value === value) {
      newChildren.push(context.children[i]);
      unused.delete(context.children[i]);
    } else {
      newChildren.push(null);
      const indexes = placeholderValues.get(value) || [];
      indexes.push(i);
      placeholderValues.set(value, indexes);
    }
  });
  if (unused.size && placeholderValues.size) {
    unused.forEach((child) => {
      if (placeholderValues.has(child._value)) {
        const indexes = placeholderValues.get(child._value);
        const index = indexes.shift();
        newChildren[index] = child;
        unused.delete(child);
        if (!indexes.length)
          placeholderValues.delete(child._value);
      }
    });
  }
  const emptyIndexes = [];
  placeholderValues.forEach((indexes) => {
    emptyIndexes.push(...indexes);
  });
  while (unused.size && emptyIndexes.length) {
    const child = unused.values().next().value;
    const index = emptyIndexes.shift();
    if (index === void 0)
      break;
    newChildren[index] = child;
    unused.delete(child);
  }
  emptyIndexes.forEach((index, value) => {
    newChildren[index] = createPlaceholder({ value });
  });
  if (unused.size) {
    unused.forEach((child) => {
      if (!("__FKP" in child)) {
        const parent = child._c.parent;
        if (!parent || isPlaceholder(parent))
          return;
        parent.ledger.unmerge(child);
        child._c.parent = null;
        child.destroy();
      }
    });
  }
  context.children = newChildren;
}
function disturb(node, context) {
  var _a;
  if (context._d <= 0) {
    context.isSettled = false;
    node.emit("settled", false, false);
    context.settled = new Promise((resolve) => {
      context._resolve = resolve;
    });
    if (node.parent)
      (_a = node.parent) === null || _a === void 0 ? void 0 : _a.disturb();
  }
  context._d++;
  return node;
}
function calm(node, context, value) {
  var _a;
  if (value !== void 0 && node.type !== "input") {
    partial(context, value);
    return commit(node, context, true, false);
  }
  if (context._d > 0)
    context._d--;
  if (context._d === 0) {
    context.isSettled = true;
    node.emit("settled", true, false);
    if (node.parent)
      (_a = node.parent) === null || _a === void 0 ? void 0 : _a.calm({ name: node.name, value: context.value });
    if (context._resolve)
      context._resolve(context.value);
  }
}
function destroy(node, context) {
  node.emit("destroying", node);
  node.store.filter(() => false);
  if (node.parent) {
    node.parent.emit("childRemoved", node);
    node.parent.remove(node);
  }
  deregister(node);
  node.emit("destroyed", node);
  context._e.flush();
  context._value = context.value = void 0;
  for (const property in context.context) {
    delete context.context[property];
  }
  context.plugins.clear();
  context.context = null;
}
function define(node, context, definition) {
  context.type = definition.type;
  context.props.definition = clone(definition);
  context.value = context._value = createValue({
    type: node.type,
    value: context.value
  });
  if (definition.forceTypeProp) {
    if (node.props.type)
      node.props.originalType = node.props.type;
    context.props.type = definition.forceTypeProp;
  }
  if (definition.family) {
    context.props.family = definition.family;
  }
  if (definition.features) {
    definition.features.forEach((feature) => feature(node));
  }
  if (definition.props) {
    node.addProps(definition.props);
  }
  node.emit("defined", definition);
}
function addProps(node, context, props) {
  var _a;
  if (node.props.attrs) {
    const attrs = { ...node.props.attrs };
    node.props._emit = false;
    for (const attr in attrs) {
      const camelName = camel(attr);
      if (props.includes(camelName)) {
        node.props[camelName] = attrs[attr];
        delete attrs[attr];
      }
    }
    const initial = cloneAny(context._value);
    node.props.initial = node.type !== "input" ? init(initial) : initial;
    node.props._emit = true;
    node.props.attrs = attrs;
    if (node.props.definition) {
      node.props.definition.props = [
        ...((_a = node.props.definition) === null || _a === void 0 ? void 0 : _a.props) || [],
        ...props
      ];
    }
  }
  node.emit("added-props", props);
  return node;
}
function addChild(parent, parentContext, child, listIndex) {
  if (parent.type === "input")
    error(100, parent);
  if (child.parent && child.parent !== parent) {
    child.parent.remove(child);
  }
  if (!parentContext.children.includes(child)) {
    if (listIndex !== void 0 && parent.type === "list") {
      const existingNode = parentContext.children[listIndex];
      if (existingNode && "__FKP" in existingNode) {
        child._c.uid = existingNode.uid;
        parentContext.children.splice(listIndex, 1, child);
      } else {
        parentContext.children.splice(listIndex, 0, child);
      }
      if (Array.isArray(parent.value) && parent.value.length < parentContext.children.length) {
        parent.disturb().calm({
          name: listIndex,
          value: child.value,
          from: valueInserted
        });
      }
    } else {
      parentContext.children.push(child);
    }
    if (!child.isSettled)
      parent.disturb();
  }
  if (child.parent !== parent) {
    child.parent = parent;
    if (child.parent !== parent) {
      parent.remove(child);
      child.parent.add(child);
      return parent;
    }
  } else {
    child.use(parent.plugins);
  }
  commit(parent, parentContext, false);
  parent.ledger.merge(child);
  parent.emit("child", child);
  return parent;
}
function setParent(child, context, _property, parent) {
  if (isNode(parent)) {
    if (child.parent && child.parent !== parent) {
      child.parent.remove(child);
    }
    context.parent = parent;
    child.resetConfig();
    !parent.children.includes(child) ? parent.add(child) : child.use(parent.plugins);
    return true;
  }
  if (parent === null) {
    context.parent = null;
    return true;
  }
  return false;
}
function removeChild(node, context, child) {
  const childIndex = context.children.indexOf(child);
  if (childIndex !== -1) {
    if (child.isSettled)
      node.disturb();
    context.children.splice(childIndex, 1);
    let preserve = undefine(child.props.preserve);
    let parent = child.parent;
    while (preserve === void 0 && parent) {
      preserve = undefine(parent.props.preserve);
      parent = parent.parent;
    }
    if (!preserve) {
      node.calm({
        name: node.type === "list" ? childIndex : child.name,
        value: valueRemoved
      });
    } else {
      node.calm();
    }
    child.parent = null;
    child.config._rmn = child;
  }
  node.ledger.unmerge(child);
  return node;
}
function eachChild(_node, context, callback) {
  context.children.forEach((child) => !("__FKP" in child) && callback(child));
}
function walkTree(_node, context, callback, stopIfFalse = false, skipSubtreeOnFalse = false) {
  context.children.some((child) => {
    if ("__FKP" in child)
      return false;
    const val = callback(child);
    if (stopIfFalse && val === false)
      return true;
    if (skipSubtreeOnFalse && val === false)
      return false;
    return child.walk(callback, stopIfFalse, skipSubtreeOnFalse);
  });
}
function resetConfig(node, context) {
  const parent = node.parent || void 0;
  context.config = createConfig(node.config._t, parent);
  node.walk((n) => n.resetConfig());
}
function use(node, context, plugin, run2 = true, library = true) {
  if (Array.isArray(plugin) || plugin instanceof Set) {
    plugin.forEach((p) => use(node, context, p));
    return node;
  }
  if (!context.plugins.has(plugin)) {
    if (library && typeof plugin.library === "function")
      plugin.library(node);
    if (run2 && plugin(node) !== false) {
      context.plugins.add(plugin);
      node.children.forEach((child) => child.use(plugin));
    }
  }
  return node;
}
function setIndex(node, _context, _property, setIndex2) {
  if (isNode(node.parent)) {
    const children = node.parent.children;
    const index = setIndex2 >= children.length ? children.length - 1 : setIndex2 < 0 ? 0 : setIndex2;
    const oldIndex = children.indexOf(node);
    if (oldIndex === -1)
      return false;
    children.splice(oldIndex, 1);
    children.splice(index, 0, node);
    node.parent.children = children;
    if (node.parent.type === "list")
      node.parent.disturb().calm({ name: index, value: valueMoved, from: oldIndex });
    return true;
  }
  return false;
}
function getIndex(node) {
  if (node.parent) {
    const index = [...node.parent.children].indexOf(node);
    return index === -1 ? node.parent.children.length : index;
  }
  return -1;
}
function getContext(_node, context) {
  return context;
}
function getName(node, context) {
  var _a;
  if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === "list")
    return node.index;
  return context.name !== useIndex ? context.name : node.index;
}
function getAddress(node, context) {
  return context.parent ? context.parent.address.concat([node.name]) : [node.name];
}
function getNode(node, _context, locator) {
  const address = typeof locator === "string" ? locator.split(node.config.delimiter) : locator;
  if (!address.length)
    return void 0;
  const first = address[0];
  let pointer = node.parent;
  if (!pointer) {
    if (String(address[0]) === String(node.name))
      address.shift();
    pointer = node;
  }
  if (first === "$parent")
    address.shift();
  while (pointer && address.length) {
    const name = address.shift();
    switch (name) {
      case "$root":
        pointer = node.root;
        break;
      case "$parent":
        pointer = pointer.parent;
        break;
      case "$self":
        pointer = node;
        break;
      default:
        pointer = pointer.children.find((c) => !("__FKP" in c) && String(c.name) === String(name)) || select(pointer, name);
    }
  }
  return pointer || void 0;
}
function select(node, selector) {
  const matches = String(selector).match(/^(find)\((.*)\)$/);
  if (matches) {
    const [, action, argStr] = matches;
    const args = argStr.split(",").map((arg) => arg.trim());
    switch (action) {
      case "find":
        return node.find(args[0], args[1]);
      default:
        return void 0;
    }
  }
  return void 0;
}
function find(node, _context, searchTerm, searcher) {
  return bfs(node, searchTerm, searcher);
}
function bfs(tree, searchValue, searchGoal = "name") {
  const search = typeof searchGoal === "string" ? (n) => n[searchGoal] == searchValue : searchGoal;
  const stack = [tree];
  while (stack.length) {
    const node = stack.shift();
    if ("__FKP" in node)
      continue;
    if (search(node, searchValue))
      return node;
    stack.push(...node.children);
  }
  return void 0;
}
function getRoot(n) {
  let node = n;
  while (node.parent) {
    node = node.parent;
  }
  return node;
}
function createConfig(target = {}, parent) {
  let node = void 0;
  return new Proxy(target, {
    get(...args) {
      const prop = args[1];
      if (prop === "_t")
        return target;
      const localValue = Reflect.get(...args);
      if (localValue !== void 0)
        return localValue;
      if (parent) {
        const parentVal = parent.config[prop];
        if (parentVal !== void 0)
          return parentVal;
      }
      if (target.rootConfig && typeof prop === "string") {
        const rootValue = target.rootConfig[prop];
        if (rootValue !== void 0)
          return rootValue;
      }
      if (prop === "delay" && (node === null || node === void 0 ? void 0 : node.type) === "input")
        return 20;
      return defaultConfig[prop];
    },
    set(...args) {
      const prop = args[1];
      const value = args[2];
      if (prop === "_n") {
        node = value;
        if (target.rootConfig)
          target.rootConfig._add(node);
        return true;
      }
      if (prop === "_rmn") {
        if (target.rootConfig)
          target.rootConfig._rm(node);
        node = void 0;
        return true;
      }
      if (!eq(target[prop], value, false)) {
        const didSet = Reflect.set(...args);
        if (node) {
          node.emit(`config:${prop}`, value, false);
          configChange(node, prop, value);
          node.walk((n) => configChange(n, prop, value), false, true);
        }
        return didSet;
      }
      return true;
    }
  });
}
function text(node, _context, key, type = "ui") {
  const fragment = typeof key === "string" ? { key, value: key, type } : key;
  const value = node.hook.text.dispatch(fragment);
  node.emit("text", value, false);
  return value.value;
}
function submit(node) {
  const name = node.name;
  do {
    if (node.props.isForm === true)
      break;
    if (!node.parent)
      error(106, name);
    node = node.parent;
  } while (node);
  if (node.props.id) {
    submitForm(node.props.id);
  }
}
function resetValue(node, _context, value) {
  return reset(node, value);
}
function setErrors$1(node, _context, localErrors, childErrors) {
  const sourceKey = `${node.name}-set`;
  const errors = node.hook.setErrors.dispatch({ localErrors, childErrors });
  createMessages(node, errors.localErrors, errors.childErrors).forEach((errors2) => {
    node.store.apply(errors2, (message) => message.meta.source === sourceKey);
  });
  return node;
}
function clearErrors$1(node, context, clearChildErrors = true, sourceKey) {
  setErrors$1(node, context, []);
  if (clearChildErrors) {
    sourceKey = sourceKey || `${node.name}-set`;
    node.walk((child) => {
      child.store.filter((message) => {
        return !(message.type === "error" && message.meta && message.meta.source === sourceKey);
      });
    });
  }
  return node;
}
function defaultProps(node) {
  if (!has(node.props, "id"))
    node.props.id = `input_${idCount++}`;
  return node;
}
function createProps(initial) {
  const props = {
    initial: typeof initial === "object" ? cloneAny(initial) : initial
  };
  let node;
  let isEmitting = true;
  return new Proxy(props, {
    get(...args) {
      const [_t, prop] = args;
      if (has(props, prop))
        return Reflect.get(...args);
      if (node && typeof prop === "string" && node.config[prop] !== void 0)
        return node.config[prop];
      return void 0;
    },
    set(target, property, originalValue, receiver) {
      if (property === "_n") {
        node = originalValue;
        return true;
      }
      if (property === "_emit") {
        isEmitting = originalValue;
        return true;
      }
      const { prop, value } = node.hook.prop.dispatch({
        prop: property,
        value: originalValue
      });
      if (!eq(props[prop], value, false) || typeof value === "object") {
        const didSet = Reflect.set(target, prop, value, receiver);
        if (isEmitting) {
          node.emit("prop", { prop, value });
          if (typeof prop === "string")
            node.emit(`prop:${prop}`, value);
        }
        return didSet;
      }
      return true;
    }
  });
}
function extend2(node, context, property, trap2) {
  context.traps.set(property, trap2);
  return node;
}
function findDefinition(node, plugins) {
  if (node.props.definition)
    return node.define(node.props.definition);
  for (const plugin of plugins) {
    if (node.props.definition)
      return;
    if (typeof plugin.library === "function") {
      plugin.library(node);
    }
  }
}
function createContext(options) {
  const value = createValue(options);
  const config = createConfig(options.config || {}, options.parent);
  return {
    _d: 0,
    _e: createEmitter(),
    uid: Symbol(),
    _resolve: false,
    _tmo: false,
    _value: value,
    children: dedupe(options.children || []),
    config,
    hook: createHooks(),
    isCreated: false,
    isSettled: true,
    ledger: createLedger(),
    name: createName(options),
    parent: options.parent || null,
    plugins: /* @__PURE__ */ new Set(),
    props: createProps(value),
    settled: Promise.resolve(value),
    store: createStore(true),
    sync: options.sync || false,
    traps: createTraps(),
    type: options.type || "input",
    value
  };
}
function nodeInit(node, options) {
  var _a;
  node.ledger.init(node.store._n = node.props._n = node.config._n = node);
  node.props._emit = false;
  if (options.props)
    Object.assign(node.props, options.props);
  node.props._emit = true;
  findDefinition(node, /* @__PURE__ */ new Set([
    ...options.plugins || [],
    ...node.parent ? node.parent.plugins : []
  ]));
  if (options.plugins) {
    for (const plugin of options.plugins) {
      use(node, node._c, plugin, true, false);
    }
  }
  defaultProps(node);
  node.each((child) => node.add(child));
  if (node.parent)
    node.parent.add(node, options.index);
  if (node.type === "input" && node.children.length)
    error(100, node);
  input(node, node._c, node._value, false);
  node.store.release();
  if ((_a = options.props) === null || _a === void 0 ? void 0 : _a.id)
    register(node);
  node.emit("created", node);
  node.isCreated = true;
  return node;
}
function createPlaceholder(options) {
  var _a, _b, _f, _g;
  return {
    __FKP: true,
    uid: Symbol(),
    name: (_a = options === null || options === void 0 ? void 0 : options.name) !== null && _a !== void 0 ? _a : `p_${nameCount++}`,
    value: (_b = options === null || options === void 0 ? void 0 : options.value) !== null && _b !== void 0 ? _b : null,
    _value: (_f = options === null || options === void 0 ? void 0 : options.value) !== null && _f !== void 0 ? _f : null,
    type: (_g = options === null || options === void 0 ? void 0 : options.type) !== null && _g !== void 0 ? _g : "input",
    use: () => {
    },
    input(value) {
      this._value = value;
      this.value = value;
      return Promise.resolve();
    },
    isSettled: true
  };
}
function isPlaceholder(node) {
  return "__FKP" in node;
}
function createNode(options) {
  const ops = options || {};
  const context = createContext(ops);
  const node = new Proxy(context, {
    get(...args) {
      const [, property] = args;
      if (property === "__FKNode__")
        return true;
      const trap2 = context.traps.get(property);
      if (trap2 && trap2.get)
        return trap2.get(node, context);
      return Reflect.get(...args);
    },
    set(...args) {
      const [, property, value] = args;
      const trap2 = context.traps.get(property);
      if (trap2 && trap2.set)
        return trap2.set(node, context, property, value);
      return Reflect.set(...args);
    }
  });
  return nodeInit(node, ops);
}
function isDOM(node) {
  return typeof node !== "string" && has(node, "$el");
}
function isComponent(node) {
  return typeof node !== "string" && has(node, "$cmp");
}
function isConditional(node) {
  if (!node || typeof node === "string")
    return false;
  return has(node, "if") && has(node, "then");
}
function isSugar(node) {
  return typeof node !== "string" && "$formkit" in node;
}
function sugar(node) {
  if (typeof node === "string") {
    return {
      $el: "text",
      children: node
    };
  }
  if (isSugar(node)) {
    const { $formkit: type, for: iterator, if: condition, children, bind, ...props } = node;
    return Object.assign({
      $cmp: "FormKit",
      props: { ...props, type }
    }, condition ? { if: condition } : {}, iterator ? { for: iterator } : {}, children ? { children } : {}, bind ? { bind } : {});
  }
  return node;
}
function compile(expr) {
  let provideTokens;
  const requirements = /* @__PURE__ */ new Set();
  const x = function expand(operand, tokens) {
    return typeof operand === "function" ? operand(tokens) : operand;
  };
  const operatorRegistry = [
    {
      "&&": (l, r, t) => x(l, t) && x(r, t),
      "||": (l, r, t) => x(l, t) || x(r, t)
    },
    {
      "===": (l, r, t) => !!(x(l, t) === x(r, t)),
      "!==": (l, r, t) => !!(x(l, t) !== x(r, t)),
      "==": (l, r, t) => !!(x(l, t) == x(r, t)),
      "!=": (l, r, t) => !!(x(l, t) != x(r, t)),
      ">=": (l, r, t) => !!(x(l, t) >= x(r, t)),
      "<=": (l, r, t) => !!(x(l, t) <= x(r, t)),
      ">": (l, r, t) => !!(x(l, t) > x(r, t)),
      "<": (l, r, t) => !!(x(l, t) < x(r, t))
    },
    {
      "+": (l, r, t) => x(l, t) + x(r, t),
      "-": (l, r, t) => x(l, t) - x(r, t)
    },
    {
      "*": (l, r, t) => x(l, t) * x(r, t),
      "/": (l, r, t) => x(l, t) / x(r, t),
      "%": (l, r, t) => x(l, t) % x(r, t)
    }
  ];
  const operatorSymbols = operatorRegistry.reduce((s, g) => {
    return s.concat(Object.keys(g));
  }, []);
  const operatorChars = new Set(operatorSymbols.map((key) => key.charAt(0)));
  function getOp(symbols, char, p, expression) {
    const candidates = symbols.filter((s) => s.startsWith(char));
    if (!candidates.length)
      return false;
    return candidates.find((symbol) => {
      if (expression.length >= p + symbol.length) {
        const nextChars = expression.substring(p, p + symbol.length);
        if (nextChars === symbol)
          return symbol;
      }
      return false;
    });
  }
  function getStep(p, expression, direction = 1) {
    let next = direction ? expression.substring(p + 1).trim() : expression.substring(0, p).trim();
    if (!next.length)
      return -1;
    if (!direction) {
      const reversed = next.split("").reverse();
      const start = reversed.findIndex((char2) => operatorChars.has(char2));
      next = reversed.slice(start).join("");
    }
    const char = next[0];
    return operatorRegistry.findIndex((operators) => {
      const symbols = Object.keys(operators);
      return !!getOp(symbols, char, 0, next);
    });
  }
  function getTail(pos, expression) {
    let tail = "";
    const length = expression.length;
    let depth = 0;
    for (let p = pos; p < length; p++) {
      const char = expression.charAt(p);
      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      } else if (depth === 0 && char === " ") {
        continue;
      }
      if (depth === 0 && getOp(operatorSymbols, char, p, expression)) {
        return [tail, p - 1];
      } else {
        tail += char;
      }
    }
    return [tail, expression.length - 1];
  }
  function parseLogicals(expression, step = 0) {
    const operators = operatorRegistry[step];
    const length = expression.length;
    const symbols = Object.keys(operators);
    let depth = 0;
    let quote = false;
    let op = null;
    let operand = "";
    let left = null;
    let operation;
    let lastChar = "";
    let char = "";
    let parenthetical = "";
    let parenQuote = "";
    let startP = 0;
    const addTo = (depth2, char2) => {
      depth2 ? parenthetical += char2 : operand += char2;
    };
    for (let p = 0; p < length; p++) {
      lastChar = char;
      char = expression.charAt(p);
      if ((char === "'" || char === '"') && lastChar !== "\\" && (depth === 0 && !quote || depth && !parenQuote)) {
        if (depth) {
          parenQuote = char;
        } else {
          quote = char;
        }
        addTo(depth, char);
        continue;
      } else if (quote && (char !== quote || lastChar === "\\") || parenQuote && (char !== parenQuote || lastChar === "\\")) {
        addTo(depth, char);
        continue;
      } else if (quote === char) {
        quote = false;
        addTo(depth, char);
        continue;
      } else if (parenQuote === char) {
        parenQuote = false;
        addTo(depth, char);
        continue;
      } else if (char === " ") {
        continue;
      } else if (char === "(") {
        if (depth === 0) {
          startP = p;
        } else {
          parenthetical += char;
        }
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth === 0) {
          const fn = typeof operand === "string" && operand.startsWith("$") ? operand : void 0;
          const hasTail = fn && expression.charAt(p + 1) === ".";
          let tail = "";
          if (hasTail) {
            [tail, p] = getTail(p + 2, expression);
          }
          const lStep = op ? step : getStep(startP, expression, 0);
          const rStep = getStep(p, expression);
          if (lStep === -1 && rStep === -1) {
            operand = evaluate(parenthetical, -1, fn, tail);
          } else if (op && (lStep >= rStep || rStep === -1) && step === lStep) {
            left = op.bind(null, evaluate(parenthetical, -1, fn, tail));
            op = null;
            operand = "";
          } else if (rStep > lStep && step === rStep) {
            operand = evaluate(parenthetical, -1, fn, tail);
          } else {
            operand += `(${parenthetical})${hasTail ? `.${tail}` : ""}`;
          }
          parenthetical = "";
        } else {
          parenthetical += char;
        }
      } else if (depth === 0 && (operation = getOp(symbols, char, p, expression))) {
        if (p === 0) {
          error(103, [operation, expression]);
        }
        p += operation.length - 1;
        if (p === expression.length - 1) {
          error(104, [operation, expression]);
        }
        if (!op) {
          if (left) {
            op = operators[operation].bind(null, evaluate(left, step));
            left = null;
          } else {
            op = operators[operation].bind(null, evaluate(operand, step));
            operand = "";
          }
        } else if (operand) {
          left = op.bind(null, evaluate(operand, step));
          op = operators[operation].bind(null, left);
          operand = "";
        }
        continue;
      } else {
        addTo(depth, char);
      }
    }
    if (operand && op) {
      op = op.bind(null, evaluate(operand, step));
    }
    op = !op && left ? left : op;
    if (!op && operand) {
      op = (v, t) => {
        return typeof v === "function" ? v(t) : v;
      };
      op = op.bind(null, evaluate(operand, step));
    }
    if (!op && !operand) {
      error(105, expression);
    }
    return op;
  }
  function evaluate(operand, step, fnToken, tail) {
    if (fnToken) {
      const fn = evaluate(fnToken, operatorRegistry.length);
      let userFuncReturn;
      let tailCall = tail ? compile(`$${tail}`) : false;
      if (typeof fn === "function") {
        const args = parseArgs(String(operand)).map((arg) => evaluate(arg, -1));
        return (tokens) => {
          const userFunc = fn(tokens);
          if (typeof userFunc !== "function") {
            warn(150, fnToken);
            return userFunc;
          }
          userFuncReturn = userFunc(...args.map((arg) => typeof arg === "function" ? arg(tokens) : arg));
          if (tailCall) {
            tailCall = tailCall.provide((subTokens) => {
              const rootTokens = provideTokens(subTokens);
              const t = subTokens.reduce((tokenSet, token2) => {
                const isTail = token2 === tail || (tail === null || tail === void 0 ? void 0 : tail.startsWith(`${token2}(`));
                if (isTail) {
                  const value = getAt(userFuncReturn, token2);
                  tokenSet[token2] = () => value;
                } else {
                  tokenSet[token2] = rootTokens[token2];
                }
                return tokenSet;
              }, {});
              return t;
            });
          }
          return tailCall ? tailCall() : userFuncReturn;
        };
      }
    } else if (typeof operand === "string") {
      if (operand === "true")
        return true;
      if (operand === "false")
        return false;
      if (operand === "undefined")
        return void 0;
      if (isQuotedString(operand))
        return rmEscapes(operand.substring(1, operand.length - 1));
      if (!isNaN(+operand))
        return Number(operand);
      if (step < operatorRegistry.length - 1) {
        return parseLogicals(operand, step + 1);
      } else {
        if (operand.startsWith("$")) {
          const cleaned = operand.substring(1);
          requirements.add(cleaned);
          return function getToken(tokens) {
            return cleaned in tokens ? tokens[cleaned]() : void 0;
          };
        }
        return operand;
      }
    }
    return operand;
  }
  const compiled = parseLogicals(expr.startsWith("$:") ? expr.substring(2) : expr);
  const reqs = Array.from(requirements);
  function provide(callback) {
    provideTokens = callback;
    return Object.assign(compiled.bind(null, callback(reqs)), {
      provide
    });
  }
  return Object.assign(compiled, {
    provide
  });
}
function createClasses(propertyKey, node, sectionClassList) {
  if (!sectionClassList)
    return {};
  if (typeof sectionClassList === "string") {
    const classKeys = sectionClassList.split(" ");
    return classKeys.reduce((obj, key) => Object.assign(obj, { [key]: true }), {});
  } else if (typeof sectionClassList === "function") {
    return createClasses(propertyKey, node, sectionClassList(node, propertyKey));
  }
  return sectionClassList;
}
function generateClassList(node, property, ...args) {
  const combinedClassList = args.reduce((finalClassList, currentClassList) => {
    if (!currentClassList)
      return handleNegativeClasses(finalClassList);
    const { $reset, ...classList } = currentClassList;
    if ($reset) {
      return handleNegativeClasses(classList);
    }
    return handleNegativeClasses(Object.assign(finalClassList, classList));
  }, {});
  return Object.keys(node.hook.classes.dispatch({ property, classes: combinedClassList }).classes).filter((key) => combinedClassList[key]).join(" ") || null;
}
function handleNegativeClasses(classList) {
  const removalToken = "$remove:";
  let hasNegativeClassValue = false;
  const applicableClasses = Object.keys(classList).filter((className) => {
    if (classList[className] && className.startsWith(removalToken)) {
      hasNegativeClassValue = true;
    }
    return classList[className];
  });
  if (applicableClasses.length > 1 && hasNegativeClassValue) {
    const negativeClasses = applicableClasses.filter((className) => className.startsWith(removalToken));
    negativeClasses.map((negativeClass) => {
      const targetClass = negativeClass.substring(removalToken.length);
      classList[targetClass] = false;
      classList[negativeClass] = false;
    });
  }
  return classList;
}
function setErrors(id2, localErrors, childErrors) {
  const node = getNode$1(id2);
  if (node) {
    node.setErrors(localErrors, childErrors);
  } else {
    warn(651, id2);
  }
}
function clearErrors(id2, clearChildren = true) {
  const node = getNode$1(id2);
  if (node) {
    node.clearErrors(clearChildren);
  } else {
    warn(652, id2);
  }
}
var FORMKIT_VERSION = "0.17.2";

// node_modules/@formkit/observer/dist/index.mjs
var revokedObservers = /* @__PURE__ */ new WeakSet();
function createObserver(node, dependencies) {
  const deps = dependencies || Object.assign(/* @__PURE__ */ new Map(), { active: false });
  const receipts2 = /* @__PURE__ */ new Map();
  const addDependency = function(event) {
    var _a;
    if (!deps.active)
      return;
    if (!deps.has(node))
      deps.set(node, /* @__PURE__ */ new Set());
    (_a = deps.get(node)) === null || _a === void 0 ? void 0 : _a.add(event);
  };
  const observeProps = function(props) {
    return new Proxy(props, {
      get(...args) {
        typeof args[1] === "string" && addDependency(`prop:${args[1]}`);
        return Reflect.get(...args);
      }
    });
  };
  const observeLedger = function(ledger) {
    return new Proxy(ledger, {
      get(...args) {
        if (args[1] === "value") {
          return (key) => {
            addDependency(`count:${key}`);
            return ledger.value(key);
          };
        }
        return Reflect.get(...args);
      }
    });
  };
  const observe = function(value, property) {
    if (isNode(value)) {
      return createObserver(value, deps);
    }
    if (property === "value")
      addDependency("commit");
    if (property === "_value")
      addDependency("input");
    if (property === "props")
      return observeProps(value);
    if (property === "ledger")
      return observeLedger(value);
    return value;
  };
  const { proxy: observed, revoke } = Proxy.revocable(node, {
    get(...args) {
      switch (args[1]) {
        case "_node":
          return node;
        case "deps":
          return deps;
        case "watch":
          return (block, after) => watch(observed, block, after);
        case "observe":
          return () => {
            const old = new Map(deps);
            deps.clear();
            deps.active = true;
            return old;
          };
        case "stopObserve":
          return () => {
            const newDeps = new Map(deps);
            deps.active = false;
            return newDeps;
          };
        case "receipts":
          return receipts2;
        case "kill":
          return () => {
            removeListeners(receipts2);
            revokedObservers.add(args[2]);
            revoke();
            return void 0;
          };
      }
      const value = Reflect.get(...args);
      if (typeof value === "function") {
        return (...subArgs) => {
          const subValue = value(...subArgs);
          return observe(subValue, args[1]);
        };
      }
      return observe(value, args[1]);
    }
  });
  return observed;
}
function applyListeners(node, [toAdd, toRemove], callback) {
  toAdd.forEach((events, depNode) => {
    events.forEach((event) => {
      var _a;
      node.receipts.has(depNode) || node.receipts.set(depNode, {});
      node.receipts.set(depNode, Object.assign((_a = node.receipts.get(depNode)) !== null && _a !== void 0 ? _a : {}, {
        [event]: depNode.on(event, callback)
      }));
    });
  });
  toRemove.forEach((events, depNode) => {
    events.forEach((event) => {
      if (node.receipts.has(depNode)) {
        const nodeReceipts = node.receipts.get(depNode);
        if (nodeReceipts && has(nodeReceipts, event)) {
          depNode.off(nodeReceipts[event]);
          delete nodeReceipts[event];
          node.receipts.set(depNode, nodeReceipts);
        }
      }
    });
  });
}
function removeListeners(receipts2) {
  receipts2.forEach((events, node) => {
    for (const event in events) {
      node.off(events[event]);
    }
  });
}
function watch(node, block, after) {
  const doAfterObservation = (res2) => {
    const newDeps = node.stopObserve();
    applyListeners(node, diffDeps(oldDeps, newDeps), () => watch(node, block, after));
    if (after)
      after(res2);
  };
  const oldDeps = new Map(node.deps);
  node.observe();
  const res = block(node);
  if (res instanceof Promise)
    res.then((val) => doAfterObservation(val));
  else
    doAfterObservation(res);
}
function diffDeps(previous, current) {
  const toAdd = /* @__PURE__ */ new Map();
  const toRemove = /* @__PURE__ */ new Map();
  current.forEach((events, node) => {
    if (!previous.has(node)) {
      toAdd.set(node, events);
    } else {
      const eventsToAdd = /* @__PURE__ */ new Set();
      const previousEvents = previous.get(node);
      events.forEach((event) => !(previousEvents === null || previousEvents === void 0 ? void 0 : previousEvents.has(event)) && eventsToAdd.add(event));
      toAdd.set(node, eventsToAdd);
    }
  });
  previous.forEach((events, node) => {
    if (!current.has(node)) {
      toRemove.set(node, events);
    } else {
      const eventsToRemove = /* @__PURE__ */ new Set();
      const newEvents = current.get(node);
      events.forEach((event) => !(newEvents === null || newEvents === void 0 ? void 0 : newEvents.has(event)) && eventsToRemove.add(event));
      toRemove.set(node, eventsToRemove);
    }
  });
  return [toAdd, toRemove];
}
function isKilled(node) {
  return revokedObservers.has(node);
}

// node_modules/@formkit/validation/dist/index.mjs
var validatingMessage = createMessage({
  type: "state",
  blocking: true,
  visible: false,
  value: true,
  key: "validating"
});
function createValidationPlugin(baseRules = {}) {
  return function validationPlugin(node) {
    let propRules = cloneAny(node.props.validationRules || {});
    let availableRules = { ...baseRules, ...propRules };
    let observedNode = createObserver(node);
    const state = { input: token(), rerun: null, isPassing: true };
    let validation2 = cloneAny(node.props.validation);
    node.on("prop:validation", ({ payload }) => reboot(payload, availableRules));
    node.on("prop:validationRules", ({ payload }) => reboot(validation2, payload));
    function reboot(newValidation, newRules) {
      var _a;
      if (eq(Object.keys(propRules || {}), Object.keys(newRules || {})) && eq(validation2, newValidation))
        return;
      propRules = cloneAny(newRules);
      validation2 = cloneAny(newValidation);
      availableRules = { ...baseRules, ...propRules };
      removeListeners(observedNode.receipts);
      (_a = node.props.parsedRules) === null || _a === void 0 ? void 0 : _a.forEach((validation3) => {
        var _a2;
        validation3.messageObserver = (_a2 = validation3.messageObserver) === null || _a2 === void 0 ? void 0 : _a2.kill();
      });
      node.store.filter(() => false, "validation");
      node.props.parsedRules = parseRules(newValidation, availableRules);
      observedNode.kill();
      observedNode = createObserver(node);
      validate(observedNode, node.props.parsedRules, state);
    }
    node.props.parsedRules = parseRules(validation2, availableRules);
    validate(observedNode, node.props.parsedRules, state);
  };
}
function validate(node, validations, state) {
  if (isKilled(node))
    return;
  state.input = token();
  state.isPassing = true;
  node.store.filter((message) => !message.meta.removeImmediately, "validation");
  validations.forEach((validation2) => validation2.debounce && clearTimeout(validation2.timer));
  if (validations.length) {
    node.store.set(validatingMessage);
    run(0, validations, node, state, false, () => {
      node.store.remove(validatingMessage.key);
    });
  }
}
function run(current, validations, node, state, removeImmediately, complete) {
  const validation2 = validations[current];
  if (!validation2)
    return complete();
  const currentRun = state.input;
  validation2.state = null;
  function next(async, result) {
    state.isPassing = state.isPassing && !!result;
    validation2.queued = false;
    const newDeps = node.stopObserve();
    applyListeners(node, diffDeps(validation2.deps, newDeps), () => {
      validation2.queued = true;
      if (state.rerun)
        clearTimeout(state.rerun);
      state.rerun = setTimeout(validate, 0, node, validations, state);
    });
    validation2.deps = newDeps;
    if (state.input === currentRun) {
      validation2.state = result;
      if (result === false) {
        createFailedMessage(node, validation2, removeImmediately || async);
      } else {
        removeMessage2(node, validation2);
      }
      if (validations.length > current + 1) {
        run(current + 1, validations, node, state, removeImmediately || async, complete);
      } else {
        complete();
      }
    }
  }
  if ((!empty(node.value) || !validation2.skipEmpty) && (state.isPassing || validation2.force)) {
    if (validation2.queued) {
      runRule(validation2, node, (result) => {
        result instanceof Promise ? result.then((r) => next(true, r)) : next(false, result);
      });
    } else {
      run(current + 1, validations, node, state, removeImmediately, complete);
    }
  } else {
    if (empty(node.value) && validation2.skipEmpty && state.isPassing) {
      node.observe();
      node.value;
      next(false, state.isPassing);
    } else {
      next(false, null);
    }
  }
}
function runRule(validation2, node, after) {
  if (validation2.debounce) {
    validation2.timer = setTimeout(() => {
      node.observe();
      after(validation2.rule(node, ...validation2.args));
    }, validation2.debounce);
  } else {
    node.observe();
    after(validation2.rule(node, ...validation2.args));
  }
}
function removeMessage2(node, validation2) {
  const key = `rule_${validation2.name}`;
  if (validation2.messageObserver) {
    validation2.messageObserver = validation2.messageObserver.kill();
  }
  if (has(node.store, key)) {
    node.store.remove(key);
  }
}
function createFailedMessage(node, validation2, removeImmediately) {
  if (isKilled(node))
    return;
  if (!validation2.messageObserver) {
    validation2.messageObserver = createObserver(node._node);
  }
  validation2.messageObserver.watch((node2) => {
    const i18nArgs = createI18nArgs(node2, validation2);
    return i18nArgs;
  }, (i18nArgs) => {
    const customMessage = createCustomMessage(node, validation2, i18nArgs);
    const message = createMessage({
      blocking: validation2.blocking,
      key: `rule_${validation2.name}`,
      meta: {
        /**
         * Use this key instead of the message root key to produce i18n validation
         * messages.
         */
        messageKey: validation2.name,
        /**
         * For messages that were created *by or after* a debounced or async
         * validation rule — we make note of it so we can immediately remove them
         * as soon as the next commit happens.
         */
        removeImmediately,
        /**
         * Determines if this message should be passed to localization.
         */
        localize: !customMessage,
        /**
         * The arguments that will be passed to the validation rules
         */
        i18nArgs
      },
      type: "validation",
      value: customMessage || "This field is not valid."
    });
    node.store.set(message);
  });
}
function createCustomMessage(node, validation2, i18nArgs) {
  const customMessage = node.props.validationMessages && has(node.props.validationMessages, validation2.name) ? node.props.validationMessages[validation2.name] : void 0;
  if (typeof customMessage === "function") {
    return customMessage(...i18nArgs);
  }
  return customMessage;
}
function createI18nArgs(node, validation2) {
  return [
    {
      node,
      name: createMessageName(node),
      args: validation2.args
    }
  ];
}
function createMessageName(node) {
  if (typeof node.props.validationLabel === "function") {
    return node.props.validationLabel(node);
  }
  return node.props.validationLabel || node.props.label || node.props.name || String(node.name);
}
var hintPattern = "(?:[\\*+?()0-9]+)";
var rulePattern = "[a-zA-Z][a-zA-Z0-9_]+";
var ruleExtractor = new RegExp(`^(${hintPattern}?${rulePattern})(?:\\:(.*)+)?$`, "i");
var hintExtractor = new RegExp(`^(${hintPattern})(${rulePattern})$`, "i");
var debounceExtractor = /([\*+?]+)?(\(\d+\))([\*+?]+)?/;
var hasDebounce = /\(\d+\)/;
var defaultHints = {
  blocking: true,
  debounce: 0,
  force: false,
  skipEmpty: true,
  name: ""
};
function parseRules(validation2, rules) {
  if (!validation2)
    return [];
  const intents = typeof validation2 === "string" ? extractRules(validation2) : clone(validation2);
  return intents.reduce((validations, args) => {
    let rule = args.shift();
    const hints = {};
    if (typeof rule === "string") {
      const [ruleName, parsedHints] = parseHints(rule);
      if (has(rules, ruleName)) {
        rule = rules[ruleName];
        Object.assign(hints, parsedHints);
      }
    }
    if (typeof rule === "function") {
      validations.push({
        rule,
        args,
        timer: 0,
        state: null,
        queued: true,
        deps: /* @__PURE__ */ new Map(),
        ...defaultHints,
        ...fnHints(hints, rule)
      });
    }
    return validations;
  }, []);
}
function extractRules(validation2) {
  return validation2.split("|").reduce((rules, rule) => {
    const parsedRule = parseRule(rule);
    if (parsedRule) {
      rules.push(parsedRule);
    }
    return rules;
  }, []);
}
function parseRule(rule) {
  const trimmed = rule.trim();
  if (trimmed) {
    const matches = trimmed.match(ruleExtractor);
    if (matches && typeof matches[1] === "string") {
      const ruleName = matches[1].trim();
      const args = matches[2] && typeof matches[2] === "string" ? matches[2].split(",").map((s) => s.trim()) : [];
      return [ruleName, ...args];
    }
  }
  return false;
}
function parseHints(ruleName) {
  const matches = ruleName.match(hintExtractor);
  if (!matches) {
    return [ruleName, { name: ruleName }];
  }
  const map = {
    "*": { force: true },
    "+": { skipEmpty: false },
    "?": { blocking: false }
  };
  const [, hints, rule] = matches;
  const hintGroups = hasDebounce.test(hints) ? hints.match(debounceExtractor) || [] : [, hints];
  return [
    rule,
    [hintGroups[1], hintGroups[2], hintGroups[3]].reduce((hints2, group) => {
      if (!group)
        return hints2;
      if (hasDebounce.test(group)) {
        hints2.debounce = parseInt(group.substr(1, group.length - 1));
      } else {
        group.split("").forEach((hint) => has(map, hint) && Object.assign(hints2, map[hint]));
      }
      return hints2;
    }, { name: rule })
  ];
}
function fnHints(existingHints, rule) {
  if (!existingHints.name) {
    existingHints.name = rule.ruleName || rule.name;
  }
  return ["skipEmpty", "force", "debounce", "blocking"].reduce((hints, hint) => {
    if (has(rule, hint) && !has(hints, hint)) {
      Object.assign(hints, {
        [hint]: rule[hint]
      });
    }
    return hints;
  }, existingHints);
}

// node_modules/@formkit/i18n/dist/index.mjs
function sentence(str) {
  return str[0].toUpperCase() + str.substr(1);
}
function list(items, conjunction = "or") {
  return items.reduce((oxford, item, index) => {
    oxford += item;
    if (index <= items.length - 2 && items.length > 2) {
      oxford += ", ";
    }
    if (index === items.length - 2) {
      oxford += `${items.length === 2 ? " " : ""}${conjunction} `;
    }
    return oxford;
  }, "");
}
function date(date2) {
  const dateTime = typeof date2 === "string" ? new Date(Date.parse(date2)) : date2;
  if (!(dateTime instanceof Date)) {
    return "(unknown)";
  }
  return new Intl.DateTimeFormat(void 0, {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(dateTime);
}
function order(first, second) {
  return Number(first) >= Number(second) ? [second, first] : [first, second];
}
var ui$D = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "إضافة",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "إزالة",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "إزالة الكل",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "عذرا، لم يتم تعبئة جميع الحقول بشكل صحيح.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "إرسال",
  /**
   * Shown when no files are selected.
   */
  noFiles: "لا يوجد ملف مختار",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "تحرك لأعلى",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "انتقل لأسفل",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "يتم الآن التحميل...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "تحميل المزيد",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "التالي",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "السابق",
  /**
   * Shown when transferring items between lists.
   */
  addAllValues: "أضف جميع القيم",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "إضافة قيم محددة",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "قم بإزالة جميع القيم",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "إزالة القيم المحددة",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "اختر التاريخ",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "تاريخ التغيير",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "التاريخ المحدد غير صالح."
};
var validation$D = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `الرجاء قبول ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `يجب أن يكون ${sentence(name)} بعد ${date(args[0])}.`;
    }
    return `يجب أن يكون ${sentence(name)} في المستقبل.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `يمكن أن يحتوي ${sentence(name)} على أحرف أبجدية فقط.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `يمكن أن يحتوي ${sentence(name)} على أحرف وأرقام فقط.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `يمكن أن تحتوي ${sentence(name)} على أحرف ومسافات فقط.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على أحرف أبجدية.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على أحرف أو أرقام.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على أحرف أو مسافات.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على رمز.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على أحرف كبيرة.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على أحرف صغيرة.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `يجب أن يحتوي ${sentence(name)} على أرقام.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `يجب أن يكون ${sentence(name)} رمزًا.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `يمكن أن يحتوي ${sentence(name)} على أحرف كبيرة فقط.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `يمكن أن يحتوي ${sentence(name)} على أحرف صغيرة فقط.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `يجب أن يكون ${sentence(name)} قبل ${date(args[0])}.`;
    }
    return `يجب أن يكون ${sentence(name)} في الماضي.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `تمت تهيئة هذا الحقل بشكل غير صحيح ولا يمكن إرساله.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `يجب أن يكون ${sentence(name)} ما بين ${a} و ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} غير متطابق.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ليس تاريخًا صالحًا ، يرجى استخدام التنسيق ${args[0]}`;
    }
    return "تمت تهيئة هذا الحقل بشكل غير صحيح ولا يمكن إرساله";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `يجب أن يكون ${sentence(name)} بين ${date(args[0])} و ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "الرجاء أدخال بريد إليكتروني صالح.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `لا ينتهي ${sentence(name)} بـ ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} ليست قيمة مسموح بها.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `يجب أن يكون ${sentence(name)} حرفًا واحدًا على الأقل.`;
    }
    if (min == 0 && max) {
      return `يجب أن يكون ${sentence(name)} أقل من أو يساوي ${max} حرفًا.`;
    }
    if (min === max) {
      return `يجب أن يتكون ${sentence(name)} من الأحرف ${max}.`;
    }
    if (min && max === Infinity) {
      return `يجب أن يكون ${sentence(name)} أكبر من أو يساوي ${min} حرفًا.`;
    }
    return `يجب أن يكون ${sentence(name)} بين ${min} و ${max} حرفًا.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} ليست قيمة مسموح بها.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `لا يمكن أن يكون أكثر من ${args[0]} ${name}.`;
    }
    return `يجب أن يكون ${sentence(name)} أقل من أو يساوي ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "لا يسمح بتنسيقات الملفات.";
    }
    return `يجب أن يكون ${sentence(name)} من النوع: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `لا يمكن أن يكون أقل من ${args[0]} ${name}.`;
    }
    return `يجب أن يكون ${sentence(name)} على الأقل ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” ليس ${name} مسموحًا به.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} يجب ان يكون رقماً`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" أو ")} مطلوب.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} مطلوب.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `لا يبدأ ${sentence(name)} بـ ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `يرجى إدخال عنوان URL صالح.`;
  }
};
var ar = Object.freeze({
  __proto__: null,
  ui: ui$D,
  validation: validation$D
});
var ui$C = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "əlavə edin",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "çıxarmaq",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Hamısını silin",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Üzr istəyirik, bütün sahələr düzgün doldurulmayıb.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Təqdim et",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Heç bir fayl seçilməyib",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "yuxarı hərəkət",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Aşağı hərəkət",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Yükləmə...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Daha çox yüklə",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Növbəti",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Əvvəlki",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Bütün dəyərləri əlavə edin",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Seçilmiş dəyərləri əlavə edin",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Bütün dəyərləri sil",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Seçilmiş dəyərləri sil",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Tarixi seçin",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Tarixi dəyişdirin",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Seçilmiş tarix etibarsızdır."
};
var validation$C = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `${name} qəbul edin.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} sonra olmalıdır.`;
    }
    return `${sentence(name)} gələcəkdə olmalıdır.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} yalnız əlifba sırası simvollarından ibarət ola bilər.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} yalnız hərf və rəqəmlərdən ibarət ola bilər.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} yalnız hərflərdən və boşluqlardan ibarət ola bilər.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} əlifba sırası simvolları ehtiva etməlidir.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} hərfləri və ya nömrələri ehtiva etməlidir.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} hərfləri və ya boşluqları ehtiva etməlidir.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} simvolu ehtiva etməlidir.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} böyük olmalıdır.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} kiçik olmalıdır.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} nömrələri ehtiva etməlidir.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} simvol olmalıdır.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} yalnız böyük hərfləri ehtiva edə bilər.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} yalnız kiçik hərfləri ehtiva edə bilər.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} əvvəl olmalıdır.`;
    }
    return `${sentence(name)} keçmişdə olmalıdır.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Bu sahə səhv konfiqurasiya edilib və onu təqdim etmək mümkün deyil.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} ${a} və ${b} arasında olmalıdır.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} uyğun gəlmir.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} etibarlı tarix deyil, ${args[0]} formatından istifadə edin`;
    }
    return "Bu sahə səhv konfiqurasiya edilib və onu təqdim etmək mümkün deyil";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} ${date(args[0])} və ${date(args[1])} arasında olmalıdır`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Etibarlı e-poçt ünvanı daxil edin.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} ${list(args)} ilə bitmir.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} icazə verilən dəyər deyil.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} ən azı bir simvol olmalıdır.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} ${max} simvoldan kiçik və ya ona bərabər olmalıdır.`;
    }
    if (min === max) {
      return `${sentence(name)} ${max} simvol uzunluğunda olmalıdır.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} ${min} simvoldan böyük və ya ona bərabər olmalıdır.`;
    }
    return `${sentence(name)} ${min} və ${max} simvol arasında olmalıdır.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} icazə verilən dəyər deyil.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${args[0]} ${name}-dən çox ola bilməz.`;
    }
    return `${sentence(name)} ${args[0]} dəyərindən kiçik və ya ona bərabər olmalıdır.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Fayl formatlarına icazə verilmir.";
    }
    return `${sentence(name)} aşağıdakı tipdə olmalıdır: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${args[0]} ${name}-dən az ola bilməz.`;
    }
    return `${sentence(name)} ən azı ${args[0]} olmalıdır.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” icazə verilən ${name} deyil.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} rəqəm olmalıdır.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" və ya ")} tələb olunur.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} tələb olunur.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ${list(args)} ilə başlamır.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Xahiş edirik, düzgün URL daxil edin.`;
  }
};
var az = Object.freeze({
  __proto__: null,
  ui: ui$C,
  validation: validation$C
});
var ui$B = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Добави",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Премахни",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Премахни всички",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Извинете, не всички полета са попълнени правилно.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Изпрати",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Няма избран файл",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Преместване нагоре",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Преместете се надолу",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Зареждане...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Заредете повече",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Следващ",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Предишен",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Добавете всички стойности",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Добавяне на избрани стойности",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Премахнете всички стойности",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Премахване на избраните стойности",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Избери дата",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Промяна на датата",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Избраната дата е невалидна."
};
var validation$B = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Моля приемете ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} трябва да е след ${date(args[0])}.`;
    }
    return `${sentence(name)} трябва да бъде в бъдещето.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} може да съдържа само букви.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} може да съдържа само букви и цифри.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} може да съдържа само букви и интервали.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} трябва да съдържа азбучни знаци.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} трябва да съдържа букви или цифри.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} трябва да съдържа букви или интервали.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} трябва да съдържа символ.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} трябва да съдържа главни букви.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} трябва да съдържа малки букви.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} трябва да съдържа числа.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} трябва да бъде символ.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} може да съдържа само главни букви.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} може да съдържа само малки букви.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} трябва да е преди ${date(args[0])}.`;
    }
    return `${sentence(name)} трябва да бъде в миналото.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Това поле е конфигурирано неправилно и не може да бъде изпратено`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} трябва да бъде между ${a} и ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} не съвпада.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} е невалидна дата. Моля, използвайте формата ${args[0]}`;
    }
    return "Това поле е конфигурирано неправилно и не може да бъде изпратено";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} трябва да бъде между ${date(args[0])} и ${date(args[1])}.`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Моля, въведете валиден имейл адрес.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} не завършва на ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} е неразрешена стойност.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} трябва да има поне един символ.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} трябва да бъде по-малко или равно на ${max} символа.`;
    }
    if (min === max) {
      return `${sentence(name)} трябва да бъде ${max} символи дълго.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} трябва да бъде по-голямо или равно на ${min} символа.`;
    }
    return `${sentence(name)} трябва да бъде между ${min} и ${max} символа.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} е неразрешена стойност.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Не може да има повече от ${args[0]} ${name}.`;
    }
    return `${sentence(name)} трябва да бъде по-малко или равно на ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Не са разрешени никакви файлови формати.";
    }
    return `${sentence(name)} трябва да бъде от тип: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Не може да има по-малко от ${args[0]} ${name}.`;
    }
    return `${sentence(name)} трябва да бъде поне ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” е неразрешен ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} трябва да бъде число.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" или ")} изисква се.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} е задължително.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} не започва с ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Моля, въведете валиден URL адрес.`;
  }
};
var bg = Object.freeze({
  __proto__: null,
  ui: ui$B,
  validation: validation$B
});
var ui$A = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Afegir",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Eliminar",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Eliminar tot",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Disculpi, no tots els camps estan omplerts correctament.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Enviar",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Cap fitxer triat",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Moure amunt",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Moure avall",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Carregant...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Carregar més",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Següent",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Anterior",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Afegir tots els valors",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Afegeix els valors seleccionats",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Eliminar tots els valors",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Elimina els valors seleccionats",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Trieu la data",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Canviar data",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "La data seleccionada no és vàlida."
};
var validation$A = {
  /**
   * The value is not an accepted value.
   * @see {@link https://docs.formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Si us plau accepti ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://docs.formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ha de ser posterior a ${date(args[0])}.`;
    }
    return `${sentence(name)} ha de succeïr al futur.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://docs.formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} només pot contenir caràcters alfabètics.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://docs.formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} només pot contenir lletres i números.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://docs.formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} només pot contenir lletres i espais.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} ha de contenir caràcters alfabètics.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} ha de contenir lletres o números.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} ha de contenir lletres o espais.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} ha de contenir símbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} ha de contenir majúscules.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} ha de contenir minúscules.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} ha de contenir números.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} ha de ser un símbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} només pot contenir lletres majúscules.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} només pot contenir lletres minúscules.`;
  },
  /**
   * The date is not before
   * @see {@link https://docs.formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ha de ser anterior a ${date(args[0])}.`;
    }
    return `${sentence(name)} ha d'estar al passat.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://docs.formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Aquest camp està configurat incorrectament i no pot ésser enviat.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} ha d'estar entre ${a} i ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://docs.formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} no concorda.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://docs.formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} no és una data vàlida, si us plau empri el format ${args[0]}`;
    }
    return "Aquest camp està configurat incorrectament i no pot ésser enviat";
  },
  /**
   * Is not within expected date range
   * @see {@link https://docs.formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} ha d'estar entre ${date(args[0])} i ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://docs.formkit.com/essentials/validation#email}
   */
  email: `Si us plau, entri una adreça d'e-mail vàlida.`,
  /**
   * Does not end with the specified value
   * @see {@link https://docs.formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} no acaba amb ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://docs.formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} no és un valor acceptat.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://docs.formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} ha de tenir com a mínim un caràcter.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} ha de ser inferior o igual a ${max} caràcters.`;
    }
    if (min === max) {
      return `${sentence(name)} ha de tenir una longitud de ${max} caràcters.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} ha de ser major que o igual a ${min} caràcters.`;
    }
    return `${sentence(name)} ha d'estar entre ${min} i ${max} caràcters.`;
  },
  /**
   * Value is not a match
   * @see {@link https://docs.formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} no és un valor permès.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://docs.formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `No pot tenir més de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} ha de ser menys que o igual a ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://docs.formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "No hi ha cap format de fitxer acceptat.";
    }
    return `${sentence(name)} ha de ser del tipus: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://docs.formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `No pot tenir menys de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} ha de ser com a mínim ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://docs.formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” no s'accepta com a ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://docs.formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} ha de ser un número.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" o ")} es requereix.`;
  },
  /**
   * Required field.
   * @see {@link https://docs.formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} és obligatori.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://docs.formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} no comença amb ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://docs.formkit.com/essentials/validation#url}
   */
  url() {
    return `Si us plau inclogui una url vàlida.`;
  }
};
var ca = Object.freeze({
  __proto__: null,
  ui: ui$A,
  validation: validation$A
});
var ui$z = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Přidat",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Odebrat",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Odebrat vše",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Pardon, ale ne všechna pole jsou vyplněna správně.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Odeslat",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Žádný soubor nebyl vybrán",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Pohyb nahoru",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Posunout dolů",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Načítání...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Načíst více",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Další",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Předchozí",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Přidat všechny hodnoty",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Přidání vybraných hodnot",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Odstraňte všechny hodnoty",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Odstranění vybraných hodnot",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Zvolte datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Změnit datum",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Vybrané datum je neplatné."
};
var validation$z = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Prosím, zaškrtněte ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} musí být po ${date(args[0])}.`;
    }
    return `${sentence(name)} musí být v budoucnosti.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} může obsahovat pouze písmena.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} může obsahovat pouze písmena a čísla.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} musí obsahovat abecední znaky.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} musí obsahovat písmena nebo číslice.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} musí obsahovat písmena nebo mezery.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} musí obsahovat symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} musí obsahovat velká písmena.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} musí obsahovat malá písmena.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} musí obsahovat čísla.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} musí být symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} může obsahovat pouze velká písmena.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} může obsahovat pouze malá písmena.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} musí být před ${date(args[0])}.`;
    }
    return `${sentence(name)} musí být v minulosti.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Toto pole bylo špatně nakonfigurováno a nemůže být odesláno.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} musí být mezi ${a} a ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} nejsou shodná.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} není platné datum, prosím, použijte formát ${args[0]}`;
    }
    return "Toto pole bylo špatně nakonfigurováno a nemůže být odesláno.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} musí být mezi ${date(args[0])} a ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Prosím, zadejte platnou e-mailovou adresu.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} nekončí na ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} není povolená hodnota.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} musí mít nejméně jeden znak.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} může mít maximálně ${max} znaků.`;
    }
    if (min === max) {
      return `${sentence(name)} by mělo být ${max} znaků dlouhé.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} musí obsahovat minimálně ${min} znaků.`;
    }
    return `${sentence(name)} musí být dlouhé ${min} až ${max} znaků.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} není povolená hodnota.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nelze použít více než ${args[0]} ${name}.`;
    }
    return `${sentence(name)} musí mít menší nebo rovno než ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Nejsou nakonfigurovány povolené typy souborů.";
    }
    return `${sentence(name)} musí být typu: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nelze mít méně než ${args[0]} ${name}.`;
    }
    return `${sentence(name)} musí být minimálně ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” není dovolená hodnota pro ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} musí být číslo.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" nebo ")} je vyžadován.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} je povinné.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} nezačíná na ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Zadejte prosím platnou adresu URL.`;
  }
};
var cs = Object.freeze({
  __proto__: null,
  ui: ui$z,
  validation: validation$z
});
var ui$y = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Tilføj",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Fjern",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Fjern alle",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Alle felter er ikke korrekt udfyldt.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Send",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Ingen filer valgt",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Flyt op",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Flyt ned",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Indlæser...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Indlæs mere",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Næste",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Forrige",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Tilføj alle værdier",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Tilføj valgte værdier",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Fjern alle værdier",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Fjern valgte værdier",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Vælg dato",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Skift dato",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Den valgte dato er ugyldig."
};
var validation$y = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Accepter venligst ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} skal være senere end ${date(args[0])}.`;
    }
    return `${sentence(name)} skal være i fremtiden.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} kan kun indeholde bogstaver.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} kan kun indeholde bogstaver og tal.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} kan kun indeholde bogstaver og mellemrum.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} skal indeholde alfabetiske tegn.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} skal indeholde bogstaver eller tal.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} skal indeholde bogstaver eller mellemrum.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} skal indeholde symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} skal indeholde store bogstaver.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} skal indeholde små bogstaver.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} skal indeholde tal.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} skal være et symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} kan kun indeholde store bogstaver.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} kan kun indeholde små bogstaver.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} skal være før ${date(args[0])}.`;
    }
    return `${sentence(name)} skal være før i dag.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Dette felt er ikke konfigureret korrekt og kan derfor ikke blive sendt.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} skal være mellem ${a} og ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} matcher ikke.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} er ikke gyldig, brug venligst formatet ${args[0]}`;
    }
    return "Dette felt er ikke konfigureret korrekt og kan derfor ikke blive sendt.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} skal være mellem ${date(args[0])} og ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Indtast venligst en gyldig email-adresse.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} slutter ikke med ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} er ikke en gyldig værdi.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} skal være på mindst ét tegn.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} skal være på højst ${max} tegn.`;
    }
    if (min === max) {
      return `${sentence(name)} skal være ${max} tegn lange.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} skal være på mindst ${min} tegn.`;
    }
    return `${sentence(name)} skal være på mindst ${min} og højst ${max} tegn.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} er ikke en gyldig værdi.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Kan ikke have flere end ${args[0]} ${name}.`;
    }
    return `${sentence(name)} skal være mindre eller lig med ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Ingen filformater tilladt.";
    }
    return `${sentence(name)} skal være af filtypen: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Kan ikke have mindre end ${args[0]} ${name}.`;
    }
    return `${sentence(name)} skal være mindst ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” er ikke en tilladt ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} skal være et tal.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" eller ")} er påkrævet.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} er påkrævet.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} starter ikke med ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Indtast en gyldig URL.`;
  }
};
var da = Object.freeze({
  __proto__: null,
  ui: ui$y,
  validation: validation$y
});
var ui$x = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Hinzufügen",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Entfernen",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Alles entfernen",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Entschuldigung, nicht alle Felder wurden korrekt ausgefüllt.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Senden",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Keine Datei ausgewählt",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Gehe nach oben",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Gehen Sie nach unten",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Wird geladen...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Mehr laden",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Weiter",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Voriges",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Alle Werte hinzufügen",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Ausgewählte Werte hinzufügen",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Alle Werte entfernen",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Ausgewählte Werte entfernen",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Datum wählen",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Datum ändern",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Das gewählte Datum ist ungültig."
};
var validation$x = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Bitte ${name} akzeptieren.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} muss nach dem ${date(args[0])} liegen.`;
    }
    return `${sentence(name)} muss in der Zukunft liegen.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} darf nur Buchstaben enthalten.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} darf nur Buchstaben und Zahlen enthalten.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} dürfen nur Buchstaben und Leerzeichen enthalten.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} muss alphabetische Zeichen enthalten.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} muss Buchstaben oder Zahlen enthalten.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} muss Buchstaben oder Leerzeichen enthalten.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} muss ein Symbol enthalten.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} muss Großbuchstaben enthalten.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} muss Kleinbuchstaben enthalten.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} muss Zahlen enthalten.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} muss ein Symbol sein.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} kann nur Großbuchstaben enthalten.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} kann nur Kleinbuchstaben enthalten.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} muss vor dem ${date(args[0])} liegen.`;
    }
    return `${sentence(name)} muss in der Vergangenheit liegen.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Dieses Feld wurde falsch konfiguriert und kann nicht übermittelt werden.`;
    }
    return `${sentence(name)} muss zwischen ${args[0]} und ${args[1]} sein.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} stimmt nicht überein.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ist kein gültiges Datum im Format ${args[0]}.`;
    }
    return "Dieses Feld wurde falsch konfiguriert und kann nicht übermittelt werden.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} muss zwischen ${date(args[0])} und ${date(args[1])} liegen.`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "E-Mail Adresse ist ungültig.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} endet nicht mit ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} enthält einen ungültigen Wert.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = first <= second ? first : second;
    const max = second >= first ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} muss mindestens ein Zeichen enthalten.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} darf maximal ${max} Zeichen enthalten.`;
    }
    if (min === max) {
      return `${sentence(name)} sollte ${max} Zeichen lang sein.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} muss mindestens ${min} Zeichen enthalten.`;
    }
    return `${sentence(name)} muss zwischen ${min} und ${max} Zeichen enthalten.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} enthält einen ungültigen Wert.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Darf maximal ${args[0]} ${name} haben.`;
    }
    return `${sentence(name)} darf maximal ${args[0]} sein.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Keine Dateiformate konfiguriert.";
    }
    return `${sentence(name)} muss vom Typ ${args[0]} sein.`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Mindestens ${args[0]} ${name} erforderlich.`;
    }
    return `${sentence(name)} muss mindestens ${args[0]} sein.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” ist kein gültiger Wert für ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} muss eine Zahl sein.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" oder ")} ist erforderlich.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} ist erforderlich.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} beginnt nicht mit ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Bitte geben Sie eine gültige URL ein.`;
  }
};
var de = Object.freeze({
  __proto__: null,
  ui: ui$x,
  validation: validation$x
});
var ui$w = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Προσθήκη",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Αφαίρεση",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Αφαίρεση όλων",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Λυπούμαστε, υπάρχουν πεδία που δεν έχουν συμπληρωθεί σωστά.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Υποβολή",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Κανένα αρχείο δεν έχει επιλεγεί",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Προς τα επάνω",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Προς τα κάτω",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Φορτώνει...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Φόρτωση περισσότερων",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Επόμενη",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Προηγούμενο",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Προσθήκη όλων των τιμών",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Προσθήκη επιλεγμένων τιμών",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Κατάργηση όλων των τιμών",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Αφαίρεση επιλεγμένων τιμών",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Επιλέξτε ημερομηνία",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Αλλαγή ημερομηνίας",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Η επιλεγμένη ημερομηνία δεν είναι έγκυρη."
};
var validation$w = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Παρακαλώ αποδεχτείτε το ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} πρέπει να είναι μετά της ${date(args[0])}.`;
    }
    return `${sentence(name)} πρέπει να είναι στο μέλλον.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} μπορεί να περιέχει μόνο αλφαβητικούς χαρακτήρες.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} μπορεί να περιέχει μόνο γράμματα και αριθμούς.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} μπορεί να περιέχει μόνο γράμματα και κενά.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `Το ${sentence(name)} πρέπει να περιέχει αλφαβητικούς χαρακτήρες.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `Το ${sentence(name)} πρέπει να περιέχει γράμματα ή αριθμούς.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} πρέπει να περιέχει γράμματα ή κενά.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `Το ${sentence(name)} πρέπει να περιέχει το σύμβολο.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `Το ${sentence(name)} πρέπει να περιέχει κεφαλαία γράμματα.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `Το ${sentence(name)} πρέπει να περιέχει πεζά γράμματα.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `Το ${sentence(name)} πρέπει να περιέχει αριθμούς.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `Το ${sentence(name)} πρέπει να είναι ένα σύμβολο.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `Το ${sentence(name)} μπορεί να περιέχει μόνο κεφαλαία γράμματα.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `Το ${sentence(name)} μπορεί να περιέχει μόνο πεζά γράμματα.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} πρέπει να είναι πριν της ${date(args[0])}.`;
    }
    return `${sentence(name)} πρέπει να είναι στο παρελθόν.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Αυτό το πεδίο έχει ρυθμιστεί λανθασμένα και δεν μπορεί να υποβληθεί.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} πρέπει να είναι μεταξύ ${a} και ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} δεν ταιριάζει.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} δεν είναι έγυρη ημερομηνία, παρακαλώ ακολουθήστε την διαμόρφωση ${args[0]}`;
    }
    return "Αυτό το πεδίο έχει ρυθμιστεί λανθασμένα και δεν μπορεί να υποβληθεί";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} πρέπει να είναι μεταξύ ${date(args[0])} και ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Παρακαλώ πληκτρολογήστε μια έγκυρη email διεύθυνση. ",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} δεν καταλήγει με ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} δεν είναι μια επιτρεπτή τιμή.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} πρέπει να είναι τουλάχιστον ενός χαρακτήρα.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} πρέπει να είναι λιγότεροι ή ίσοι με ${max} χαρακτήρες.`;
    }
    if (min === max) {
      return `Το ${sentence(name)} θα πρέπει να έχει μήκος ${max} χαρακτήρες.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} πρέπει να είναι περισσότεροι ή ίσοι με ${min} χαρακτήρες.`;
    }
    return `${sentence(name)} πρέπει να είναι μεταξύ ${min} και ${max} χαρακτήρες.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} δεν είναι μια επιτρεπτή τιμή.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Δεν μπορεί να έχει παραπάνω από ${args[0]} ${name}.`;
    }
    return `${sentence(name)} πρέπει αν είναι λιγότερο ή ίσο με το ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Δεν επιτρέπονται αρχεία.";
    }
    return `${sentence(name)} πρέπει να είναι τύπου: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Δεν μπορεί να είναι λιγότερο από ${args[0]} ${name}.`;
    }
    return `${sentence(name)} πρέπει να είναι τουλάχιστον ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” δεν είναι μια επιτρεπτή ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} πρέπει να είναι αριθμός.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" ή ")} απαιτείται.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} είναι υποχρεωτικό.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} δεν αρχίζει με ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Παρακαλώ εισάγετε ένα έγκυρο URL.`;
  }
};
var el = Object.freeze({
  __proto__: null,
  ui: ui$w,
  validation: validation$w
});
var ui$v = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Add",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Remove",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Remove all",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Sorry, not all fields are filled out correctly.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Submit",
  /**
   * Shown when no files are selected.
   */
  noFiles: "No file chosen",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Move up",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Move down",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Loading...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Load more",
  /**
   * Show on buttons that navigate state forward
   */
  next: "Next",
  /**
   * Show on buttons that navigate state backward
   */
  prev: "Previous",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Add all values",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Add selected values",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Remove all values",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Remove selected values",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Choose date",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Change date",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "The selected date is invalid."
};
var validation$v = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Please accept the ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} must be after ${date(args[0])}.`;
    }
    return `${sentence(name)} must be in the future.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} can only contain alphabetical characters.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} can only contain letters and numbers.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} can only contain letters and spaces.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} must contain alphabetical characters.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} must contain letters or numbers.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} must contain letters or spaces.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} must contain a symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} must contain an uppercase letter.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} must contain a lowercase letter.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} must contain numbers.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} must be a symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} can only contain uppercase letters.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} can only contain lowercase letters.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} must be before ${date(args[0])}.`;
    }
    return `${sentence(name)} must be in the past.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `This field was configured incorrectly and can’t be submitted.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} must be between ${a} and ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} does not match.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} is not a valid date, please use the format ${args[0]}`;
    }
    return "This field was configured incorrectly and can’t be submitted";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} must be between ${date(args[0])} and ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Please enter a valid email address.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} doesn’t end with ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} is not an allowed value.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} must be at least one character.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} must be less than or equal to ${max} characters.`;
    }
    if (min === max) {
      return `${sentence(name)} should be ${max} characters long.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} must be greater than or equal to ${min} characters.`;
    }
    return `${sentence(name)} must be between ${min} and ${max} characters.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} is not an allowed value.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Cannot have more than ${args[0]} ${name}.`;
    }
    return `${sentence(name)} must be less than or equal to ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "No file formats allowed.";
    }
    return `${sentence(name)} must be of the type: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Cannot have fewer than ${args[0]} ${name}.`;
    }
    return `Must be at least ${args[0]} ${name} .`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” is not an allowed ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} must be a number.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" or ")} is required.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} is required.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} doesn’t start with ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Please enter a valid URL.`;
  }
};
var en = Object.freeze({
  __proto__: null,
  ui: ui$v,
  validation: validation$v
});
var ui$u = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Añadir",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Quitar",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Quitar todos",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Discúlpe, los campos no fueron completados correctamente.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Enviar",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Archivo no seleccionado",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Moverse hacia arriba",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Moverse hacia abajo",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Cargando...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Cargar más",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Próximo",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Anterior",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Añadir todos los valores",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Añadir valores seleccionados",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Eliminar todos los valores",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Eliminar los valores seleccionados",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Elige fecha",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Cambiar fecha",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "La fecha seleccionada no es válida."
};
var validation$u = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Acepte el ${name} por favor.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} debe ser posterior a ${date(args[0])}.`;
    }
    return `${sentence(name)} debe ser una fecha futura.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} debe contener solo caractéres alfabéticos.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} debe ser alfanumérico.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} espacios alfa solo pueden contener letras y espacios.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} debe contener caracteres alfabéticos.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} debe contener letras o números.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} debe contener letras o espacios.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} debe contener un símbolo.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} debe estar en mayúsculas.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} debe contener minúsculas.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} debe contener números.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} debe ser un símbolo.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} solo puede contener letras mayúsculas.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} solo puede contener letras minúsculas.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} debe ser anterior a ${date(args[0])}.`;
    }
    return `${sentence(name)} debe ser una fecha pasada.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `El campo no fue completado correctamente y no puede ser enviado.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} debe estar entre ${a} y ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} no coincide.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} no es una fecha válida, por favor utilice el formato ${args[0]}`;
    }
    return "El campo no fue completado correctamente y no puede ser enviado.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} debe estar entre ${date(args[0])} y ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Ingrese una dirección de correo electrónico válida por favor.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} no termina con ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} no es un valor permitido.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} debe tener al menos una letra.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} debe tener como máximo ${max} caractéres.`;
    }
    if (min === max) {
      return `${sentence(name)} debe tener ${max} caracteres.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} debe tener como mínimo ${min} caractéres.`;
    }
    return `${sentence(name)} debe tener entre ${min} y ${max} caractéres.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} no es un valor permitido.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `No puede tener más de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} debe ser menor o igual a ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "No existen formatos de archivos permitidos.";
    }
    return `${sentence(name)} debe ser del tipo: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `No puede tener menos de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} debe ser de al menos ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” no es un valor permitido de ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} debe ser un número.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" o ")} se requiere estar.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} es requerido.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} debe comenzar con ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Introduce una URL válida.`;
  }
};
var es = Object.freeze({
  __proto__: null,
  ui: ui$u,
  validation: validation$u
});
var ui$t = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "افزودن",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "حذف",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "همه را حذف کنید",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "همه فیلدها به‌درستی پر نشده‌اند",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "ثبت",
  /**
   * Shown when no files are selected.
   */
  noFiles: "هیچ فایلی انتخاب نشده است",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "حرکت به بالا",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "حرکت به پایین",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "در حال بارگذاری...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "بارگذاری بیشتر",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "بعدی",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "قبلی",
  /**
   * Shown when adding all values.
   */
  addAllValues: "تمام مقادیر را اضافه کنید",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "مقادیر انتخاب شده را اضافه کنید",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "تمام مقادیر را حذف کنید",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "حذف مقادیر انتخاب شده",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "تاریخ را انتخاب کنید",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "تغییر تاریخ",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "تاریخ انتخاب شده نامعتبر است"
};
var validation$t = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `لطفاً ${name} را بپذیرید.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} باید بعد از تاریخ ${date(args[0])} باشد.`;
    }
    return `${sentence(name)} باید مربوط به آینده باشد.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} فقط میتواند شامل حروف الفبا باشد.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} فقط میتواند شامل حروف و اعداد باشد.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} فقط می تواند شامل حروف و فاصله باشد.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} باید حاوی حروف الفبا باشد.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} باید حاوی حروف یا اعداد باشد.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} باید حاوی حروف یا فاصله باشد.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} باید حاوی نماد باشد.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} باید دارای حروف بزرگ باشد.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} باید حاوی حروف کوچک باشد.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} باید حاوی اعداد باشد.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} باید یک نماد باشد.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} تنها می‌تواند شامل حروف بزرگ باشد.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} تنها می‌تواند شامل حروف کوچک باشد.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} باید قبل از تاریخ ${date(args[0])} باشد.`;
    }
    return `${sentence(name)} باید مربوط به گذشته باشد.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `این فیلد به اشتباه پیکربندی شده است و قابل ارسال نیست`;
    }
    return `${sentence(name)} باید بین ${args[0]} و ${args[1]} باشد.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} مطابقت ندارد.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} تاریخ معتبری نیست، لطفاً از قالب ${args[0]} استفاده کنید
`;
    }
    return "این فیلد به اشتباه پیکربندی شده است و قابل ارسال نیست";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} باید بین ${date(args[0])} و ${date(args[1])} باشد.`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "لطفا آدرس ایمیل معتبر وارد کنید.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} باید به ${list(args)} ختم شود.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} مجاز نیست.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = first <= second ? first : second;
    const max = second >= first ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} باید حداقل یک کاراکتر باشد.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} باید کمتر یا برابر با ${max} کاراکتر باشد.`;
    }
    if (min === max) {
      return `${sentence(name)} باید ${max} کاراکتر طولانی باشد.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} باید بزرگتر یا برابر با ${min} کاراکتر باشد.`;
    }
    return `${sentence(name)} باید بین ${min} و ${max} کاراکتر باشد.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} مجاز نیست.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name} نمی تواند بیش از ${args[0]} باشد.`;
    }
    return `${sentence(name)} باید کمتر یا برابر با ${args[0]} باشد.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "فرمت فایل مجاز نیست.";
    }
    return `${sentence(name)} باید از این نوع باشد: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name} نمی تواند کمتر از ${args[0]} باشد.
`;
    }
    return `${sentence(name)} باید حداقل ${args[0]} باشد.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" یک ${name} مجاز نیست.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} باید عدد باشد.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" یا ")} مورد نیاز است.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `پر کردن ${sentence(name)} اجباری است.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} باید با ${list(args)} شروع شود.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `لطفا یک URL معتبر وارد کنید.`;
  }
};
var fa = Object.freeze({
  __proto__: null,
  ui: ui$t,
  validation: validation$t
});
var ui$s = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Lisää",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Poista",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Poista kaikki",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Kaikkia kenttiä ei ole täytetty oikein.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Tallenna",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Ei valittuja tiedostoja",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Siirrä ylös",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Siirrä alas",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Ladataan...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Lataa lisää",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Seuraava",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Edellinen",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Lisää kaikki arvot",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Lisää valitut arvot",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Poista kaikki arvot",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Poista valitut arvot",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Valitse päivämäärä",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Vaihda päivämäärä",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Valittu päivämäärä on virheellinen."
};
var validation$s = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Ole hyvä ja hyväksy ${name}`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} tulee olla ${date(args[0])} jälkeen.`;
    }
    return `${sentence(name)} on oltava tulevaisuudessa.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} saa sisältää vain kirjaimia.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} saa sisältää vain kirjaimia ja numeroita.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} voivat sisältää vain kirjaimia ja välilyöntejä.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} on sisällettävä aakkoselliset merkit.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} täytyy sisältää kirjaimia tai numeroita.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} täytyy sisältää kirjaimia tai välilyöntejä.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} täytyy sisältää symboli.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} täytyy sisältää isoja kirjaimia.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} täytyy sisältää pieniä kirjaimia.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} täytyy sisältää numeroita.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} on oltava symboli.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} voi sisältää vain isoja kirjaimia.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} voi sisältää vain pieniä kirjaimia.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} tulee olla ennen: ${date(args[0])}.`;
    }
    return `${sentence(name)} on oltava menneisyydessä.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Tämä kenttä on täytetty virheellisesti joten sitä ei voitu lähettää.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} on oltava välillä ${a} - ${b} `;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} ei täsmää.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ei ole validi päivämäärä, ole hyvä ja syötä muodossa: ${args[0]}`;
    }
    return "Tämä kenttä on täytetty virheellisesti joten sitä ei voitu lähettää.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} on oltava välillä ${date(args[0])} - ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Syötä validi sähköpostiosoite.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} tulee päättyä ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} ei ole sallittu vaihtoehto.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} on oltava vähintään yksi merkki.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} on oltava ${max} tai alle merkkiä.`;
    }
    if (min === max) {
      return `${sentence(name)} pitäisi olla ${max} merkkiä pitkä.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} on oltava vähintään ${min} merkkiä.`;
    }
    return `${sentence(name)} on oltava vähintään ${min}, enintään ${max} merkkiä.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} ei ole sallittu arvo.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Valitse enintään ${args[0]} ${name} vaihtoehtoa.`;
    }
    return `${sentence(name)} on oltava ${args[0]} tai alle.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Tiedostoja ei sallita.";
    }
    return `${sentence(name)} tulee olla ${args[0]}-tiedostotyyppiä.`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Valitse vähintään ${args[0]} ${name} vaihtoehtoa.`;
    }
    return `${sentence(name)} tulee olla ${args[0]} tai suurempi.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” ei ole sallittu ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `Kentän ${sentence(name)} tulee olla numero.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" tai ")} vaaditaan.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} vaaditaan.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} on alettava ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Anna kelvollinen URL-osoite.`;
  }
};
var fi = Object.freeze({
  __proto__: null,
  ui: ui$s,
  validation: validation$s
});
var ui$r = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Ajouter",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Supprimer",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Enlever tout",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Désolé, tous les champs ne sont pas remplis correctement.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Valider",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Aucun fichier choisi",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Déplacez-vous",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Déplacez-vous",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Chargement...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Chargez plus",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Suivant",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Précédent",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Ajouter toutes les valeurs",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Ajouter les valeurs sélectionnées",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Supprimer toutes les valeurs",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Supprimer les valeurs sélectionnées",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Choisissez la date",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Modifier la date",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: `La date sélectionnée n'est pas valide.`
};
var validation$r = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Veuillez accepter le ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} doit être postérieure au ${date(args[0])}.`;
    }
    return `${sentence(name)} doit être dans le futur.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} ne peut contenir que des caractères alphabétiques.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} ne peut contenir que des lettres et des chiffres.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} ne peuvent contenir que des lettres et des espaces.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} doit contenir des caractères alphabétiques.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} doit contenir au moins un lettre ou nombre.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} doit contenir des lettres ou des espaces.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} doit contenir un symbole.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} doit contenir au moins une majuscule.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} doit contenir au moins une minuscule.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} doit contenir des chiffres.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} doit être un symbole.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} ne peuvent contenir que des majuscules.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} ne peut contenir que des lettres minuscules.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} doit être antérieure au ${date(args[0])}.`;
    }
    return `${sentence(name)} doit être dans le passé.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Ce champ a été configuré de manière incorrecte et ne peut pas être soumis.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} doit être comprise entre ${a} et ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} ne correspond pas.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} n'est pas une date valide, veuillez utiliser le format ${args[0]}`;
    }
    return "Ce champ a été configuré de manière incorrecte et ne peut pas être soumis.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} doit être comprise entre ${date(args[0])} et ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Veuillez saisir une adresse email valide.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} ne se termine pas par ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} n'est pas une valeur autorisée.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} doit comporter au moins un caractère.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} doit être inférieur ou égal à ${max} caractères.`;
    }
    if (min === max) {
      return `${sentence(name)} doit contenir ${max} caractères.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} doit être supérieur ou égal à ${min} caractères.`;
    }
    return `${sentence(name)} doit être comprise entre ${min} et ${max} caractères.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} n'est pas une valeur autorisée.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Ne peut pas avoir plus de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} doit être inférieur ou égal à ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Aucun format de fichier n’est autorisé";
    }
    return `${sentence(name)} doit être du type: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Ne peut pas avoir moins de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} doit être au moins de ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” n'est pas un ${name} autorisé.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} doit être un nombre.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" ou ")} est requis.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} est requis.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ne commence pas par ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Entrez une URL valide.`;
  }
};
var fr = Object.freeze({
  __proto__: null,
  ui: ui$r,
  validation: validation$r
});
var ui$q = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Foeg ta",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Ferwider",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Ferwider alles",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Sorry, net alle fjilden binne korrekt ynfolle.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Ferstjoere",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Gjin bestân keazen",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Gean omheech",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Nei ûnderen",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Lade…",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Mear lade",
  /**
   * Show on buttons that navigate state forward
   */
  next: "Folgende",
  /**
   * Show on buttons that navigate state backward
   */
  prev: "Foarige",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Foegje alle wearden ta",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Foegje selektearre wearden ta",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Fuortsmite alle wearden",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Fuortsmite selektearre wearden",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Kies datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Feroarje datum",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "De selektearre datum is ûnjildich."
};
var validation$q = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Akseptearje de ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} moat nei ${date(args[0])} wêze.`;
    }
    return `${sentence(name)} moat yn de takomst lizze.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} mei allinne alfabetyske tekens befetsje.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} mei allinne letters en sifers befetsje.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} mei allinne letters en spaasjes befetsje.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} must contain alphabetical characters.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} must contain letters and numbers.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} must contain letters and spaces.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} must contain symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} must contain uppercase.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} must contain lowercase.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} must contain number.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} can only contain symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} can only contain uppercase.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} can only contain lowercase.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} moat foar ${date(args[0])} falle.`;
    }
    return `${sentence(name)} moat yn it ferline wêze.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Dit fjild is ferkeard konfigurearre en kin net ferstjoerd wurde.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} moat tusken ${a} en ${b} lizze.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} komt net oerien.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} is gjin jildige datum, brûk de notaasje ${args[0]}`;
    }
    return "Dit fjild is ferkeard konfigurearre en kin net ferstjoerd wurde";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} moat tusken ${date(args[0])} en ${date(args[1])} lizze`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Folje in jildich e-mailadres yn.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} einiget net mei ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} is gjin tastiene wearde.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} moat minimaal ien teken wêze.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} moat lytser wêze as of gelyk wêze oan ${max} tekens.`;
    }
    if (min === max) {
      return `${sentence(name)} moat ${max} tekens lang wêze.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} moat grutter wêze as of gelyk wêze oan ${min} tekens.`;
    }
    return `${sentence(name)} moat tusken de ${min} en ${max} tekens befetsje.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} is gjin tastiene wearde.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Mei net mear as ${args[0]} ${name} hawwe.`;
    }
    return `${sentence(name)} moat lytser wêze as of gelyk wêze oan ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Gjin bestânsnotaasjes tastien.";
    }
    return `${sentence(name)} moat fan it type: ${args[0]} wêze`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Mei net minder as ${args[0]} ${name} hawwe.`;
    }
    return `${sentence(name)} moat minimaal ${args[0]} wêze.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" is gjin tastiene ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} moat in getal wêze.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" of ")} is ferplichte.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} is ferplicht.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} begjint net mei ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Doch der in jildige url by.`;
  }
};
var fy = Object.freeze({
  __proto__: null,
  ui: ui$q,
  validation: validation$q
});
var ui$p = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "הוסף",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "מחק",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "מחק הכל",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "שים לב, לא כל השדות מלאים כראוי.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "שלח",
  /**
   * Shown when no files are selected.
   */
  noFiles: "לא נבחר קובץ..",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "הזז למעלה",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "הזז למטה",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "טוען...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "טען יותר",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "הבא",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "הקודם",
  /**
   * Shown when adding all values.
   */
  addAllValues: "הוסף את כל הערכים",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "הוספת ערכים נבחרים",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "הסר את כל הערכים",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "הסר ערכים נבחרים",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "בחר תאריך",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "שינוי תאריך",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "התאריך שנבחר אינו חוקי."
};
var validation$p = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `אנא אשר את ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} חייב להיות אחרי ${date(args[0])}.`;
    }
    return `${sentence(name)} חייב להיות בעתיד.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} חייב להכיל אותיות אלפבת.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} יכול להכיל רק מספרים ואותיות.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} יכול להכיל רק אותיות ורווחים.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} חייב להכיל תווים אלפביתיים.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} חייב להכיל אותיות או מספרים.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} חייב להכיל אותיות או רווחים.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} חייב להכיל סמל.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} חייב להכיל אותיות רישיות.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} חייב להכיל אותיות קטנות.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} חייב להכיל מספרים.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} חייב להיות סמל.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} יכול להכיל אותיות רישיות בלבד.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} יכול להכיל רק אותיות קטנות.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} חייב להיות לפני ${date(args[0])}.`;
    }
    return `${sentence(name)} חייב להיות בעבר`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `שדה זה לא הוגדר כראוי ולא יכול להישלח.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} חייב להיות בין ${a} ו- ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} לא מתאים.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} הוא לא תאריך תקין, אנא השתמש בפורמט ${args[0]}`;
    }
    return "שדה זה לא הוגדר כראוי ולא יכול להישלח.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} חייב להיות בין ${date(args[0])} ו- ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "אנא הקלד אימייל תקין.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} לא מסתיים ב- ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} הוא לא ערך מורשה.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} חייב להיות לפחות תו אחד.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} חייב להיות פחות או שווה ל- ${max} תווים.`;
    }
    if (min === max) {
      return `${sentence(name)} צריך להיות ${max} תווים ארוכים.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} חייב להיות גדול או שווה ל- ${min} תווים.`;
    }
    return `${sentence(name)} חייב להיות בין ${min} ו- ${max} תווים.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} הוא לא ערך תקין.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name} לא יכול להיות עם יותר מ- ${args[0]}.`;
    }
    return `${sentence(name)} חייב להיות פחות או שווה ל- ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "פורמט הקובץ לא מורשה.";
    }
    return `${sentence(name)} חייב להיות מסוג: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name} לא יכול להיות עם פחות מ- ${args[0]}.`;
    }
    return `${sentence(name)} חייב להיות לפחות ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” לא מתאים ל- ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} חייב להיות מספר.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" או ")} נדרש.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} הינו חובה.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} לא מתחיל ב- ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `הזן כתובת URL חוקית.`;
  }
};
var he = Object.freeze({
  __proto__: null,
  ui: ui$p,
  validation: validation$p
});
var ui$o = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Dodaj",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Ukloni",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Pojedina polja nisu ispravno ispunjena.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Predaj",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Pomaknite se gore",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Pomakni se dolje",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Učitavanje...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Učitaj više",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Sljedeći",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "prijašnji",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Dodajte sve vrijednosti",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Dodavanje odabranih vrijednosti",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Ukloni sve vrijednosti",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Ukloni odabrane vrijednosti",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Odaberite datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Promijeni datum",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Odabrani datum je nevažeći."
};
var validation$o = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Potrebno je potvrditi ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mora biti u periodu poslije ${date(args[0])}.`;
    }
    return `${sentence(name)} mora biti u budućnosti.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} mora sadržavati samo slova.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} mora sadržavati slova i brojeve.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} mogu sadržavati samo slova i razmake..`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} mora sadržavati abecedne znakove.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} mora sadržavati slova ili brojeve.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} mora sadržavati slova ili razmake.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} mora sadržavati simbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} mora sadržavati velika slova.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} mora sadržavati mala slova.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} mora sadržavati brojeve.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} mora biti simbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} može sadržavati samo velika slova.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} može sadržavati samo mala slova.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mora biti prije ${date(args[0])}.`;
    }
    return `${sentence(name)} mora biti u prošlosti.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Format sadržaja nije ispravan i ne može biti predan.`;
    }
    return `${sentence(name)} mora biti između ${args[0]} i ${args[1]}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} ne odgovara zadanoj vrijednosti.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nije ispravan format datuma. Molimo koristite sljedeći format: ${args[0]}`;
    }
    return "Ovo polje nije ispravno postavljeno i ne može biti predano.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} mora biti vrijednost između ${date(args[0])} i ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Molimo upišite ispravnu email adresu.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} ne završava s ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} nije dopuštena vrijednost.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = first <= second ? first : second;
    const max = second >= first ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} mora sadržavati barem jedan znak.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} mora imati ${max} ili manje znakova.`;
    }
    if (min === max) {
      return `${sentence(name)} trebao bi biti dugačak ${max} znakova.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} mora imati barem ${min} znakova.`;
    }
    return `Broj znakova za polje ${sentence(name)} mora biti između ${min} i ${max}.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} nije dozvoljena vrijednost.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Ne smije imati više od ${args[0]} ${name} polja.`;
    }
    return `${sentence(name)} mora imati vrijednost manju ili jednaku ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Format datoteke nije dozvoljen.";
    }
    return `Format datoteke na polju ${sentence(name)} mora odgovarati: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Broj upisanih vrijednosti na polju ${name} mora biti barem ${args[0]}.`;
    }
    return `${sentence(name)} mora biti barem ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” nije dozvoljena vrijednost na polju ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} mora biti broj.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" ili ")} je potreban.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} je obavezno.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ne počinje s ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Unesite valjanu URL adresu.`;
  }
};
var hr = Object.freeze({
  __proto__: null,
  ui: ui$o,
  validation: validation$o
});
var ui$n = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Hozzáadás",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Eltávolítás",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Összes eltávolítása",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Sajnáljuk, nem minden mező lett helyesen kitöltve.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Beküldés",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nincs fájl kiválasztva",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Mozgás felfelé",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Mozgás lefelé",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Betöltés...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Töltsön be többet",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Következő",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Előző",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Adja hozzá az összes értéket",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Kiválasztott értékek hozzáadása",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Távolítsa el az összes értéket",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "A kiválasztott értékek eltávolítása",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Válassza ki a dátumot",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Dátum módosítása",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "A kiválasztott dátum érvénytelen."
};
var validation$n = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Fogadja el a ${name} mezőt.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mezőnek ${date(args[0])} után kell lennie.`;
    }
    return `${sentence(name)} mezőnek a jövőben kell lennie.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} csak alfanumerikus karaktereket tartalmazhat.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} csak betűket és számokat tartalmazhat.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} csak betűket és szóközöket tartalmazhat.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `A ${sentence(name)} betűrendes karaktereket kell tartalmaznia.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `A ${sentence(name)} betűket vagy számokat kell tartalmaznia.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `A ${sentence(name)} betűket vagy szóközöket kell tartalmaznia.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `A ${sentence(name)} szimbólumot kell tartalmaznia.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `A ${sentence(name)} nagybetűt kell tartalmaznia.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `A ${sentence(name)} kisbetűt kell tartalmaznia.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `A ${sentence(name)} számot kell tartalmaznia.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `A ${sentence(name)} szimbólumnak kell lennie.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `A ${sentence(name)} csak nagybetűket tartalmazhat.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `A ${sentence(name)} csak kisbetűket tartalmazhat.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mezőnek ${date(args[0])} előtt kell lennie.`;
    }
    return `${sentence(name)} mezőnek a múltban kell lennie.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Ez a mező hibásan lett konfigurálva, így nem lehet beküldeni.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `A ${sentence(name)} mezőnek ${a} és ${b} között kell lennie.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} nem egyezik.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nem érvényes dátum, ${args[0]} formátumot használj`;
    }
    return "Ez a mező hibásan lett konfigurálva, így nem lehet beküldeni.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} mezőnek ${date(args[0])} és ${args[1]} között kell lennie`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Kérjük, érvényes email címet adjon meg.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} mező nem a kijelölt (${list(args)}) módon ér véget.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} nem engedélyezett érték.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} mezőnek legalább egy karakteresnek kell lennie.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} mezőnek maximum ${max} karakteresnek kell lennie.`;
    }
    if (min === max) {
      return `${sentence(name)} ${max} karakter hosszúnak kell lennie.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} mezőnek minimum ${min} karakteresnek kell lennie.`;
    }
    return `${sentence(name)} mezőnek ${min} és ${max} karakter között kell lennie.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} nem engedélyezett érték.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nem lehet több mint ${args[0]} ${name}.`;
    }
    return `${sentence(name)} nem lehet nagyobb, mint ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Nincsenek támogatott fájlformátumok.";
    }
    return `${sentence(name)}-nak/nek a következőnek kell lennie: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nem lehet kevesebb, mint ${args[0]} ${name}.`;
    }
    return `${sentence(name)}-nak/nek minimum ${args[0]}-nak/nek kell lennie.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" nem engedélyezett ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} mezőnek számnak kell lennie.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" vagy ")} szükséges.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} mező kötelező.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} nem a következővel kezdődik: ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Kérjük, adjon meg egy érvényes URL-t.`;
  }
};
var hu = Object.freeze({
  __proto__: null,
  ui: ui$n,
  validation: validation$n
});
var ui$m = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Tambah",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Hapus",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Hapus semua",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Maaf, tidak semua bidang formulir terisi dengan benar",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Kirim",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Tidak ada file yang dipilih",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Pindah ke atas",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Pindah ke bawah",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Memuat...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Muat lebih",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Berikutnya",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Sebelumnya",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Tambahkan semua nilai",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Tambahkan nilai yang dipilih",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Hapus semua nilai",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Hapus nilai yang dipilih",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Pilih tanggal",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Ubah tanggal",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Tanggal yang dipilih tidak valid."
};
var validation$m = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Tolong terima kolom ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nilainya harus lebih dari waktu ${date(args[0])}.`;
    }
    return `${sentence(name)} harus berisi waktu di masa depan.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} hanya bisa diisi huruf alfabet.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} hanya bisa diisi huruf dan angka.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} hanya boleh berisi huruf dan spasi..`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} harus berisi karakter abjad.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} harus mengandung huruf atau angka.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} harus berisi huruf atau spasi.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} harus berisi simbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} harus berisi huruf besar.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} harus berisi huruf kecil.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} harus berisi angka.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} harus berupa simbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} hanya dapat berisi huruf besar.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} hanya dapat berisi huruf kecil.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nilainya harus kurang dari waktu ${date(args[0])}.`;
    }
    return `${sentence(name)} harus berisi waktu yang sudah lampau.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Kolom ini tidak diisi dengan benar sehingga tidak bisa dikirim`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} harus bernilai diantara ${a} dan ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} nilainya tidak cocok.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} waktu tidak cocok, mohon gunakan format waktu ${args[0]}`;
    }
    return "Kolom ini tidak diisi dengan benar sehingga tidak bisa dikirim";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} harus diantara waktu ${date(args[0])} dan waktu ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Tolong tulis alamat email yang benar.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} nilainya tidak berakhiran dengan ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} adalah nilai yang tidak diizinkan.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} nilainya setidaknya berisi satu karakter.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} jumlah karakternya harus kurang dari atau sama dengan ${max} karakter.`;
    }
    if (min === max) {
      return `${sentence(name)} harus ${max} karakter panjang.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} jumlah karakternya harus lebih dari atau sama dengan ${min} karakter.`;
    }
    return `${sentence(name)} jumlah karakternya hanya bisa antara ${min} dan ${max} karakter.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} nilainya tidak diizinkan.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Tidak bisa memiliki lebih dari ${args[0]} ${name}.`;
    }
    return `${sentence(name)} harus lebih kecil atau sama dengan ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Format file tidak diizinkan";
    }
    return `${sentence(name)} hanya bisa bertipe: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Tidak boleh kurang dari ${args[0]} ${name}.`;
    }
    return `${sentence(name)} setidaknya harus berisi ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” adalah nilai yang tidak diperbolehkan untuk ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} harus berupa angka.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" atau ")} diperlukan`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} harus diisi.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} tidak dimulai dengan ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Harap masukkan URL yang valid.`;
  }
};
var id = Object.freeze({
  __proto__: null,
  ui: ui$m,
  validation: validation$m
});
var ui$l = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Inserisci",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Rimuovi",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Rimuovi tutti",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Ci dispiace, non tutti i campi sono compilati correttamente.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Invia",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nessun file selezionato",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Sposta in alto",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Sposta giù",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Caricamento...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Carica altro",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Prossimo",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Precedente",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Aggiungi tutti i valori",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Aggiungi valori selezionati",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Rimuovi tutti i valori",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Rimuovi i valori selezionati",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Scegli la data",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Cambia data",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "La data selezionata non è valida."
};
var validation$l = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Si prega di accettare ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `la data ${sentence(name)} deve essere successiva ${date(args[0])}.`;
    }
    return `la data ${sentence(name)} deve essere nel futuro.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} può contenere solo caratteri alfanumerici.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} può contenere solo lettere e numeri.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} può contenere solo lettere e spazi.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} deve contenere caratteri alfabetici.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} deve contenere lettere o numeri.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} deve contenere lettere o spazi.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} deve contenere un simbolo.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} must contain uppercase.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} deve contenere lettere minuscole.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} deve contenere numeri.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} deve essere un simbolo.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} può contenere solo lettere maiuscole.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} può contenere solo lettere minuscole.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `la data ${sentence(name)} deve essere antecedente ${date(args[0])}.`;
    }
    return `${sentence(name)} deve essere nel passato.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Questo campo è stato configurato male e non può essere inviato.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} deve essere tra ${a} e ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} non corrisponde.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} non è una data valida, per favore usa il formato ${args[0]}`;
    }
    return "Questo campo è stato configurato in modo errato e non può essere inviato.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} deve essere tra ${date(args[0])} e ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Per favore inserire un indirizzo email valido.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} non termina con ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} non è un valore consentito.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} deve contenere almeno un carattere.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} deve essere minore o uguale a ${max} caratteri.`;
    }
    if (min === max) {
      return `${sentence(name)} deve contenere ${max} caratteri.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} deve essere maggiore o uguale a ${min} caratteri.`;
    }
    return `${sentence(name)} deve essere tra ${min} e ${max} caratteri.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} non è un valore consentito.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Non può avere più di ${args[0]} ${name}.`;
    }
    return `${sentence(name)} deve essere minore o uguale a ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Formato file non consentito.";
    }
    return `${sentence(name)} deve essere di tipo: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Non può avere meno di ${args[0]} ${name}.`;
    }
    return `${sentence(name)} deve essere almeno ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" non è un ${name} consentito.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} deve essere un numero.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" o ")} è richiesto.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} è richiesto.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} non inizia con ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Inserisci un URL valido.`;
  }
};
var it = Object.freeze({
  __proto__: null,
  ui: ui$l,
  validation: validation$l
});
var ui$k = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "追加",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "削除",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "全て削除",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "項目が正しく入力されていません。",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "送信",
  /**
   * Shown when no files are selected.
   */
  noFiles: "ファイルが選択されていません",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "上に移動",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "下へ移動",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "読み込み中...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "さらに読み込む",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "[次へ]",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "前へ",
  /**
   * Shown when adding all values.
   */
  addAllValues: "すべての値を追加",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "選択した値を追加",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "すべての値を削除",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "選択した値を削除",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "日付を選択",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "日付を変更",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "選択した日付は無効です。"
};
var validation$k = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `${name}の同意が必要です。`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)}は${date(args[0])}より後の日付である必要があります。`;
    }
    return `${sentence(name)}は将来の日付でなければなりません。`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)}には英字のみを含めることができます。`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)}には、文字と数字のみを含めることができます。`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)}には、文字とスペースのみを含めることができます。`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} にはアルファベット文字が含まれている必要があります。`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} には文字または数字を含める必要があります。`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} には文字またはスペースを含める必要があります。`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} には記号が含まれている必要があります。`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} には大文字を含める必要があります。`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} には小文字を含める必要があります。`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} には数字が含まれている必要があります。`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} はシンボルでなければなりません。`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} には大文字しか使用できません`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} には小文字しか使用できません。`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)}は${date(args[0])}より前の日付である必要があります。`;
    }
    return `${sentence(name)}は過去の日付である必要があります。`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `このフィールドは正しく構成されていないため、送信できません。`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)}は${a}と${b}の間にある必要があります。`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)}が一致しません。`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)}は有効な日付ではありません。${args[0]}の形式を使用してください。`;
    }
    return "このフィールドは正しく構成されておらず、送信できません。";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)}は${date(args[0])}と${date(args[1])}の間にある必要があります。`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "有効なメールアドレスを入力してください。",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)}は${list(args)}で終わっていません。`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)}は許可された値ではありません。`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)}は少なくとも1文字である必要があります。`;
    }
    if (min == 0 && max) {
      return `${sentence(name)}は${max}文字以下である必要があります。`;
    }
    if (min === max) {
      return `${sentence(name)} の長さは ${max} 文字でなければなりません。`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)}は${min}文字以上である必要があります。`;
    }
    return `${sentence(name)}は${min}から${max}文字の間でなければなりません。`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)}は許可された値ではありません。`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name}は${args[0]}を超えることはできません。`;
    }
    return `${sentence(name)}は${args[0]}以下である必要があります。`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "ファイル形式は許可されていません。";
    }
    return `${sentence(name)}は${args[0]}である必要があります。`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name}は${args[0]}未満にすることはできません。`;
    }
    return `${sentence(name)}は少なくとも${args[0]}である必要があります。`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}”は許可された${name}ではありません。`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)}は数値でなければなりません。`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join("または")}${labels}が必要です。`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)}は必須です。`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)}は${list(args)}で始まっていません。`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `有効な URL を入力してください。`;
  }
};
var ja = Object.freeze({
  __proto__: null,
  ui: ui$k,
  validation: validation$k
});
var ui$j = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "қосу",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Жою",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Барлығын жою",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Кешіріңіз, барлық өрістер дұрыс толтырылмаған.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Жіберу",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Ешбір файл таңдалмады",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Жоғары жылжу",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Төмен жылжытыңыз",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Жүктеу...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Көбірек жүктеңіз",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Келесі",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Алдыңғы",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Барлық мәндерді қосыңыз",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Таңдалған мәндерді қосыңыз",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Барлық мәндерді алып тастаңыз",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Таңдалған мәндерді алып тастаңыз",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Күнді таңдаңыз",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Өзгерту күні",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Таңдалған күн жарамсыз."
};
var validation$j = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `қабылдаңыз ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} кейін болуы керек ${date(args[0])}.`;
    }
    return `${sentence(name)} болашақта болуы керек.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} тек алфавиттік таңбаларды қамтуы мүмкін.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} тек әріптер мен сандардан тұруы мүмкін.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} тек әріптер мен бос орындар болуы мүмкін.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} алфавиттік таңбалардан тұруы керек.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} құрамында әріптер немесе сандар болуы керек.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} құрамында әріптер немесе бос орындар болуы керек.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} символы болуы керек.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} құрамында бас әріптер болуы керек.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} кіші әріп болуы керек.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} сандардан тұруы керек.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} символы болуы керек.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} тек бас әріптерден тұруы мүмкін.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} құрамында тек кіші әріптер болуы мүмкін.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} бұрын болуы керек ${date(args[0])}.`;
    }
    return `${sentence(name)} өткенде болуы керек.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Бұл өріс қате конфигурацияланған және оны жіберу мүмкін емес.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} арасында болуы керек ${a} және ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} сәйкес келмейді.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} жарамды күн емес, пішімді пайдаланыңыз ${args[0]}`;
    }
    return "Бұл өріс қате конфигурацияланған және оны жіберу мүмкін емес";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} арасында болуы керек ${date(args[0])} және ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Өтінеміз қолданыстағы электронды пошта адресін енгізіңіз.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} -мен бітпейді ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} рұқсат етілген мән емес.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} кем дегенде бір таңба болуы керек.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} кем немесе тең болуы керек ${max} кейіпкерлер.`;
    }
    if (min === max) {
      return `${sentence(name)} ${max} таңбалары болуы керек.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} артық немесе тең болуы керек ${min} кейіпкерлер.`;
    }
    return `${sentence(name)} арасында болуы керек ${min} және ${max} кейіпкерлер.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} рұқсат етілген мән емес.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `артық болуы мүмкін емес ${args[0]} ${name}.`;
    }
    return `${sentence(name)} кем немесе тең болуы керек ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Файл пішімдері рұқсат етілмейді.";
    }
    return `${sentence(name)} типте болуы керек: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `кем болуы мүмкін емес ${args[0]} ${name}.`;
    }
    return `${sentence(name)} кем дегенде болуы керек ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” рұқсат етілмейді ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} сан болуы керек.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" не ")} қажет.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} талап етіледі.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} -ден басталмайды ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Жарамды URL мекенжайын енгізіңіз.`;
  }
};
var kk = Object.freeze({
  __proto__: null,
  ui: ui$j,
  validation: validation$j
});
var ui$i = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "추가",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "제거",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "모두 제거",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "모든 값을 채워주세요",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "제출하기",
  /**
   * Shown when no files are selected.
   */
  noFiles: "선택된 파일이 없습니다",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "위로 이동",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "아래로 이동",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "로드 중...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "더 불러오기",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "다음",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "이전",
  /**
   * Shown when adding all values.
   */
  addAllValues: "모든 값 추가",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "선택한 값 추가",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "모든 값 제거",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "선택한 값 제거",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "날짜 선택",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "날짜 변경",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "선택한 날짜가 잘못되었습니다."
};
var validation$i = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `${name} 올바른 값을 선택 해주세요`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} 이후여야 합니다`;
    }
    return `${sentence(name)} 미래의 날짜여야합니다`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} 알파벳 문자만 포함할 수 있습니다`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} 문자와 숫자만 포함될 수 있습니다`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} 문자와 공백만 포함할 수 있습니다.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} 에는 알파벳 문자가 포함되어야 합니다.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} 에는 문자나 숫자가 포함되어야 합니다.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} 에는 문자나 공백이 포함되어야 합니다.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} 에는 기호를 포함해야 합니다.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} 는 대문자를 포함해야 합니다.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} 는 소문자를 포함해야 합니다.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} 에는 숫자가 포함되어야 합니다.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} 는 기호여야 합니다.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} 는 대문자만 포함할 수 있습니다.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} 는 소문자만 포함할 수 있습니다.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} 이전여야 합니다`;
    }
    return `${sentence(name)} 과거의 날짜여야합니다`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `잘못된 구성으로 제출할 수 없습니다`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} ${a}와 ${b} 사이여야 합니다`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} 일치하지 않습니다`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} 유효한 날짜가 아닙니다. ${args[0]}과 같은 형식을 사용해주세요`;
    }
    return "잘못된 구성으로 제출할 수 없습니다";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} ${date(args[0])}에서 ${date(args[1])} 사이여야 합니다`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "올바른 이메일 주소를 입력해주세요",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} ${list(args)}로 끝나지 않습니다`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} 허용되는 값이 아닙니다`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} 하나 이상의 문자여야 합니다`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} ${max}자 이하여야 합니다`;
    }
    if (min === max) {
      return `${sentence(name)} 는 ${max} 자 길이여야 합니다.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} ${min} 문자보다 크거나 같아야 합니다`;
    }
    return `${sentence(name)} ${min}에서 ${max}자 사이여야 합니다`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} 허용되는 값이 아닙니다`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${args[0]} ${name} 초과할 수 없습니다`;
    }
    return `${sentence(name)} ${args[0]}보다 작거나 같아야 합니다`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "파일 형식이 허용되지 않습니다";
    }
    return `${sentence(name)} ${args[0]} 유형이어야 합니다`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${args[0]} ${name}보다 작을 수 없습니다`;
    }
    return `${sentence(name)} ${args[0]} 이상이어야 합니다`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `${value}" 허용되지 않는 ${name}입니다`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} 숫자여야 합니다`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" 또는 ")}가 필요합니다.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} 필수 값입니다`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ${list(args)}로 시작하지 않습니다`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `유효한 URL을 입력하십시오.`;
  }
};
var ko = Object.freeze({
  __proto__: null,
  ui: ui$i,
  validation: validation$i
});
var ui$h = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Legg til",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Fjern",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Fjern alle",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Beklager, noen felter er ikke fylt ut korrekt.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Send inn",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Ingen fil valgt",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Flytt opp",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Flytt ned",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Laster...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Last mer",
  /**
   * Show on buttons that navigate state forward
   */
  next: "Neste",
  /**
   * Show on buttons that navigate state backward
   */
  prev: "Forrige",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Legg til alle verdier",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Legg til valgte verdier",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Fjern alle verdier",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Fjern valgte verdier",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Velg dato",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Endre dato",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Den valgte datoen er ugyldig."
};
var validation$h = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Vennligst aksepter ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} må være senere enn ${date(args[0])}.`;
    }
    return `${sentence(name)} må være i fremtiden.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} kan bare inneholde alfabetiske tegn.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} kan bare inneholde bokstaver og tall.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} kan bare inneholde bokstaver og mellomrom.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} must contain alphabetical characters.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} must contain letters and numbers.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} must contain letters and spaces.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} must contain symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} must contain uppercase.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} must contain lowercase.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} must contain number.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} can only contain symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} can only contain uppercase.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} can only contain lowercase.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} må være tidligere enn ${date(args[0])}.`;
    }
    return `${sentence(name)} må være i fortiden.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Dette feltet er feilkonfigurert og kan ikke innsendes.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} må være mellom ${a} og ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} stemmer ikke overens.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} er ikke en gyldig dato, vennligst bruk formatet ${args[0]}`;
    }
    return "Dette feltet er feilkonfigurert og kan ikke innsendes.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} må være mellom ${date(args[0])} og ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Vennligst oppgi en gyldig epostadresse.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} slutter ikke med ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} er ikke en tillatt verdi.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} må ha minst ett tegn.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} må ha mindre enn eller nøyaktig ${max} tegn.`;
    }
    if (min === max) {
      return `${sentence(name)} skal være ${max} tegn langt.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} må ha mer enn eller nøyaktig ${min} tegn.`;
    }
    return `${sentence(name)} må ha mellom ${min} og ${max} tegn.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} er ikke en tillatt verdi.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Kan ikke ha mer enn ${args[0]} ${name}.`;
    }
    return `${sentence(name)} må være mindre enn eller nøyaktig ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Ingen tillatte filformater.";
    }
    return `${sentence(name)} må være av typen: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Kan ikke ha mindre enn ${args[0]} ${name}.`;
    }
    return `${sentence(name)} må være minst ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” er ikke en tillatt ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} må være et tall.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" eller ")} er nødvendig.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} er påkrevd.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} starter ikke med ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Vennligst inkluder en gyldig url.`;
  }
};
var nb = Object.freeze({
  __proto__: null,
  ui: ui$h,
  validation: validation$h
});
var ui$g = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Toevoegen",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Verwijderen",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Alles verwijderen",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Sorry, niet alle velden zijn correct ingevuld.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Versturen",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Geen bestand gekozen",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Naar boven gaan",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Naar beneden verplaatsen",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Aan het laden...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Meer laden",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Vervolgens",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Voorgaand",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Alle waarden toevoegen",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Geselecteerde waarden toevoegen",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Alle waarden verwijderen",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Geselecteerde waarden verwijderen",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Kies een datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Datum wijzigen",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "De geselecteerde datum is ongeldig."
};
var validation$g = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Accepteer de ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} moet na ${date(args[0])} zijn.`;
    }
    return `${sentence(name)} moet in de toekomst liggen.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} mag alleen alfabetische tekens bevatten.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} mag alleen letters en cijfers bevatten.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} mag alleen letters en spaties bevatten.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} moet alfabetische tekens bevatten.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} moet letters of cijfers bevatten.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} moet letters of spaties bevatten.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} moet een symbool bevatten.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} moet hoofdletters bevatten.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} moet kleine letters bevatten.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} moet cijfers bevatten.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} moet een symbool zijn.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} mag alleen hoofdletters bevatten.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} mag alleen kleine letters bevatten.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} moet vóór ${date(args[0])} vallen.`;
    }
    return `${sentence(name)} moet in het verleden liggen.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Dit veld is onjuist geconfigureerd en kan niet worden verzonden.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} moet tussen ${a} en ${b} liggen.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} komt niet overeen.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} is geen geldige datum, gebruik de notatie ${args[0]}`;
    }
    return "Dit veld is onjuist geconfigureerd en kan niet worden verzonden";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} moet tussen ${date(args[0])} en ${date(args[1])} liggen`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Vul een geldig e-mailadres in.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} eindigt niet met ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} is geen toegestane waarde.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} moet minimaal één teken zijn.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} moet kleiner zijn dan of gelijk zijn aan ${max} tekens.`;
    }
    if (min === max) {
      return `${sentence(name)} moet ${max} tekens lang zijn.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} moet groter zijn dan of gelijk zijn aan ${min} tekens.`;
    }
    return `${sentence(name)} moet tussen de ${min} en ${max} tekens bevatten.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} is geen toegestane waarde.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Mag niet meer dan ${args[0]} ${name} hebben.`;
    }
    return `${sentence(name)} moet kleiner zijn dan of gelijk zijn aan ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Geen bestandsformaten toegestaan.";
    }
    return `${sentence(name)} moet van het type: ${args[0]} zijn`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Mag niet minder dan ${args[0]} ${name} hebben.`;
    }
    return `${sentence(name)} moet minimaal ${args[0]} zijn.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" is geen toegestane ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} moet een getal zijn.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" of ")} is vereist.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} is verplicht.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} begint niet met ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Voer een geldige URL in.`;
  }
};
var nl = Object.freeze({
  __proto__: null,
  ui: ui$g,
  validation: validation$g
});
var ui$f = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Dodaj",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Usuń",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Usuń wszystko",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Nie wszystkie pola zostały wypełnione poprawnie.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Wyślij",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nie wybrano pliku",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Przesuń w górę",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Przesuń w dół",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Ładowanie...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Załaduj więcej",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Kolejny",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Poprzednia",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Dodaj wszystkie wartości",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Dodaj wybrane wartości",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Usuń wszystkie wartości",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Usuń wybrane wartości",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Wybierz datę",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Zmień datę",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Wybrana data jest nieprawidłowa."
};
var validation$f = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Proszę zaakceptować ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} musi być po ${date(args[0])}.`;
    }
    return `${sentence(name)} musi być w przyszłości.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `Pole ${sentence(name)} może zawierać tylko znaki alfabetyczne.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `Pole ${sentence(name)} może zawierać tylko znaki alfanumeryczne.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `Pole ${sentence(name)} mogą zawierać tylko litery i spacje.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} musi zawierać znaki alfabetyczne.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} musi zawierać litery lub cyfry.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} musi zawierać litery lub spacje.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} musi zawierać symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} musi zawierać wielkie litery.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} musi zawierać małe litery.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} musi zawierać liczby.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} musi być symbolem.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} może zawierać tylko wielkie litery.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} może zawierać tylko małe litery.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} musi być przed ${date(args[0])}.`;
    }
    return `${sentence(name)} musi być w przeszłości.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Pole zostało wypełnione niepoprawnie i nie może zostać wysłane.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `Wartość pola ${sentence(name)} musi być pomiędzy ${a} i ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} nie pokrywa się.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Wartość pola ${sentence(name)} nie jest poprawną datą, proszę użyć formatu ${args[0]}`;
    }
    return "To pole zostało wypełnione niepoprawnie i nie może zostać wysłane";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `Data w polu ${sentence(name)} musi być pomiędzy ${date(args[0])} i ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Proszę wpisać poprawny adres email.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `Pole ${sentence(name)} nie kończy się na ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `Pole ${sentence(name)} nie jest dozwoloną wartością.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `Pole ${sentence(name)} musi posiadać minimum jeden znak.`;
    }
    if (min == 0 && max) {
      return `Pole ${sentence(name)} musi zawierać ${max} lub mniej znaków.`;
    }
    if (min && max === Infinity) {
      return `Pole ${sentence(name)} musi zawierać ${min} lub więcej znaków.`;
    }
    if (min === max) {
      return `Pole ${sentence(name)} musi mieć ${min} znaków.`;
    }
    return `Pole ${sentence(name)} musi mieć ${min}-${max} znaków.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `Pole ${sentence(name)} zawiera niedozwolone znaki.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nie można mieć więcej niż ${args[0]} ${name}.`;
    }
    return `Wartość pola ${sentence(name)} musi być mniejsza lub równa ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Nie podano dozwolonych typów plików.";
    }
    return `${sentence(name)} musi być typem: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Musisz podać więcej niż ${args[0]} ${name}.`;
    }
    return ` Musisz podać conajmniej ${args[0]} ${sentence(name)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name }) {
    return `Wartość pola ${name} jest niedozwolona.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} musi być numerem.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" lub ")} wymagany jest.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `Pole ${sentence(name)} jest wymagane.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `Wartośc pola ${sentence(name)} nie zaczyna się od ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Wprowadź prawidłowy adres URL.`;
  }
};
var pl = Object.freeze({
  __proto__: null,
  ui: ui$f,
  validation: validation$f
});
var ui$e = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Incluir",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Remover",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Remover todos",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Desculpe, alguns campos não foram preenchidos corretamente.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Enviar",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nenhum arquivo selecionado.",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Mover para cima",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Mover para baixo",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Carregando...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Carregar mais",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Próximo",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Anterior",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Adicione todos os valores",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Adicionar valores selecionados",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Remover todos os valores",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Remover valores selecionados",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Escolha a data",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Data da alteração",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "A data selecionada é inválida."
};
var validation$e = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Por favor aceite o ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} precisa ser depois de ${date(args[0])}.`;
    }
    return `${sentence(name)} precisa ser no futuro.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} precisa conter apenas letras.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} pode conter apenas letras e números.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} pode conter apenas números e espaços.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} deve conter caracteres alfabéticos.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} deve conter letras ou números.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} deve conter letras ou espaços.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} deve conter um símbolo.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} deve conter letras maiúsculas.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} deve conter letras minúsculas.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} deve conter números.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} deve ser um símbolo.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} só pode conter letras maiúsculas.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} só pode conter letras minúsculas.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} precisa ser antes de ${date(args[0])}.`;
    }
    return `${sentence(name)} precisa ser no passado.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Este campo não foi configurado corretamente e não pode ser submetido.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} precisa ser entre ${a} e ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} não é igual.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} não é uma data válida, por favor use este formato ${args[0]}`;
    }
    return "Este campo não foi configurado corretamente e não pode ser submetido.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} precisa ser entre ${date(args[0])} e ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Por favor, insira um endereço de email válido.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} não termina com ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} não é um valor permitido.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = first <= second ? first : second;
    const max = second >= first ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} precisa conter ao menos um caractere.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} precisa ser menor ou igual a ${max} caracteres.`;
    }
    if (min === max) {
      return `${sentence(name)} precisa conter ${max} caracteres.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} precisa ser maior ou igual a ${min} caracteres.`;
    }
    return `${sentence(name)} precisa ter entre ${min} e ${max} caracteres.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} não é um valor permitido.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Não pode ter mais de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} precisa ser menor ou igual a ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Não há formatos de arquivos permitidos.";
    }
    return `${sentence(name)} precisa ser do tipo: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Não pode ter menos de ${args[0]} ${name}.`;
    }
    return `${sentence(name)} precisa ser pelo menos ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” não é um(a) ${name} permitido(a).`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} precisa ser um número.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" ou ")} é necessário.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} é obrigatório.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} não começa com ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Por favor, insira uma url válida.`;
  }
};
var pt = Object.freeze({
  __proto__: null,
  ui: ui$e,
  validation: validation$e
});
var ui$d = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Adăugare",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Elimină",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Elimină tot",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Pare rău, unele câmpuri nu sunt corect completate.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Trimite",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nu este selectat nici un fișier",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Mutare în sus",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Mutare în jos",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Se încarcă...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Încărcați mai mult",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Urmatorul",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Precedent",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Adăugați toate valorile",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Adăugarea valorilor selectate",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Eliminați toate valorile",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Eliminați valorile selectate",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Alege data",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Modificați data",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Data selectată este nevalidă."
};
var validation$d = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Te rog acceptă ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} trebuie să fie după ${date(args[0])}.`;
    }
    return `${sentence(name)} trebuie sa fie în viitor.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} poate conține doar caractere alafetice.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} poate conține doar litere și numere.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} poate conține doar litere și spații.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} trebuie să conțină caractere alfabetice.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} trebuie să conțină litere sau numere.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} trebuie să conțină litere sau spații.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} trebuie să conțină simbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} trebuie să conțină majuscule.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} trebuie să conțină litere mici.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} trebuie să conțină numere.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} trebuie să fie un simbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} poate conține doar litere mari.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} poate conține doar litere mici.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} trebuie să preceadă ${date(args[0])}.`;
    }
    return `${sentence(name)} trebuie să fie în trecut.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Câmpul a fost configurat incorect și nu poate fi trimis.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} trebuie să fie între ${a} și ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} nu se potrivește.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nu este validă, te rog foloște formatul ${args[0]}`;
    }
    return "Câmpul a fost incorect configurat și nu poate fi trimis.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} trebuie să fie între ${date(args[0])} și ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Te rog folosește o adresă de email validă.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} nu se termină cu ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} nu este o valoare acceptată.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} trebuie sa conțină cel puțin un caracter.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} trebuie sa aibă cel mult ${max} caractere.`;
    }
    if (min === max) {
      return `${sentence(name)} ar trebui să aibă ${max} caractere lungi.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} trebuie să aibă cel puțin ${min} caractere.`;
    }
    return `${sentence(name)} trebuie să aibă între ${min} și ${max} caractere.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} nu este o valoare acceptată.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nu poate avea mai mult decat ${args[0]} ${name}.`;
    }
    return `${sentence(name)} trebuie să fie cel mult egal cu ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Tipul de fișier neacceptat.";
    }
    return `${sentence(name)} trebuie să fie de tipul: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nu poate avea mai puțin decât ${args[0]} ${name}.`;
    }
    return `${sentence(name)} trebuie să fie cel puțin ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” nu este o valoare acceptă pentru ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} trebuie să fie un număr.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" sau ")} este necesar.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} este necesar.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} nu începe cu ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Introduceți o adresă URL validă.`;
  }
};
var ro = Object.freeze({
  __proto__: null,
  ui: ui$d,
  validation: validation$d
});
var ui$c = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Добавить",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Удалить",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Убрать все",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Извините, не все поля заполнены верно.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Отправить",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Файл не выбран",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Переместить вверх",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Переместить вниз",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Загрузка...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Загрузить больше",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Следующий",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Предыдущий",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Добавить все значения",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Добавить выбранные значения",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Удалить все значения",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Удалить выбранные значения",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Выберите дату",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Изменить дату",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Выбранная дата недействительна."
};
var validation$c = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Пожалуйста, примите ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Дата ${sentence(name)} должна быть позже ${date(args[0])}.`;
    }
    return `Дата ${sentence(name)} должна быть в будущем.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `Поле ${sentence(name)} может содержать только буквы.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `Поле ${sentence(name)} может содержать только буквы и цифры.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} могут содержать только буквы и пробелы.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} должен содержать алфавитные символы.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} должен содержать буквы или цифры.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} должно содержать буквы или пробелы.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} должен содержать символ.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} должно содержать прописные буквы.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} должно содержать строчные буквы.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} должен содержать числа.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} должен быть символом.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} может содержать только прописные буквы.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} может содержать только буквы нижнего регистра.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Дата ${sentence(name)} должна быть раньше ${date(args[0])}.`;
    }
    return `Дата ${sentence(name)} должна быть в прошлом.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Это поле заполнено неверно и не может быть отправлено.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `Поле ${sentence(name)} должно быть между ${a} и ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `Поле ${sentence(name)} не совпадает.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Поле ${sentence(name)} имеет неверную дату. Пожалуйста, используйте формат ${args[0]}`;
    }
    return "Это поле заполнено неверно и не может быть отправлено.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `Дата ${sentence(name)} должна быть между ${date(args[0])} и ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Пожалуйста, введите действительный электронный адрес.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `Поле ${sentence(name)} не должно заканчиваться на ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `Поле ${sentence(name)} имеет неподустимое значение.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `Поле ${sentence(name)} должно содержать минимум один символ.`;
    }
    if (min == 0 && max) {
      return `Длина поля ${sentence(name)} должна быть меньше или равна ${max} символам.`;
    }
    if (min === max) {
      return `Длина ${sentence(name)} должна составлять ${max} символов.`;
    }
    if (min && max === Infinity) {
      return `Длина поля ${sentence(name)} должна быть больше или равна ${min} символам.`;
    }
    return `Длина поля ${sentence(name)} должна быть между ${min} и ${max} символами.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `Поле ${sentence(name)} имеет недопустимое значение.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Не может быть выбрано больше, чем ${args[0]} ${name}.`;
    }
    return `Поле ${sentence(name)} должно быть меньше или равно ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Не указаны поддержиавемые форматы файла.";
    }
    return `Формат файла в поле ${sentence(name)} должен быть: ${args[0]}.`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Не может быть выбрано меньше, чем ${args[0]} ${name}.`;
    }
    return `Поле ${sentence(name)} должно быть не менее, чем ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” не поддерживается в поле ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `Поле ${sentence(name)} должно быть числом.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" или ")} требуется.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `Поле ${sentence(name)} обязательно для заполнения.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `Поле ${sentence(name)} должно начинаться с ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Пожалуйста, введите действительный URL-адрес.`;
  }
};
var ru = Object.freeze({
  __proto__: null,
  ui: ui$c,
  validation: validation$c
});
var ui$b = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Pridať",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Odstrániť",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Odstrániť všetko",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Prepáčte, ale nie všetky polia sú vyplnené správne.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Odoslať",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nebol vybraný žiadny súbor",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Posunúť hore",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Posunúť dole",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Načítavanie...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Načítať viac",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Ďalšie",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Predošlý",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Pridajte všetky hodnoty",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Pridajte vybrané hodnoty",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Odstrániť všetky hodnoty",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Odstrániť vybrané hodnoty",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Vyberte dátum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Zmena dátumu",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Vybraný dátum je neplatný."
};
var validation$b = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Prosím zaškrtnite ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} musí byť za ${date(args[0])}.`;
    }
    return `${sentence(name)} musí byť v budúcnosti.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} môže obsahovať iba písmená.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} môže obsahovať iba písmená a čísla.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} môže obsahovať iba písmená a medzery.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} musí obsahovať abecedné znaky.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} musí obsahovať písmená alebo číslice.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} musí obsahovať písmená alebo medzery.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} musí obsahovať symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} musí obsahovať veľké písmená.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} musí obsahovať malé písmená.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} musí obsahovať čísla.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} musí byť symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} môže obsahovať iba veľké písmená.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} môže obsahovať len malé písmená.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} musí byť pred ${date(args[0])}.`;
    }
    return `${sentence(name)} musí byť v minulosti.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Toto pole bolo nesprávne nakonfigurované a nemôže byť odoslané.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} musí byť medzi ${a} and ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} does not match.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nie je platným dátumom, prosím, použite formát ${args[0]}`;
    }
    return "Toto pole bolo nesprávne nakonfigurované a nemôže byť odoslané.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} musí byť medzi ${date(args[0])} a ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Prosím, zadajte platnú emailovú adresu.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} nekončí na ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} nie je povolená hodnota.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} musí mať najmenej jeden znak.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} musí byť menšie alebo rovné ako ${max} znakov.`;
    }
    if (min === max) {
      return `${sentence(name)} by mala mať dĺžku ${max} znakov.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} musí byť väčšie alebo rovné ako ${min} znakov.`;
    }
    return `${sentence(name)} musí byť medzi ${min} až ${max} znakov.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} nie je povolená hodnota.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nie je možné použiť viac než ${args[0]} ${name}.`;
    }
    return `${sentence(name)} musí byť menšie alebo rovné ako ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Nie sú povolené formáty súborov.";
    }
    return `${sentence(name)} musí byť typu: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Nemôže byť menej než ${args[0]} ${name}.`;
    }
    return `${sentence(name)} musí byť minimálne ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” nie je povolené hodnota pre ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} musí byť číslo.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" alebo ")} je potrebný.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} je povinné.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} nezačíná s ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Zadajte platnú adresu URL.`;
  }
};
var sk = Object.freeze({
  __proto__: null,
  ui: ui$b,
  validation: validation$b
});
var ui$a = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Dodaj",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Odstrani",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Odstrani vse",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Nekatera polja niso pravilno izpolnjena.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Pošlji",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Nobena datoteka ni izbrana",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Premakni se navzgor",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Premakni se navzdol",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Nalaganje...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Naloži več",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Naslednji",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Prejšnji",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Dodajte vse vrednosti",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Dodajanje izbranih vrednosti",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Odstranite vse vrednosti",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Odstrani izbrane vrednosti",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Izberite datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Spremeni datum",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Izbrani datum je neveljaven."
};
var validation$a = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Prosimo popravite ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mora biti po ${date(args[0])}.`;
    }
    return `${sentence(name)} mora biti v prihodnosti.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} lahko vsebuje samo znake abecede.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} lahko vsebuje samo črke in številke.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} lahko vsebuje samo črke in presledke.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} mora vsebovati abecedne znake.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} mora vsebovati črke ali številke.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} mora vsebovati črke ali presledke.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} mora vsebovati simbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} mora vsebovati velike črke.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} mora vsebovati male črke.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} mora vsebovati številke.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} mora biti simbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} lahko vsebuje le velike črke.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} lahko vsebuje le male črke.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mora biti pred ${date(args[0])}.`;
    }
    return `${sentence(name)} mora biti v preteklosti.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `To polje je narobe nastavljeno in ne mora biti izpolnjeno.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} mora biti med ${a} in ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} se ne ujema.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ni pravilen datum, prosimo uporabite format ${args[0]}`;
    }
    return "To polje je narobe nastavljeno in ne mora biti izpolnjeno.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} mora biti med ${date(args[0])} in ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Vnesite veljaven e-poštni naslov.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} se mora kočati z ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} ni dovoljena vrednost.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} mora vsebovati vsaj en znak.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} mora vsebovati največ ${max} znakov.`;
    }
    if (min === max) {
      return `${sentence(name)} mora biti dolg ${max} znakov.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} mora vsebovati vsaj ${min} znakov.`;
    }
    return `${sentence(name)} mora vsebovati med ${min} in ${max} znakov.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} ni dovoljena vrednost.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Največ je ${args[0]} ${name}.`;
    }
    return `${sentence(name)} je lahko največ ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Nobena vrsta datoteke ni dovoljena.";
    }
    return `${sentence(name)} mora biti tipa: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Najmanj ${args[0]} ${name} je dovoljenih.`;
    }
    return `${sentence(name)} mora biti vsaj ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” ni dovoljen(a/o) ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} mora biti številka.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" ali ")} zahtevan je.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} je zahtevan(o/a).`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} se mora začeti z ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Vnesite veljaven URL.`;
  }
};
var sl = Object.freeze({
  __proto__: null,
  ui: ui$a,
  validation: validation$a
});
var ui$9 = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Dodaj",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Ukloni",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Ukloni sve",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Pojedina polja nisu ispravno ispunjena.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Pošalji",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Fajl nije odabran",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Pomerite se gore",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Pomeri se dole",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Učitavanje...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Učitaj više",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Sledeća",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Prethodna",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Dodajte sve vrednosti",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Dodajte izabrane vrednosti",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Uklonite sve vrednosti",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Uklonite izabrane vrednosti",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Izaberite datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Promenite datum",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Izabrani datum je nevažeći."
};
var validation$9 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Molimo prihvatite ${name}`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mora biti posle ${date(args[0])}.`;
    }
    return `${sentence(name)} mora biti u budućnosti.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} može da sadrži samo abecedne znakove.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} može da sadrži samo slova i brojeve.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} može da sadrži samo slova i razmake.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} mora da sadrži abecedne znakove.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} mora da sadrži slova ili brojeve.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} mora da sadrži slova ili razmake.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} mora da sadrži simbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} mora da sadrži velika slova.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} mora da sadrži mala slova.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} mora da sadrži brojeve.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} mora biti simbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} može da sadrži samo velika slova.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} može da sadrži samo mala slova.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} mora biti pre ${date(args[0])}.`;
    }
    return `${sentence(name)} mora biti u prošlosti.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Ovo polje je pogrešno konfigurisano i ne može se poslati.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} mora biti između ${a} i ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} se ne podudara.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} nije važeći datum, molimo Vas koristite format ${args[0]}`;
    }
    return "Ovo polje je pogrešno konfigurisano i ne može se poslati";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} mora biti između ${date(args[0])} i ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Unesite ispravnu e-mail adresu.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} se ne završava sa ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} nije dozvoljena vrednost`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} mora biti najmanje jedan karakter.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} mora biti manji ili jednaki od ${max} karaktera.`;
    }
    if (min === max) {
      return `${sentence(name)} treba da bude ${max} znakova dugačak.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} mora biti veći ili jednaki od ${min} karaktera.`;
    }
    return `${sentence(name)} mora biti između ${min} i ${max} karaktera.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} nije dozvoljena vrednost.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Ne može imati više od ${args[0]} ${name}.`;
    }
    return `${sentence(name)} mora biti manji ili jednaki od ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Nisu dozvoljeni formati datoteka.";
    }
    return `${sentence(name)} mora biti tipa: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Ne može imati manje od ${args[0]} ${name}.`;
    }
    return `${sentence(name)} mora da ima najmanje ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” nije dozvoljeno ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} mora biti broj.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" или ")} потребан је.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} je obavezno polje.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ne počinje sa ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Unesite važeću URL adresu.`;
  }
};
var sr = Object.freeze({
  __proto__: null,
  ui: ui$9,
  validation: validation$9
});
var ui$8 = {
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Ta bort",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Ta bort alla",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Tyvärr är inte alla fält korrekt ifyllda",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Skicka",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Ingen fil vald",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Flytta upp",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Flytta ner",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Laddar...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Ladda mer",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Nästa",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Föregående",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Lägg till alla värden",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Lägg till valda värden",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Ta bort alla värden",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Ta bort valda värden",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Välj datum",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Ändra datum",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Det valda datumet är ogiltigt."
};
var validation$8 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Var god acceptera ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} måste vara efter ${date(args[0])}.`;
    }
    return `${sentence(name)} måste vara framåt i tiden.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} kan enbart innehålla bokstäver i alfabetet.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} kan bara innehålla bokstäver och siffror.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} kan bara innehålla bokstäver och blanksteg.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} måste innehålla alfabetiska tecken.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} måste innehålla bokstäver eller siffror.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} måste innehålla bokstäver eller mellanslag.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} måste innehålla symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} måste innehålla versaler.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} måste innehålla gemener.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} måste innehålla siffror.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} måste vara en symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} kan bara innehålla versaler.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} kan bara innehålla små bokstäver.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} måste vara före ${date(args[0])}.`;
    }
    return `${sentence(name)} måste vara bakåt i tiden.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Det här fältet ställdes inte in korrekt och kan inte användas.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} måste vara mellan ${a} och ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} matchar inte.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} är inte ett giltigt datum, var god använd formatet ${args[0]}`;
    }
    return "Det här fältet ställdes inte in korrekt och kan inte användas";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} måste vara mellan ${date(args[0])} och ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Var god fyll i en giltig e-postadress.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} slutar inte med ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} är inte ett godkänt värde.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} måste ha minst ett tecken.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} måste vara ${max} tecken eller färre.`;
    }
    if (min === max) {
      return `${sentence(name)} bör vara ${max} tecken långa.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} måste vara ${min} tecken eller fler.`;
    }
    return `${sentence(name)} måste vara mellan ${min} och ${max} tecken.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} är inte ett godkänt värde.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Kan inte ha mer än ${args[0]} ${name}.`;
    }
    return `${sentence(name)} måste vara ${args[0]} eller mindre.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Inga filtyper tillåtna.";
    }
    return `${sentence(name)} måste vara av filtypen: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Kan inte ha mindre än ${args[0]} ${name}.`;
    }
    return `${sentence(name)} måste vara minst ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” är inte ett godkänt ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} måste vara en siffra.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" eller ")} krävs.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} är obligatoriskt.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} börjar inte med ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Ange en giltig URL.`;
  }
};
var sv = Object.freeze({
  __proto__: null,
  ui: ui$8,
  validation: validation$8
});
var ui$7 = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Илова кардан",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Хориҷ кардан",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Ҳамаро хориҷ кунед",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Бубахшед, на ҳама майдонҳо дуруст пур карда шудаанд.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Пешниҳод кунед",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Ягон файл интихоб нашудааст",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Ба боло ҳаракат кунед",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Ба поён ҳаракат кунед",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Дар ҳоли боргузорӣ",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Бештар бор кунед",
  /**
   * Show on buttons that navigate state forward
   */
  next: "Баъдӣ",
  /**
   * Show on buttons that navigate state backward
   */
  prev: "Гузашта",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Ҳама арзишҳоро илова кунед",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Илова кардани арзишҳои интихобшуда",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Ҳама арзишҳоро хориҷ кунед",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Арзишҳои интихобшударо хориҷ кунед",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Сана интихоб кунед",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Тағйир додани сана",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Санаи интихобшуда нодуруст аст."
};
var validation$7 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Лутфан ${name}-ро қабул кунед`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} бояд пас аз ${date(args[0])} бошад.`;
    }
    return `${sentence(name)} бояд дар оянда бошад.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} метавонад танҳо аломатҳои алифборо дар бар гирад.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} метавонад танҳо ҳарфҳо ва рақамҳоро дар бар гирад.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} метавонад танҳо ҳарфҳо ва фосилаҳоро дар бар гирад.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} must contain alphabetical characters.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} must contain letters and numbers.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} must contain letters and spaces.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} must contain symbol.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} must contain uppercase.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} must contain lowercase.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} must contain number.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} can only contain symbol.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} can only contain uppercase.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} can only contain lowercase.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} бояд пеш аз ${date(args[0])} бошад.`;
    }
    return `${sentence(name)} бояд дар гузашта бошад.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Ин майдон нодуруст танзим шудааст ва онро пешниҳод кардан ғайриимкон аст.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} бояд дар байни ${a} ва ${b} бошад.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} мувофиқат намекунад.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} санаи дуруст нест, лутфан формати ${args[0]}-ро истифода баред`;
    }
    return "Ин майдон нодуруст танзим шудааст ва онро пешниҳод кардан ғайриимкон аст";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} бояд дар байни ${date(args[0])} ва ${date(args[1])} бошад`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Лутфан нишонаи имейли амалкунандаро ворид намоед.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} бо ${list(args)} ба охир намерасад.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} арзиши иҷозатдодашуда нест.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} бояд ҳадди аққал як аломат бошад.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} бояд аз ${max} аломат камтар ё баробар бошад.`;
    }
    if (min === max) {
      return `${sentence(name)} бояд ${max} аломат бошад.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} бояд аз ${min} аломат зиёд ё баробар бошад.`;
    }
    return `${sentence(name)} бояд дар байни ${min} ва ${max} аломат бошад.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} арзиши иҷозатдодашуда нест.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Зиёда аз ${args[0]} ${name} дошта наметавонад.`;
    }
    return `${sentence(name)} бояд аз ${args[0]} камтар ё баробар бошад.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Ягон формати файл иҷозат дода намешавад.";
    }
    return `${sentence(name)} бояд чунин намуд бошад: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Камтар аз ${args[0]} ${name} дошта наметавонад.`;
    }
    return `${sentence(name)} бояд ҳадди аққал ${args[0]} бошад.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" ${name} иҷозат дода намешавад.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} бояд рақам бошад.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" ё ")} зарур а`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} лозим аст.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} бо ${list(args)} оғоз намешавад.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Лутфан URL-и дурустро дохил кунед.`;
  }
};
var tg = Object.freeze({
  __proto__: null,
  ui: ui$7,
  validation: validation$7
});
var ui$6 = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "เพิ่ม",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "เอาออก",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "เอาออกทั้งหมด",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "ขออภัย ข้อมูลบางช่องที่กรอกไม่ถูกต้อง",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "ส่ง",
  /**
   * Shown when no files are selected.
   */
  noFiles: "ยังไม่ได้เลือกไฟล์",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "เลื่อนขึ้น",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "เลื่อนลง",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "กำลังโหลด...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "โหลดเพิ่มเติม",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "ถัดไป",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "ก่อนหน้า",
  /**
   * Shown when adding all values.
   */
  addAllValues: "เพิ่มค่าทั้งหมด",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "เพิ่มค่าที่เลือก",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "ลบค่าทั้งหมด",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "ลบค่าที่เลือก",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "เลือกวันที่",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "เปลี่ยนวันที่",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "วันที่ที่เลือกไม่ถูกต้อง"
};
var validation$6 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `กรุณายอมรับ ${name}`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} จะต้องเป็นวันที่หลังจาก ${date(args[0])}`;
    }
    return `${sentence(name)} จะต้องเป็นวันที่ที่ยังไม่มาถึง`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} สามารถเป็นได้แค่ตัวอักษรเท่านั้น`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} สามารถเป็นได้แค่ตัวอักษรและตัวเลขเท่านั้น`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} สามารถเป็นได้แค่ตัวอักษรและเว้นวรรคเท่านั้น`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} ต้องมีตัวอักษรตัวอักษร`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} ต้องมีตัวอักษรหรือตัวเลข`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} ต้องมีตัวอักษรหรือช่องว่าง`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} ต้องมีสัญลักษณ์`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} ต้องมีตัวพิมพ์ใหญ่`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} ต้องมีตัวพิมพ์เล็ก`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} ต้องมีตัวเลข`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} จะต้องเป็นสัญลักษณ์`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} เท่านั้นที่สามารถมีตัวอักษรตัวพิมพ์ใหญ่`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} เท่านั้นที่สามารถมีตัวอักษรตัวพิมพ์เล็ก`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} จะต้องเป็นวันที่ที่มาก่อน ${date(args[0])}`;
    }
    return `${sentence(name)} จะต้องเป็นวันที่ที่ผ่านมาแล้ว`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `ช่องนี้ถูกตั้งค่าอย่างไม่ถูกต้อง และจะไม่สามารถส่งข้อมูลได้`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} จะต้องเป็นค่าระหว่าง ${a} และ ${b}`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} ไม่ตรงกัน`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ไม่อยู่ในรูปแบบวันที่ที่ถูกต้อง กรุณากรอกตามรูปแบบ ${args[0]}`;
    }
    return "ช่องนี้ถูกตั้งค่าอย่างไม่ถูกต้อง และจะไม่สามารถส่งข้อมูลได้";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} จะต้องเป็นวันที่ระหว่าง ${date(args[0])} และ ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "กรุณากรอกที่อยู่อีเมลทีถูกต้อง",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} จะต้องลงท้ายด้วย ${list(args)}`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} ไม่ใช่ค่าที่อนุญาตให้กรอก`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} จะต้องมีความยาวอย่างน้อยหนึ่งตัวอักษร`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} จะต้องมีความยาวไม่เกิน ${max} ตัวอักษร`;
    }
    if (min === max) {
      return `${sentence(name)} ควรจะเป็น ${max} ตัวอักษรยาว`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} จะต้องมีความยาว ${min} ตัวอักษรขึ้นไป`;
    }
    return `${sentence(name)} จะต้องมีความยาวระหว่าง ${min} และ ${max} ตัวอักษร`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} ไม่ใช่ค่าที่อนุญาตให้กรอก`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `ไม่สามารถเลือกมากกว่า ${args[0]} ${name} ได้`;
    }
    return `${sentence(name)} จะต้องมีค่าไม่เกิน ${args[0]}`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "ไม่มีประเภทของไฟล์ที่อนุญาต";
    }
    return `${sentence(name)} จะต้องเป็นไฟล์ประเภท ${args[0]} เท่านั้น`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `ไม่สามารถเลือกน้อยกว่า ${args[0]} ${name} ได้`;
    }
    return `${sentence(name)} จะต้องมีค่าอย่างน้อย ${args[0]}`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” ไม่ใช่ค่า ${name} ที่อนุญาตให้กรอก`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} จะต้องเป็นตัวเลขเท่านั้น`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" หรือ ")} ต้องการ.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `กรุณากรอก ${sentence(name)}`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} จะต้องเริ่มต้นด้วย ${list(args)}`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `กรุณาระบุที่อยู่ลิงก์ให้ถูกต้อง`;
  }
};
var th = Object.freeze({
  __proto__: null,
  ui: ui$6,
  validation: validation$6
});
var ui$5 = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Ekle",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Kaldır",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Hepsini kaldır",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Maalesef, tüm alanlar doğru doldurulmadı.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Gönder",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Dosya yok",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Yukarı Taşı",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Aşağı taşı",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Yükleniyor...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Daha fazla yükle",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Sonraki",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Önceki",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Tüm değerleri ekle",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Seçili değerleri ekle",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Tüm değerleri kaldır",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Seçili değerleri kaldır",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Tarih seçin",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Tarihi değiştir",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Seçilen tarih geçersiz."
};
var validation$5 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Lütfen ${name}'yi kabul edin.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])}'den sonra olmalıdır.`;
    }
    return `${sentence(name)} gelecekte bir zaman olmalıdır.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} sadece alfabetik karakterler içerebilir.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} sadece alfabetik karakterler ve sayı içerebilir.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} yalnızca harf ve boşluk içerebilir.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} alfabetik karakterler içermelidir.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} harf veya rakamı içermelidir.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} harf veya boşluk içermelidir.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} sembol içermelidir.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} büyük harf içermelidir.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} küçük harf içermelidir.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} sayı içermelidir.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} bir sembol olmalıdır.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} yalnızca büyük harfler içerebilir.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} yalnızca küçük harfler içerebilir.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} tarihinden önce olmalı.`;
    }
    return `${sentence(name)} geçmişte olmalı.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Alan yanlış yapılandırılmış ve gönderilemez.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} ${a} ve ${b} aralığında olmalı.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} eşleşmiyor.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} geçerli bir tarih değil, lütfen ${args[0]} biçimini kullanın.`;
    }
    return "Alan yanlış yapılandırılmış ve gönderilemez.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)}, ${date(args[0])} ve ${date(args[1])} aralığında olmalı.`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Lütfen geçerli bir e-mail adresi girin.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} ${list(args)} ile bitmiyor.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} izin verilen bir değer değil.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} en azından bir karakter uzunluğunda olmalı.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} ${max}'e eşit veya daha küçük olmalı.`;
    }
    if (min === max) {
      return `${sentence(name)} ${max} karakter uzunluğunda olmalıdır.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} ${min}'e eşit veya daha büyük olmalı.`;
    }
    return `${sentence(name)}, ${min} ve ${max} karakter uzunluğu aralığında olmalı.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} izin verilen bir değer değil.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name}'in uzunluğu ${args[0]}'dan daha uzun olamaz.`;
    }
    return `${sentence(name)} en azından ${args[0]} uzunluğunda veya ona eşit olmalı.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Hiçbir dosya türüne izin verilmez.";
    }
    return `${sentence(name)} şu tiplerden biri olmalı: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name}'in uzunluğu ${args[0]}'dan daha kısa olamaz.`;
    }
    return `${sentence(name)} en azından ${args[0]} uzunluğunda olmalı.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” ${name} olamaz.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} sayı olmalı.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" veya ")} gereklidir.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} gerekli.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ${list(args)} ile başlamıyor.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Lütfen geçerli bir URL girin.`;
  }
};
var tr = Object.freeze({
  __proto__: null,
  ui: ui$5,
  validation: validation$5
});
var ui$4 = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Додати",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Видалити",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Видалити все",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Вибачте, не всі поля заповнені правильно.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Відправити",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Файл не вибрано",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Рухатися вгору",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Пересунути вниз",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Завантаження...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Завантажте більше",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Наступний",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Попередній",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Додати всі значення",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Додати вибрані значення",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Вилучити всі значення",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Вилучити вибрані значення",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Виберіть дату",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Змінити дату",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Вибрана дата недійсна."
};
var validation$4 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Будь ласка, прийміть ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Дата ${sentence(name)} повинна бути пізніше за ${date(args[0])}.`;
    }
    return `Дата ${sentence(name)} має бути в майбутньому.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `Поле ${sentence(name)} може містити лише літери.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `Поле ${sentence(name)} може містити лише літери та цифри.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `Поле ${sentence(name)} може містити лише літери та пробіли.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} повинен містити алфавітні символи.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} повинен містити букви або цифри.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} повинен містити літери або пробіли.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} повинен містити символ.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} повинен містити великі регістри.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} повинен містити малі регістри.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} повинен містити цифри.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} має бути символом.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} може містити лише великі літери.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} може містити лише малі літери.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Дата ${sentence(name)} повинна бути раніше за ${date(args[0])}.`;
    }
    return `Дата ${sentence(name)} повинна бути в минулому.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Це поле заповнено неправильно і не може бути надіслано.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `Поле ${sentence(name)} повинно бути між ${a} та ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `Поле ${sentence(name)} не збігається.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `Поле ${sentence(name)} має неправильну дату. Будь ласка, використовуйте формат ${args[0]}.`;
    }
    return "Це поле заповнено неправильно і не може бути надіслано.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `Дата ${sentence(name)} повинна бути між ${date(args[0])} та ${date(args[1])}.`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Будь ласка, введіть дійсну електронну адресу.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `Поле ${sentence(name)} не повинно закінчуватися на ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `Поле ${sentence(name)} має неприпустиме значення.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `Поле ${sentence(name)} має містити щонайменше один символ.`;
    }
    if (min == 0 && max) {
      return `Довжина поля ${sentence(name)} повинна бути меншою або дорівнювати ${max} символам.`;
    }
    if (min === max) {
      return `${sentence(name)} має бути довжиною ${max} символів.`;
    }
    if (min && max === Infinity) {
      return `Довжина поля ${sentence(name)} повинна бути більшою або дорівнювати ${min} символам.`;
    }
    return `Довжина поля ${sentence(name)} повинна бути між ${min} та ${max} символами.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `Поле ${sentence(name)} має неприпустиме значення.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Не може бути вибрано більше ніж ${args[0]} ${name}.`;
    }
    return `Поле ${sentence(name)} має бути менше або дорівнювати ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Не вказано дозволені типи файлів.";
    }
    return `Тип файлу в полі ${sentence(name)} має бути: ${args[0]}.`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `Не може бути вибрано менше ніж ${args[0]} ${name}.`;
    }
    return `Поле ${sentence(name)} має бути не менше ніж ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” не дозволено в полі ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `Поле ${sentence(name)} має бути числом.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" або ")} потрібно.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `Поле ${sentence(name)} є обов'язковим.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `Поле ${sentence(name)} має починатися з ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Будь ласка, введіть коректну URL-адресу.`;
  }
};
var uk = Object.freeze({
  __proto__: null,
  ui: ui$4,
  validation: validation$4
});
var ui$3 = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "Qo'shish",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "O'chirish",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Hammasini o'chirish",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Kechirasiz, barcha maydonlar to'g'ri to'ldirilmagan.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Yuborish",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Hech qanday fayl tanlanmagan",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Yuqoriga ko’taring",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Pastga siljish",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Yuklanmoqda...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Ko’proq yuklang",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Keyingi",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Oldingi",
  /**
   * Shown when adding all values.
   */
  addAllValues: `Barcha qiymatlarni qo'shish`,
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: `Tanlangan qiymatlarni qoʻshish`,
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Barcha qiymatlarni olib tashlang",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Tanlangan qiymatlarni olib tashlash",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Sanani tanlang",
  /**
   * Shown when there is a date to change.
   */
  changeDate: `O'zgartirish sanasi`,
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Tanlangan sana yaroqsiz."
};
var validation$3 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `${name} ni qabul qiling.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} dan keyin bo'lishi kerak.`;
    }
    return `${sentence(name)} kelajakda bo'lishi kerak.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} faqat alifbo tartibidagi belgilardan iborat bo'lishi mumkin.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} faqat harflar va raqamlardan iborat bo'lishi mumkin.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} faqat harf va bo'shliqlardan iborat bo'lishi mumkin.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} alfavit belgilarini o'z ichiga olishi kerak.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} harflar yoki raqamlarni o'z ichiga olishi kerak.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} harflar yoki bo'shliqlar bo'lishi kerak.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} belgisi bo'lishi kerak.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} katta harfni o'z ichiga olishi kerak.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} kichik harflarni o'z ichiga olishi kerak.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} raqamlarini o'z ichiga olishi kerak.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} belgisi bo'lishi kerak.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} faqat katta harflarni o'z ichiga olishi mumkin.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} faqat kichik harflarni o'z ichiga olishi mumkin.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} ${date(args[0])} dan oldin bo'lishi kerak`;
    }
    return `${sentence(name)} o'tmishda bo'lishi kerak.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Bu maydon noto'g'ri sozlangan va uni yuborib bo'lmaydi.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} ${a} va ${b} orasida bo'lishi kerak.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} mos emas.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} haqiqiy sana emas, iltimos ${args[0]} formatidan foydalaning`;
    }
    return "Bu maydon noto'g'ri sozlangan va uni yuborib bo'lmaydi";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} ${date(args[0])} va ${date(args[1])} oralig'ida bo'lishi kerak`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Iltimos amaldagi e-mail manzilingizni kiriting.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} ${list(args)} bilan tugamaydi.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} ruxsat etilgan qiymat emas.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} kamida bitta belgidan iborat bo'lishi kerak.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} ${max} ta belgidan kam yoki teng bo'lishi kerak.`;
    }
    if (min === max) {
      return `${sentence(name)} bo'lishi kerak ${max} belgilar uzun.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} ${min} ta belgidan ko'p yoki teng bo'lishi kerak.`;
    }
    return `${sentence(name)} ${min} va ${max} gacha belgilardan iborat bo'lishi kerak.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} ruxsat etilgan qiymat emas.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${args[0]} ${name} dan ortiq bo'lishi mumkin emas.`;
    }
    return `${sentence(name)} ${args[0]} dan kichik yoki teng bo'lishi kerak.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Fayl formatlariga ruxsat berilmagan.";
    }
    return `${sentence(name)} quyidagi turdagi bo'lishi kerak: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${args[0]} ${name} dan kam bo'lmasligi kerak.`;
    }
    return `${sentence(name)} kamida ${args[0]} bo'lishi kerak.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" ruxsat berilmagan ${name}.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} raqam bo'lishi kerak.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" yoki ")} kerak.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} talab qilinadi.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} ${list(args)} bilan boshlanmaydi.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Iltimos, tegishli URL manzilini kiriting.`;
  }
};
var uz = Object.freeze({
  __proto__: null,
  ui: ui$3,
  validation: validation$3
});
var ui$2 = {
  /**
   * Shown on buttons for adding new items.
   */
  add: "Thêm",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "Xoá",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "Xoá tất cả",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "Xin lỗi, không phải tất cả các trường đều được nhập đúng.",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "Gửi",
  /**
   * Shown when no files are selected.
   */
  noFiles: "Chưa chọn file",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "Di chuyển lên",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "Di chuyển xuống",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "Đang tải...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "Tải thêm",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "Tiếp",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "Trước",
  /**
   * Shown when adding all values.
   */
  addAllValues: "Thêm tất cả các giá trị",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "Thêm các giá trị đã chọn",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "Loại bỏ tất cả các giá trị",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "Loại bỏ các giá trị đã chọn",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "Chọn ngày",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "Thay đổi ngày",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "Ngày đã chọn không hợp lệ."
};
var validation$2 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `Hãy đồng ý với ${name}.`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} phải sau ${date(args[0])}.`;
    }
    return `${sentence(name)} phải trong tương lai.`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} có thể chỉ bao gồm các chữ cái alphabet.`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} có thể chỉ bao gồm các chữ cái và chữ số.`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} chỉ có thể chứa các chữ cái và khoảng trắng.`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} phải chứa các ký tự chữ cái.`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} phải chứa chữ cái hoặc số.`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} phải chứa chữ cái hoặc dấu cách.`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} phải chứa ký hiệu.`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} phải chứa chữ hoa.`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} phải chứa chữ thường.`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} phải chứa số.`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} phải là một ký hiệu.`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} chỉ có thể chứa chữ hoa.`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} chỉ có thể chứa chữ thường.`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} phải trước ${date(args[0])}.`;
    }
    return `${sentence(name)} phải trong quá khứ.`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `Trường này đã được thiết lập sai và không thể gửi.`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} phải ở giữa ${a} và ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} không khớp.`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} không phải ngày hợp lệ, hãy sử dụng định dạng ${args[0]}`;
    }
    return "Trường này đã được thiết lập sai và không thể gửi.";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} phải ở giữa khoảng từ ${date(args[0])} đến ${date(args[1])}.`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "Hãy nhập một địa chỉ email hợp lệ.",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} không kết thúc với ${list(args)}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} không phải một giá trị được cho phép.`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} phải có độ dài tối thiểu một ký tự.`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} phải có độ dài tối đa ${max} ký tự.`;
    }
    if (min === max) {
      return `${sentence(name)} nên dài ${max} ký tự.`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} phải có độ dài tối thiểu ${min} ký tự.`;
    }
    return `${sentence(name)} phải có độ dài tối đa trong khoảng từ ${min} đến ${max} ký tự.`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} không phải một giá trị được cho phép.`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name} không thể lớn hơn ${args[0]}.`;
    }
    return `${sentence(name)} phải tối đa bằng ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "Định dạng tệp tin này không được phép.";
    }
    return `${sentence(name)} phải là một trong các dạng: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name} không thể nhỏ hơn ${args[0]}.`;
    }
    return `${sentence(name)} phải tối thiểu bằng ${args[0]}.`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}" không phải giá trị ${name} được phép.`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} phải là một số.`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join(" hoặc ")} cần có.`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} là bắt buộc.`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} không bắt đầu với ${list(args)}.`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `Vui lòng nhập một URL hợp lệ.`;
  }
};
var vi = Object.freeze({
  __proto__: null,
  ui: ui$2,
  validation: validation$2
});
var ui$1 = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "添加",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "移除",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "移除全部",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "抱歉，部分字段未被正确填写。",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "提交",
  /**
   * Shown when no files are selected.
   */
  noFiles: "未选择文件",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "上移",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "下移",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "加载中...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "加载更多",
  /**
   * Shown on buttons that navigate state forward
   */
  next: "下一步",
  /**
   * Shown on buttons that navigate state backward
   */
  prev: "上一步",
  /**
   * Shown when adding all values.
   */
  addAllValues: "添加所有值",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "添加所选值",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "移除所有值",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "移除所选值",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "选择日期",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "更改日期",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "所选日期无效。"
};
var validation$1 = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `请接受${name}。`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)}必须晚于${date(args[0])}。`;
    }
    return `${sentence(name)}必须是未来的日期。`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)}只能包含英文字母。`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)}只能包含字母和数字。`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)}只能包含字母和空格。`;
  },
  /**
   * The value have no letter.
   * @see {@link https://formkit.com/essentials/validation#contains_alpha}
   */
  contains_alpha({ name }) {
    return `${sentence(name)} 必须包含字母字符`;
  },
  /**
   * The value have no alphanumeric
   * @see {@link https://formkit.com/essentials/validation#contains_alphanumeric}
   */
  contains_alphanumeric({ name }) {
    return `${sentence(name)} 必须包含字母或数字。`;
  },
  /**
   * The value have no letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#contains_alpha-spaces}
   */
  contains_alpha_spaces({ name }) {
    return `${sentence(name)} 必须包含字母或空格。`;
  },
  /**
   * The value have no symbol
   * @see {@link https://formkit.com/essentials/validation#contains_symbol}
   */
  contains_symbol({ name }) {
    return `${sentence(name)} 必须包含符号。`;
  },
  /**
   * The value have no uppercase
   * @see {@link https://formkit.com/essentials/validation#contains_uppercase}
   */
  contains_uppercase({ name }) {
    return `${sentence(name)} 必须包含大写字母。`;
  },
  /**
   * The value have no lowercase
   * @see {@link https://formkit.com/essentials/validation#contains_lowercase}
   */
  contains_lowercase({ name }) {
    return `${sentence(name)} 必须包含小写字母。`;
  },
  /**
   *  The value have no numeric
   * @see {@link https://formkit.com/essentials/validation#contains_numeric}
   */
  contains_numeric({ name }) {
    return `${sentence(name)} 必须包含数字。`;
  },
  /**
   * The value is not symbol
   * @see {@link https://formkit.com/essentials/validation#symbol}
   */
  symbol({ name }) {
    return `${sentence(name)} 必须是符号。`;
  },
  /**
   * The value is not uppercase
   * @see {@link https://formkit.com/essentials/validation#uppercase}
   */
  uppercase({ name }) {
    return `${sentence(name)} 只能包含大写字母。`;
  },
  /**
   * The value is not lowercase
   * @see {@link https://formkit.com/essentials/validation#lowercase}
   */
  lowercase({ name }) {
    return `${sentence(name)} 只能包含小写字母。`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)}必须早于${date(args[0])}。`;
    }
    return `${sentence(name)}必须是过去的日期。`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `该字段未被正确设置而无法提交。`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)}必须在${a}和${b}之间。`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)}不匹配。`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)}不是合法日期，请使用 ${args[0]} 格式`;
    }
    return "该字段未被正确设置而无法提交";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)}必须在${date(args[0])}和${date(args[1])}之间`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "请输入合法的电子邮件地址。",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)}必须以${list(args)}结尾。`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)}是不允许的。`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)}至少要有一个字符。`;
    }
    if (min == 0 && max) {
      return `${sentence(name)}必须少于或等于${max}个字符。`;
    }
    if (min === max) {
      return `${sentence(name)}必须包含${max}个字符。`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)}必须多于或等于${min}个字符。`;
    }
    return `${sentence(name)}必须介于${min}和${max}个字符之间。`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)}是不允许的。`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name}不得多于${args[0]}个值。`;
    }
    return `${name}不得大于${args[0]}。`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "没有允许的文件格式。";
    }
    return `${sentence(name)}的类型必须为：${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `${name}不得少于${args[0]}个值。`;
    }
    return `${sentence(name)}不得小于${args[0]}。`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `"${value}"不是一个合法的${name}。`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)}必须为数字。`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join("或")}${labels}需要。`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)}不得留空。`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)}必须以${list(args)}开头。`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `请输入有效的 URL。`;
  }
};
var zh = Object.freeze({
  __proto__: null,
  ui: ui$1,
  validation: validation$1
});
var ui = {
  /**
   * Shown on a button for adding additional items.
   */
  add: "新增",
  /**
   * Shown when a button to remove items is visible.
   */
  remove: "移除",
  /**
   * Shown when there are multiple items to remove at the same time.
   */
  removeAll: "移除全部",
  /**
   * Shown when all fields are not filled out correctly.
   */
  incomplete: "很抱歉，部分欄位填寫錯誤",
  /**
   * Shown in a button inside a form to submit the form.
   */
  submit: "提交",
  /**
   * Shown when no files are selected.
   */
  noFiles: "尚未選取檔案",
  /**
   * Shown on buttons that move fields up in a list.
   */
  moveUp: "上移",
  /**
   * Shown on buttons that move fields down in a list.
   */
  moveDown: "下移",
  /**
   * Shown when something is actively loading.
   */
  isLoading: "載入中...",
  /**
   * Shown when there is more to load.
   */
  loadMore: "載入更多",
  /**
   * Show on buttons that navigate state forward
   */
  next: "下一個",
  /**
   * Show on buttons that navigate state backward
   */
  prev: "上一個",
  /**
   * Shown when adding all values.
   */
  addAllValues: "加入全部的值",
  /**
   * Shown when adding selected values.
   */
  addSelectedValues: "加入選取的值",
  /**
   * Shown when removing all values.
   */
  removeAllValues: "移除全部的值",
  /**
   * Shown when removing selected values.
   */
  removeSelectedValues: "移除選取的值",
  /**
   * Shown when there is a date to choose.
   */
  chooseDate: "選擇日期",
  /**
   * Shown when there is a date to change.
   */
  changeDate: "變更日期",
  /**
   * Shown when the date is invalid.
   */
  invalidDate: "選取的日期無效"
};
var validation = {
  /**
   * The value is not an accepted value.
   * @see {@link https://formkit.com/essentials/validation#accepted}
   */
  accepted({ name }) {
    return `請接受 ${name}`;
  },
  /**
   * The date is not after
   * @see {@link https://formkit.com/essentials/validation#date-after}
   */
  date_after({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} 必須晚於 ${date(args[0])}`;
    }
    return `${sentence(name)} 必須晚於今日`;
  },
  /**
   * The value is not a letter.
   * @see {@link https://formkit.com/essentials/validation#alpha}
   */
  alpha({ name }) {
    return `${sentence(name)} 欄位儘能填寫英文字母`;
  },
  /**
   * The value is not alphanumeric
   * @see {@link https://formkit.com/essentials/validation#alphanumeric}
   */
  alphanumeric({ name }) {
    return `${sentence(name)} 欄位僅能填寫英文字母與數字`;
  },
  /**
   * The value is not letter and/or spaces
   * @see {@link https://formkit.com/essentials/validation#alpha-spaces}
   */
  alpha_spaces({ name }) {
    return `${sentence(name)} 欄位儘能填寫英文字母與空白`;
  },
  /**
   * The date is not before
   * @see {@link https://formkit.com/essentials/validation#date-before}
   */
  date_before({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} 必須早於 ${date(args[0])}.`;
    }
    return `${sentence(name)} 必須早於今日`;
  },
  /**
   * The value is not between two numbers
   * @see {@link https://formkit.com/essentials/validation#between}
   */
  between({ name, args }) {
    if (isNaN(args[0]) || isNaN(args[1])) {
      return `欄位值錯誤，無法提交`;
    }
    const [a, b] = order(args[0], args[1]);
    return `${sentence(name)} 必須介於 ${a} 和 ${b}.`;
  },
  /**
   * The confirmation field does not match
   * @see {@link https://formkit.com/essentials/validation#confirm}
   */
  confirm({ name }) {
    return `${sentence(name)} 與目標不一致`;
  },
  /**
   * The value is not a valid date
   * @see {@link https://formkit.com/essentials/validation#date-format}
   */
  date_format({ name, args }) {
    if (Array.isArray(args) && args.length) {
      return `${sentence(name)} 不是有效的日期，請使用 ${args[0]} 格式`;
    }
    return "欄位值錯誤，無法提交";
  },
  /**
   * Is not within expected date range
   * @see {@link https://formkit.com/essentials/validation#date-between}
   */
  date_between({ name, args }) {
    return `${sentence(name)} 必須介於 ${date(args[0])} 和 ${date(args[1])}`;
  },
  /**
   * Shown when the user-provided value is not a valid email address.
   * @see {@link https://formkit.com/essentials/validation#email}
   */
  email: "請輸入有效的 email",
  /**
   * Does not end with the specified value
   * @see {@link https://formkit.com/essentials/validation#ends-with}
   */
  ends_with({ name, args }) {
    return `${sentence(name)} 的結尾必須是 ${list(args)}`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#is}
   */
  is({ name }) {
    return `${sentence(name)} 欄位的值不合規則`;
  },
  /**
   * Does not match specified length
   * @see {@link https://formkit.com/essentials/validation#length}
   */
  length({ name, args: [first = 0, second = Infinity] }) {
    const min = Number(first) <= Number(second) ? first : second;
    const max = Number(second) >= Number(first) ? second : first;
    if (min == 1 && max === Infinity) {
      return `${sentence(name)} 欄位必須至少包含一個字`;
    }
    if (min == 0 && max) {
      return `${sentence(name)} 的字數必須小於等於 ${max}`;
    }
    if (min === max) {
      return `${sentence(name)} 的字數必須為 ${max}`;
    }
    if (min && max === Infinity) {
      return `${sentence(name)} 的字數必須大於等於 ${min}`;
    }
    return `${sentence(name)} 的字數必須介於 ${min} 和 ${max}`;
  },
  /**
   * Value is not a match
   * @see {@link https://formkit.com/essentials/validation#matches}
   */
  matches({ name }) {
    return `${sentence(name)} 欄位的值無效`;
  },
  /**
   * Exceeds maximum allowed value
   * @see {@link https://formkit.com/essentials/validation#max}
   */
  max({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `不能超過 ${args[0]} 個 ${name}.`;
    }
    return `${sentence(name)} 必須小於等於 ${args[0]}.`;
  },
  /**
   * The (field-level) value does not match specified mime type
   * @see {@link https://formkit.com/essentials/validation#mime}
   */
  mime({ name, args }) {
    if (!args[0]) {
      return "非有效的檔案格式";
    }
    return `${sentence(name)} 可接受的檔案格式為: ${args[0]}`;
  },
  /**
   * Does not fulfill minimum allowed value
   * @see {@link https://formkit.com/essentials/validation#min}
   */
  min({ name, node: { value }, args }) {
    if (Array.isArray(value)) {
      return `不可少於 ${args[0]} 個 ${name}`;
    }
    return `${name} 必須大於等於 ${args[0]}`;
  },
  /**
   * Is not an allowed value
   * @see {@link https://formkit.com/essentials/validation#not}
   */
  not({ name, node: { value } }) {
    return `“${value}” 不是 ${name} 欄位可接受的值`;
  },
  /**
   *  Is not a number
   * @see {@link https://formkit.com/essentials/validation#number}
   */
  number({ name }) {
    return `${sentence(name)} 欄位必須是數字`;
  },
  /**
   * Require one field.
   * @see {@link https://formkit.com/essentials/validation#require-one}
   */
  require_one: ({ name, node, args: inputNames }) => {
    const labels = inputNames.map((name2) => {
      const dependentNode = node.at(name2);
      if (dependentNode) {
        return createMessageName(dependentNode);
      }
      return false;
    }).filter((name2) => !!name2);
    labels.unshift(name);
    return `${labels.join("或")}${labels}需要。`;
  },
  /**
   * Required field.
   * @see {@link https://formkit.com/essentials/validation#required}
   */
  required({ name }) {
    return `${sentence(name)} 是必要欄位`;
  },
  /**
   * Does not start with specified value
   * @see {@link https://formkit.com/essentials/validation#starts-with}
   */
  starts_with({ name, args }) {
    return `${sentence(name)} 的開頭必須是 ${list(args)}`;
  },
  /**
   * Is not a url
   * @see {@link https://formkit.com/essentials/validation#url}
   */
  url() {
    return `請輸入有效的 url`;
  }
};
var zhTW = Object.freeze({
  __proto__: null,
  ui,
  validation
});
function createI18nPlugin(registry2) {
  return function i18nPlugin(node) {
    let localeKey = parseLocale(node.config.locale, registry2);
    let locale = localeKey ? registry2[localeKey] : {};
    node.on("prop:locale", ({ payload: lang }) => {
      localeKey = parseLocale(lang, registry2);
      locale = localeKey ? registry2[localeKey] : {};
      node.store.touch();
    });
    node.on("prop:label", () => node.store.touch());
    node.on("prop:validationLabel", () => node.store.touch());
    node.hook.text((fragment, next) => {
      var _a, _b;
      const key = ((_a = fragment.meta) === null || _a === void 0 ? void 0 : _a.messageKey) || fragment.key;
      if (has(locale, fragment.type) && has(locale[fragment.type], key)) {
        const t = locale[fragment.type][key];
        if (typeof t === "function") {
          fragment.value = Array.isArray((_b = fragment.meta) === null || _b === void 0 ? void 0 : _b.i18nArgs) ? t(...fragment.meta.i18nArgs) : t(fragment);
        } else {
          fragment.value = t;
        }
      }
      return next(fragment);
    });
  };
}
function parseLocale(locale, availableLocales) {
  if (has(availableLocales, locale)) {
    return locale;
  }
  const [lang] = locale.split("-");
  if (has(availableLocales, lang)) {
    return lang;
  }
  for (const locale2 in availableLocales) {
    return locale2;
  }
  return false;
}
var locales = {
  ar,
  az,
  bg,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  fa,
  fi,
  fr,
  fy,
  he,
  hr,
  hu,
  id,
  it,
  ja,
  kk,
  ko,
  nb,
  nl,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  sr,
  sv,
  tg,
  th,
  tr,
  uk,
  uz,
  vi,
  zh,
  "zh-TW": zhTW
};

export {
  token,
  has,
  eq,
  empty,
  regexForFormat,
  isObject,
  isPojo,
  extend,
  nodeProps,
  except,
  only,
  camel,
  kebab,
  shallowClone,
  clone,
  cloneAny,
  undefine,
  slugify,
  oncePerTick,
  errorHandler,
  warningHandler,
  warn,
  error,
  createMessage,
  getNode$1,
  watchRegistry,
  createConfig$1,
  submitForm,
  reset,
  isNode,
  resetCount,
  createNode,
  isDOM,
  isComponent,
  isConditional,
  sugar,
  compile,
  createClasses,
  generateClassList,
  setErrors,
  clearErrors,
  FORMKIT_VERSION,
  createObserver,
  createValidationPlugin,
  sentence,
  list,
  date,
  order,
  ar,
  az,
  bg,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  fa,
  fi,
  fr,
  fy,
  he,
  hr,
  hu,
  id,
  it,
  ja,
  kk,
  ko,
  nb,
  nl,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  sr,
  sv,
  tg,
  th,
  tr,
  uk,
  uz,
  vi,
  zh,
  zhTW,
  createI18nPlugin,
  locales
};
//# sourceMappingURL=chunk-5T7GL4E2.js.map
