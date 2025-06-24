"use client";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import {
	ArrowTrendingUpIcon,
	ChevronDoubleDownIcon,
	ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import {
	BoltIcon,
	CalendarIcon,
	PauseCircleIcon,
	SparklesIcon,
	TrophyIcon,
	XCircleIcon,
	XMarkIcon
} from "@heroicons/react/24/solid";
import { AchievementList, useAchievementRedemption } from "@self-learning/achievements";
import { trpc } from "@self-learning/api-client";
import {
	AnimatedFlame,
	GameifyDialog,
	LightningLoadingDialog,
	showToast,
	SlotCounter,
	useIsAtLeastLargeScreen
} from "@self-learning/ui/common";
import { NotificationPropsMap } from "@self-learning/ui/notifications";
import { addHours, formatDistanceToNowStrict } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useState } from "react";

type StreakStatus = "active" | "broken" | "refire" | "paused";

interface SlotMachineProps {
	streakStatus: StreakStatus;
	streakCount: number;
}

export function SlotMachine({ streakStatus, streakCount }: SlotMachineProps) {
	const [flamesVisible, setFlamesVisible] = useState(false);

	// Effect for flame animations
	useEffect(() => {
		setFlamesVisible(streakStatus === "refire");
		if (streakStatus === "refire") {
			const timer = setTimeout(() => {
				setFlamesVisible(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [streakStatus]);

	// Style constants
	const bgBase = "p-8 rounded-xl shadow-xl mb-4";
	const bgFlames = "absolute inset-0 scale-150 z-0";

	// Slot counter logic (moved from renderSlotCounter)
	const renderSlotCounter = () => {
		switch (streakStatus) {
			case "refire":
				return (
					<SlotCounter
						targetValue={streakCount + 1}
						startValue={streakCount}
						duration={3000}
					/>
				);
			case "active":
				return <SlotCounter targetValue={streakCount} startValue={0} duration={2000} />;
			case "paused":
				return (
					<SlotCounter
						targetValue={streakCount}
						startValue={streakCount}
						duration={2000}
					/>
				);
			case "broken":
			default:
				return (
					<SlotCounter targetValue={streakCount} startValue={streakCount} duration={0} />
				);
		}
	};

	// Background styles based on streak status
	const getBackgroundStyles = () => {
		if (streakStatus === "broken") {
			return (
				<div
					className={`${bgBase} bg-gradient-to-br from-gray-400 via-gray-400 to-gray-600`}
				>
					<div className="mb-4 text-center text-white text-xl font-semibold">
						<div className="mb-2">Tage in Folge aktiv</div>
						<div className="text-3xl font-bold">{renderSlotCounter()}</div>
					</div>
				</div>
			);
		}

		if (streakStatus === "active") {
			return (
				<div
					className={`${bgBase} bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800`}
				>
					<div className="mb-4 text-center text-white text-xl font-semibold">
						<div className="mb-2">Tage in Folge aktiv</div>
						<div className="text-3xl font-bold">{renderSlotCounter()}</div>
					</div>
				</div>
			);
		}

		if (streakStatus === "refire") {
			return (
				<div className="relative">
					{/* Hintergrund-Flamme */}
					<div
						className={`${bgFlames} transition-opacity duration-700 ease-out ${flamesVisible ? "opacity-100" : "opacity-0"}`}
					>
						<AnimatedFlame className="w-full h-full" />
					</div>
					{/* Vordergrund-Inhalt */}
					<div
						className={`${bgBase} animate-color-change relative z-10`}
						style={
							{
								"--from-color": "#6b7280", // gray-500
								"--via-color": "#f97316", // orange-500
								"--to-color": "#8b5cf6" // purple-600
							} as React.CSSProperties
						}
					>
						<div className="mb-4 text-center text-white text-xl font-semibold">
							<div className="mb-2">Tage in Folge aktiv</div>
							<div className="text-3xl font-bold">{renderSlotCounter()}</div>
						</div>
					</div>
				</div>
			);
		}

		if (streakStatus === "paused") {
			return (
				<div className="relative">
					{/* Hintergrund-Flamme */}
					<div className={`${bgFlames} bottom-10`}>
						{/* <AnimatedFlame className="w-full" isBlue /> */}
					</div>
					{/* Vordergrund-Inhalt */}
					<div
						className={`${bgBase} relative bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 z-10`}
					>
						<div className="mb-4 text-center text-white text-xl font-semibold">
							<div className="mb-2">Tage in Folge aktiv</div>
							<div className="text-3xl font-bold">{renderSlotCounter()}</div>
						</div>
					</div>
				</div>
			);
		}

		return null;
	};

	return getBackgroundStyles();
}

export function StreakSlotMachineDialog({
	onClose,
	open,
	trigger,
	loginStreak,
	energy
}: {
	open: boolean;
	onClose: () => void;
	trigger: NotificationPropsMap["StreakInfoDialog"]["trigger"];
	loginStreak: NotificationPropsMap["StreakInfoDialog"]["loginStreak"];
	energy: NotificationPropsMap["StreakInfoDialog"]["energy"];
}) {
	const {
		pausedUntil: initialPausedUntil,
		status: initialStreakStatus,
		count: streakCount
	} = loginStreak;

	const isLargeScreen = useIsAtLeastLargeScreen();
	const [isRefireDisclosureOpen, setRefireDisclosureOpen] = useState(false);
	const [showAchievements, setShowAchievements] = useState(false);
	const [streakStatus, setStreakStatus] = useState<StreakStatus>(initialStreakStatus);
	const [pausedUntil, setPausedUntil] = useState(initialPausedUntil ?? new Date());

	const [remainingEnergy, setRemainingEnergy] = useState(energy);

	const { mutateAsync: pauseStreakMutation } = trpc.achievement.pauseStreak.useMutation();
	const { mutateAsync: refireStreakMutation } = trpc.achievement.refireStreak.useMutation();
	const { mutateAsync: resetStreak } = trpc.achievement.resetStreak.useMutation();

	const achievements = trpc.achievement.getOwnAchievements.useQuery();
	const streakAchievements = (achievements.data ?? [])
		.filter(achievement => achievement?.meta?.group === "daily_streak")
		.reverse();
	const { mutateAsync: earnAchievements } = trpc.achievement.earnAchievements.useMutation();
	const { handleRedeem } = useAchievementRedemption();

	const isPaused = streakStatus === "paused" && pausedUntil !== null;

	const [showLightning, setShowLightning] = useState(false);

	useEffect(() => {
		setRemainingEnergy(energy ?? 0);
	}, [energy]);

	useEffect(() => {
		async function fetchAchievements() {
			if (trigger !== "reset") {
				const newAch = await earnAchievements({ trigger: "daily_login" });
				if (newAch.length > 0) {
					setShowAchievements(true);
				}
			}
		}
		fetchAchievements();
	}, [trigger, earnAchievements]);

	const handleRefire = async (): Promise<void> => {
		if (remainingEnergy >= 2) {
			setRefireDisclosureOpen(false);
			setStreakStatus("refire");
			// Optimistic Update: Energy sofort reduzieren
			setRemainingEnergy(prev => prev - 2);
			await refireStreakMutation();
		} else {
			showToast({
				title: "Nicht genug Energie",
				subtitle: "Du benötigst mindestens 2 Energie, um deinen Streak wiederherzustellen.",
				type: "error"
			});
		}
	};

	const handlePauseStreak = async (): Promise<void> => {
		if (remainingEnergy >= 1 && !isPaused) {
			setStreakStatus("paused");
			setPausedUntil(addHours(new Date(), 24));
			// Optimistic Update: Energy sofort reduzieren
			setRemainingEnergy(prev => prev - 1);
			await pauseStreakMutation();
			setShowLightning(true);
		}
	};

	const handleReset = async (): Promise<void> => {
		await resetStreak();
		customOnClose(); // just close it and save logic for resetting here
		window.location.reload();
	};

	const customOnClose = () => {
		onClose();
		setStreakStatus(prev => {
			if (prev === "refire") {
				return "active"; // Reset to active after refire animation
			} else {
				return prev;
			}
		});
		setRefireDisclosureOpen(false);
		setShowAchievements(false);
	};

	// Rest der Komponente bleibt gleich...
	return (
		<>
			<LightningLoadingDialog
				open={showLightning}
				onClose={async () => {
					setShowLightning(false);
				}}
				animationMode="static"
				text={"Du hast mithilfe von 1 Energie eine Lernpause aktiviert!"}
				showOkButton={true}
			/>

			<GameifyDialog
				open={open}
				title={`Deine Streak!`}
				onClose={customOnClose}
				style={{
					height: "80vh",
					width: "90vw",
					maxWidth: "600px",
					minWidth: 420,
					maxHeight: "80vh"
				}}
			>
				{/* Single scrollable container for all content */}
				<div className="overflow-y-auto h-full">
					{/* Top section with streak machine */}
					<div className="flex flex-col items-center justify-center mb-6 relative">
						{/* Flame Counter - Absolutely positioned at top right */}
						<div className="absolute top-0 right-0 flex items-center backdrop-blur-sm px-2 py-1 bg-orange-50 rounded-full p-2 shadow-lg">
							<span className="font-medium mr-1">{remainingEnergy}</span>
							<BoltIcon className="w-5 h-5 text-orange-500" />
						</div>

						{/* Rest der JSX bleibt gleich... */}
						<SlotMachine streakCount={streakCount} streakStatus={streakStatus} />

						<div className="flex flex-col items-center justify-center">
							{isPaused && (
								<div className="mb-4 text-center">
									<div className="flex items-center justify-center mb-2">
										<PauseCircleIcon className="w-6 h-6 mr-2 text-blue-500" />
										<span className="font-semibold">Lernpause aktiv</span>
									</div>
									<div className="text-sm text-gray-700 mb-2">
										Pausiert bis{" "}
										{formatDistanceToNowStrict(pausedUntil ?? new Date(), {
											locale: de,
											addSuffix: true
										})}
										<div className="text-xs text-gray-500">
											An dem Tag an dem die Pause endet, verlierst du keinen
											Fortschritt.
										</div>
									</div>
								</div>
							)}

							{/* Fixed height button container to prevent layout shifts */}
							<div className="flex justify-center mt-2" style={{ minHeight: "48px" }}>
								{streakStatus === "broken" && (
									<div className="flex flex-col items-center gap-4">
										<button
											className="btn-secondary bg-gradient-to-br from-orange-500 to-orange-100 animate-bounce"
											onClick={handleRefire}
											disabled={remainingEnergy < 2}
										>
											Streak wiederherstellen
											<BoltIcon className="w-5 h-5 ml-2 inline-block" />
											<span className="ml-1">
												(-2 <BoltIcon className="w-4 h-4 inline-block" />)
											</span>
										</button>

										<button className="btn-stroked" onClick={handleReset}>
											Jetzt zurücksetzen
										</button>
									</div>
								)}

								{streakStatus === "active" && (
									<button
										className="btn bg-gradient-to-br from-blue-300 to-blue-500 flex items-center shadow-lg hover:animate-highlight-shimmering"
										onClick={handlePauseStreak}
										disabled={remainingEnergy < 1}
									>
										<PauseCircleIcon className="w-5 h-5 ml-2" />
										Lernpause aktivieren
										<span className="ml-1">
											(-1 <BoltIcon className="w-4 h-4 inline-block" />)
										</span>
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Main content area */}
					<div className="space-y-6">
						{showAchievements ? (
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="flex justify-between items-center mb-4">
									<h3 className="font-bold text-lg">Deine Errungenschaften</h3>
									<button
										onClick={() => setShowAchievements(false)}
										className="text-gray-500 hover:text-gray-700"
									>
										<XMarkIcon className="w-5 h-5" />
									</button>
								</div>
								<AchievementList
									achievements={streakAchievements}
									onRedeem={handleRedeem}
								/>
							</div>
						) : (
							<>
								<DisclosureSection
									title="Dein Streak-Fortschritt"
									defaultOpen={isLargeScreen}
								>
									<p className="mb-2">
										Du bist inzwischen seit <strong>{streakCount} Tagen</strong>{" "}
										aktiv. Mach weiter so und halte die Flamme am brennen!
									</p>
									<p>
										Du kannst Erfolge freischalten, indem du mehrere Tage in
										Folge aktiv bist. Du kannst mithilfe von{" "}
										<BoltIcon className="w-4 h-4 inline-block text-orange-500" />{" "}
										deine Lernreihe schützen oder wiederherstellen.
									</p>
									<button
										className="btn-gamify mt-4"
										onClick={() => setShowAchievements(true)}
									>
										Errungenschaften anzeigen
										<TrophyIcon className="w-5 h-5 ml-2 inline-block" />
									</button>
								</DisclosureSection>

								<DisclosureSection
									title="Wie Streaks funktionieren"
									defaultOpen={false}
								>
									<div className="space-y-4">
										<div className="flex items-start">
											<ArrowTrendingUpIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
											<p>
												Jeden Tag, an dem du dich in deinem Account
												einloggst, wird dein Zähler um 1 erhöht. Kontinuität
												wird belohnt!
											</p>
										</div>
										<div className="flex items-start">
											<CalendarIcon className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" />
											<p>
												<strong>
													Samstag und Sonntag sind Bonus-Tage.
												</strong>{" "}
												An diesen Tagen kann dein Zähler steigen, aber nicht
												zurückgesetzt werden. So hast du am Wochenende eine
												Pause verdient!
											</p>
										</div>
										<div className="flex items-start">
											<XCircleIcon className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" />
											<p>
												Solltest du dich an einem Werktag nicht anmelden,
												wird der Zähler zurückgesetzt. Du kannst ihn aber
												mit Funken wiederherstellen oder im Voraus eine
												Lernpause einplanen.
											</p>
										</div>
										<div className="flex items-start">
											<ExclamationTriangleIcon className="w-6 h-6 text-amber-500 mr-2 flex-shrink-0" />
											<p>
												<strong>Wichtig:</strong> Wenn dein Streak
												unterbrochen ist, wird er beim nächsten Login
												automatisch zurückgesetzt, es sei denn du stellst
												ihn vorher wieder her.
											</p>
										</div>
									</div>
								</DisclosureSection>

								<DisclosureSection
									title="Energie Funktionen"
									defaultOpen={
										streakStatus === "broken" || isRefireDisclosureOpen
									}
								>
									<div className="space-y-4">
										<div className="flex items-start">
											<PauseCircleIcon className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" />
											<div>
												<h4 className="font-semibold">
													Lernpause aktivieren
												</h4>
												<p>
													Du weißt, dass du morgen nicht lernen kannst?
													Aktiviere eine Lernpause für 24 Stunden und wir
													verwenden eine Energie automatisch für dich wenn
													es soweit ist. Dein Fortschritt bleibt so
													geschützt.
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<BoltIcon className="w-6 h-6 text-orange-500 mr-2 flex-shrink-0" />
											<div>
												<h4 className="font-semibold">
													Streak wiederherstellen
												</h4>
												<p>
													Wenn dein Streak unterbrochen wurde, kannst du
													ihn mit zwei Energie wiederherstellen. So
													bewahrst du deinen Fortschritt.
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<SparklesIcon className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" />
											<div>
												<h4 className="font-semibold">Energie sammeln</h4>
												<p>
													Du erhältst Energie durch Lernfortschritte,
													abgeschlossene Kurse und regelmäßige
													Aktivitäten. Setze sie strategisch ein, um deine
													Lernreihe zu schützen!
												</p>
												<p className="mt-1 ">
													<strong>
														Du hast:{" "}
														<BoltIconText text={remainingEnergy} />
													</strong>
												</p>
											</div>
										</div>
									</div>
								</DisclosureSection>
							</>
						)}
					</div>
				</div>
			</GameifyDialog>
		</>
	);
}

function BoltIconText({ text }: { text: string | number }) {
	return (
		<span className="inline-flex items-center space-x-1">
			<span>{text}</span>
			<BoltIcon className="w-4 h-4 text-orange-500 align-middle" />
		</span>
	);
}

function DisclosureSection({
	title,
	children,
	defaultOpen = false
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	return (
		<Disclosure defaultOpen={defaultOpen}>
			{({ open }) => (
				<div className="border rounded-lg overflow-hidden">
					<DisclosureButton className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold">
						<span>{title}</span>
						<ChevronDoubleDownIcon
							className={`w-5 h-5 transition-transform ${
								open ? "rotate-180" : "rotate-0"
							}`}
						/>
					</DisclosureButton>
					<DisclosurePanel className="px-4 py-2 text-gray-600">
						{children}
					</DisclosurePanel>
				</div>
			)}
		</Disclosure>
	);
}
