import { useState } from 'preact/hooks'
import { useBuilderState } from './useBuilderState'
import { hapticImpact, hapticNotification } from '../lib/tma'
import type { DateFormat, DateKind, DateMode, DateOrder } from '../lib/payload'
import { Toggle } from '../components/Toggle'

const ACCENT = '#007AFF'

function Section({ title, children }: { title: string; children: preact.ComponentChildren }) {
	return (
		<div class='flex flex-col gap-3'>
			<span class='text-xs font-semibold uppercase tracking-widest text-gray-400'>{title}</span>
			{children}
		</div>
	)
}

function Field({ label, children }: { label: string; children: preact.ComponentChildren }) {
	return (
		<label class='flex flex-col gap-1.5'>
			<span class='text-sm font-medium text-gray-600'>{label}</span>
			{children}
		</label>
	)
}

function Input(props: preact.JSX.HTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			class='w-full rounded-2xl border-0 bg-black/5 px-4 py-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/30 transition placeholder:text-gray-400'
		/>
	)
}

function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
}: {
	options: { label: string; value: T }[]
	value: T
	onChange: (v: T) => void
}) {
	return (
		<div class='flex rounded-2xl bg-black/5 p-1 gap-1 flex-wrap'>
			{options.map((opt) => (
				<button
					key={opt.value}
					onClick={() => {
						hapticImpact('light')
						onChange(opt.value)
					}}
					class={[
						'flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
						value === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
					].join(' ')}
				>
					{opt.label}
				</button>
			))}
		</div>
	)
}

// --- format preview helpers ---

const EXAMPLE_DATE = new Date(2025, 2, 15, 14, 30) // 2025-03-15 14:30

function dateFormatExample(format: DateFormat, mode: DateMode, order: DateOrder): string {
	const y = EXAMPLE_DATE.getFullYear()
	const m = String(EXAMPLE_DATE.getMonth() + 1).padStart(2, '0')
	const d = String(EXAMPLE_DATE.getDate()).padStart(2, '0')
	const H = String(EXAMPLE_DATE.getHours()).padStart(2, '0')
	const M = String(EXAMPLE_DATE.getMinutes()).padStart(2, '0')

	const midnight = new Date(y, EXAMPLE_DATE.getMonth(), EXAMPLE_DATE.getDate())
	const midnightEnd = new Date(y, EXAMPLE_DATE.getMonth() + 3, EXAMPLE_DATE.getDate())
	const withTime = EXAMPLE_DATE
	const div = format === 'unix-s' ? 1000 : 1

	function fmtDate(date: Date) {
		const yy = String(date.getFullYear())
		const mm = String(date.getMonth() + 1).padStart(2, '0')
		const dd = String(date.getDate()).padStart(2, '0')
		switch (order) {
			case 'ymd':
				return `${yy}-${mm}-${dd}`
			case 'dmy':
				return `${dd}-${mm}-${yy}`
			case 'mdy':
				return `${mm}-${dd}-${yy}`
		}
	}

	switch (mode) {
		case 'date':
			if (format !== 'default') return String(Math.floor(midnight.getTime() / div))
			return fmtDate(midnight)
		case 'time':
			if (format !== 'default') return String(Math.floor(withTime.getTime() / div))
			return `${H}-${M}`
		case 'datetime':
			if (format !== 'default') return String(Math.floor(withTime.getTime() / div))
			return `${fmtDate(midnight)}_${H}-${M}`
		case 'date-range':
			if (format !== 'default') {
				return `${Math.floor(midnight.getTime() / div)}_${Math.floor(midnightEnd.getTime() / div)}`
			}
			return `${fmtDate(midnight)}_${fmtDate(midnightEnd)}`
		case 'time-range':
			if (format !== 'default') {
				const end = new Date(withTime.getTime() + 2 * 3600 * 1000)
				return `${Math.floor(withTime.getTime() / div)}_${Math.floor(end.getTime() / div)}`
			}
			return `${H}-${M}_16-45`
	}
}

