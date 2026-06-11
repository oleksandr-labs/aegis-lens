/** @type {import('size-limit').SizeLimitConfig} */
module.exports = [
  {
    name: "Marketing pages (JS)",
    path: ".next/static/chunks/**/*.js",
    limit: "150 KB",
    gzip: true,
    brotli: false,
    // Exclude workspace/app chunks from the marketing budget
    ignore: [
      "**/workspace*",
      "**/app-router*",
      "**/[id]*",
    ],
  },
  {
    name: "Workspace app (JS)",
    path: ".next/static/chunks/**/*.js",
    limit: "600 KB",
    gzip: true,
  },
  {
    name: "Global CSS",
    path: ".next/static/css/**/*.css",
    limit: "80 KB",
    gzip: true,
  },
  {
    name: "SDK (TypeScript, CommonJS)",
    path: "../../packages/sdk-ts/dist/index.js",
    limit: "30 KB",
    gzip: true,
  },
];
