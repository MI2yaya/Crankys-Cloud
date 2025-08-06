import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class Test extends OpenAPIRoute {
	schema = {
		tags: ["Test"],
		summary: "Test endpoint",
		request: {},
		responses: {
			"200": {
				description: "Test response",
				content: {
					"application/json": {
						schema: z.object({
							test_bool: Bool(),
							test_number: Num()
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		return {
			test_bool: true,
			test_number: 1337
		};
	}
}
