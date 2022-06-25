import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import toast from "react-hot-toast";

type ToastProps = {
	type: "success" | "info" | "error" | "warning";
	title: string;
	subtitle: string;
};

export function showToast(props: ToastProps) {
	toast.custom(t => <Toast id={t.id} {...props} />);
}

export function Toast({ id, title, subtitle, type }: ToastProps & { id: string }) {
	return (
		<div className="relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 rounded-lg border border-light-border bg-white p-4 shadow-lg sm:w-96">
			{type === "success" && <CheckCircleIcon className="h-6 text-green-500" />}
			{type === "error" && <XCircleIcon className="h-6 text-red-500" />}
			<div className="flex flex-col gap-1">
				<span className="text-sm font-semibold">{title}</span>
				<span className="text-sm text-light">{subtitle}</span>
			</div>
			<button
				type="button"
				onClick={() => toast.remove(id)}
				className="rounded-full hover:bg-gray-100"
			>
				<XIcon className="h-5 text-slate-400" />
			</button>
		</div>
	);
}
