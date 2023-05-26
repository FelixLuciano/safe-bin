import {
  Fragment,
  cloneVNode,
  computed,
  createApp,
  createVNode,
  defineComponent,
  h,
  isVNode,
  mergeProps,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRaw,
  watchEffect
} from "./chunk-QH2LEIYP.js";
import "./chunk-F4AF7QOS.js";

// node_modules/vue3-toastify/dist/esm/index.js
var U = {
  TOP_LEFT: "top-left",
  TOP_RIGHT: "top-right",
  TOP_CENTER: "top-center",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_CENTER: "bottom-center"
};
var $ = {
  LIGHT: "light",
  DARK: "dark",
  COLORED: "colored",
  AUTO: "auto"
};
var g = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  DEFAULT: "default"
};
var Ne = {
  BOUNCE: "bounce",
  SLIDE: "slide",
  FLIP: "flip",
  ZOOM: "zoom"
};
var de = {
  dangerouslyHTMLString: false,
  multiple: true,
  position: U.TOP_RIGHT,
  autoClose: 5e3,
  transition: "bounce",
  hideProgressBar: false,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  closeOnClick: true,
  className: "",
  bodyClassName: "",
  style: {},
  progressClassName: "",
  progressStyle: {},
  role: "alert",
  theme: "light"
};
var Ie = {
  rtl: false,
  newestOnTop: false,
  toastClassName: ""
};
var ce = {
  ...de,
  ...Ie
};
({
  ...de,
  type: g.DEFAULT
});
var r = ((e) => (e[e.COLLAPSE_DURATION = 300] = "COLLAPSE_DURATION", e[e.DEBOUNCE_DURATION = 50] = "DEBOUNCE_DURATION", e.CSS_NAMESPACE = "Toastify", e))(r || {});
var X = ((e) => (e.ENTRANCE_ANIMATION_END = "d", e))(X || {});
var _e = {
  enter: "Toastify--animate Toastify__bounce-enter",
  exit: "Toastify--animate Toastify__bounce-exit",
  appendPosition: true
};
var he = {
  enter: "Toastify--animate Toastify__slide-enter",
  exit: "Toastify--animate Toastify__slide-exit",
  appendPosition: true
};
var Oe = {
  enter: "Toastify--animate Toastify__zoom-enter",
  exit: "Toastify--animate Toastify__zoom-exit"
};
var be = {
  enter: "Toastify--animate Toastify__flip-enter",
  exit: "Toastify--animate Toastify__flip-exit"
};
function fe(e) {
  let t = _e;
  if (!e || typeof e == "string")
    switch (e) {
      case "flip":
        t = be;
        break;
      case "zoom":
        t = Oe;
        break;
      case "slide":
        t = he;
        break;
    }
  else
    t = e;
  return t;
}
function Pe(e) {
  return e.containerId || String(e.position);
}
var Q = "will-unmount";
function Le(e = U.TOP_RIGHT) {
  return !!document.querySelector(`.${r.CSS_NAMESPACE}__toast-container--${e}`);
}
function $e(e = U.TOP_RIGHT) {
  return `${r.CSS_NAMESPACE}__toast-container--${e}`;
}
function qe(e, t, n = false) {
  const a = [
    `${r.CSS_NAMESPACE}__toast-container`,
    `${r.CSS_NAMESPACE}__toast-container--${e}`,
    n ? `${r.CSS_NAMESPACE}__toast-container--rtl` : null
  ].filter(Boolean).join(" ");
  return L(t) ? t({
    position: e,
    rtl: n,
    defaultClassName: a
  }) : `${a} ${t || ""}`;
}
function Be(e) {
  var E;
  const { position: t, containerClassName: n, rtl: a = false, style: o = {} } = e, s = r.CSS_NAMESPACE, d = $e(t), y = document.querySelector(`.${s}`), u = document.querySelector(`.${d}`), C = !!u && !((E = u.className) != null && E.includes(Q)), c = y || document.createElement("div"), v = document.createElement("div");
  v.className = qe(
    t,
    n,
    a
  ), v.dataset.testid = `${r.CSS_NAMESPACE}__toast-container--${t}`, v.id = Pe(e);
  for (const N in o)
    if (Object.prototype.hasOwnProperty.call(o, N)) {
      const Y = o[N];
      v.style[N] = Y;
    }
  return y || (c.className = r.CSS_NAMESPACE, document.body.appendChild(c)), C || c.appendChild(v), v;
}
function J(e) {
  var a, o, s;
  const t = typeof e == "string" ? e : ((a = e.currentTarget) == null ? void 0 : a.id) || ((o = e.target) == null ? void 0 : o.id), n = document.getElementById(t);
  n && n.removeEventListener("animationend", J, false);
  try {
    F[t].unmount(), (s = document.getElementById(t)) == null || s.remove(), delete F[t], delete f[t];
  } catch {
  }
}
var F = reactive({});
function Me(e, t) {
  const n = document.getElementById(String(t));
  n && (F[n.id] = e);
}
function ee(e, t = true) {
  const n = String(e);
  if (!F[n])
    return;
  const a = document.getElementById(n);
  a && a.classList.add(Q), t ? (Re(e), a && a.addEventListener("animationend", J, false)) : J(n), A.items = A.items.filter((o) => o.containerId !== e);
}
function we(e) {
  for (const t in F)
    ee(t, e);
  A.items = [];
}
function me(e, t) {
  const n = document.getElementById(e.toastId);
  if (n) {
    let a = e;
    a = {
      ...a,
      ...fe(a.transition)
    };
    const o = a.appendPosition ? `${a.exit}--${a.position}` : a.exit;
    n.className += ` ${o}`, t && t(n);
  }
}
function Re(e) {
  for (const t in f)
    if (t === e)
      for (const n of f[t] || [])
        me(n);
}
function Fe(e) {
  const n = x().find((a) => a.toastId === e);
  return n == null ? void 0 : n.containerId;
}
function oe(e) {
  return document.getElementById(e);
}
function Ue(e) {
  const t = oe(e.containerId);
  return t && t.classList.contains(Q);
}
function se(e) {
  var n;
  const t = isVNode(e.content) ? toRaw(e.content.props) : null;
  return t != null ? t : toRaw((n = e.data) != null ? n : {});
}
function xe(e) {
  return e ? A.items.filter((n) => n.containerId === e).length > 0 : A.items.length > 0;
}
function De() {
  if (A.items.length > 0) {
    const e = A.items.shift();
    H(e == null ? void 0 : e.toastContent, e == null ? void 0 : e.toastProps);
  }
}
var f = reactive({});
var A = reactive({
  items: []
});
function x() {
  const e = toRaw(f);
  return Object.values(e).reduce((t, n) => [...t, ...n], []);
}
function ke(e) {
  return x().find((n) => n.toastId === e);
}
function H(e, t = {}) {
  if (Ue(t)) {
    const n = oe(t.containerId);
    n && n.addEventListener("animationend", te.bind(null, e, t), false);
  } else
    te(e, t);
}
function te(e, t = {}) {
  const n = oe(t.containerId);
  n && n.removeEventListener("animationend", te.bind(null, e, t), false);
  const a = f[t.containerId] || [], o = a.length > 0;
  if (!o && !Le(t.position)) {
    const s = Be(t), d = createApp(rt, t);
    d.mount(s), Me(d, s.id);
  }
  o && (t.position = a[0].position), nextTick(() => {
    t.updateId ? p.update(t) : p.add(e, t);
  });
}
var p = {
  /**
   * add a toast
   * @param _ ..
   * @param opts toast props
   */
  add(e, t) {
    const { containerId: n = "" } = t;
    n && (f[n] = f[n] || [], f[n].find((a) => a.toastId === t.toastId) || setTimeout(() => {
      var a, o;
      t.newestOnTop ? (a = f[n]) == null || a.unshift(t) : (o = f[n]) == null || o.push(t), t.onOpen && t.onOpen(se(t));
    }, t.delay || 0));
  },
  /**
   * remove a toast
   * @param id toastId
   */
  remove(e) {
    if (e) {
      const t = Fe(e);
      if (t) {
        const n = f[t];
        let a = n.find((o) => o.toastId === e);
        f[t] = n.filter((o) => o.toastId !== e), !f[t].length && !xe(t) && ee(t, false), De(), nextTick(() => {
          a != null && a.onClose && (a.onClose(se(a)), a = void 0);
        });
      }
    }
  },
  /**
   * update the toast
   * @param opts toast props
   */
  update(e = {}) {
    const { containerId: t = "" } = e;
    if (t && e.updateId) {
      f[t] = f[t] || [];
      const n = f[t].find((a) => a.toastId === e.toastId);
      n && setTimeout(() => {
        for (const a in e)
          if (Object.prototype.hasOwnProperty.call(e, a)) {
            const o = e[a];
            n[a] = o;
          }
      }, e.delay || 0);
    }
  },
  /**
   * clear all toasts in container.
   * @param containerId container id
   */
  clear(e, t = true) {
    e ? ee(e, t) : we(t);
  },
  dismissCallback(e) {
    var a;
    const t = (a = e.currentTarget) == null ? void 0 : a.id, n = document.getElementById(t);
    n && (n.removeEventListener("animationend", p.dismissCallback, false), setTimeout(() => {
      p.remove(t);
    }));
  },
  dismiss(e) {
    if (e) {
      const t = x();
      for (const n of t)
        if (n.toastId === e) {
          me(n, (a) => {
            a.addEventListener("animationend", p.dismissCallback, false);
          });
          break;
        }
    }
  }
};
var ge = reactive({});
var G = reactive({});
function Ce() {
  return Math.random().toString(36).substring(2, 9);
}
function He(e) {
  return typeof e == "number" && !isNaN(e);
}
function ne(e) {
  return typeof e == "string";
}
function L(e) {
  return typeof e == "function";
}
function W(...e) {
  return mergeProps(...e);
}
function z(e) {
  return typeof e == "object" && (!!(e != null && e.render) || !!(e != null && e.setup) || typeof (e == null ? void 0 : e.type) == "object");
}
function ze(e = {}) {
  ge[`${r.CSS_NAMESPACE}-default-options`] = e;
}
function je() {
  return ge[`${r.CSS_NAMESPACE}-default-options`] || ce;
}
function Ge() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
var j = ((e) => (e[e.Enter = 0] = "Enter", e[e.Exit = 1] = "Exit", e))(j || {});
var ye = {
  containerId: {
    type: [String, Number],
    required: false,
    default: ""
  },
  clearOnUrlChange: {
    type: Boolean,
    required: false,
    default: true
  },
  dangerouslyHTMLString: {
    type: Boolean,
    required: false,
    default: false
  },
  multiple: {
    type: Boolean,
    required: false,
    default: true
  },
  limit: {
    type: Number,
    required: false,
    default: void 0
  },
  position: {
    type: String,
    required: false,
    default: U.TOP_LEFT
  },
  bodyClassName: {
    type: String,
    required: false,
    default: ""
  },
  autoClose: {
    type: [Number, Boolean],
    required: false,
    default: false
  },
  closeButton: {
    type: [Boolean, Function, Object],
    required: false,
    default: void 0
  },
  transition: {
    type: [String, Object],
    required: false,
    default: "bounce"
  },
  hideProgressBar: {
    type: Boolean,
    required: false,
    default: false
  },
  pauseOnHover: {
    type: Boolean,
    required: false,
    default: true
  },
  pauseOnFocusLoss: {
    type: Boolean,
    required: false,
    default: true
  },
  closeOnClick: {
    type: Boolean,
    required: false,
    default: true
  },
  progress: {
    type: Number,
    required: false,
    default: void 0
  },
  progressClassName: {
    type: String,
    required: false,
    default: ""
  },
  toastStyle: {
    type: Object,
    required: false,
    default() {
      return {};
    }
  },
  progressStyle: {
    type: Object,
    required: false,
    default() {
      return {};
    }
  },
  role: {
    type: String,
    required: false,
    default: "alert"
  },
  theme: {
    type: String,
    required: false,
    default: $.AUTO
  },
  content: {
    type: [String, Object, Function],
    required: false,
    default: ""
  },
  toastId: {
    type: [String, Number],
    required: false,
    default: ""
  },
  data: {
    type: [Object, String],
    required: false,
    default() {
      return {};
    }
  },
  type: {
    type: String,
    required: false,
    default: g.DEFAULT
  },
  icon: {
    type: [Boolean, String, Number, Object, Function],
    required: false,
    default: void 0
  },
  delay: {
    type: Number,
    required: false,
    default: void 0
  },
  onOpen: {
    type: Function,
    required: false,
    default: void 0
  },
  onClose: {
    type: Function,
    required: false,
    default: void 0
  },
  onClick: {
    type: Function,
    required: false,
    default: void 0
  },
  isLoading: {
    type: Boolean,
    required: false,
    default: void 0
  },
  rtl: {
    type: Boolean,
    required: false,
    default: false
  },
  toastClassName: {
    type: String,
    required: false,
    default: ""
  },
  updateId: {
    type: [String, Number],
    required: false,
    default: ""
  }
};
var Ve = {
  autoClose: {
    type: [Number, Boolean],
    required: true
  },
  isRunning: {
    type: Boolean,
    required: false,
    default: void 0
  },
  type: {
    type: String,
    required: false,
    default: g.DEFAULT
  },
  theme: {
    type: String,
    required: false,
    default: $.AUTO
  },
  hide: {
    type: Boolean,
    required: false,
    default: void 0
  },
  className: {
    type: [String, Function],
    required: false,
    default: ""
  },
  controlledProgress: {
    type: Boolean,
    required: false,
    default: void 0
  },
  rtl: {
    type: Boolean,
    required: false,
    default: void 0
  },
  isIn: {
    type: Boolean,
    required: false,
    default: void 0
  },
  progress: {
    type: Number,
    required: false,
    default: void 0
  },
  closeToast: {
    type: Function,
    required: false,
    default: void 0
  }
};
var Qe = defineComponent({
  name: "ProgressBar",
  props: Ve,
  // @ts-ignore
  setup(e, {
    attrs: t
  }) {
    const n = ref(), a = computed(() => e.hide ? "true" : "false"), o = computed(() => ({
      ...t.style || {},
      animationDuration: `${e.autoClose === true ? 5e3 : e.autoClose}ms`,
      animationPlayState: e.isRunning ? "running" : "paused",
      opacity: e.hide ? 0 : 1,
      transform: e.controlledProgress ? `scaleX(${e.progress})` : "none"
    })), s = computed(() => [`${r.CSS_NAMESPACE}__progress-bar`, e.controlledProgress ? `${r.CSS_NAMESPACE}__progress-bar--controlled` : `${r.CSS_NAMESPACE}__progress-bar--animated`, `${r.CSS_NAMESPACE}__progress-bar-theme--${e.theme}`, `${r.CSS_NAMESPACE}__progress-bar--${e.type}`, e.rtl ? `${r.CSS_NAMESPACE}__progress-bar--rtl` : null].filter(Boolean).join(" ")), d = computed(() => `${s.value} ${(t == null ? void 0 : t.class) || ""}`), y = () => {
      n.value && (n.value.onanimationend = null, n.value.ontransitionend = null);
    }, u = () => {
      e.isIn && e.closeToast && e.autoClose !== false && (e.closeToast(), y());
    }, C = computed(() => e.controlledProgress ? null : u), c = computed(() => e.controlledProgress ? u : null);
    return watchEffect(() => {
      n.value && (y(), n.value.onanimationend = C.value, n.value.ontransitionend = c.value);
    }), () => createVNode("div", {
      ref: n,
      role: "progressbar",
      "aria-hidden": a.value,
      "aria-label": "notification timer",
      class: d.value,
      style: o.value
    }, null);
  }
});
var We = defineComponent({
  name: "CloseButton",
  inheritAttrs: false,
  props: {
    theme: {
      type: String,
      required: false,
      default: $.AUTO
    },
    type: {
      type: String,
      required: false,
      default: $.LIGHT
    },
    ariaLabel: {
      type: String,
      required: false,
      default: "close"
    },
    closeToast: {
      type: Function,
      required: false,
      default: void 0
    }
  },
  setup(e) {
    return () => createVNode("button", {
      class: `${r.CSS_NAMESPACE}__close-button ${r.CSS_NAMESPACE}__close-button--${e.theme}`,
      type: "button",
      onClick: (t) => {
        t.stopPropagation(), e.closeToast && e.closeToast(t);
      },
      "aria-label": e.ariaLabel
    }, [createVNode("svg", {
      "aria-hidden": "true",
      viewBox: "0 0 14 16"
    }, [createVNode("path", {
      "fill-rule": "evenodd",
      d: "M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"
    }, null)])]);
  }
});
var K = ({
  theme: e,
  type: t,
  path: n,
  ...a
}) => createVNode("svg", mergeProps({
  viewBox: "0 0 24 24",
  width: "100%",
  height: "100%",
  fill: e === "colored" ? "currentColor" : `var(--toastify-icon-color-${t})`
}, a), [createVNode("path", {
  d: n
}, null)]);
function Ke(e) {
  return createVNode(K, mergeProps(e, {
    path: "M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z"
  }), null);
}
function Ye(e) {
  return createVNode(K, mergeProps(e, {
    path: "M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"
  }), null);
}
function Ze(e) {
  return createVNode(K, mergeProps(e, {
    path: "M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"
  }), null);
}
function Xe(e) {
  return createVNode(K, mergeProps(e, {
    path: "M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"
  }), null);
}
function Je() {
  return createVNode("div", {
    class: `${r.CSS_NAMESPACE}__spinner`
  }, null);
}
var ae = {
  info: Ye,
  warning: Ke,
  success: Ze,
  error: Xe,
  spinner: Je
};
var et = (e) => e in ae;
function tt({
  theme: e,
  type: t,
  isLoading: n,
  icon: a
}) {
  let o;
  const s = {
    theme: e,
    type: t
  };
  return n ? o = ae.spinner() : a === false ? o = void 0 : z(a) ? o = toRaw(a) : L(a) ? o = a(s) : isVNode(a) ? o = cloneVNode(a, s) : ne(a) || He(a) ? o = a : et(t) && (o = ae[t](s)), o;
}
var nt = () => {
};
function at(e, t, n = r.COLLAPSE_DURATION) {
  const { scrollHeight: a, style: o } = e, s = n;
  requestAnimationFrame(() => {
    o.minHeight = "initial", o.height = a + "px", o.transition = `all ${s}ms`, requestAnimationFrame(() => {
      o.height = "0", o.padding = "0", o.margin = "0", setTimeout(t, s);
    });
  });
}
function ot(e) {
  const t = ref(false), n = ref(false), a = ref(false), o = ref(j.Enter), s = reactive({
    ...e,
    appendPosition: e.appendPosition || false,
    collapse: typeof e.collapse > "u" ? true : e.collapse,
    collapseDuration: e.collapseDuration || r.COLLAPSE_DURATION
  }), d = s.done || nt, y = computed(() => s.appendPosition ? `${s.enter}--${s.position}` : s.enter), u = computed(() => s.appendPosition ? `${s.exit}--${s.position}` : s.exit), C = computed(() => e.pauseOnHover ? {
    onMouseenter: M,
    onMouseleave: B
  } : {});
  function c() {
    const S = y.value.split(" ");
    E().addEventListener(
      X.ENTRANCE_ANIMATION_END,
      B,
      { once: true }
    );
    const I = (b) => {
      const w = E();
      b.target === w && (w.dispatchEvent(new Event(X.ENTRANCE_ANIMATION_END)), w.removeEventListener("animationend", I), w.removeEventListener("animationcancel", I), o.value === j.Enter && b.type !== "animationcancel" && w.classList.remove(...S));
    }, _ = () => {
      const b = E();
      b.classList.add(...S), b.addEventListener("animationend", I), b.addEventListener("animationcancel", I);
    };
    e.pauseOnFocusLoss && N(), _();
  }
  function v() {
    if (!E())
      return;
    const S = () => {
      const _ = E();
      _.removeEventListener("animationend", S), s.collapse ? at(_, d, s.collapseDuration) : d();
    }, I = () => {
      const _ = E();
      o.value = j.Exit, _ && (_.className += ` ${u.value}`, _.addEventListener("animationend", S));
    };
    n.value || (a.value ? S() : setTimeout(I));
  }
  function E() {
    return e.toastRef.value;
  }
  function N() {
    document.hasFocus() || M(), window.addEventListener("focus", B), window.addEventListener("blur", M);
  }
  function Y() {
    window.removeEventListener("focus", B), window.removeEventListener("blur", M);
  }
  function B() {
    (!e.loading.value || e.isLoading === void 0) && (t.value = true);
  }
  function M() {
    t.value = false;
  }
  function ve(S) {
    S && (S.stopPropagation(), S.preventDefault()), n.value = false;
  }
  return watchEffect(v), watchEffect(() => {
    const S = x();
    n.value = S.findIndex((I) => I.toastId === s.toastId) > -1;
  }), watchEffect(() => {
    e.isLoading !== void 0 && (e.loading.value ? M() : B());
  }), onMounted(c), onUnmounted(() => {
    e.pauseOnFocusLoss && Y();
  }), {
    isIn: n,
    isRunning: t,
    hideToast: ve,
    eventHandlers: C
  };
}
var st = defineComponent({
  name: "ToastItem",
  inheritAttrs: false,
  props: ye,
  // @ts-ignore
  setup(e) {
    const t = ref(), n = computed(() => !!e.isLoading), a = computed(() => e.progress !== void 0 && e.progress !== null), o = computed(() => tt(e)), s = computed(() => [`${r.CSS_NAMESPACE}__toast`, `${r.CSS_NAMESPACE}__toast-theme--${e.theme}`, `${r.CSS_NAMESPACE}__toast--${e.type}`, e.rtl ? `${r.CSS_NAMESPACE}__toast--rtl` : void 0, e.toastClassName || ""].filter(Boolean).join(" ")), {
      isRunning: d,
      isIn: y,
      hideToast: u,
      eventHandlers: C
    } = ot({
      toastRef: t,
      loading: n,
      done: () => {
        p.remove(e.toastId);
      },
      ...fe(e.transition),
      ...e
    });
    return () => createVNode("div", mergeProps({
      id: e.toastId,
      class: s.value,
      style: e.toastStyle || {},
      ref: t,
      "data-testid": `toast-item-${e.toastId}`,
      onClick: (c) => {
        e.closeOnClick && u(), e.onClick && e.onClick(c);
      }
    }, C.value), [createVNode("div", {
      role: e.role,
      "data-testid": "toast-body",
      class: `${r.CSS_NAMESPACE}__toast-body ${e.bodyClassName || ""}`
    }, [o.value != null && createVNode("div", {
      "data-testid": `toast-icon-${e.type}`,
      class: [`${r.CSS_NAMESPACE}__toast-icon`, e.isLoading ? "" : `${r.CSS_NAMESPACE}--animate-icon ${r.CSS_NAMESPACE}__zoom-enter`].join(" ")
    }, [z(o.value) ? h(toRaw(o.value), {
      theme: e.theme,
      type: e.type
    }) : L(o.value) ? o.value({
      theme: e.theme,
      type: e.type
    }) : o.value]), createVNode("div", {
      "data-testid": "toast-content"
    }, [z(e.content) ? h(toRaw(e.content), {
      toastProps: toRaw(e),
      closeToast: u,
      data: e.data
    }) : L(e.content) ? e.content({
      toastProps: toRaw(e),
      closeToast: u,
      data: e.data
    }) : e.dangerouslyHTMLString ? h("div", {
      innerHTML: e.content
    }) : e.content])]), (e.closeButton === void 0 || e.closeButton === true) && createVNode(We, {
      theme: e.theme,
      closeToast: (c) => {
        c.stopPropagation(), c.preventDefault(), u();
      }
    }, null), z(e.closeButton) ? h(toRaw(e.closeButton), {
      closeToast: u,
      type: e.type,
      theme: e.theme
    }) : L(e.closeButton) ? e.closeButton({
      closeToast: u,
      type: e.type,
      theme: e.theme
    }) : null, createVNode(Qe, {
      className: e.progressClassName,
      style: e.progressStyle,
      rtl: e.rtl,
      theme: e.theme,
      isIn: y.value,
      type: e.type,
      hide: e.hideProgressBar,
      isRunning: d.value,
      autoClose: e.autoClose,
      controlledProgress: a.value,
      progress: e.progress,
      closeToast: e.isLoading ? void 0 : u
    }, null)]);
  }
});
var R = 0;
function Ee() {
  typeof window > "u" || (R && window.cancelAnimationFrame(R), R = window.requestAnimationFrame(Ee), G.lastUrl !== window.location.href && (G.lastUrl = window.location.href, p.clear()));
}
var rt = defineComponent({
  name: "ToastifyContainer",
  inheritAttrs: false,
  props: ye,
  // @ts-ignore
  setup(e) {
    const t = computed(() => e.containerId), n = computed(() => f[t.value] || []), a = computed(() => n.value.filter((o) => o.position === e.position));
    return onMounted(() => {
      typeof window < "u" && e.clearOnUrlChange && window.requestAnimationFrame(Ee);
    }), onUnmounted(() => {
      typeof window < "u" && R && (window.cancelAnimationFrame(R), G.lastUrl = "");
    }), () => createVNode(Fragment, null, [a.value.map((o) => {
      const {
        toastId: s = ""
      } = o;
      return createVNode(st, mergeProps({
        key: s
      }, o), null);
    })]);
  }
});
var Z = false;
function Se() {
  const e = [];
  return x().forEach((n) => {
    const a = document.getElementById(n.containerId);
    a && !a.classList.contains(Q) && e.push(n);
  }), e;
}
function it(e) {
  const t = Se().length, n = e != null ? e : 0;
  return n > 0 && t + A.items.length >= n;
}
function lt(e) {
  it(e.limit) && !e.updateId && A.items.push({
    toastId: e.toastId,
    containerId: e.containerId,
    toastContent: e.content,
    toastProps: e
  });
}
function O(e, t, n = {}) {
  if (Z)
    return;
  n = W(je(), {
    type: t
  }, toRaw(n)), (!n.toastId || typeof n.toastId != "string" && typeof n.toastId != "number") && (n.toastId = Ce()), n = {
    ...n,
    content: e,
    containerId: n.containerId || String(n.position)
  };
  const a = Number(n == null ? void 0 : n.progress);
  return a < 0 && (n.progress = 0), a > 1 && (n.progress = 1), n.theme === "auto" && (n.theme = Ge()), lt(n), G.lastUrl = window.location.href, n.multiple ? A.items.length ? n.updateId && H(e, n) : H(e, n) : (Z = true, i.clearAll(void 0, false), setTimeout(() => {
    H(e, n);
  }, 0), setTimeout(() => {
    Z = false;
  }, 390)), n.toastId;
}
var i = (e, t) => O(e, g.DEFAULT, t);
i.info = (e, t) => O(e, g.DEFAULT, {
  ...t,
  type: g.INFO
});
i.error = (e, t) => O(e, g.DEFAULT, {
  ...t,
  type: g.ERROR
});
i.warning = (e, t) => O(e, g.DEFAULT, {
  ...t,
  type: g.WARNING
});
i.warn = i.warning;
i.success = (e, t) => O(e, g.DEFAULT, {
  ...t,
  type: g.SUCCESS
});
i.loading = (e, t) => O(e, g.DEFAULT, W(t, {
  isLoading: true,
  autoClose: false,
  closeOnClick: false,
  closeButton: false,
  draggable: false
}));
i.dark = (e, t) => O(e, g.DEFAULT, W(t, {
  theme: $.DARK
}));
i.remove = (e) => {
  e ? p.dismiss(e) : p.clear();
};
i.clearAll = (e, t) => {
  p.clear(e, t);
};
i.isActive = (e) => {
  let t = false;
  return t = Se().findIndex((a) => a.toastId === e) > -1, t;
};
i.update = (e, t = {}) => {
  setTimeout(() => {
    const n = ke(e);
    if (n) {
      const a = toRaw(n), {
        content: o
      } = a, s = {
        ...a,
        ...t,
        toastId: t.toastId || e,
        updateId: Ce()
      }, d = s.render || o;
      delete s.render, O(d, s.type, s);
    }
  }, 0);
};
i.done = (e) => {
  i.update(e, {
    isLoading: false,
    progress: 1
  });
};
i.promise = ut;
function ut(e, {
  pending: t,
  error: n,
  success: a
}, o) {
  let s;
  t && (s = ne(t) ? i.loading(t, o) : i.loading(t.render, {
    ...o,
    ...t
  }));
  const d = {
    isLoading: void 0,
    autoClose: null,
    closeOnClick: null,
    closeButton: null,
    draggable: null,
    delay: 100
  }, y = (C, c, v) => {
    if (c == null) {
      i.remove(s);
      return;
    }
    const E = {
      type: C,
      ...d,
      ...o,
      data: v
    }, N = ne(c) ? {
      render: c
    } : c;
    return s ? i.update(s, {
      ...E,
      ...N,
      isLoading: false,
      autoClose: true
    }) : i(N.render, {
      ...E,
      ...N,
      isLoading: false,
      autoClose: true
    }), v;
  }, u = L(e) ? e() : e;
  return u.then((C) => {
    y("success", a, C);
  }).catch((C) => {
    y("error", n, C);
  }), u;
}
i.POSITION = U;
i.THEME = $;
i.TYPE = g;
i.TRANSITIONS = Ne;
var dt = {
  install(e, t = {}) {
    ct(t);
  }
};
typeof window < "u" && (window.Vue3Toastify = dt);
function ct(e = {}) {
  const t = W(ce, e);
  ze(t);
}
export {
  j as AnimationStep,
  _e as Bounce,
  be as Flip,
  he as Slide,
  p as ToastActions,
  rt as ToastifyContainer,
  Oe as Zoom,
  me as addExitAnimateToNode,
  De as appendFromQueue,
  Me as cacheRenderInstance,
  we as clearContainers,
  F as containerInstances,
  dt as default,
  H as doAppend,
  x as getAllToast,
  ke as getToast,
  G as globalCache,
  ge as globalOptions,
  A as queue,
  ee as removeContainer,
  i as toast,
  f as toastContainers,
  ct as updateGlobalOptions,
  ot as useCssTransition
};
//# sourceMappingURL=vue3-toastify.js.map
