window.__ModuleLoader__.load({
	id: "i-am-yuike",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		// 浏览器半区。人格预设完全由 cordis.patch.yml 的声明行注册，本插件不需要
		// 任何浏览器设置面板，这里仅作合法空模块占位。
		exports.name = 'i-am-yuike'
		exports.inject = []
		exports.apply = function () {}

		return module.exports;
	}
});