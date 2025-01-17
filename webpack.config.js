const Path = require("path");
const webpackConfig = require("@silverstripe/webpack-config");
const {
  resolveJS,
  externalJS,
  moduleJS,
  pluginJS,
  moduleCSS,
  pluginCSS,
} = webpackConfig;

const ENV = process.env.NODE_ENV;
const PATHS = {
  MODULES: "node_modules",
  FILES_PATH: "../",
  ROOT: Path.resolve(),
  SRC: Path.resolve("client/src"),
  DIST: Path.resolve("client/dist"),
};

const externals = externalJS(ENV, PATHS);
delete externals.reactstrap;
delete externals["react-dnd"];
delete externals["react-dnd-html5-backend"];

const config = [
  {
    name: "js",
    entry: {
      bundle: `${PATHS.SRC}/bundles/bundle.js`,
    },
    output: {
      path: PATHS.DIST,
      filename: "js/[name].js",
    },
    devtool: ENV !== "production" ? "source-map" : "",
    resolve: resolveJS(ENV, PATHS),
    externals,
    module: moduleJS(ENV, PATHS),
    plugins: pluginJS(ENV, PATHS),
  },
  {
    name: "css",
    entry: {
      bundle: `${PATHS.SRC}/bundles/bundle.scss`,
    },
    output: {
      path: PATHS.DIST,
      filename: "styles/[name].css",
    },
    devtool: ENV !== "production" ? "source-map" : "",
    module: moduleCSS(ENV, PATHS),
    plugins: pluginCSS(ENV, PATHS),
  },
];

// Use WEBPACK_CHILD=js or WEBPACK_CHILD=css env var to run a single config
module.exports = process.env.WEBPACK_CHILD
  ? config.find((entry) => entry.name === process.env.WEBPACK_CHILD)
  : (module.exports = config);
