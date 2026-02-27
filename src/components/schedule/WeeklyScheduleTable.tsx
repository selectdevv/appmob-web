import { useMemo, useState } from 'react'

const DAY_LABELS = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00`

const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)

interface WeeklyScheduleTableProps {
  checkedSlots?: Record<string, boolean>
  onCheckedSlotsChange?: (slots: Record<string, boolean>) => void
}

const WeeklyScheduleTable = ({ checkedSlots, onCheckedSlotsChange }: WeeklyScheduleTableProps) => {
  const [weekOffset, setWeekOffset] = useState(0)
  const [internalCheckedSlots, setInternalCheckedSlots] = useState<Record<string, boolean>>({})

  const slots = checkedSlots ?? internalCheckedSlots

  const weekStart = useMemo(() => {
    const currentWeekStart = getStartOfWeek(new Date())
    return addDays(currentWeekStart, weekOffset * 7)
  }, [weekOffset])

  const weekDays = useMemo(
    () => DAY_LABELS.map((label, index) => ({ label, date: addDays(weekStart, index), dayIndex: index })),
    [weekStart],
  )

  const weekRange = `${formatDateLabel(weekDays[0].date)} - ${formatDateLabel(weekDays[6].date)}`

  const getSlotKey = (dayIndex: number, hour: number) => {
    const weekKey = weekStart.toISOString().slice(0, 10)
    return `${weekKey}-${dayIndex}-${hour}`
  }

  const isChecked = (dayIndex: number, hour: number) => Boolean(slots[getSlotKey(dayIndex, hour)])

  const toggleSlot = (dayIndex: number, hour: number) => {
    const key = getSlotKey(dayIndex, hour)
    const next = { ...slots, [key]: !slots[key] }
    if (!next[key]) {
      delete next[key]
    }

    if (onCheckedSlotsChange) {
      onCheckedSlotsChange(next)
      return
    }

    setInternalCheckedSlots(next)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-gray-700">Semana: {weekRange}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Semana anterior
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Semana atual
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Proxima semana
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] border-collapse text-center text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="border border-gray-300 px-3 py-2 text-left">Horario</th>
              {weekDays.map((day) => (
                <th key={day.dayIndex} className="border border-gray-300 px-3 py-2">
                  <div className="font-bold text-blue-700">{day.label}</div>
                  <div className="text-xs font-medium text-gray-500">{formatDateLabel(day.date)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="border border-gray-300 px-3 py-2 text-left font-semibold text-blue-700">
                  {formatHourLabel(hour)}
                </td>
                {weekDays.map((day) => (
                  <td key={`${day.dayIndex}-${hour}`} className="border border-gray-300 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isChecked(day.dayIndex, hour)}
                      onChange={() => toggleSlot(day.dayIndex, hour)}
                      className="h-4 w-4 cursor-pointer accent-emerald-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WeeklyScheduleTable
