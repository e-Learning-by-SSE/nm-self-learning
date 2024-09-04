import { PrismaClient } from "@prisma/client";
import { ActionPayloadTypes, Actions } from "@self-learning/types";

const prisma = new PrismaClient();

type EventType = {
	action: Actions;
	createdAt: string;
	payload: ActionPayloadTypes[Actions];
	resourceId: string;
};

const videoEvents: EventType[] = [
	// Scenario 1: Start -> Pause -> Play -> Stop -> End
	{
		action: "VIDEO_OPENED",
		createdAt: "2024-08-01T08:00:00.000Z",
		payload: {
			url: "http://example.com/video-1.mp4"
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-01T08:00:01.000Z",
		payload: {
			videoCurrentTime: 0
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_PAUSE",
		createdAt: "2024-08-01T08:01:01.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-01T08:01:06.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_STOP",
		createdAt: "2024-08-01T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-1"
	},
	{
		action: "VIDEO_END",
		createdAt: "2024-08-01T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-1"
	},
	// Scenario 2: Same video later at the same day; 1 JUMP
	{
		action: "VIDEO_OPENED",
		createdAt: "2024-08-01T12:00:00.000Z",
		payload: {
			url: "http://example.com/video-1.mp4"
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-01T12:00:01.000Z",
		payload: {
			videoCurrentTime: 0
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_PAUSE",
		createdAt: "2024-08-01T12:01:01.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_JUMP",
		createdAt: "2024-08-01T12:01:01.500Z",
		payload: {
			videoJump: 0,
			videoLand: 120000
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-01T12:01:02.000Z",
		payload: {
			videoCurrentTime: 120000
		},
		resourceId: "video-1"
	},
	{
		action: "VIDEO_STOP",
		createdAt: "2024-08-01T12:01:32.000Z",
		payload: undefined,
		resourceId: "video-1"
	},
	{
		action: "VIDEO_END",
		createdAt: "2024-08-01T12:01:32.000Z",
		payload: undefined,
		resourceId: "video-1"
	},
	// Scenario 3: Scenario 1 with a different video on a different day; same week
	{
		action: "VIDEO_OPENED",
		createdAt: "2024-08-02T08:00:00.000Z",
		payload: {
			url: "http://example.com/video-2.mp4"
		},
		resourceId: "video-2"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-02T08:00:01.000Z",
		payload: {
			videoCurrentTime: 0
		},
		resourceId: "video-2"
	},
	{
		action: "VIDEO_PAUSE",
		createdAt: "2024-08-02T08:01:01.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-2"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-02T08:01:06.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-2"
	},
	{
		action: "VIDEO_STOP",
		createdAt: "2024-08-02T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-2"
	},
	{
		action: "VIDEO_END",
		createdAt: "2024-08-02T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-2"
	},
	// Scenario 4: Scenario 1 with a different video on a different week
	{
		action: "VIDEO_OPENED",
		createdAt: "2024-08-05T08:00:00.000Z",
		payload: {
			url: "http://example.com/video-3.mp4"
		},
		resourceId: "video-3"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-05T08:00:01.000Z",
		payload: {
			videoCurrentTime: 0
		},
		resourceId: "video-3"
	},
	{
		action: "VIDEO_PAUSE",
		createdAt: "2024-08-05T08:01:01.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-3"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-08-05T08:01:06.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-3"
	},
	{
		action: "VIDEO_STOP",
		createdAt: "2024-08-05T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-3"
	},
	{
		action: "VIDEO_END",
		createdAt: "2024-08-05T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-3"
	},
	// Scenario 5: Scenario 1 with a different video on a different month
	{
		action: "VIDEO_OPENED",
		createdAt: "2024-09-01T08:00:00.000Z",
		payload: {
			url: "http://example.com/video-4.mp4"
		},
		resourceId: "video-4"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-09-01T08:00:01.000Z",
		payload: {
			videoCurrentTime: 0
		},
		resourceId: "video-4"
	},
	{
		action: "VIDEO_PAUSE",
		createdAt: "2024-09-01T08:01:01.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-4"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-09-01T08:01:06.000Z",
		payload: {
			videoCurrentTime: 60000
		},
		resourceId: "video-4"
	},
	{
		action: "VIDEO_STOP",
		createdAt: "2024-09-01T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-4"
	},
	{
		action: "VIDEO_END",
		createdAt: "2024-09-01T08:02:01.000Z",
		payload: undefined,
		resourceId: "video-4"
	},
	// Scenario 6: Some parts of the video watched with different speed
	{
		action: "VIDEO_OPENED",
		createdAt: "2024-09-01T09:00:00.000Z",
		payload: {
			url: "http://example.com/video-5.mp4"
		},
		resourceId: "video-5"
	},
	{
		action: "VIDEO_PLAY",
		createdAt: "2024-09-01T09:00:01.000Z",
		payload: {
			videoCurrentTime: 0
		},
		resourceId: "video-5"
	},
	{
		action: "VIDEO_SPEED",
		createdAt: "2024-09-01T09:01:01.000Z",
		payload: {
			videoSpeed: 1.5 // After 1 minute
		},
		resourceId: "video-5"
	},
	{
		action: "VIDEO_SPEED",
		createdAt: "2024-09-01T09:02:01.000Z",
		payload: {
			videoSpeed: 1.25 // After 1 min (90sec playback)
		},
		resourceId: "video-5"
	},
	{
		action: "VIDEO_STOP",
		createdAt: "2024-09-01T09:03:01.000Z",
		payload: undefined, // After 1 min (75sec playback)
		resourceId: "video-5"
	},
	{
		action: "VIDEO_END",
		createdAt: "2024-09-01T09:03:01.000Z",
		payload: undefined,
		resourceId: "video-5"
	}
];

async function seedVideoEvents() {
	const userIds = await prisma.user.findMany({
		select: {
			id: true
		}
	});

	userIds
		.map(id => id.id)
		.forEach(async id => {
			videoEvents.forEach(async event => {
				await prisma.eventLog.create({
					data: {
						userId: id,
						action: event.action,
						createdAt: new Date(event.createdAt),
						payload: event.payload,
						resourceId: event.resourceId
					}
				});
			});
		});
}

export async function seedEvents() {
	await seedVideoEvents();
}
