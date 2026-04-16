export const TagList = ({ tags }: { tags: { name: string, slug: string }[] }) => {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.slug}
          className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-400"
        >
          {tag.name}
        </span>
      ))}
    </div>
  )
}
