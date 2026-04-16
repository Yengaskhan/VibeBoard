export const CharCounter = ({ current, max }: { current: number, max: number }) => {
  const isOver = current > max

  return (
    <span className={`text-xs tabular-nums ${isOver ? 'text-red-400' : 'text-zinc-500'}`}>
      {current}/{max}
    </span>
  )
}