export function BuilderPage() {
	const s = useBuilderState()
	const [copied, setCopied] = useState(false)

	function copyUrl() {
		navigator.clipboard.writeText(s.generatedUrl).then(() => {
			hapticNotification('success')
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}

	function openPreview() {
		hapticImpact('medium')
		window.open(s.generatedUrl, '_blank')
	}

	const showDateOptions = s.widgetType === 'date'
	const showColorOptions = s.widgetType === 'color'
	const showScheduleOptions = s.widgetType === 'schedule'

	return (
		<div class='min-h-screen bg-[#F2F2F7] p-5 flex flex-col gap-5'>
			<div class='pt-4'>
				<h1 class='text-2xl font-bold text-gray-900'>Widget Builder</h1>
				<p class='mt-1 text-sm text-gray-500'>Configure and generate a widget link</p>
			</div>

			<div class='flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm'>
				<Section title='Widget type'>
					<SegmentedControl
						options={[
							{ label: 'Date', value: 'date' },
							{ label: 'Color', value: 'color' },
							{ label: 'Schedule', value: 'schedule' },
						]}
						value={s.widgetType}
						onChange={s.setWidgetType}
					/>
				</Section>

				<div class='h-px bg-black/5' />

				<Section title='Bot settings'>
					<Field label='Bot username'>
						<Input
							type='text'
							placeholder='your_telegram_bot'
							value={s.botUsername}
							onInput={(e) => s.setBotUsername((e.target as HTMLInputElement).value)}
						/>
					</Field>
				</Section>

				<div class='h-px bg-black/5' />

				{showDateOptions && (
					<Section title='Date options'>
						<Field label='Type'>
							<SegmentedControl
								options={[
									{ label: 'Date', value: 'date' },
									{ label: 'Time', value: 'time' },
									{ label: 'Date & Time', value: 'datetime' },
								]}
								value={s.dateKind}
								onChange={(v) => {
									s.setDateKind(v)
									if (v === 'datetime') s.setDateRange(false)
								}}
							/>
						</Field>
						{s.dateKind !== 'datetime' && (
							<div class='flex items-center justify-between'>
								<span class='text-sm font-medium text-gray-600'>Range</span>
								<Toggle value={s.dateRange} onChange={s.setDateRange} />
							</div>
						)}
						{
							<Field label='Output format'>
								<div class='flex flex-col gap-1.5'>
									<SegmentedControl
										options={[
											{ label: 'Default', value: 'default' },
											{ label: 'Unix s', value: 'unix-s' },
											{ label: 'Unix ms', value: 'unix-ms' },
										]}
										value={s.dateFormat}
										onChange={s.setDateFormat}
									/>
									<div class='rounded-xl bg-black/5 px-3 py-2'>
										<span class='text-xs text-gray-400 font-medium'>Example: </span>
										<span class='text-xs font-mono text-gray-600'>
											{dateFormatExample(s.dateFormat, s.dateMode, s.dateOrder)}
										</span>
									</div>
								</div>
							</Field>
						}
						{s.dateFormat === 'default' && s.dateKind !== 'time' && (
							<Field label='Date order'>
								<div class='flex flex-col gap-1.5'>
									<SegmentedControl
										options={[
											{ label: 'YMD', value: 'ymd' },
											{ label: 'DMY', value: 'dmy' },
											{ label: 'MDY', value: 'mdy' },
										]}
										value={s.dateOrder}
										onChange={s.setDateOrder}
									/>
									<div class='rounded-xl bg-black/5 px-3 py-2'>
										<span class='text-xs text-gray-400 font-medium'>Example: </span>
										<span class='text-xs font-mono text-gray-600'>
											{dateFormatExample(s.dateFormat, s.dateMode, s.dateOrder)}
										</span>
									</div>
								</div>
							</Field>
						)}
					</Section>
				)}

				{showColorOptions && (
					<Section title='Color options'>
						<Field label='Format'>
							<SegmentedControl
								options={[
									{ label: 'HEX', value: 'hex' },
									{ label: 'RGB', value: 'rgb' },
									{ label: 'HSL', value: 'hsl' },
								]}
								value={s.colorFormat}
								onChange={s.setColorFormat}
							/>
						</Field>
						<div class='rounded-xl bg-black/5 px-3 py-2 flex items-center gap-2'>
							<div class='h-4 w-4 rounded-full shrink-0' style={{ backgroundColor: '#007AFF' }} />
							<span class='text-xs text-gray-400 font-medium'>Example: </span>
							<span class='text-xs font-mono text-gray-600'>
								{s.colorFormat === 'hex' ? '007AFF' : s.colorFormat === 'rgb' ? '0_122_255' : '211_100_50'}
							</span>
						</div>
					</Section>
				)}

				{showScheduleOptions && (
					<Section title='Schedule options'>
						<div class='rounded-xl bg-black/5 px-3 py-2.5 flex flex-col gap-1'>
							<span class='text-xs font-semibold text-gray-500'>Format: bunch</span>
							<span class='text-xs text-gray-400 leading-relaxed'>
								7 days × <span class='font-mono'>HHMMHHMm</span> — 56 chars, no separators. Disabled days encoded
								as <span class='font-mono'>00000000</span>.
							</span>
						</div>
						<div class='rounded-xl bg-black/5 px-3 py-2'>
							<span class='text-xs text-gray-400 font-medium'>Example: </span>
							<span class='text-xs font-mono text-gray-600 break-all'>
								09001800090018000000000009001800090018000000000000000000
							</span>
						</div>
						<div class='text-xs text-gray-400 leading-relaxed px-1'>
							Mon 09:00–18:00, Tue 09:00–18:00, Wed off, Thu 09:00–18:00, Fri 09:00–18:00, Sat off, Sun off
						</div>
					</Section>
				)}

				<div class='h-px bg-black/5' />

				<Section title='Style'>
					<div class='flex items-center justify-between'>
						<span class='text-sm font-medium text-gray-600'>Liquid Glass</span>
						<Toggle value={s.liquidGlass} onChange={s.setLiquidGlass} />
					</div>
					<Field label='Color scheme'>
						<SegmentedControl
							options={[
								{ label: 'Light', value: 'light' },
								{ label: 'Dark', value: 'dark' },
								{ label: 'Auto', value: 'auto' },
							]}
							value={s.colorScheme}
							onChange={s.setColorScheme}
						/>
					</Field>
					<div class='flex items-center justify-between'>
						<div class='flex flex-col gap-0.5'>
							<span class='text-sm font-medium text-gray-600'>Adapt to Telegram theme</span>
							<span class='text-xs text-gray-400'>Colors from Telegram UI variables</span>
						</div>
						<Toggle value={s.adaptTgTheme} onChange={s.setAdaptTgTheme} />
					</div>
					<div class='flex gap-3'>
						<Field label='Accent color'>
							<div class='flex items-center gap-2 rounded-2xl bg-black/5 px-3 py-2'>
								<input
									type='color'
									value={s.accent}
									onInput={(e) => s.setAccent((e.target as HTMLInputElement).value)}
									class='h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0.5'
								/>
								<span class='text-sm font-mono text-gray-600'>{s.accent.toUpperCase()}</span>
							</div>
						</Field>
						{s.liquidGlass && (
							<Field label='Background tint'>
								<div class='flex items-center gap-2 rounded-2xl bg-black/5 px-3 py-2'>
									<input
										type='color'
										value={s.tint}
										onInput={(e) => s.setTint((e.target as HTMLInputElement).value)}
										class='h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0.5'
									/>
									<span class='text-sm font-mono text-gray-600'>{s.tint.toUpperCase()}</span>
								</div>
							</Field>
						)}
					</div>
				</Section>
			</div>

			{/* generated url */}
			<div class='flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm'>
				<span class='text-xs font-semibold uppercase tracking-widest text-gray-400'>Generated link</span>
				<div class='rounded-2xl bg-black/5 px-4 py-3'>
					<p class='break-all text-xs font-mono text-gray-600 leading-relaxed'>{s.generatedUrl}</p>
				</div>
				<div class='flex gap-2'>
					<button
						onClick={openPreview}
						class='flex-1 rounded-2xl border border-black/10 py-3 text-sm font-semibold text-gray-700 hover:bg-black/5 active:scale-95 transition-all'
					>
						Preview
					</button>
					<button
						onClick={copyUrl}
						style={{ backgroundColor: copied ? '#34C759' : ACCENT }}
						class='flex-1 rounded-2xl py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition-all duration-150'
					>
						{copied ? 'Copied!' : 'Copy link'}
					</button>
				</div>
			</div>
		</div>
	)
}
