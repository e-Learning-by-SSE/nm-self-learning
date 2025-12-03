import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	XCircleIcon
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
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
		<div
			className="relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 rounded-lg border border-c-border bg-white p-4 shadow-lg sm:w-96"
			data-testid={`toast-${type}`}
		>
			{type === "success" && <CheckCircleIcon className="h-6 text-c-success" />}
			{type === "error" && <XCircleIcon className="h-6 text-c-danger" />}
			{type === "info" && <InformationCircleIcon className="h-6 text-c-info" />}
			{type === "warning" && <ExclamationTriangleIcon className="h-6 text-c-attention" />}
			<div className="flex flex-col gap-1">
				<span className="text-sm font-semibold">{title}</span>
				<span className="text-sm text-c-text-muted">{subtitle}</span>
			</div>
			<button
				type="button"
				onClick={() => toast.remove(id)}
				className="rounded-full hover:bg-c-hover-muted"
			>
				<XMarkIcon className="h-5 text-slate-400" />
			</button>
		</div>
	);
}
