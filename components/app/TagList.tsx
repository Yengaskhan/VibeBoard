export const TagList = ({ tags }: { tags: { name: string, slug: string }[] }) => {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.slug}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[12px] font-medium text-white/70 transition-colors hover:border-[#bfff3c]/30 hover:text-[#bfff3c]"
        >
          <span className="h-1 w-1 rounded-full bg-[#bfff3c]/60" />
          {tag.name}
        </span>
      ))}
    </div>
  )
}
