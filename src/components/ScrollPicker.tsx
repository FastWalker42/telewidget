import { useEffect, useRef } from 'preact/hooks'
import { hapticSelection } from '../lib/tma'
import type { Theme } from '../lib/style'

interface Props {
	items: string[]
	value: string
	onChange: (value: string) => void
	width?: string
	theme?: Theme
}

const ITEM_HEIGHT = 52
const VISIBLE = 5
const PADDING = Math.floor(VISIBLE / 2)
// Max rotation angle for items at the edge (slots away from center)
const MAX_ANGLE = 40

export function ScrollPicker({ items, value, onChange, width = '80px', theme }: Props) {
	const listRef = useRef<HTMLUListElement>(null)
	const selectedIndex = items.indexOf(value)
	const lastEmitted = useRef(selectedIndex)
	const dragRef = useRef<{ y: number; scrollTop: number } | null>(null)
	const rafRef = useRef<number>(0)

	// Apply 3D transform to each <li> based on its distance from center
	function applyTransforms() {
		const el = listRef.current
		if (!el) return
		const centerY = el.scrollTop + PADDING * ITEM_HEIGHT
		const lis = el.querySelectorAll<HTMLLIElement>('li')
		lis.forEach((li, i) => {
			const itemCenterY = i * ITEM_HEIGHT + ITEM_HEIGHT / 2
			// t: -1 at top edge, 0 at center, +1 at bottom edge
			const t = (itemCenterY - centerY) / (PADDING * ITEM_HEIGHT)
			const clamped = Math.max(-1, Math.min(1, t))
			const angle = clamped * MAX_ANGLE
			const scale = 1 - Math.abs(clamped) * 0.25
			const opacity = 1 - Math.abs(clamped) * 0.6
			li.style.transform = `perspective(200px) rotateX(${angle}deg) scale(${scale})`
			li.style.opacity = String(Math.max(0.15, opacity))
		})
	}

	// Sync scroll + transforms when value changes externally
	useEffect(() => {
		const el = listRef.current
		if (!el || dragRef.current) return
		const target = selectedIndex * ITEM_HEIGHT
		if (Math.abs(el.scrollTop - target) > 1) {
			el.scrollTop = target
		}
		applyTransforms()
	}, [selectedIndex])

	// Initial render
	useEffect(() => {
		applyTransforms()
	}, [])

	function scheduleTransform() {
		cancelAnimationFrame(rafRef.current)
		rafRef.current = requestAnimationFrame(applyTransforms)
	}

	function snapTo(idx: number) {
		const el = listRef.current
		if (!el) return
		const clamped = Math.max(0, Math.min(idx, items.length - 1))
		el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' })
		if (clamped !== lastEmitted.current) {
			lastEmitted.current = clamped
			hapticSelection()
			onChange(items[clamped]!)
		}
	}

	function nearestIndex() {
		const el = listRef.current
		if (!el) return 0
		return Math.round(el.scrollTop / ITEM_HEIGHT)
	}

	function onPointerDown(e: PointerEvent) {
		const el = listRef.current
		if (!el) return
		dragRef.current = { y: e.clientY, scrollTop: el.scrollTop }
		;(e.currentTarget as Element).setPointerCapture(e.pointerId)
		e.preventDefault()
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragRef.current) return
		const el = listRef.current
		if (!el) return
		el.scrollTop = dragRef.current.scrollTop + (dragRef.current.y - e.clientY)
		scheduleTransform()

		const idx = nearestIndex()
		const clamped = Math.max(0, Math.min(idx, items.length - 1))
		if (clamped !== lastEmitted.current) {
			lastEmitted.current = clamped
			hapticSelection()
			onChange(items[clamped]!)
		}
		e.preventDefault()
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragRef.current) return
		dragRef.current = null
		snapTo(nearestIndex())
		e.preventDefault()
	}

	const padded = [...Array(PADDING).fill(''), ...items, ...Array(PADDING).fill('')]

	return (
		<div
			style={{ width, height: `${ITEM_HEIGHT * VISIBLE}px`, perspective: '200px' }}
			class='relative select-none overflow-hidden'
		>
			{/* selection highlight */}
			<div
				class='pointer-events-none absolute inset-x-0 z-10 rounded-xl'
				style={{
					top: `${PADDING * ITEM_HEIGHT}px`,
					height: `${ITEM_HEIGHT}px`,
					backgroundColor: theme?.surface ?? 'rgba(0,0,0,0.06)',
				}}
			/>
			{/* top fade */}
			<div
				class='pointer-events-none absolute inset-x-0 top-0 z-10 h-16'
				style={{ background: `linear-gradient(to bottom, ${theme?.fade ?? '#F2F2F7'}, transparent)` }}
			/>
			{/* bottom fade */}
			<div
				class='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16'
				style={{ background: `linear-gradient(to top, ${theme?.fade ?? '#F2F2F7'}, transparent)` }}
			/>

			<ul
				ref={listRef}
				class='absolute inset-0 overflow-y-scroll'
				style={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					WebkitOverflowScrolling: 'touch',
					touchAction: 'none',
					transformStyle: 'preserve-3d',
				}}
				onScroll={scheduleTransform}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
			>
				{padded.map((item, i) => (
					<li
						key={i}
						style={{
							height: `${ITEM_HEIGHT}px`,
							color: item === value ? (theme?.text ?? '#111111') : (theme?.textMuted ?? '#8E8E93'),
							willChange: 'transform, opacity',
						}}
						class={[
							'flex items-center justify-center text-2xl font-medium',
							!item ? 'pointer-events-none' : '',
						].join(' ')}
					>
						{item}
					</li>
				))}
			</ul>
		</div>
	)
}
