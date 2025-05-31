#!/usr/bin/env node

import { Project } from "ts-morph";
import path from "path";
import { Command } from "commander";

const program = new Command();

program
  .name("ts-type-expander")
  .description("Print full expanded version of a TypeScript exported type")
  .arguments("<file> <typeName>")
  .action((file, typeName) => {
    console.log('Hello', file, typeName);
  });

program.parse(process.argv);
