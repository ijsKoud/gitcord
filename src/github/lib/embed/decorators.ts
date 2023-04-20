import { createClassDecorator, type ApplyOptionsParam, createProxy, type ConstructorType } from "@snowcrystals/iglo";

/**
 * Applies the ConstructorOptions to a class
 * @param result The ConstructorOptions or a function to get the ConstructorOptions from
 */
export function ApplyOptions<Options>(result: ApplyOptionsParam<Options>): ClassDecorator {
	return createClassDecorator((target: ConstructorType) =>
		createProxy(target, {
			construct: (constructor, [baseOptions = {}]: [Partial<Options>]) => new constructor({ ...baseOptions, ...result })
		})
	);
}
