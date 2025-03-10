import { test, expect } from "@playwright/test";

test("basic test", async ({page}) => {
	await page.togo("http://localhost:3000");
	const title = await page.title();
	expect(title).toBe("Expected Title");
});
