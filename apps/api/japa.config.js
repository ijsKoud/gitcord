import { expect } from "@japa/expect";
import { configure, processCLIArgs, run } from "@japa/runner";

processCLIArgs(process.argv.splice(2));
configure({
	files: ["tests/**/*.spec.ts"],
	plugins: [expect()]
});

run()
	.then(() => process.exit(0))
	.catch(console.error)
	.finally(() => process.exit(1));
