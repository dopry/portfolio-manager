#!/usr/bin/env node
export * from './types'
export * from './PortfolioManagerApi'
export * from './PortfolioManager'
export * from './cli'
import { get_cli } from './cli'

if (require.main === module) {
  const cli = get_cli();
  cli.parse(process.argv);
}
