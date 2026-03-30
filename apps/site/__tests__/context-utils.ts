import { IncomingMessage, ServerResponse } from "http";
import { GetServerSidePropsContext } from "next";
import { Socket } from "node:net";

// Mock the provided context of getServerSideProps
export type MockRequest = IncomingMessage & {
	cookies: Partial<{ [key: string]: string }>;
	headers: Partial<{ [key: string]: string }>;
};

/**
 * Simplifies creation of mocked context to test getServerSideProps.
 * @param overrides Optional parameters to pass with the context
 * @returns A mocked context object to be used in tests.
 * @author Sascha El-Sharkawy
 */
export const createMockContext = (
	overrides: Partial<GetServerSidePropsContext> = {}
): GetServerSidePropsContext => {
	return {
		req: {
			cookies: {},
			headers: {},
			method: "GET",
			url: "/",
			connection: {} as Socket,
			socket: {} as Socket
		} as MockRequest,
		res: {} as ServerResponse,
		params: {},
		query: {},
		resolvedUrl: "/",
		...overrides
	};
};
