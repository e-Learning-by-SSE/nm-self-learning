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
	beforeEach(() => {
		jest.clearAllMocks();
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

	it("shows credentials alongside an OIDC provider", async () => {
		jest.mocked(getProviders).mockResolvedValue({
			oidc: { id: "oidc", name: "SSO", type: "oauth", signinUrl: "", callbackUrl: "" },
			credentials: {
				id: "credentials",
				name: "Demo",
				type: "credentials",
				signinUrl: "",
				callbackUrl: ""
			}
		} as unknown as Awaited<ReturnType<typeof getProviders>>);
		const { result } = renderHook(() => useLoginRedirect());
		await result.current.loginRedirect();
		expect(signIn).toHaveBeenCalledWith(undefined, { callbackUrl: "/profile" });
	});

	it("shows the sign-in page for a credentials-only provider", async () => {
		jest.mocked(getProviders).mockResolvedValue({
			credentials: {
				id: "credentials",
				name: "Demo",
				type: "credentials",
				signinUrl: "",
				callbackUrl: ""
			}
		} as unknown as Awaited<ReturnType<typeof getProviders>>);
		const { result } = renderHook(() => useLoginRedirect());
		await result.current.loginRedirect();
		expect(signIn).toHaveBeenCalledWith(undefined, { callbackUrl: "/profile" });
	});
});
