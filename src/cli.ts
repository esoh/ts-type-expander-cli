#!/usr/bin/env node

import { Project, Type } from "ts-morph";
import path from "path";
import { Command } from "commander";
import * as ts from "typescript"; // Required for format flags

const program = new Command();

program
  .name("ts-type-expander")
  .description("Print full expanded version of a TypeScript exported type")
  .arguments("<file> <typeName>")
  .option("-c, --config <tsconfig>", "TypeScript configuration file", "tsconfig.json")
  .action((file, typeName, options) => {
    const consumerTsconfigPath = path.resolve(options.config);

    const project = new Project({
      tsConfigFilePath: consumerTsconfigPath,
    });

    const absFilePath = path.resolve(file);
    const sourceFile = project.getSourceFile(absFilePath);

    if (!sourceFile) {
      console.error("Could not find file:", absFilePath);
      process.exit(1);
    }

    const typeChecker = project.getTypeChecker();
    const exportedDeclarations = sourceFile.getExportedDeclarations()
    const typeNodes = exportedDeclarations.get(typeName);
    if (!typeNodes || typeNodes.length === 0) {
      console.error(`Could not find exported type: ${typeName}`);
      process.exit(1);
    }
    const type = typeNodes[0].getType();

    const expanded = printExpanded(type);
    console.log("\n🧾 Expanded Type:\n");
    console.log(expanded);
  });

program.parse(process.argv);

function printExpanded(type: Type, depth = 0): string {
  const indent = "  ".repeat(depth);

  // ✅ Handle tuples
  if (type.isTuple()) {
    const elements = type.getTupleElements();
    return `[${elements.map(e => printExpanded(e, depth + 1)).join(", ")}]`;
  }

  // ✅ Handle arrays
  if (type.isArray()) {
    const elem = type.getArrayElementType();
    return `Array<${elem ? printExpanded(elem, depth + 1) : "unknown"}>`;
  }

  // ✅ Handle unions
  if (type.isUnion()) {
    const subTypes = type.getUnionTypes();
    return subTypes.map(t => printExpanded(t, depth)).join(" | ");
  }

  // ✅ Handle objects
  if (type.isObject()) {
    const props = type.getProperties().filter(prop =>
      prop.getName()?.startsWith("__@") === false &&
      prop.getDeclarations().some(decl => {
        const kind = decl.getKindName();
        return kind === "PropertySignature" || kind === "PropertyDeclaration";
      })
    );

    if (props.length === 0) return "{}";

    // Sort properties by name
    const sortedProps = [...props].sort((a, b) => {
      const nameA = a.getName() || '';
      const nameB = b.getName() || '';
      return nameA.localeCompare(nameB);
    });

    return (
      "{\n" +
      sortedProps
        .map((prop) => {
          const name = prop.getName();
          const valueDecl = prop.getDeclarations()[0];
          const valueType = prop.getTypeAtLocation(valueDecl);
          return `${indent}  ${name}: ${printExpanded(valueType, depth + 1)};`;
        })
        .join("\n") +
      `\n${indent}}`
    );
  }

  // ✅ Fallback for simple/primitive types
  return type.getText(undefined, ts.TypeFormatFlags.NoTruncation);
}