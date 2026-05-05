export type DateKind = 'date' | 'time' | 'datetime'
export type DateMode = 'date' | 'time' | 'datetime' | 'date-range' | 'time-range'
export type DateFormat = 'default' | 'unix-s' | 'unix-ms'
export type DateOrder = 'ymd' | 'dmy' | 'mdy'
export type ColorFormat = 'hex' | 'rgb' | 'hsl'
export type ScheduleFormat = 'bunch'

export type ColorScheme = 'light' | 'dark' | 'auto'

export interface WidgetStyle {
	liquidGlass?: boolean
	accent?: string
	tint?: string
	colorScheme?: ColorScheme
	/** Adapt colors from Telegram UI CSS variables */
	adaptTgTheme?: boolean
}

interface BasePayload {
	bot_username: string
	style?: WidgetStyle
}

export interface DatePayload extends BasePayload {
	widget: 'date'
	mode: DateMode
	format?: DateFormat
	order?: DateOrder
}

export interface ColorPayload extends BasePayload {
	widget: 'color'
	format: ColorFormat
}

export interface SchedulePayload extends BasePayload {
	widget: 'schedule'
	format: ScheduleFormat
}

export type WidgetPayload = DatePayload | ColorPayload | SchedulePayload

export function parsePayload(): WidgetPayload | null {
	try {
		const raw = new URLSearchParams(window.location.search).get('p')
		if (!raw) return null
		const json = atob(raw)
		return JSON.parse(json) as WidgetPayload
	} catch {
		return null
	}
}

export function encodeResult(payload: WidgetPayload, value: string): string {
	return `https://t.me/${payload.bot_username}?start=${value}`
}
