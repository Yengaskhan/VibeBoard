'use client'

import { useState } from 'react'

const PRESET_TAGS = [
  { name: 'Productivity', slug: 'productivity' },
  { name: 'Game', slug: 'game' },
  { name: 'Developer Tool', slug: 'developer-tool' },
  { name: 'Finance', slug: 'finance' },
  { name: 'Health', slug: 'health' },
  { name: 'Education', slug: 'education' },
  { name: 'Social', slug: 'social' },
  { name: 'AI Tool', slug: 'ai-tool' },
  { name: 'Creative', slug: 'creative' },
  { name: 'Utility', slug: 'utility' },
  { name: 'Analytics', slug: 'analytics' },
  { name: 'Automation', slug: 'automation' },
]

const slugifyTag = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const TagSelect = ({
  selectedTags,
  setSelectedTags,
  customTags,
  setCustomTags,
}: {
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  customTags: { name: string, slug: string }[]
  setCustomTags: (tags: { name: string, slug: string }[]) => void
}) => {
  const [input, setInput] = useState('')
  const allSelected = [...selectedTags]
  const totalCount = allSelected.length

  const toggle = (slug: string) => {
    if (selectedTags.includes(slug)) {
      setSelectedTags(selectedTags.filter((t) => t !== slug))
      setCustomTags(customTags.filter((t) => t.slug !== slug))
    } else if (totalCount < 3) {
      setSelectedTags([...selectedTags, slug])
    }
  }

  const addCustomTag = () => {
    const name = input.trim()
    if (!name || totalCount >= 3) return

    const slug = slugifyTag(name)
    if (!slug) return

    // Check if already selected or is a preset
    if (selectedTags.includes(slug)) {
      setInput('')
      return
    }

    const isPreset = PRESET_TAGS.some((t) => t.slug === slug)
    if (!isPreset) {
      setCustomTags([...customTags, { name, slug }])
    }
    setSelectedTags([...selectedTags, slug])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">
          Tags (max 3)
        </label>
        <span className="text-xs text-zinc-500">{totalCount}/3</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => {
          const selected = selectedTags.includes(tag.slug)
          return (
            <button
              key={tag.slug}
              type="button"
              onClick={() => toggle(tag.slug)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                selected
                  ? 'bg-white text-zinc-950'
                  : 'border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
              } ${!selected && totalCount >= 3 ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {tag.name}
            </button>
          )
        })}
        {customTags.filter((ct) => !PRESET_TAGS.some((p) => p.slug === ct.slug)).map((tag) => (
          <button
            key={tag.slug}
            type="button"
            onClick={() => toggle(tag.slug)}
            className="rounded-full bg-white px-3 py-1 text-sm text-zinc-950 transition-colors"
          >
            {tag.name} &times;
          </button>
        ))}
      </div>
      {totalCount < 3 && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a custom tag..."
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/25"
          />
          <button
            type="button"
            onClick={addCustomTag}
            disabled={!input.trim()}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}
    </div>
  )
}
