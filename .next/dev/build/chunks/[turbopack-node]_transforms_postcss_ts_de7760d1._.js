module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/projects/lion-school/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/dc371__pnpm_ebf22ebe._.js",
  "chunks/[root-of-the-server]__a88dc002._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/projects/lion-school/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];