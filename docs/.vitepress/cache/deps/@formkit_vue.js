import {
  computed,
  createTextVNode,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  isReactive,
  isRef,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  resolveComponent,
  toRef,
  triggerRef,
  watch,
  watchEffect
} from "./chunk-QH2LEIYP.js";
import {
  FORMKIT_VERSION,
  camel,
  clearErrors,
  clone,
  cloneAny,
  compile,
  createClasses,
  createConfig$1,
  createI18nPlugin,
  createMessage,
  createNode,
  createObserver,
  createValidationPlugin,
  empty,
  en,
  eq,
  error,
  errorHandler,
  except,
  extend,
  generateClassList,
  getNode$1,
  has,
  isComponent,
  isConditional,
  isDOM,
  isNode,
  isObject,
  isPojo,
  kebab,
  nodeProps,
  oncePerTick,
  only,
  regexForFormat,
  reset,
  resetCount,
  setErrors,
  shallowClone,
  slugify,
  submitForm,
  sugar,
  token,
  undefine,
  warn,
  warningHandler,
  watchRegistry
} from "./chunk-5T7GL4E2.js";
import {
  __export
} from "./chunk-F4AF7QOS.js";

// node_modules/@formkit/inputs/dist/index.mjs
function createLibraryPlugin(...libraries) {
  const library = libraries.reduce((merged, lib) => extend(merged, lib), {});
  const plugin2 = () => {
  };
  plugin2.library = function(node) {
    const type = camel(node.props.type);
    if (has(library, type)) {
      node.define(library[type]);
    }
  };
  return plugin2;
}
function normalizeOptions(options2) {
  let i = 1;
  if (Array.isArray(options2)) {
    return options2.map((option2) => {
      if (typeof option2 === "string" || typeof option2 === "number") {
        return {
          label: String(option2),
          value: String(option2)
        };
      }
      if (typeof option2 == "object") {
        if ("value" in option2 && typeof option2.value !== "string") {
          Object.assign(option2, {
            value: `__mask_${i++}`,
            __original: option2.value
          });
        }
      }
      return option2;
    });
  }
  return Object.keys(options2).map((value) => {
    return {
      label: options2[value],
      value
    };
  });
}
function optionValue(options2, value) {
  if (Array.isArray(options2)) {
    for (const option2 of options2) {
      if (value == option2.value) {
        return "__original" in option2 ? option2.__original : option2.value;
      }
    }
  }
  return value;
}
function shouldSelect(valueA, valueB) {
  if (valueA === null && valueB === void 0 || valueA === void 0 && valueB === null)
    return false;
  if (valueA == valueB)
    return true;
  if (isPojo(valueA) && isPojo(valueB))
    return eq(valueA, valueB);
  return false;
}
function options(node) {
  node.hook.prop((prop, next) => {
    if (prop.prop === "options") {
      if (typeof prop.value === "function") {
        node.props.optionsLoader = prop.value;
        prop.value = [];
      } else {
        prop.value = normalizeOptions(prop.value);
      }
    }
    return next(prop);
  });
}
function createSection(section, el, fragment2 = false) {
  return (...children) => {
    const extendable = (extensions) => {
      const node = !el || typeof el === "string" ? { $el: el } : el();
      if (isDOM(node) || isComponent(node)) {
        if (!node.meta) {
          node.meta = { section };
        }
        if (children.length && !node.children) {
          node.children = [
            ...children.map((child) => typeof child === "string" ? child : child(extensions))
          ];
        }
        if (isDOM(node)) {
          node.attrs = {
            class: `$classes.${section}`,
            ...node.attrs || {}
          };
        }
      }
      return {
        if: `$slots.${section}`,
        then: `$slots.${section}`,
        else: section in extensions ? extendSchema(node, extensions[section]) : node
      };
    };
    extendable._s = section;
    return fragment2 ? createRoot(extendable) : extendable;
  };
}
function createRoot(rootSection) {
  return (extensions) => {
    return [rootSection(extensions)];
  };
}
function isSchemaObject(schema) {
  return typeof schema === "object" && ("$el" in schema || "$cmp" in schema || "$formkit" in schema);
}
function extendSchema(schema, extension = {}) {
  if (typeof schema === "string") {
    return isSchemaObject(extension) || typeof extension === "string" ? extension : schema;
  } else if (Array.isArray(schema)) {
    return isSchemaObject(extension) ? extension : schema;
  }
  return extend(schema, extension);
}
var outer = createSection("outer", () => ({
  $el: "div",
  attrs: {
    key: "$id",
    "data-family": "$family || undefined",
    "data-type": "$type",
    "data-multiple": '$attrs.multiple || ($type != "select" && $options != undefined) || undefined',
    "data-disabled": "$disabled || undefined",
    "data-complete": "$state.complete || undefined",
    "data-invalid": "$state.valid === false && $state.validationVisible || undefined",
    "data-errors": "$state.errors || undefined",
    "data-submitted": "$state.submitted || undefined",
    "data-prefix-icon": "$_rawPrefixIcon !== undefined || undefined",
    "data-suffix-icon": "$_rawSuffixIcon !== undefined || undefined",
    "data-prefix-icon-click": "$onPrefixIconClick !== undefined || undefined",
    "data-suffix-icon-click": "$onSuffixIconClick !== undefined || undefined"
  }
}));
var inner = createSection("inner", "div");
var wrapper = createSection("wrapper", "div");
var label = createSection("label", () => ({
  $el: "label",
  if: "$label",
  attrs: {
    for: "$id"
  }
}));
var messages = createSection("messages", () => ({
  $el: "ul",
  if: "$defaultMessagePlacement && $fns.length($messages)"
}));
var message = createSection("message", () => ({
  $el: "li",
  for: ["message", "$messages"],
  attrs: {
    key: "$message.key",
    id: `$id + '-' + $message.key`,
    "data-message-type": "$message.type"
  }
}));
var prefix = createSection("prefix", null);
var suffix = createSection("suffix", null);
var help = createSection("help", () => ({
  $el: "div",
  if: "$help",
  attrs: {
    id: '$: "help-" + $id'
  }
}));
var fieldset = createSection("fieldset", () => ({
  $el: "fieldset",
  attrs: {
    id: "$id",
    "aria-describedby": {
      if: "$help",
      then: '$: "help-" + $id',
      else: void 0
    }
  }
}));
var decorator = createSection("decorator", () => ({
  $el: "span",
  attrs: {
    "aria-hidden": "true"
  }
}));
var box = createSection("input", () => ({
  $el: "input",
  bind: "$attrs",
  attrs: {
    type: "$type",
    name: "$node.props.altName || $node.name",
    disabled: "$option.attrs.disabled || $disabled",
    onInput: "$handlers.toggleChecked",
    checked: "$fns.eq($_value, $onValue)",
    onBlur: "$handlers.blur",
    value: "$: true",
    id: "$id",
    "aria-describedby": {
      if: "$options.length",
      then: {
        if: "$option.help",
        then: '$: "help-" + $option.attrs.id',
        else: void 0
      },
      else: {
        if: "$help",
        then: '$: "help-" + $id',
        else: void 0
      }
    }
  }
}));
var legend = createSection("legend", () => ({
  $el: "legend",
  if: "$label"
}));
var boxOption = createSection("option", () => ({
  $el: "li",
  for: ["option", "$options"],
  attrs: {
    "data-disabled": "$option.attrs.disabled || $disabled"
  }
}));
var boxOptions = createSection("options", "ul");
var boxWrapper = createSection("wrapper", () => ({
  $el: "label",
  attrs: {
    "data-disabled": {
      if: "$options.length",
      then: void 0,
      else: "$disabled || undefined"
    },
    "data-checked": {
      if: "$options == undefined",
      then: "$fns.eq($_value, $onValue) || undefined",
      else: "$fns.isChecked($option.value) || undefined"
    }
  }
}));
var boxHelp = createSection("optionHelp", () => ({
  $el: "div",
  if: "$option.help",
  attrs: {
    id: '$: "help-" + $option.attrs.id'
  }
}));
var boxLabel = createSection("label", "span");
var buttonInput = createSection("input", () => ({
  $el: "button",
  bind: "$attrs",
  attrs: {
    type: "$type",
    disabled: "$disabled",
    name: "$node.name",
    id: "$id"
  }
}));
var buttonLabel = createSection("default", null);
var fileInput = createSection("input", () => ({
  $el: "input",
  bind: "$attrs",
  attrs: {
    type: "file",
    disabled: "$disabled",
    name: "$node.name",
    onChange: "$handlers.files",
    onBlur: "$handlers.blur",
    id: "$id",
    "aria-describedby": "$describedBy"
  }
}));
var fileItem = createSection("fileItem", () => ({
  $el: "li",
  for: ["file", "$value"]
}));
var fileList = createSection("fileList", () => ({
  $el: "ul",
  if: "$value.length",
  attrs: {
    "data-has-multiple": {
      if: "$value.length > 1",
      then: "true"
    }
  }
}));
var fileName = createSection("fileName", () => ({
  $el: "span",
  attrs: {
    class: "$classes.fileName"
  }
}));
var fileRemove = createSection("fileRemove", () => ({
  $el: "button",
  attrs: {
    onClick: "$handlers.resetFiles"
  }
}));
var noFiles = createSection("noFiles", () => ({
  $el: "span",
  if: "$value.length == 0"
}));
var formInput = createSection("form", () => ({
  $el: "form",
  bind: "$attrs",
  attrs: {
    id: "$id",
    name: "$node.name",
    onSubmit: "$handlers.submit",
    "data-loading": "$state.loading || undefined"
  }
}));
var actions = createSection("actions", () => ({
  $el: "div",
  if: "$actions"
}));
var submitInput = createSection("submit", () => ({
  $cmp: "FormKit",
  bind: "$submitAttrs",
  props: {
    type: "submit",
    disabled: "$disabled",
    label: "$submitLabel"
  }
}));
var textInput = createSection("input", () => ({
  $el: "input",
  bind: "$attrs",
  attrs: {
    type: "$type",
    disabled: "$disabled",
    name: "$node.name",
    onInput: "$handlers.DOMInput",
    onBlur: "$handlers.blur",
    value: "$_value",
    id: "$id",
    "aria-describedby": "$describedBy"
  }
}));
var fragment = createSection("wrapper", null, true);
var selectInput$1 = createSection("input", () => ({
  $el: "select",
  bind: "$attrs",
  attrs: {
    id: "$id",
    "data-placeholder": "$fns.showPlaceholder($_value, $placeholder)",
    disabled: "$disabled",
    class: "$classes.input",
    name: "$node.name",
    onChange: "$handlers.onChange",
    onInput: "$handlers.selectInput",
    onBlur: "$handlers.blur",
    "aria-describedby": "$describedBy"
  }
}));
var option = createSection("option", () => ({
  $el: "option",
  for: ["option", "$options"],
  bind: "$option.attrs",
  attrs: {
    class: "$classes.option",
    value: "$option.value",
    selected: "$fns.isSelected($option)"
  }
}));
var optionSlot = () => ({
  $el: null,
  if: "$options.length",
  for: ["option", "$options"],
  children: "$slots.option"
});
var textareaInput = createSection("input", () => ({
  $el: "textarea",
  bind: "$attrs",
  attrs: {
    disabled: "$disabled",
    name: "$node.name",
    onInput: "$handlers.DOMInput",
    onBlur: "$handlers.blur",
    value: "$_value",
    id: "$id",
    "aria-describedby": "$describedBy"
  },
  children: "$initialValue"
}));
var icon = (sectionKey, el) => {
  return createSection(`${sectionKey}Icon`, () => {
    const rawIconProp = `_raw${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}Icon`;
    return {
      if: `$${sectionKey}Icon && $${rawIconProp}`,
      $el: `${el ? el : "span"}`,
      attrs: {
        class: `$classes.${sectionKey}Icon + " formkit-icon"`,
        innerHTML: `$${rawIconProp}`,
        onClick: `$handlers.iconClick(${sectionKey})`,
        for: {
          if: `${el === "label"}`,
          then: "$id"
        }
      }
    };
  })();
};
function normalizeBoxes(node) {
  return function(prop, next) {
    if (prop.prop === "options" && Array.isArray(prop.value)) {
      prop.value = prop.value.map((option2) => {
        var _a;
        if (!((_a = option2.attrs) === null || _a === void 0 ? void 0 : _a.id)) {
          return extend(option2, {
            attrs: {
              id: `${node.name}-option-${slugify(String(option2.value))}`
            }
          });
        }
        return option2;
      });
      if (node.props.type === "checkbox" && !Array.isArray(node.value)) {
        if (node.isCreated) {
          node.input([], false);
        } else {
          node.on("created", () => {
            if (!Array.isArray(node.value)) {
              node.input([], false);
            }
          });
        }
      }
    }
    return next(prop);
  };
}
function toggleChecked$1(node, e) {
  const el = e.target;
  if (el instanceof HTMLInputElement) {
    const value = Array.isArray(node.props.options) ? optionValue(node.props.options, el.value) : el.value;
    if (Array.isArray(node.props.options) && node.props.options.length) {
      if (!Array.isArray(node._value)) {
        node.input([value]);
      } else if (!node._value.some((existingValue) => shouldSelect(value, existingValue))) {
        node.input([...node._value, value]);
      } else {
        node.input(node._value.filter((existingValue) => !shouldSelect(value, existingValue)));
      }
    } else {
      if (el.checked) {
        node.input(node.props.onValue);
      } else {
        node.input(node.props.offValue);
      }
    }
  }
}
function isChecked$1(node, value) {
  var _a, _b;
  (_a = node.context) === null || _a === void 0 ? void 0 : _a.value;
  (_b = node.context) === null || _b === void 0 ? void 0 : _b._value;
  if (Array.isArray(node._value)) {
    return node._value.some((existingValue) => shouldSelect(optionValue(node.props.options, value), existingValue));
  }
  return false;
}
function checkboxes(node) {
  node.on("created", () => {
    var _a, _b;
    if ((_a = node.context) === null || _a === void 0 ? void 0 : _a.handlers) {
      node.context.handlers.toggleChecked = toggleChecked$1.bind(null, node);
    }
    if ((_b = node.context) === null || _b === void 0 ? void 0 : _b.fns) {
      node.context.fns.isChecked = isChecked$1.bind(null, node);
    }
    if (!has(node.props, "onValue"))
      node.props.onValue = true;
    if (!has(node.props, "offValue"))
      node.props.offValue = false;
  });
  node.hook.prop(normalizeBoxes(node));
}
function disables(node) {
  node.on("created", () => {
    node.props.disabled = undefine(node.props.disabled);
    node.config.disabled = undefine(node.props.disabled);
  });
  node.hook.prop(({ prop, value }, next) => {
    value = prop === "disabled" ? undefine(value) : value;
    return next({ prop, value });
  });
  node.on("prop:disabled", ({ payload: value }) => {
    node.config.disabled = undefine(value);
  });
}
function localize(key, value) {
  return (node) => {
    node.store.set(createMessage({
      key,
      type: "ui",
      value: value || key,
      meta: {
        localize: true,
        i18nArgs: [node]
      }
    }));
  };
}
var isBrowser = typeof window !== "undefined";
function removeHover(e) {
  if (e.target instanceof HTMLElement && e.target.hasAttribute("data-file-hover")) {
    e.target.removeAttribute("data-file-hover");
  }
}
function preventStrayDrop(type, e) {
  if (!(e.target instanceof HTMLInputElement)) {
    e.preventDefault();
  } else if (type === "dragover") {
    e.target.setAttribute("data-file-hover", "true");
  }
  if (type === "drop") {
    removeHover(e);
  }
}
function files(node) {
  localize("noFiles", "Select file")(node);
  localize("removeAll", "Remove all")(node);
  localize("remove")(node);
  if (isBrowser) {
    if (!window._FormKit_File_Drop) {
      window.addEventListener("dragover", preventStrayDrop.bind(null, "dragover"));
      window.addEventListener("drop", preventStrayDrop.bind(null, "drop"));
      window.addEventListener("dragleave", removeHover);
      window._FormKit_File_Drop = true;
    }
  }
  node.hook.input((value, next) => next(Array.isArray(value) ? value : []));
  node.on("created", () => {
    if (!Array.isArray(node.value))
      node.input([], false);
    if (!node.context)
      return;
    node.context.handlers.resetFiles = (e) => {
      e.preventDefault();
      node.input([]);
      if (node.props.id && isBrowser) {
        const el = document.getElementById(node.props.id);
        if (el)
          el.value = "";
      }
    };
    node.context.handlers.files = (e) => {
      var _a, _b;
      const files2 = [];
      if (e.target instanceof HTMLInputElement && e.target.files) {
        for (let i = 0; i < e.target.files.length; i++) {
          let file2;
          if (file2 = e.target.files.item(i)) {
            files2.push({ name: file2.name, file: file2 });
          }
        }
        node.input(files2);
      }
      if (node.context)
        node.context.files = files2;
      if (typeof ((_a = node.props.attrs) === null || _a === void 0 ? void 0 : _a.onChange) === "function") {
        (_b = node.props.attrs) === null || _b === void 0 ? void 0 : _b.onChange(e);
      }
    };
  });
}
async function handleSubmit(node, submitEvent) {
  submitEvent.preventDefault();
  await node.settled;
  const setSubmitted = (n) => n.store.set(createMessage({
    key: "submitted",
    value: true,
    visible: false
  }));
  node.walk(setSubmitted);
  setSubmitted(node);
  if (typeof node.props.onSubmitRaw === "function") {
    node.props.onSubmitRaw(submitEvent, node);
  }
  if (node.ledger.value("blocking")) {
    if (typeof node.props.onSubmitInvalid === "function") {
      node.props.onSubmitInvalid(node);
    }
    if (node.props.incompleteMessage !== false) {
      node.store.set(createMessage({
        blocking: false,
        key: `incomplete`,
        meta: {
          localize: node.props.incompleteMessage === void 0,
          i18nArgs: [{ node }],
          showAsMessage: true
        },
        type: "ui",
        value: node.props.incompleteMessage || "Form incomplete."
      }));
    }
  } else {
    if (typeof node.props.onSubmit === "function") {
      const retVal = node.props.onSubmit(node.hook.submit.dispatch(clone(node.value)), node);
      if (retVal instanceof Promise) {
        const autoDisable = node.props.disabled === void 0 && node.props.submitBehavior !== "live";
        if (autoDisable)
          node.props.disabled = true;
        node.store.set(createMessage({
          key: "loading",
          value: true,
          visible: false
        }));
        await retVal;
        if (autoDisable)
          node.props.disabled = false;
        node.store.remove("loading");
      }
    } else {
      if (submitEvent.target instanceof HTMLFormElement) {
        submitEvent.target.submit();
      }
    }
  }
}
function form$1(node) {
  node.props.isForm = true;
  node.on("created", () => {
    var _a;
    if ((_a = node.context) === null || _a === void 0 ? void 0 : _a.handlers) {
      node.context.handlers.submit = handleSubmit.bind(null, node);
    }
    if (!has(node.props, "actions")) {
      node.props.actions = true;
    }
  });
  node.on("settled:blocking", () => node.store.remove("incomplete"));
}
function ignore(node) {
  if (node.props.ignore === void 0) {
    node.props.ignore = true;
    node.parent = null;
  }
}
function initialValue(node) {
  node.on("created", () => {
    if (node.context) {
      node.context.initialValue = node.value || "";
    }
  });
}
function toggleChecked(node, event) {
  if (event.target instanceof HTMLInputElement) {
    node.input(optionValue(node.props.options, event.target.value));
  }
}
function isChecked(node, value) {
  var _a, _b;
  (_a = node.context) === null || _a === void 0 ? void 0 : _a.value;
  (_b = node.context) === null || _b === void 0 ? void 0 : _b._value;
  return shouldSelect(optionValue(node.props.options, value), node._value);
}
function radios(node) {
  node.on("created", () => {
    var _a, _b;
    if (!Array.isArray(node.props.options)) {
      warn(350, {
        node,
        inputType: "radio"
      });
    }
    if ((_a = node.context) === null || _a === void 0 ? void 0 : _a.handlers) {
      node.context.handlers.toggleChecked = toggleChecked.bind(null, node);
    }
    if ((_b = node.context) === null || _b === void 0 ? void 0 : _b.fns) {
      node.context.fns.isChecked = isChecked.bind(null, node);
    }
  });
  node.hook.prop(normalizeBoxes(node));
}
function isSelected(node, option2) {
  node.context && node.context.value;
  const optionValue2 = "__original" in option2 ? option2.__original : option2.value;
  function hasNoNullOption() {
    return !node.props.options.some((option3) => ("__original" in option3 ? option3.__original : option3.value) === null);
  }
  return Array.isArray(node._value) ? node._value.some((optionA) => shouldSelect(optionA, optionValue2)) : (node._value === void 0 || node._value === null && hasNoNullOption()) && option2.attrs && option2.attrs["data-is-placeholder"] ? true : shouldSelect(optionValue2, node._value);
}
async function deferChange(node, e) {
  var _a;
  if (typeof ((_a = node.props.attrs) === null || _a === void 0 ? void 0 : _a.onChange) === "function") {
    await new Promise((r) => setTimeout(r, 0));
    await node.settled;
    node.props.attrs.onChange(e);
  }
}
function selectInput(node, e) {
  const target = e.target;
  const value = target.hasAttribute("multiple") ? Array.from(target.selectedOptions).map((o) => optionValue(node.props.options, o.value)) : optionValue(node.props.options, target.value);
  node.input(value);
}
function applyPlaceholder(options2, placeholder) {
  if (!options2.some((option2) => option2.attrs && option2.attrs["data-is-placeholder"])) {
    return [
      {
        label: placeholder,
        value: "",
        attrs: {
          hidden: true,
          disabled: true,
          "data-is-placeholder": "true"
        }
      },
      ...options2
    ];
  }
  return options2;
}
function select$1(node) {
  node.on("created", () => {
    var _a, _b, _c;
    const isMultiple = undefine((_a = node.props.attrs) === null || _a === void 0 ? void 0 : _a.multiple);
    if (!isMultiple && node.props.placeholder && Array.isArray(node.props.options)) {
      node.hook.prop(({ prop, value }, next) => {
        if (prop === "options") {
          value = applyPlaceholder(value, node.props.placeholder);
        }
        return next({ prop, value });
      });
      node.props.options = applyPlaceholder(node.props.options, node.props.placeholder);
    }
    if (isMultiple) {
      if (node.value === void 0) {
        node.input([], false);
      }
    } else if (node.context && !node.context.options) {
      node.props.attrs = Object.assign({}, node.props.attrs, {
        value: node._value
      });
      node.on("input", ({ payload }) => {
        node.props.attrs = Object.assign({}, node.props.attrs, {
          value: payload
        });
      });
    }
    if ((_b = node.context) === null || _b === void 0 ? void 0 : _b.handlers) {
      node.context.handlers.selectInput = selectInput.bind(null, node);
      node.context.handlers.onChange = deferChange.bind(null, node);
    }
    if ((_c = node.context) === null || _c === void 0 ? void 0 : _c.fns) {
      node.context.fns.isSelected = isSelected.bind(null, node);
      node.context.fns.showPlaceholder = (value, placeholder) => {
        if (!Array.isArray(node.props.options))
          return false;
        const hasMatchingValue = node.props.options.some((option2) => {
          if (option2.attrs && "data-is-placeholder" in option2.attrs)
            return false;
          const optionValue2 = "__original" in option2 ? option2.__original : option2.value;
          return eq(value, optionValue2);
        });
        return placeholder && !hasMatchingValue ? true : void 0;
      };
    }
  });
  node.hook.input((value, next) => {
    var _a, _b, _c;
    if (!node.props.placeholder && value === void 0 && Array.isArray((_a = node.props) === null || _a === void 0 ? void 0 : _a.options) && node.props.options.length && !undefine((_c = (_b = node.props) === null || _b === void 0 ? void 0 : _b.attrs) === null || _c === void 0 ? void 0 : _c.multiple)) {
      value = "__original" in node.props.options[0] ? node.props.options[0].__original : node.props.options[0].value;
    }
    return next(value);
  });
}
function defaultIcon(sectionKey, defaultIcon2) {
  return (node) => {
    if (node.props[`${sectionKey}Icon`] === void 0) {
      node.props[`${sectionKey}Icon`] = `default:${defaultIcon2}`;
    }
  };
}
function isSlotCondition(node) {
  if (isConditional(node) && node.if && node.if.startsWith("$slots.") && typeof node.then === "string" && node.then.startsWith("$slots.") && "else" in node) {
    return true;
  }
  return false;
}
function useSchema(inputSection) {
  return outer(wrapper(label("$label"), inner(prefix(), inputSection(), suffix())), help("$help"), messages(message("$message.value")));
}
function $if(condition, then, otherwise) {
  const extendable = (extensions) => {
    const node = then(extensions);
    if (otherwise || isSchemaObject(node) && "if" in node || isSlotCondition(node)) {
      const conditionalNode = {
        if: condition,
        then: node
      };
      if (otherwise) {
        conditionalNode.else = otherwise(extensions);
      }
      return conditionalNode;
    } else if (isSlotCondition(node)) {
      Object.assign(node.else, { if: condition });
    } else if (isSchemaObject(node)) {
      Object.assign(node, { if: condition });
    }
    return node;
  };
  extendable._s = token();
  return extendable;
}
function $extend(section, extendWith) {
  const extendable = (extensions) => {
    const node = section({});
    if (isSlotCondition(node)) {
      if (Array.isArray(node.else))
        return node;
      node.else = extendSchema(extendSchema(node.else, extendWith), section._s ? extensions[section._s] : {});
      return node;
    }
    return extendSchema(extendSchema(node, extendWith), section._s ? extensions[section._s] : {});
  };
  extendable._s = section._s;
  return extendable;
}
var button = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(messages(message("$message.value")), wrapper(buttonInput(icon("prefix"), prefix(), buttonLabel("$label || $ui.submit.value"), suffix(), icon("suffix"))), help("$help")),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * The family of inputs this one belongs too. For example "text" and "email"
   * are both part of the "text" family. This is primary used for styling.
   */
  family: "button",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [localize("submit"), ignore],
  /**
   * A key to use for memoizing the schema. This is used to prevent the schema
   * from needing to be stringified when performing a memo lookup.
   */
  schemaMemoKey: "h6st4epl3j8"
};
var checkbox = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(
    $if(
      "$options == undefined",
      /**
       * Single checkbox structure.
       */
      boxWrapper(inner(prefix(), box(), decorator(icon("decorator")), suffix()), $extend(boxLabel("$label"), {
        if: "$label"
      })),
      /**
       * Multi checkbox structure.
       */
      fieldset(legend("$label"), help("$help"), boxOptions(boxOption(boxWrapper(inner(prefix(), $extend(box(), {
        bind: "$option.attrs",
        attrs: {
          id: "$option.attrs.id",
          value: "$option.value",
          checked: "$fns.isChecked($option.value)"
        }
      }), decorator(icon("decorator")), suffix()), $extend(boxLabel("$option.label"), {
        if: "$option.label"
      })), boxHelp("$option.help"))))
    ),
    // Help text only goes under the input when it is a single.
    $if("$options == undefined && $help", help("$help")),
    messages(message("$message.value"))
  ),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * The family of inputs this one belongs too. For example "text" and "email"
   * are both part of the "text" family. This is primary used for styling.
   */
  family: "box",
  /**
   * An array of extra props to accept for this input.
   */
  props: ["options", "onValue", "offValue", "optionsLoader"],
  /**
   * Additional features that should be added to your input
   */
  features: [
    options,
    checkboxes,
    defaultIcon("decorator", "checkboxDecorator")
  ],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "qje02tb3gu8"
};
var file = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(wrapper(label("$label"), inner(icon("prefix", "label"), prefix(), fileInput(), fileList(fileItem(icon("fileItem"), fileName("$file.name"), $if("$value.length === 1", fileRemove(icon("fileRemove"), "$ui.remove.value")))), $if("$value.length > 1", fileRemove("$ui.removeAll.value")), noFiles(icon("noFiles"), "$ui.noFiles.value"), suffix(), icon("suffix"))), help("$help"), messages(message("$message.value"))),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * The family of inputs this one belongs too. For example "text" and "email"
   * are both part of the "text" family. This is primary used for styling.
   */
  family: "text",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [
    files,
    defaultIcon("fileItem", "fileItem"),
    defaultIcon("fileRemove", "fileRemove"),
    defaultIcon("noFiles", "noFiles")
  ],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "9kqc4852fv8"
};
var form = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: formInput("$slots.default", messages(message("$message.value")), actions(submitInput())),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "group",
  /**
   * An array of extra props to accept for this input.
   */
  props: [
    "actions",
    "submit",
    "submitLabel",
    "submitAttrs",
    "submitBehavior",
    "incompleteMessage"
  ],
  /**
   * Additional features that should be added to your input
   */
  features: [form$1, disables],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "5bg016redjo"
};
var group = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: fragment("$slots.default"),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "group",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [disables]
};
var hidden = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: textInput(),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: []
};
var list = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: fragment("$slots.default"),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "list",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [disables]
};
var radio = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(
    $if(
      "$options == undefined",
      /**
       * Single radio structure.
       */
      boxWrapper(inner(prefix(), box(), decorator(icon("decorator")), suffix()), $if("$label", boxLabel("$label"))),
      /**
       * Multi radio structure.
       */
      fieldset(legend("$label"), help("$help"), boxOptions(boxOption(boxWrapper(inner(prefix(), $extend(box(), {
        bind: "$option.attrs",
        attrs: {
          id: "$option.attrs.id",
          value: "$option.value",
          checked: "$fns.isChecked($option.value)"
        }
      }), decorator(icon("decorator")), suffix()), $extend(boxLabel("$option.label"), {
        if: "$option.label"
      })), boxHelp("$option.help"))))
    ),
    // Help text only goes under the input when it is a single.
    $if("$options == undefined && $help", help("$help")),
    messages(message("$message.value"))
  ),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * The family of inputs this one belongs too. For example "text" and "email"
   * are both part of the "text" family. This is primary used for styling.
   */
  family: "box",
  /**
   * An array of extra props to accept for this input.
   */
  props: ["options", "onValue", "offValue", "optionsLoader"],
  /**
   * Additional features that should be added to your input
   */
  features: [
    disables,
    options,
    radios,
    defaultIcon("decorator", "radioDecorator")
  ],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "qje02tb3gu8"
};
var select = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(wrapper(label("$label"), inner(icon("prefix"), prefix(), selectInput$1($if("$slots.default", () => "$slots.default", $if("$slots.option", optionSlot, option("$option.label")))), $if("$attrs.multiple !== undefined", () => "", icon("select")), suffix(), icon("suffix"))), help("$help"), messages(message("$message.value"))),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * An array of extra props to accept for this input.
   */
  props: ["options", "placeholder", "optionsLoader"],
  /**
   * Additional features that should be added to your input
   */
  features: [options, select$1, defaultIcon("select", "select")],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "cb119h43krg"
};
var textarea = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(wrapper(label("$label"), inner(icon("prefix", "label"), prefix(), textareaInput(), suffix(), icon("suffix"))), help("$help"), messages(message("$message.value"))),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [initialValue],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "b1n0td79m9g"
};
var text = {
  /**
   * The actual schema of the input, or a function that returns the schema.
   */
  schema: outer(wrapper(label("$label"), inner(icon("prefix", "label"), prefix(), textInput(), suffix(), icon("suffix"))), help("$help"), messages(message("$message.value"))),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: "input",
  /**
   * The family of inputs this one belongs too. For example "text" and "email"
   * are both part of the "text" family. This is primary used for styling.
   */
  family: "text",
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [],
  /**
   * The key used to memoize the schema.
   */
  schemaMemoKey: "c3cc4kflsg"
};
var index = Object.freeze({
  __proto__: null,
  button,
  submit: button,
  checkbox,
  file,
  form,
  group,
  hidden,
  list,
  radio,
  select,
  textarea,
  text,
  color: text,
  date: text,
  datetimeLocal: text,
  email: text,
  month: text,
  number: text,
  password: text,
  search: text,
  tel: text,
  time: text,
  url: text,
  week: text,
  range: text
});

