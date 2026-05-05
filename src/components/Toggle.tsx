import { hapticImpact } from "../lib/tma";

interface ToggleProps {
	value: boolean;
	onChange: (v: boolean) => void;
	size?: "sm" | "md";
}

export function Toggle({ value, onChange, size = "md" }: ToggleProps) {
	const isSm = size === "sm";
	return (
		<button
			role="switch"
			aria-checked={value}
			onClick={() => { hapticImpact("light"); onChange(!value); }}
			class={[
				"relative rounded-full transition-colors duration-200 shrink-0",
				isSm ? "h-6 w-10" : "h-7 w-12",
				value ? "bg-blue-500" : "bg-black/10",
			].join(" ")}
		>
			<span
				class={[
					"absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform duration-200",
					isSm ? "h-5 w-5" : "h-6 w-6",
					value ? (isSm ? "translate-x-4" : "translate-x-5") : "translate-x-0",
				].join(" ")}
			/>
		</button>
	);
}
