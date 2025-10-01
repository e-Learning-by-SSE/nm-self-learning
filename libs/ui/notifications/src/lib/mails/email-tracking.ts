import { database } from "@self-learning/database";
import { getRandomId } from "@self-learning/util/common";
import { createEventLogEntry } from "@self-learning/util/eventlog";
import { GetServerSidePropsContext } from "next";

export interface EmailTrackingResult {
	shouldRedirect: boolean;
}

/**
 * Generic email tracking handler for getServerSideProps
 *
 * @param context - Next.js GetServerSidePropsContext
 * @param trackingParamName - Name of the tracking parameter (default: "ident")
 * @returns Promise<EmailTrackingResult>
 */
export async function handleEmailTracking(
	context: GetServerSidePropsContext,
	trackingParamName = "ident"
): Promise<EmailTrackingResult> {
	const { query, req } = context;
	const emailTrackId = query[trackingParamName] as string | undefined;

	if (!emailTrackId) {
		return { shouldRedirect: false };
	}

	try {
		const reminderLog = await database.reminderLog.findFirst({
			where: {
				metadata: {
					path: ["trackingIdentifier"],
					equals: emailTrackId
				}
			},
			select: {
				id: true,
				metadata: true,
				user: {
					select: {
						name: true
					}
				}
			}
		});

		if (reminderLog) {
			await database.reminderLog.update({
				where: { id: reminderLog.id },
				data: {
					metadata: {
						...((reminderLog.metadata ?? {}) as any),
						ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
						userAgent: req.headers["user-agent"],
						clickedAt: new Date().toISOString()
					}
				}
			});

			// since the user can click the link multiple times, we want to log this too
			await createEventLogEntry({
				type: "EMAIL_CLICK",
				resourceId: emailTrackId,
				username: reminderLog.user.name,
				payload: undefined
			});
		}

		return {
			shouldRedirect: true
		};
	} catch (error) {
		console.error("Email tracking failed:", error);
		return { shouldRedirect: false };
	}
}

/**
 * Helper function to create the redirect object for Next.js getServerSideProps
 */
export function createTrackingRedirect(destination: string) {
	return {
		redirect: {
			destination,
			permanent: false
		}
	};
}

export function buildTrackingUrl(baseUrl: string) {
	const trackingId = getRandomId();
	const url = new URL(baseUrl);
	url.searchParams.set("ident", trackingId);
	return { url: url.toString(), trackingId: trackingId };
}
