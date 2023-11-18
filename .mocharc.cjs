/** @type { import('mocha').MochaInstanceOptions } */
module.exports = {
  color: true,
  exit: true,
  extension: ['ts'],
  spec: ['src/**/*.spec.ts'],
  recursive: true,
  require: [
    "ts-node/register",
    "source-map-support/register",
  ],
  loader: 'ts-node/esm',
}
