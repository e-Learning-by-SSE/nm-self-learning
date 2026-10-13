/** @jest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { getProviders, signIn } from "next-auth/react";
import { useLoginRedirect } from "./use-login";

jest.mock("next/router", () => ({
	useRouter: () => ({ basePath: "", asPath: "/" })
}));
jest.mock("next-auth/react", () => ({
	getProviders: jest.fn(),
	signIn: jest.fn(),
	signOut: jest.fn()
}));

describe("useLoginRedirect", () => {
	const originalDemoMode = process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE;
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE = "false";
	});
	afterAll(() => {
		if (originalDemoMode === undefined) {
			delete process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE;
		} else {
			process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE = originalDemoMode;
		}
	});

	it("redirects directly to a single OIDC provider", async () => {
		jest.mocked(getProviders).mockResolvedValue({
			first: { id: "first", name: "First SSO", type: "oauth", signinUrl: "", callbackUrl: "" }
		} as unknown as Awaited<ReturnType<typeof getProviders>>);
		const { result } = renderHook(() => useLoginRedirect());
		await result.current.loginRedirect();
		expect(signIn).toHaveBeenCalledWith("first", { callbackUrl: "/profile" });
	});

	it("shows the provider selection when multiple OIDC providers exist", async () => {
		jest.mocked(getProviders).mockResolvedValue({
			first: {
				id: "first",
				name: "First SSO",
				type: "oauth",
				signinUrl: "",
				callbackUrl: ""
			},
			second: {
				id: "second",
				name: "Second SSO",
				type: "oauth",
				signinUrl: "",
				callbackUrl: ""
			}
		} as unknown as Awaited<ReturnType<typeof getProviders>>);
		const { result } = renderHook(() => useLoginRedirect());
		await result.current.loginRedirect("/courses");
		expect(signIn).toHaveBeenCalledWith(undefined, { callbackUrl: "/courses" });
	});
});
