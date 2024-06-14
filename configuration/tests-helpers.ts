/**
 * This function checks if the provided HTMLElement has
 * all the classes specified in the `classes` array.
 *
 * It is designed to be used in Jest tests ONLY.
 *
 * @param {HTMLElement} element - The element to check.
 * @param {string[]} classes - An array of class names that the element is expected to have.
 **/
export const expectToHaveClasses = (
	element: HTMLElement | Element,
	classes: string[],
) => {
	const elementClasses = new Set(element.className.split(" "));
	classes.sort().forEach((expectedClass) => {
		expect(Array.from(elementClasses)).toContain(expectedClass);
	});
};

export const expectToHaveStyles = (
	element: HTMLElement,
	styles: Record<string, string>,
) => {
	const elementStyles = getComputedStyle(element);
	Object.entries(styles).forEach(([property, value]) => {
		expect(elementStyles.getPropertyValue(property)).toBe(value);
	});
};