// node_modules/@formkit/rules/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  accepted: () => accepted,
  alpha: () => alpha,
  alpha_spaces: () => alpha_spaces,
  alphanumeric: () => alphanumeric,
  between: () => between,
  confirm: () => confirm,
  contains_alpha: () => contains_alpha,
  contains_alpha_spaces: () => contains_alpha_spaces,
  contains_alphanumeric: () => contains_alphanumeric,
  contains_lowercase: () => contains_lowercase,
  contains_numeric: () => contains_numeric,
  contains_symbol: () => contains_symbol,
  contains_uppercase: () => contains_uppercase,
  date_after: () => date_after,
  date_before: () => date_before,
  date_between: () => date_between,
  date_format: () => date_format,
  email: () => email,
  ends_with: () => ends_with,
  is: () => is,
  length: () => length,
  lowercase: () => lowercase,
  matches: () => matches,
  max: () => max,
  min: () => min,
  not: () => not,
  number: () => number2,
  require_one: () => require_one,
  required: () => required,
  starts_with: () => starts_with,
  symbol: () => symbol,
  uppercase: () => uppercase,
  url: () => url
});
var accepted = function accepted2({ value }) {
  return ["yes", "on", "1", 1, true, "true"].includes(value);
};
accepted.skipEmpty = false;
var date_after = function({ value }, compare = false) {
  const timestamp = Date.parse(compare || /* @__PURE__ */ new Date());
  const fieldValue = Date.parse(String(value));
  return isNaN(fieldValue) ? false : fieldValue > timestamp;
};
var alpha = function({ value }, set = "default") {
  const sets = {
    default: /^[\p{Lu}\p{L}]+$/u,
    latin: /^[a-zA-Z]+$/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var alpha_spaces = function({ value }, set = "default") {
  const sets = {
    default: /^[\p{Lu}\p{L} ]+$/u,
    latin: /^[a-zA-Z ]+$/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var alphanumeric = function({ value }, set = "default") {
  const sets = {
    default: /^[0-9[\p{Lu}\p{L}]+$/u,
    latin: /^[0-9\p{Latin}]+$/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var date_before = function({ value }, compare = false) {
  const timestamp = Date.parse(compare || /* @__PURE__ */ new Date());
  const fieldValue = Date.parse(String(value));
  return isNaN(fieldValue) ? false : fieldValue < timestamp;
};
var between = function between2({ value }, from, to) {
  if (!isNaN(value) && !isNaN(from) && !isNaN(to)) {
    const val = 1 * value;
    from = Number(from);
    to = Number(to);
    const [a, b] = from <= to ? [from, to] : [to, from];
    return val >= 1 * a && val <= 1 * b;
  }
  return false;
};
var hasConfirm = /(_confirm(?:ed)?)$/;
var confirm = function confirm2(node, address, comparison = "loose") {
  var _a;
  if (!address) {
    address = hasConfirm.test(node.name) ? node.name.replace(hasConfirm, "") : `${node.name}_confirm`;
  }
  const foreignValue = (_a = node.at(address)) === null || _a === void 0 ? void 0 : _a.value;
  return comparison === "strict" ? node.value === foreignValue : node.value == foreignValue;
};
var contains_alpha = function({ value }, set = "default") {
  const sets = {
    default: /[\p{Lu}\p{L}]/u,
    latin: /[a-zA-Z]/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var contains_alpha_spaces = function({ value }, set = "default") {
  const sets = {
    default: /[\p{Lu}\p{L} ]/u,
    latin: /[a-zA-Z ]/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var contains_alphanumeric = function({ value }, set = "default") {
  const sets = {
    default: /[0-9[\p{Lu}\p{L}]/u,
    latin: /[0-9\p{Latin}]/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var contains_lowercase = function({ value }, set = "default") {
  const sets = {
    default: /[\p{Ll}]/u,
    latin: /[a-z]/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var contains_numeric = function number({ value }) {
  return /[0-9]/.test(String(value));
};
var contains_symbol = function({ value }) {
  return /[!-/:-@[-`{-~]/.test(String(value));
};
var contains_uppercase = function({ value }, set = "default") {
  const sets = {
    default: /[\p{Lu}]/u,
    latin: /[A-Z]/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var date_between = function date_between2({ value }, dateA, dateB) {
  dateA = dateA instanceof Date ? dateA.getTime() : Date.parse(dateA);
  dateB = dateB instanceof Date ? dateB.getTime() : Date.parse(dateB);
  const compareTo = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (dateA && !dateB) {
    dateB = dateA;
    dateA = Date.now();
  } else if (!dateA || !compareTo) {
    return false;
  }
  return compareTo >= dateA && compareTo <= dateB;
};
var date_format = function date({ value }, format) {
  if (format && typeof format === "string") {
    return regexForFormat(format).test(String(value));
  }
  return !isNaN(Date.parse(String(value)));
};
var email = function email2({ value }) {
  const isEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return isEmail.test(String(value));
};
var ends_with = function ends_with2({ value }, ...stack) {
  if (typeof value === "string" && stack.length) {
    return stack.some((item) => {
      return value.endsWith(item);
    });
  } else if (typeof value === "string" && stack.length === 0) {
    return true;
  }
  return false;
};
var is = function is2({ value }, ...stack) {
  return stack.some((item) => {
    if (typeof item === "object") {
      return eq(item, value);
    }
    return item == value;
  });
};
var length = function length2({ value }, first = 0, second = Infinity) {
  first = parseInt(first);
  second = isNaN(parseInt(second)) ? Infinity : parseInt(second);
  const min3 = first <= second ? first : second;
  const max3 = second >= first ? second : first;
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length >= min3 && value.length <= max3;
  } else if (value && typeof value === "object") {
    const length3 = Object.keys(value).length;
    return length3 >= min3 && length3 <= max3;
  }
  return false;
};
var lowercase = function({ value }, set = "default") {
  const sets = {
    default: /^[\p{Ll}]+$/u,
    latin: /^[a-z]+$/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var matches = function matches2({ value }, ...stack) {
  return stack.some((pattern) => {
    if (typeof pattern === "string" && pattern.substr(0, 1) === "/" && pattern.substr(-1) === "/") {
      pattern = new RegExp(pattern.substr(1, pattern.length - 2));
    }
    if (pattern instanceof RegExp) {
      return pattern.test(String(value));
    }
    return pattern === value;
  });
};
var max = function max2({ value }, maximum = 10) {
  if (Array.isArray(value)) {
    return value.length <= maximum;
  }
  return Number(value) <= Number(maximum);
};
var min = function min2({ value }, minimum = 1) {
  if (Array.isArray(value)) {
    return value.length >= minimum;
  }
  return Number(value) >= Number(minimum);
};
var not = function not2({ value }, ...stack) {
  return !stack.some((item) => {
    if (typeof item === "object") {
      return eq(item, value);
    }
    return item === value;
  });
};
var number2 = function number3({ value }) {
  return !isNaN(value);
};
var require_one = function(node, ...inputNames) {
  if (!empty(node.value))
    return true;
  const values = inputNames.map((name) => {
    var _a;
    return (_a = node.at(name)) === null || _a === void 0 ? void 0 : _a.value;
  });
  return values.some((value) => !empty(value));
};
require_one.skipEmpty = false;
var required = function required2({ value }, action = "default") {
  return action === "trim" && typeof value === "string" ? !empty(value.trim()) : !empty(value);
};
required.skipEmpty = false;
var starts_with = function starts_with2({ value }, ...stack) {
  if (typeof value === "string" && stack.length) {
    return stack.some((item) => {
      return value.startsWith(item);
    });
  } else if (typeof value === "string" && stack.length === 0) {
    return true;
  }
  return false;
};
var symbol = function({ value }) {
  return /^[!-/:-@[-`{-~]+$/.test(String(value));
};
var uppercase = function({ value }, set = "default") {
  const sets = {
    default: /^[\p{Lu}]+$/u,
    latin: /^[A-Z]+$/
  };
  const selectedSet = has(sets, set) ? set : "default";
  return sets[selectedSet].test(String(value));
};
var url = function url2({ value }, ...stack) {
  try {
    const protocols = stack.length ? stack : ["http:", "https:"];
    const url3 = new URL(String(value));
    return protocols.includes(url3.protocol);
  } catch {
    return false;
  }
};

// node_modules/@formkit/themes/dist/index.mjs
var documentStyles = void 0;
var documentThemeLinkTag = null;
var themeDidLoad;
var themeHasLoaded = false;
var themeWasRequested = false;
var themeLoaded = new Promise((res) => {
  themeDidLoad = () => {
    themeHasLoaded = true;
    res();
  };
});
var isClient = typeof window !== "undefined" && typeof fetch !== "undefined";
documentStyles = isClient ? getComputedStyle(document.documentElement) : void 0;
var iconRegistry = {};
var iconRequests = {};
function createThemePlugin(theme, icons, iconLoaderUrl, iconLoader) {
  if (icons) {
    Object.assign(iconRegistry, icons);
  }
  if (isClient && !themeWasRequested && (documentStyles === null || documentStyles === void 0 ? void 0 : documentStyles.getPropertyValue("--formkit-theme"))) {
    themeDidLoad();
    themeWasRequested = true;
  } else if (theme && !themeWasRequested && isClient) {
    loadTheme(theme);
  } else if (!themeWasRequested && isClient) {
    themeDidLoad();
  }
  const themePlugin = function themePlugin2(node) {
    var _a, _b;
    node.addProps(["iconLoader", "iconLoaderUrl"]);
    node.props.iconHandler = createIconHandler(((_a = node.props) === null || _a === void 0 ? void 0 : _a.iconLoader) ? node.props.iconLoader : iconLoader, ((_b = node.props) === null || _b === void 0 ? void 0 : _b.iconLoaderUrl) ? node.props.iconLoaderUrl : iconLoaderUrl);
    loadIconPropIcons(node, node.props.iconHandler);
    node.on("created", () => {
      var _a2;
      if ((_a2 = node === null || node === void 0 ? void 0 : node.context) === null || _a2 === void 0 ? void 0 : _a2.handlers) {
        node.context.handlers.iconClick = (sectionKey) => {
          const clickHandlerProp = `on${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}IconClick`;
          const handlerFunction = node.props[clickHandlerProp];
          if (handlerFunction && typeof handlerFunction === "function") {
            return (e) => {
              return handlerFunction(node, e);
            };
          }
          return void 0;
        };
      }
    });
  };
  themePlugin.iconHandler = createIconHandler(iconLoader, iconLoaderUrl);
  return themePlugin;
}
function loadTheme(theme) {
  if (!theme || !isClient || typeof getComputedStyle !== "function") {
    return;
  }
  themeWasRequested = true;
  documentThemeLinkTag = document.getElementById("formkit-theme");
  if (theme && // if we have a window object
  isClient && // we don't have an existing theme OR the theme being set up is different
  (!(documentStyles === null || documentStyles === void 0 ? void 0 : documentStyles.getPropertyValue("--formkit-theme")) && !documentThemeLinkTag || (documentThemeLinkTag === null || documentThemeLinkTag === void 0 ? void 0 : documentThemeLinkTag.getAttribute("data-theme")) && (documentThemeLinkTag === null || documentThemeLinkTag === void 0 ? void 0 : documentThemeLinkTag.getAttribute("data-theme")) !== theme)) {
    const formkitVersion = FORMKIT_VERSION.startsWith("__") ? "latest" : FORMKIT_VERSION;
    const themeUrl = `https://cdn.jsdelivr.net/npm/@formkit/themes@${formkitVersion}/dist/${theme}/theme.css`;
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.id = "formkit-theme";
    link.setAttribute("data-theme", theme);
    link.onload = () => {
      documentStyles = getComputedStyle(document.documentElement);
      themeDidLoad();
    };
    document.head.appendChild(link);
    link.href = themeUrl;
    if (documentThemeLinkTag) {
      documentThemeLinkTag.remove();
    }
  }
}
function createIconHandler(iconLoader, iconLoaderUrl) {
  return (iconName) => {
    if (typeof iconName === "boolean") {
      return;
    }
    if (iconName.startsWith("<svg")) {
      return iconName;
    }
    if (typeof iconName !== "string")
      return;
    const isDefault = iconName.startsWith("default:");
    iconName = isDefault ? iconName.split(":")[1] : iconName;
    const iconWasAlreadyLoaded = iconName in iconRegistry;
    let loadedIcon = void 0;
    if (iconWasAlreadyLoaded) {
      return iconRegistry[iconName];
    } else if (!iconRequests[iconName]) {
      loadedIcon = getIconFromStylesheet(iconName);
      loadedIcon = isClient && typeof loadedIcon === "undefined" ? Promise.resolve(loadedIcon) : loadedIcon;
      if (loadedIcon instanceof Promise) {
        iconRequests[iconName] = loadedIcon.then((iconValue) => {
          if (!iconValue && typeof iconName === "string" && !isDefault) {
            return loadedIcon = typeof iconLoader === "function" ? iconLoader(iconName) : getRemoteIcon(iconName, iconLoaderUrl);
          }
          return iconValue;
        }).then((finalIcon) => {
          if (typeof iconName === "string") {
            iconRegistry[isDefault ? `default:${iconName}` : iconName] = finalIcon;
          }
          return finalIcon;
        });
      } else if (typeof loadedIcon === "string") {
        iconRegistry[isDefault ? `default:${iconName}` : iconName] = loadedIcon;
        return loadedIcon;
      }
    }
    return iconRequests[iconName];
  };
}
function getIconFromStylesheet(iconName) {
  if (!isClient)
    return;
  if (themeHasLoaded) {
    return loadStylesheetIcon(iconName);
  } else {
    return themeLoaded.then(() => {
      return loadStylesheetIcon(iconName);
    });
  }
}
function loadStylesheetIcon(iconName) {
  const cssVarIcon = documentStyles === null || documentStyles === void 0 ? void 0 : documentStyles.getPropertyValue(`--fk-icon-${iconName}`);
  if (cssVarIcon) {
    const icon2 = atob(cssVarIcon);
    if (icon2.startsWith("<svg")) {
      iconRegistry[iconName] = icon2;
      return icon2;
    }
  }
  return void 0;
}
function getRemoteIcon(iconName, iconLoaderUrl) {
  const formkitVersion = FORMKIT_VERSION.startsWith("__") ? "latest" : FORMKIT_VERSION;
  const fetchUrl = typeof iconLoaderUrl === "function" ? iconLoaderUrl(iconName) : `https://cdn.jsdelivr.net/npm/@formkit/icons@${formkitVersion}/dist/icons/${iconName}.svg`;
  if (!isClient)
    return void 0;
  return fetch(`${fetchUrl}`).then(async (r) => {
    const icon2 = await r.text();
    if (icon2.startsWith("<svg")) {
      return icon2;
    }
    return void 0;
  }).catch((e) => {
    console.error(e);
    return void 0;
  });
}
function loadIconPropIcons(node, iconHandler) {
  const iconRegex = /^[a-zA-Z-]+(?:-icon|Icon)$/;
  const iconProps = Object.keys(node.props).filter((prop) => {
    return iconRegex.test(prop);
  });
  iconProps.forEach((sectionKey) => {
    return loadPropIcon(node, iconHandler, sectionKey);
  });
}
function loadPropIcon(node, iconHandler, sectionKey) {
  const iconName = node.props[sectionKey];
  const loadedIcon = iconHandler(iconName);
  const rawIconProp = `_raw${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}`;
  const clickHandlerProp = `on${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}Click`;
  node.addProps([rawIconProp, clickHandlerProp]);
  node.on(`prop:${sectionKey}`, reloadIcon);
  if (loadedIcon instanceof Promise) {
    return loadedIcon.then((svg) => {
      node.props[rawIconProp] = svg;
    });
  } else {
    node.props[rawIconProp] = loadedIcon;
  }
  return;
}
function reloadIcon(event) {
  var _a;
  const node = event.origin;
  const iconName = event.payload;
  const iconHandler = (_a = node === null || node === void 0 ? void 0 : node.props) === null || _a === void 0 ? void 0 : _a.iconHandler;
  const sectionKey = event.name.split(":")[1];
  const rawIconProp = `_raw${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}`;
  if (iconHandler && typeof iconHandler === "function") {
    const loadedIcon = iconHandler(iconName);
    if (loadedIcon instanceof Promise) {
      return loadedIcon.then((svg) => {
        node.props[rawIconProp] = svg;
      });
    } else {
      node.props[rawIconProp] = loadedIcon;
    }
  }
}

// node_modules/@formkit/dev/dist/index.mjs
var registered = false;
var errors = {
  /**
   * FormKit errors:
   */
  100: ({ data: node }) => `Only groups, lists, and forms can have children (${node.name}).`,
  101: ({ data: node }) => `You cannot directly modify the store (${node.name}). See: https://formkit.com/advanced/core#message-store`,
  102: ({ data: [node, property] }) => `You cannot directly assign node.${property} (${node.name})`,
  103: ({ data: [operator] }) => `Schema expressions cannot start with an operator (${operator})`,
  104: ({ data: [operator, expression] }) => `Schema expressions cannot end with an operator (${operator} in "${expression}")`,
  105: ({ data: expression }) => `Invalid schema expression: ${expression}`,
  106: ({ data: name }) => `Cannot submit because (${name}) is not in a form.`,
  107: ({ data: [node, value] }) => `Cannot set ${node.name} to non object value: ${value}`,
  108: ({ data: [node, value] }) => `Cannot set ${node.name} to non array value: ${value}`,
  /**
   * Input specific errors:
   */
  300: ({ data: [node] }) => `Cannot set behavior prop to overscroll (on ${node.name} input) when options prop is a function.`,
  /**
   * FormKit vue errors:
   */
  600: ({ data: node }) => `Unknown input type${typeof node.props.type === "string" ? ' "' + node.props.type + '"' : ""} ("${node.name}")`,
  601: ({ data: node }) => `Input definition${typeof node.props.type === "string" ? ' "' + node.props.type + '"' : ""} is missing a schema or component property (${node.name}).`
};
var warnings = {
  /**
   * Core warnings:
   */
  150: ({ data: fn }) => `Schema function "${fn}()" is not a valid function.`,
  151: ({ data: id }) => `No form element with id: ${id}`,
  152: ({ data: id }) => `No input element with id: ${id}`,
  /**
   * Input specific warnings:
   */
  350: ({ data: { node, inputType } }) => `Invalid options prop for ${node.name} input (${inputType}). See https://formkit.com/inputs/${inputType}`,
  /**
   * Vue warnings:
   */
  650: 'Schema "$get()" must use the id of an input to access.',
  651: ({ data: id }) => `Cannot setErrors() on "${id}" because no such id exists.`,
  652: ({ data: id }) => `Cannot clearErrors() on "${id}" because no such id exists.`,
  /**
   * Deprecation warnings:
   */
  800: ({ data: name }) => `${name} is deprecated.`
};
var decodeErrors = (error2, next) => {
  if (error2.code in errors) {
    const err = errors[error2.code];
    error2.message = typeof err === "function" ? err(error2) : err;
  }
  return next(error2);
};
if (!registered)
  errorHandler(decodeErrors);
var decodeWarnings = (warning, next) => {
  if (warning.code in warnings) {
    const warn2 = warnings[warning.code];
    warning.message = typeof warn2 === "function" ? warn2(warning) : warn2;
  }
  return next(warning);
};
if (!registered)
  warningHandler(decodeWarnings);
registered = true;

// node_modules/@formkit/vue/dist/index.mjs
var isServer$2 = typeof window === "undefined";
var ssrCompleteRegistry = /* @__PURE__ */ new Map();
function ssrComplete(app) {
  if (!isServer$2)
    return;
  const callbacks = ssrCompleteRegistry.get(app);
  if (!callbacks)
    return;
  for (const callback of callbacks) {
    callback();
  }
  callbacks.clear();
  ssrCompleteRegistry.delete(app);
}
function onSSRComplete(app, callback) {
  var _a;
  if (!isServer$2 || !app)
    return;
  if (!ssrCompleteRegistry.has(app))
    ssrCompleteRegistry.set(app, /* @__PURE__ */ new Set());
  (_a = ssrCompleteRegistry.get(app)) === null || _a === void 0 ? void 0 : _a.add(callback);
}
var isServer$1 = typeof window === "undefined";
var memo = {};
var memoKeys = {};
var instanceKey;
var instanceScopes = /* @__PURE__ */ new WeakMap();
var raw = "__raw__";
var isClassProp = /[a-zA-Z0-9\-][cC]lass$/;
function getRef(token2, data) {
  const value = ref(null);
  if (token2 === "get") {
    const nodeRefs = {};
    value.value = get.bind(null, nodeRefs);
    return value;
  }
  const path = token2.split(".");
  watchEffect(() => {
    value.value = getValue(isRef(data) ? data.value : data, path);
  });
  return value;
}
function getValue(set, path) {
  if (Array.isArray(set)) {
    for (const subset of set) {
      const value = subset !== false && getValue(subset, path);
      if (value !== void 0)
        return value;
    }
    return void 0;
  }
  let foundValue = void 0;
  let obj = set;
  for (const i in path) {
    const key = path[i];
    if (typeof obj !== "object" || obj === null) {
      foundValue = void 0;
      break;
    }
    const currentValue = obj[key];
    if (Number(i) === path.length - 1 && currentValue !== void 0) {
      foundValue = typeof currentValue === "function" ? currentValue.bind(obj) : currentValue;
      break;
    }
    obj = currentValue;
  }
  return foundValue;
}
function get(nodeRefs, id) {
  if (typeof id !== "string")
    return warn(650);
  if (!(id in nodeRefs))
    nodeRefs[id] = ref(void 0);
  if (nodeRefs[id].value === void 0) {
    nodeRefs[id].value = null;
    const root = getNode$1(id);
    if (root)
      nodeRefs[id].value = root.context;
    watchRegistry(id, ({ payload: node }) => {
      nodeRefs[id].value = isNode(node) ? node.context : node;
    });
  }
  return nodeRefs[id].value;
}
function parseSchema(library, schema, memoKey) {
  function parseCondition(library2, node) {
    const condition = provider(compile(node.if), { if: true });
    const children = createElements(library2, node.then);
    const alternate = node.else ? createElements(library2, node.else) : null;
    return [condition, children, alternate];
  }
  function parseConditionAttr(attr, _default) {
    var _a, _b;
    const condition = provider(compile(attr.if));
    let b = () => _default;
    let a = () => _default;
    if (typeof attr.then === "object") {
      a = parseAttrs(attr.then, void 0);
    } else if (typeof attr.then === "string" && ((_a = attr.then) === null || _a === void 0 ? void 0 : _a.startsWith("$"))) {
      a = provider(compile(attr.then));
    } else {
      a = () => attr.then;
    }
    if (has(attr, "else")) {
      if (typeof attr.else === "object") {
        b = parseAttrs(attr.else);
      } else if (typeof attr.else === "string" && ((_b = attr.else) === null || _b === void 0 ? void 0 : _b.startsWith("$"))) {
        b = provider(compile(attr.else));
      } else {
        b = () => attr.else;
      }
    }
    return () => condition() ? a() : b();
  }
  function parseAttrs(unparsedAttrs, bindExp, _default = {}) {
    const explicitAttrs = new Set(Object.keys(unparsedAttrs || {}));
    const boundAttrs = bindExp ? provider(compile(bindExp)) : () => ({});
    const setters = [
      (attrs) => {
        const bound = boundAttrs();
        for (const attr in bound) {
          if (!explicitAttrs.has(attr)) {
            attrs[attr] = bound[attr];
          }
        }
      }
    ];
    if (unparsedAttrs) {
      if (isConditional(unparsedAttrs)) {
        const condition = parseConditionAttr(unparsedAttrs, _default);
        return condition;
      }
      for (let attr in unparsedAttrs) {
        const value = unparsedAttrs[attr];
        let getValue2;
        const isStr = typeof value === "string";
        if (attr.startsWith(raw)) {
          attr = attr.substring(7);
          getValue2 = () => value;
        } else if (isStr && value.startsWith("$") && value.length > 1 && !(value.startsWith("$reset") && isClassProp.test(attr))) {
          getValue2 = provider(compile(value));
        } else if (typeof value === "object" && isConditional(value)) {
          getValue2 = parseConditionAttr(value, void 0);
        } else if (typeof value === "object" && isPojo(value)) {
          getValue2 = parseAttrs(value);
        } else {
          getValue2 = () => value;
        }
        setters.push((attrs) => {
          attrs[attr] = getValue2();
        });
      }
    }
    return () => {
      const attrs = Array.isArray(unparsedAttrs) ? [] : {};
      setters.forEach((setter) => setter(attrs));
      return attrs;
    };
  }
  function parseNode(library2, _node) {
    let element = null;
    let attrs = () => null;
    let condition = false;
    let children = null;
    let alternate = null;
    let iterator = null;
    let resolve = false;
    const node = sugar(_node);
    if (isDOM(node)) {
      element = node.$el;
      attrs = node.$el !== "text" ? parseAttrs(node.attrs, node.bind) : () => null;
    } else if (isComponent(node)) {
      if (typeof node.$cmp === "string") {
        if (has(library2, node.$cmp)) {
          element = library2[node.$cmp];
        } else {
          element = node.$cmp;
          resolve = true;
        }
      } else {
        element = node.$cmp;
      }
      attrs = parseAttrs(node.props, node.bind);
    } else if (isConditional(node)) {
      [condition, children, alternate] = parseCondition(library2, node);
    }
    if (!isConditional(node) && "if" in node) {
      condition = provider(compile(node.if));
    } else if (!isConditional(node) && element === null) {
      condition = () => true;
    }
    if ("children" in node && node.children) {
      if (typeof node.children === "string") {
        if (node.children.startsWith("$slots.")) {
          element = element === "text" ? "slot" : element;
          children = provider(compile(node.children));
        } else if (node.children.startsWith("$") && node.children.length > 1) {
          const value = provider(compile(node.children));
          children = () => String(value());
        } else {
          children = () => String(node.children);
        }
      } else if (Array.isArray(node.children)) {
        children = createElements(library2, node.children);
      } else {
        const [childCondition, c, a] = parseCondition(library2, node.children);
        children = (iterationData) => childCondition && childCondition() ? c && c(iterationData) : a && a(iterationData);
      }
    }
    if (isComponent(node)) {
      if (children) {
        const produceChildren = children;
        children = (iterationData) => {
          return {
            default(slotData2, key) {
              var _a, _b, _c, _d;
              const currentKey = instanceKey;
              if (key)
                instanceKey = key;
              if (slotData2)
                (_a = instanceScopes.get(instanceKey)) === null || _a === void 0 ? void 0 : _a.unshift(slotData2);
              if (iterationData)
                (_b = instanceScopes.get(instanceKey)) === null || _b === void 0 ? void 0 : _b.unshift(iterationData);
              const c = produceChildren(iterationData);
              if (slotData2)
                (_c = instanceScopes.get(instanceKey)) === null || _c === void 0 ? void 0 : _c.shift();
              if (iterationData)
                (_d = instanceScopes.get(instanceKey)) === null || _d === void 0 ? void 0 : _d.shift();
              instanceKey = currentKey;
              return c;
            }
          };
        };
        children.slot = true;
      } else {
        children = () => ({});
      }
    }
    if ("for" in node && node.for) {
      const values = node.for.length === 3 ? node.for[2] : node.for[1];
      const getValues = typeof values === "string" && values.startsWith("$") ? provider(compile(values)) : () => values;
      iterator = [
        getValues,
        node.for[0],
        node.for.length === 3 ? String(node.for[1]) : null
      ];
    }
    return [condition, element, attrs, children, alternate, iterator, resolve];
  }
  function createSlots(children, iterationData) {
    const slots = children(iterationData);
    const currentKey = instanceKey;
    return Object.keys(slots).reduce((allSlots, slotName) => {
      const slotFn = slots && slots[slotName];
      allSlots[slotName] = (data) => {
        return slotFn && slotFn(data, currentKey) || null;
      };
      return allSlots;
    }, {});
  }
  function createElement(library2, node) {
    const [condition, element, attrs, children, alternate, iterator, resolve] = parseNode(library2, node);
    let createNodes = (iterationData) => {
      if (condition && element === null && children) {
        return condition() ? children(iterationData) : alternate && alternate(iterationData);
      }
      if (element && (!condition || condition())) {
        if (element === "text" && children) {
          return createTextVNode(String(children()));
        }
        if (element === "slot" && children)
          return children(iterationData);
        const el = resolve ? resolveComponent(element) : element;
        const slots = (children === null || children === void 0 ? void 0 : children.slot) ? createSlots(children, iterationData) : null;
        return h(el, attrs(), slots || (children ? children(iterationData) : []));
      }
      return typeof alternate === "function" ? alternate(iterationData) : alternate;
    };
    if (iterator) {
      const repeatedNode = createNodes;
      const [getValues, valueName, keyName] = iterator;
      createNodes = () => {
        const _v = getValues();
        const values = Number.isFinite(_v) ? Array(Number(_v)).fill(0).map((_, i) => i) : _v;
        const fragment2 = [];
        if (typeof values !== "object")
          return null;
        const instanceScope = instanceScopes.get(instanceKey) || [];
        const isArray = Array.isArray(values);
        for (const key in values) {
          if (isArray && key in Array.prototype)
            continue;
          const iterationData = Object.defineProperty({
            ...instanceScope.reduce((previousIterationData, scopedData) => {
              if (previousIterationData.__idata) {
                return { ...previousIterationData, ...scopedData };
              }
              return scopedData;
            }, {}),
            [valueName]: values[key],
            ...keyName !== null ? { [keyName]: isArray ? Number(key) : key } : {}
          }, "__idata", { enumerable: false, value: true });
          instanceScope.unshift(iterationData);
          fragment2.push(repeatedNode.bind(null, iterationData)());
          instanceScope.shift();
        }
        return fragment2;
      };
    }
    return createNodes;
  }
  function createElements(library2, schema2) {
    if (Array.isArray(schema2)) {
      const els = schema2.map(createElement.bind(null, library2));
      return (iterationData) => els.map((element2) => element2(iterationData));
    }
    const element = createElement(library2, schema2);
    return (iterationData) => element(iterationData);
  }
  const providers = [];
  function provider(compiled, hints = {}) {
    const compiledFns = /* @__PURE__ */ new WeakMap();
    providers.push((callback, key) => {
      compiledFns.set(key, compiled.provide((tokens) => callback(tokens, hints)));
    });
    return () => compiledFns.get(instanceKey)();
  }
  function createInstance(providerCallback, key) {
    var _a;
    memoKey !== null && memoKey !== void 0 ? memoKey : memoKey = JSON.stringify(schema);
    const [render, compiledProviders] = has(memo, memoKey) ? memo[memoKey] : [createElements(library, schema), providers];
    if (!isServer$1) {
      (_a = memoKeys[memoKey]) !== null && _a !== void 0 ? _a : memoKeys[memoKey] = 0;
      memoKeys[memoKey]++;
      memo[memoKey] = [render, compiledProviders];
    }
    compiledProviders.forEach((compiledProvider) => {
      compiledProvider(providerCallback, key);
    });
    return () => {
      instanceKey = key;
      return render();
    };
  }
  return createInstance;
}
function useScope(token2, defaultValue) {
  const scopedData = instanceScopes.get(instanceKey) || [];
  let scopedValue = void 0;
  if (scopedData.length) {
    scopedValue = getValue(scopedData, token2.split("."));
  }
  return scopedValue === void 0 ? defaultValue : scopedValue;
}
function slotData(data, key) {
  return new Proxy(data, {
    get(...args) {
      let data2 = void 0;
      const property = args[1];
      if (typeof property === "string") {
        const prevKey = instanceKey;
        instanceKey = key;
        data2 = useScope(property, void 0);
        instanceKey = prevKey;
      }
      return data2 !== void 0 ? data2 : Reflect.get(...args);
    }
  });
}
function createRenderFn(instanceCreator, data, instanceKey2) {
  return instanceCreator((requirements, hints = {}) => {
    return requirements.reduce((tokens, token2) => {
      if (token2.startsWith("slots.")) {
        const slot = token2.substring(6);
        const hasSlot = () => data.slots && has(data.slots, slot) && typeof data.slots[slot] === "function";
        if (hints.if) {
          tokens[token2] = hasSlot;
        } else if (data.slots) {
          const scopedData = slotData(data, instanceKey2);
          tokens[token2] = () => hasSlot() ? data.slots[slot](scopedData) : null;
        }
      } else {
        const value = getRef(token2, data);
        tokens[token2] = () => useScope(token2, value.value);
      }
      return tokens;
    }, {});
  }, instanceKey2);
}
function clean(schema, memoKey, instanceKey2) {
  memoKey !== null && memoKey !== void 0 ? memoKey : memoKey = JSON.stringify(schema);
  memoKeys[memoKey]--;
  if (memoKeys[memoKey] === 0) {
    delete memoKeys[memoKey];
    const [, providers] = memo[memoKey];
    delete memo[memoKey];
    providers.length = 0;
  }
  instanceScopes.delete(instanceKey2);
}
var FormKitSchema = defineComponent({
  name: "FormKitSchema",
  props: {
    schema: {
      type: [Array, Object],
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    library: {
      type: Object,
      default: () => ({})
    },
    memoKey: {
      type: String,
      required: false
    }
  },
  setup(props2, context) {
    var _a;
    const instance = getCurrentInstance();
    let instanceKey2 = {};
    instanceScopes.set(instanceKey2, []);
    let provider = parseSchema(props2.library, props2.schema, props2.memoKey);
    let render;
    let data;
    if (!isServer$1) {
      watch(() => props2.schema, (newSchema, oldSchema) => {
        var _a2;
        const oldKey = instanceKey2;
        instanceKey2 = {};
        provider = parseSchema(props2.library, props2.schema, props2.memoKey);
        render = createRenderFn(provider, data, instanceKey2);
        if (newSchema === oldSchema) {
          ((_a2 = instance === null || instance === void 0 ? void 0 : instance.proxy) === null || _a2 === void 0 ? void 0 : _a2.$forceUpdate)();
        }
        clean(props2.schema, props2.memoKey, oldKey);
      }, { deep: true });
    }
    watchEffect(() => {
      var _a2;
      data = Object.assign(reactive((_a2 = props2.data) !== null && _a2 !== void 0 ? _a2 : {}), {
        slots: context.slots
      });
      context.slots;
      render = createRenderFn(provider, data, instanceKey2);
    });
    function cleanUp() {
      clean(props2.schema, props2.memoKey, instanceKey2);
      if (data.node)
        data.node.destroy();
      data.slots = null;
      data = null;
      render = null;
    }
    onUnmounted(cleanUp);
    onSSRComplete((_a = getCurrentInstance()) === null || _a === void 0 ? void 0 : _a.appContext.app, cleanUp);
    return () => render ? render() : null;
  }
});
var nativeProps = {
  config: {
    type: Object,
    default: {}
  },
  classes: {
    type: Object,
    required: false
  },
  delay: {
    type: Number,
    required: false
  },
  dynamic: {
    type: Boolean,
    required: false
  },
  errors: {
    type: Array,
    default: []
  },
  inputErrors: {
    type: Object,
    default: () => ({})
  },
  index: {
    type: Number,
    required: false
  },
  id: {
    type: String,
    required: false
  },
  modelValue: {
    required: false
  },
  name: {
    type: String,
    required: false
  },
  parent: {
    type: Object,
    required: false
  },
  plugins: {
    type: Array,
    default: []
  },
  sectionsSchema: {
    type: Object,
    default: {}
  },
  sync: {
    type: Boolean,
    required: false
  },
  type: {
    type: [String, Object],
    default: "text"
  },
  validation: {
    type: [String, Array],
    required: false
  },
  validationMessages: {
    type: Object,
    required: false
  },
  validationRules: {
    type: Object,
    required: false
  },
  validationLabel: {
    type: [String, Function],
    required: false
  }
};
var props = nativeProps;
var isServer = typeof window === "undefined";
var parentSymbol = Symbol("FormKitParent");
var currentSchemaNode = null;
var getCurrentSchemaNode = () => currentSchemaNode;
var FormKit = defineComponent({
  props,
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    input: (_value, _node) => true,
    inputRaw: (_value, _node) => true,
    "update:modelValue": (_value) => true,
    node: (node) => !!node,
    submit: (_data, _node) => true,
    submitRaw: (_event, _node) => true,
    submitInvalid: (_node) => true
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  inheritAttrs: false,
  setup(props2, context) {
    const node = useInput(props2, context);
    if (!node.props.definition)
      error(600, node);
    if (node.props.definition.component) {
      return () => {
        var _a;
        return h((_a = node.props.definition) === null || _a === void 0 ? void 0 : _a.component, {
          context: node.context
        }, { ...context.slots });
      };
    }
    const schema = ref([]);
    let memoKey = node.props.definition.schemaMemoKey;
    const generateSchema = () => {
      var _a, _b;
      const schemaDefinition = (_b = (_a = node.props) === null || _a === void 0 ? void 0 : _a.definition) === null || _b === void 0 ? void 0 : _b.schema;
      if (!schemaDefinition)
        error(601, node);
      if (typeof schemaDefinition === "function") {
        currentSchemaNode = node;
        schema.value = schemaDefinition({ ...props2.sectionsSchema });
        currentSchemaNode = null;
        if (memoKey && props2.sectionsSchema || "memoKey" in schemaDefinition && typeof schemaDefinition.memoKey === "string") {
          memoKey = (memoKey !== null && memoKey !== void 0 ? memoKey : schemaDefinition === null || schemaDefinition === void 0 ? void 0 : schemaDefinition.memoKey) + JSON.stringify(props2.sectionsSchema);
        }
      } else {
        schema.value = schemaDefinition;
      }
    };
    generateSchema();
    if (!isServer) {
      node.on("schema", generateSchema);
    }
    context.emit("node", node);
    const library = node.props.definition.library;
    context.expose({ node });
    return () => h(FormKitSchema, { schema: schema.value, data: node.context, library, memoKey }, { ...context.slots });
  }
});
function createPlugin(app, options2) {
  app.component(options2.alias || "FormKit", FormKit).component(options2.schemaAlias || "FormKitSchema", FormKitSchema);
  return {
    get: getNode$1,
    setLocale: (locale) => {
      var _a;
      if ((_a = options2.config) === null || _a === void 0 ? void 0 : _a.rootConfig) {
        options2.config.rootConfig.locale = locale;
      }
    },
    clearErrors,
    setErrors,
    submit: submitForm,
    reset
  };
}
var optionsSymbol = Symbol.for("FormKitOptions");
var configSymbol = Symbol.for("FormKitConfig");
var plugin = {
  install(app, _options) {
    const options2 = Object.assign({
      alias: "FormKit",
      schemaAlias: "FormKitSchema"
    }, typeof _options === "function" ? _options() : _options);
    const rootConfig = createConfig$1(options2.config || {});
    options2.config = { rootConfig };
    app.config.globalProperties.$formkit = createPlugin(app, options2);
    app.provide(optionsSymbol, options2);
    app.provide(configSymbol, rootConfig);
  }
};
var pseudoProps = [
  "help",
  "label",
  "ignore",
  "disabled",
  "preserve",
  /^preserve(-e|E)rrors/,
  /^[a-z]+(?:-visibility|Visibility|-behavior|Behavior)$/,
  /^[a-zA-Z-]+(?:-class|Class)$/,
  "prefixIcon",
  "suffixIcon",
  /^[a-zA-Z-]+(?:-icon|Icon)$/
];
function classesToNodeProps(node, props2) {
  if (props2.classes) {
    Object.keys(props2.classes).forEach((key) => {
      if (typeof key === "string") {
        node.props[`_${key}Class`] = props2.classes[key];
        if (isObject(props2.classes[key]) && key === "inner")
          Object.values(props2.classes[key]);
      }
    });
  }
}
function onlyListeners(props2) {
  if (!props2)
    return {};
  const knownListeners = ["Submit", "SubmitRaw", "SubmitInvalid"].reduce((listeners, listener) => {
    const name = `on${listener}`;
    if (name in props2) {
      if (typeof props2[name] === "function") {
        listeners[name] = props2[name];
      }
    }
    return listeners;
  }, {});
  return knownListeners;
}
function useInput(props2, context, options2 = {}) {
  var _a;
  const config = Object.assign({}, inject(optionsSymbol) || {}, options2);
  const instance = getCurrentInstance();
  const listeners = onlyListeners(instance === null || instance === void 0 ? void 0 : instance.vnode.props);
  const isVModeled = "modelValue" in ((_a = instance === null || instance === void 0 ? void 0 : instance.vnode.props) !== null && _a !== void 0 ? _a : {});
  let isMounted = false;
  onMounted(() => {
    isMounted = true;
  });
  const value = props2.modelValue !== void 0 ? props2.modelValue : cloneAny(context.attrs.value);
  function createInitialProps() {
    const initialProps2 = {
      ...nodeProps(props2),
      ...listeners
    };
    const attrs = except(nodeProps(context.attrs), pseudoProps);
    if (!attrs.key)
      attrs.key = token();
    initialProps2.attrs = attrs;
    const propValues = only(nodeProps(context.attrs), pseudoProps);
    for (const propName in propValues) {
      initialProps2[camel(propName)] = propValues[propName];
    }
    const classesProps = { props: {} };
    classesToNodeProps(classesProps, props2);
    Object.assign(initialProps2, classesProps.props);
    if (typeof initialProps2.type !== "string") {
      initialProps2.definition = initialProps2.type;
      delete initialProps2.type;
    }
    return initialProps2;
  }
  const initialProps = createInitialProps();
  const parent = initialProps.ignore ? null : props2.parent || inject(parentSymbol, null);
  const node = createNode(extend(config || {}, {
    name: props2.name || void 0,
    value,
    parent,
    plugins: (config.plugins || []).concat(props2.plugins),
    config: props2.config,
    props: initialProps,
    index: props2.index,
    sync: props2.sync || props2.dynamic
  }, false, true));
  if (!node.props.definition)
    error(600, node);
  const lateBoundProps = ref(new Set(node.props.definition.props || []));
  node.on("added-props", ({ payload: lateProps }) => {
    if (Array.isArray(lateProps))
      lateProps.forEach((newProp) => lateBoundProps.value.add(newProp));
  });
  const pseudoPropNames = computed(() => pseudoProps.concat([...lateBoundProps.value]).reduce((names, prop) => {
    if (typeof prop === "string") {
      names.push(camel(prop));
      names.push(kebab(prop));
    } else {
      names.push(prop);
    }
    return names;
  }, []));
  watchEffect(() => classesToNodeProps(node, props2));
  const passThrough = nodeProps(props2);
  for (const prop in passThrough) {
    watch(() => props2[prop], () => {
      if (props2[prop] !== void 0) {
        node.props[prop] = props2[prop];
      }
    });
  }
  const attributeWatchers = /* @__PURE__ */ new Set();
  const possibleProps = nodeProps(context.attrs);
  watchEffect(() => {
    watchAttributes(only(possibleProps, pseudoPropNames.value));
  });
  function watchAttributes(attrProps) {
    attributeWatchers.forEach((stop) => {
      stop();
      attributeWatchers.delete(stop);
    });
    for (const prop in attrProps) {
      const camelName = camel(prop);
      attributeWatchers.add(watch(() => context.attrs[prop], () => {
        node.props[camelName] = context.attrs[prop];
      }));
    }
  }
  watchEffect(() => {
    const attrs = except(nodeProps(context.attrs), pseudoPropNames.value);
    if ("multiple" in attrs)
      attrs.multiple = undefine(attrs.multiple);
    if (typeof attrs.onBlur === "function") {
      attrs.onBlur = oncePerTick(attrs.onBlur);
    }
    node.props.attrs = Object.assign({}, node.props.attrs || {}, attrs);
  });
  watchEffect(() => {
    const messages3 = props2.errors.map((error2) => createMessage({
      key: slugify(error2),
      type: "error",
      value: error2,
      meta: { source: "prop" }
    }));
    node.store.apply(messages3, (message3) => message3.type === "error" && message3.meta.source === "prop");
  });
  if (node.type !== "input") {
    const sourceKey = `${node.name}-prop`;
    watchEffect(() => {
      const keys = Object.keys(props2.inputErrors);
      if (!keys.length)
        node.clearErrors(true, sourceKey);
      const messages3 = keys.reduce((messages4, key) => {
        let value2 = props2.inputErrors[key];
        if (typeof value2 === "string")
          value2 = [value2];
        if (Array.isArray(value2)) {
          messages4[key] = value2.map((error2) => createMessage({
            key: error2,
            type: "error",
            value: error2,
            meta: { source: sourceKey }
          }));
        }
        return messages4;
      }, {});
      node.store.apply(messages3, (message3) => message3.type === "error" && message3.meta.source === sourceKey);
    });
  }
  watchEffect(() => Object.assign(node.config, props2.config));
  if (node.type !== "input") {
    provide(parentSymbol, node);
  }
  let clonedValueBeforeVmodel = void 0;
  node.on("modelUpdated", () => {
    var _a2, _b;
    context.emit("inputRaw", (_a2 = node.context) === null || _a2 === void 0 ? void 0 : _a2.value, node);
    if (isMounted) {
      context.emit("input", (_b = node.context) === null || _b === void 0 ? void 0 : _b.value, node);
    }
    if (isVModeled && node.context) {
      clonedValueBeforeVmodel = cloneAny(node.value);
      context.emit("update:modelValue", shallowClone(node.value));
    }
  });
  if (isVModeled) {
    watch(toRef(props2, "modelValue"), (value2) => {
      if (!eq(clonedValueBeforeVmodel, value2)) {
        node.input(value2, false);
      }
    }, { deep: true });
    if (node.value !== value) {
      node.emit("modelUpdated");
    }
  }
  onBeforeUnmount(() => node.destroy());
  return node;
}
var totalCreated = 1;
function isComponent2(obj) {
  return typeof obj === "function" && obj.length === 2 || typeof obj === "object" && !Array.isArray(obj) && !("$el" in obj) && !("$cmp" in obj) && !("if" in obj);
}
function createInput(schemaOrComponent, definitionOptions = {}) {
  const definition2 = {
    type: "input",
    ...definitionOptions
  };
  let schema;
  if (isComponent2(schemaOrComponent)) {
    const cmpName = `SchemaComponent${totalCreated++}`;
    schema = createSection("input", () => ({
      $cmp: cmpName,
      props: {
        context: "$node.context"
      }
    }));
    definition2.library = { [cmpName]: markRaw(schemaOrComponent) };
  } else if (typeof schemaOrComponent === "function") {
    schema = schemaOrComponent;
  } else {
    schema = createSection("input", () => cloneAny(schemaOrComponent));
  }
  definition2.schema = useSchema(schema || "Schema undefined");
  if (!definition2.schemaMemoKey) {
    definition2.schemaMemoKey = `${Math.random()}`;
  }
  return definition2;
}
var messages2 = createSection("messages", () => ({
  $el: "ul",
  if: "$fns.length($messages)"
}));
var message2 = createSection("message", () => ({
  $el: "li",
  for: ["message", "$messages"],
  attrs: {
    key: "$message.key",
    id: `$id + '-' + $message.key`,
    "data-message-type": "$message.type"
  }
}));
var definition = messages2(message2("$message.value"));
var FormKitMessages = defineComponent({
  props: {
    node: {
      type: Object,
      required: false
    },
    sectionsSchema: {
      type: Object,
      default: {}
    },
    defaultPosition: {
      type: [String, Boolean],
      default: false
    }
  },
  setup(props2, context) {
    const node = computed(() => {
      return props2.node || inject(parentSymbol, void 0);
    });
    watch(node, () => {
      var _a;
      if (((_a = node.value) === null || _a === void 0 ? void 0 : _a.context) && !undefine(props2.defaultPosition)) {
        node.value.context.defaultMessagePlacement = false;
      }
    }, { immediate: true });
    const schema = definition(props2.sectionsSchema || {});
    const data = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        messages: ((_b = (_a = node.value) === null || _a === void 0 ? void 0 : _a.context) === null || _b === void 0 ? void 0 : _b.messages) || {},
        fns: ((_d = (_c = node.value) === null || _c === void 0 ? void 0 : _c.context) === null || _d === void 0 ? void 0 : _d.fns) || {},
        classes: ((_f = (_e = node.value) === null || _e === void 0 ? void 0 : _e.context) === null || _f === void 0 ? void 0 : _f.classes) || {}
      };
    });
    return () => {
      var _a;
      return ((_a = node.value) === null || _a === void 0 ? void 0 : _a.context) ? h(FormKitSchema, { schema, data: data.value }, { ...context.slots }) : null;
    };
  }
});
var vueBindings = function vueBindings2(node) {
  node.ledger.count("blocking", (m) => m.blocking);
  const isValid = ref(!node.ledger.value("blocking"));
  node.ledger.count("errors", (m) => m.type === "error");
  const hasErrors = ref(!!node.ledger.value("errors"));
  let hasTicked = false;
  nextTick(() => {
    hasTicked = true;
  });
  const availableMessages = reactive(node.store.reduce((store, message3) => {
    if (message3.visible) {
      store[message3.key] = message3;
    }
    return store;
  }, {}));
  const validationVisibility = ref(node.props.validationVisibility || "blur");
  node.on("prop:validationVisibility", ({ payload }) => {
    validationVisibility.value = payload;
  });
  const hasShownErrors = ref(validationVisibility.value === "live");
  const items = ref(node.children.map((child) => child.uid));
  const validationVisible = computed(() => {
    if (context.state.submitted)
      return true;
    if (!hasShownErrors.value && !context.state.settled) {
      return false;
    }
    switch (validationVisibility.value) {
      case "live":
        return true;
      case "blur":
        return context.state.blurred;
      case "dirty":
        return context.state.dirty;
      default:
        return false;
    }
  });
  const isComplete = computed(() => {
    return hasValidation.value ? isValid.value && !hasErrors.value : context.state.dirty && !empty(context.value);
  });
  const hasValidation = ref(Array.isArray(node.props.parsedRules) && node.props.parsedRules.length > 0);
  node.on("prop:parsedRules", ({ payload: rules }) => {
    hasValidation.value = Array.isArray(rules) && rules.length > 0;
  });
  const messages3 = computed(() => {
    const visibleMessages = {};
    for (const key in availableMessages) {
      const message3 = availableMessages[key];
      if (message3.type !== "validation" || validationVisible.value) {
        visibleMessages[key] = message3;
      }
    }
    return visibleMessages;
  });
  const ui = reactive(node.store.reduce((messages4, message3) => {
    if (message3.type === "ui" && message3.visible)
      messages4[message3.key] = message3;
    return messages4;
  }, {}));
  const cachedClasses = reactive({});
  const classes = new Proxy(cachedClasses, {
    get(...args) {
      const [target, property] = args;
      let className = Reflect.get(...args);
      if (!className && typeof property === "string") {
        if (!has(target, property) && !property.startsWith("__v")) {
          const observedNode = createObserver(node);
          observedNode.watch((node2) => {
            const rootClasses = typeof node2.config.rootClasses === "function" ? node2.config.rootClasses(property, node2) : {};
            const globalConfigClasses = node2.config.classes ? createClasses(property, node2, node2.config.classes[property]) : {};
            const classesPropClasses = createClasses(property, node2, node2.props[`_${property}Class`]);
            const sectionPropClasses = createClasses(property, node2, node2.props[`${property}Class`]);
            className = generateClassList(node2, property, rootClasses, globalConfigClasses, classesPropClasses, sectionPropClasses);
            target[property] = className !== null && className !== void 0 ? className : "";
          });
        }
      }
      return className;
    }
  });
  const describedBy = computed(() => {
    const describers = [];
    if (context.help) {
      describers.push(`help-${node.props.id}`);
    }
    for (const key in messages3.value) {
      describers.push(`${node.props.id}-${key}`);
    }
    return describers.length ? describers.join(" ") : void 0;
  });
  const value = ref(node.value);
  const _value = ref(node.value);
  const context = reactive({
    _value,
    attrs: node.props.attrs,
    disabled: node.props.disabled,
    describedBy,
    fns: {
      length: (obj) => Object.keys(obj).length,
      number: (value2) => Number(value2),
      string: (value2) => String(value2),
      json: (value2) => JSON.stringify(value2),
      eq
    },
    handlers: {
      blur: (e) => {
        node.store.set(createMessage({ key: "blurred", visible: false, value: true }));
        if (typeof node.props.attrs.onBlur === "function") {
          node.props.attrs.onBlur(e);
        }
      },
      touch: () => {
        var _a;
        const doCompare = context.dirtyBehavior === "compare";
        if (((_a = node.store.dirty) === null || _a === void 0 ? void 0 : _a.value) && !doCompare)
          return;
        const isDirty = !eq(node.props._init, node._value);
        if (!isDirty && !doCompare)
          return;
        node.store.set(createMessage({ key: "dirty", visible: false, value: isDirty }));
      },
      DOMInput: (e) => {
        node.input(e.target.value);
        node.emit("dom-input-event", e);
      }
    },
    help: node.props.help,
    id: node.props.id,
    items,
    label: node.props.label,
    messages: messages3,
    node: markRaw(node),
    options: node.props.options,
    defaultMessagePlacement: true,
    state: {
      blurred: false,
      complete: isComplete,
      dirty: false,
      submitted: false,
      settled: node.isSettled,
      valid: isValid,
      errors: hasErrors,
      rules: hasValidation,
      validationVisible
    },
    type: node.props.type,
    family: node.props.family,
    ui,
    value,
    classes
  });
  node.on("created", () => {
    if (!eq(context.value, node.value)) {
      _value.value = node.value;
      value.value = node.value;
      triggerRef(value);
      triggerRef(_value);
    }
    (async () => {
      await node.settled;
      if (node)
        node.props._init = cloneAny(node.value);
    })();
  });
  node.on("settled", ({ payload: isSettled }) => {
    context.state.settled = isSettled;
  });
  function observeProps(observe) {
    observe.forEach((prop) => {
      prop = camel(prop);
      if (!has(context, prop) && has(node.props, prop)) {
        context[prop] = node.props[prop];
      }
      node.on(`prop:${prop}`, ({ payload }) => {
        context[prop] = payload;
      });
    });
  }
  const rootProps = () => {
    const props2 = [
      "help",
      "label",
      "disabled",
      "options",
      "type",
      "attrs",
      "preserve",
      "preserveErrors",
      "id",
      "dirtyBehavior"
    ];
    const iconPattern = /^[a-zA-Z-]+(?:-icon|Icon)$/;
    const matchingProps = Object.keys(node.props).filter((prop) => {
      return iconPattern.test(prop);
    });
    return props2.concat(matchingProps);
  };
  observeProps(rootProps());
  function definedAs(definition2) {
    if (definition2.props)
      observeProps(definition2.props);
  }
  node.props.definition && definedAs(node.props.definition);
  node.on("added-props", ({ payload }) => observeProps(payload));
  node.on("input", ({ payload }) => {
    if (node.type !== "input" && !isRef(payload) && !isReactive(payload)) {
      _value.value = shallowClone(payload);
    } else {
      _value.value = payload;
      triggerRef(_value);
    }
  });
  node.on("commitRaw", ({ payload }) => {
    if (node.type !== "input" && !isRef(payload) && !isReactive(payload)) {
      value.value = _value.value = shallowClone(payload);
    } else {
      value.value = _value.value = payload;
      triggerRef(value);
    }
    node.emit("modelUpdated");
  });
  node.on("commit", () => {
    if ((!context.state.dirty || context.dirtyBehavior === "compare") && node.isCreated && hasTicked) {
      context.handlers.touch();
    }
    if (isComplete && node.type === "input" && hasErrors.value && !undefine(node.props.preserveErrors)) {
      node.store.filter((message3) => {
        var _a;
        return !(message3.type === "error" && ((_a = message3.meta) === null || _a === void 0 ? void 0 : _a.autoClear) === true);
      });
    }
    if (node.type === "list" && node.sync) {
      items.value = node.children.map((child) => child.uid);
    }
  });
  const updateState = async (message3) => {
    if (message3.type === "ui" && message3.visible && !message3.meta.showAsMessage) {
      ui[message3.key] = message3;
    } else if (message3.visible) {
      availableMessages[message3.key] = message3;
    } else if (message3.type === "state") {
      context.state[message3.key] = !!message3.value;
    }
  };
  node.on("message-added", (e) => updateState(e.payload));
  node.on("message-updated", (e) => updateState(e.payload));
  node.on("message-removed", ({ payload: message3 }) => {
    delete ui[message3.key];
    delete availableMessages[message3.key];
    delete context.state[message3.key];
  });
  node.on("settled:blocking", () => {
    isValid.value = true;
  });
  node.on("unsettled:blocking", () => {
    isValid.value = false;
  });
  node.on("settled:errors", () => {
    hasErrors.value = false;
  });
  node.on("unsettled:errors", () => {
    hasErrors.value = true;
  });
  watch(validationVisible, (value2) => {
    if (value2) {
      hasShownErrors.value = true;
    }
  });
  node.context = context;
  node.emit("context", node, false);
  node.on("destroyed", () => {
    node.context = void 0;
    node = null;
  });
};
var defaultConfig = (options2 = {}) => {
  const { rules = {}, locales = {}, inputs: inputs$1 = {}, messages: messages3 = {}, locale = void 0, theme = void 0, iconLoaderUrl = void 0, iconLoader = void 0, icons = {}, ...nodeOptions } = options2;
  const validation = createValidationPlugin({
    ...dist_exports,
    ...rules || {}
  });
  const i18n = createI18nPlugin(extend({ en, ...locales || {} }, messages3));
  const library = createLibraryPlugin(index, inputs$1);
  const themePlugin = createThemePlugin(theme, icons, iconLoaderUrl, iconLoader);
  return extend({
    plugins: [library, themePlugin, vueBindings, i18n, validation],
    ...!locale ? {} : { config: { locale } }
  }, nodeOptions || {}, true);
};
var FormKitIcon = defineComponent({
  name: "FormKitIcon",
  props: {
    icon: {
      type: String,
      default: ""
    },
    iconLoader: {
      type: Function,
      default: null
    },
    iconLoaderUrl: {
      type: Function,
      default: null
    }
  },
  setup(props2) {
    var _a, _b;
    const icon2 = ref(void 0);
    const config = inject(optionsSymbol, {});
    const parent = inject(parentSymbol, null);
    let iconHandler = void 0;
    function loadIcon() {
      if (!iconHandler || typeof iconHandler !== "function")
        return;
      const iconOrPromise = iconHandler(props2.icon);
      if (iconOrPromise instanceof Promise) {
        iconOrPromise.then((iconValue) => {
          icon2.value = iconValue;
        });
      } else {
        icon2.value = iconOrPromise;
      }
    }
    if (props2.iconLoader && typeof props2.iconLoader === "function") {
      iconHandler = createIconHandler(props2.iconLoader);
    } else if (parent && ((_a = parent.props) === null || _a === void 0 ? void 0 : _a.iconLoader)) {
      iconHandler = createIconHandler(parent.props.iconLoader);
    } else if (props2.iconLoaderUrl && typeof props2.iconLoaderUrl === "function") {
      iconHandler = createIconHandler(iconHandler, props2.iconLoaderUrl);
    } else {
      const iconPlugin = (_b = config === null || config === void 0 ? void 0 : config.plugins) === null || _b === void 0 ? void 0 : _b.find((plugin2) => {
        return typeof plugin2.iconHandler === "function";
      });
      if (iconPlugin) {
        iconHandler = iconPlugin.iconHandler;
      }
    }
    watch(() => props2.icon, () => {
      loadIcon();
    }, { immediate: true });
    return () => {
      if (props2.icon && icon2.value) {
        return h("span", {
          class: "formkit-icon",
          innerHTML: icon2.value
        });
      }
      return null;
    };
  }
});
export {
  FormKit,
  FormKitIcon,
  FormKitMessages,
  FormKitSchema,
  vueBindings as bindings,
  clearErrors,
  configSymbol,
  createInput,
  defaultConfig,
  errorHandler,
  getCurrentSchemaNode,
  onSSRComplete,
  optionsSymbol,
  parentSymbol,
  plugin,
  reset,
  resetCount,
  setErrors,
  ssrComplete,
  submitForm,
  useInput
};
//# sourceMappingURL=@formkit_vue.js.map
