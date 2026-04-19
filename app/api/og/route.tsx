import { ImageResponse } from 'next/og'

// Must run on the edge for ImageResponse.
export const runtime = 'edge'

// Fetch the Instrument Serif font at build/request time so we can render with
// our signature display typography. Fallback fonts (Georgia/serif) kick in if
// the fetch fails so OG images still look reasonable.
const fetchSerifFont = async (): Promise<ArrayBuffer | null> => {
  try {
    const res = await fetch(
      'https://fonts.gstatic.com/s/instrumentserif/v1/kJEhBugZ7AAjhybUvR1FTj4gZwT6QJF7.ttf',
      { cache: 'force-cache' }
    )
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'AI-built apps, curated.'
  const description =
    searchParams.get('description') ??
    'A curated showcase of the best vibe-coded projects from indie builders.'
  const tag = searchParams.get('tag') ?? null
  const creator = searchParams.get('creator') ?? null

  const serifFont = await fetchSerifFont()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#08080a',
          padding: '72px',
          position: 'relative',
        }}
      >
        {/* Ambient lime glow */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            left: '15%',
            width: '70%',
            height: '70%',
            background:
              'radial-gradient(ellipse at center, rgba(191, 255, 60, 0.22) 0%, transparent 65%)',
            display: 'flex',
          }}
        />

        {/* Top row: brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#bfff3c',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px -4px rgba(191, 255, 60, 0.5)',
            }}
          >
            <span
              style={{
                fontFamily: 'Instrument Serif, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 38,
                color: '#08080a',
                lineHeight: 1,
              }}
            >
              V
            </span>
          </div>
          <span
            style={{
              fontFamily: 'Instrument Serif, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 34,
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em',
            }}
          >
            VibeBoard
          </span>
        </div>

        {/* Middle: title + description */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            zIndex: 1,
            maxWidth: '1000px',
          }}
        >
          {tag && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#bfff3c',
                fontFamily: 'sans-serif',
                fontSize: 18,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: '#bfff3c',
                  display: 'flex',
                }}
              />
              {tag}
            </div>
          )}

          <div
            style={{
              fontFamily: 'Instrument Serif, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 96,
              color: 'white',
              letterSpacing: '-0.025em',
              lineHeight: 0.98,
              display: 'flex',
            }}
          >
            {title.slice(0, 110)}
          </div>

          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 28,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.35,
              display: 'flex',
            }}
          >
            {description.slice(0, 220)}
          </div>
        </div>

        {/* Bottom row: signature */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '24px',
            zIndex: 1,
            fontFamily: 'sans-serif',
            fontSize: 16,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          <span>vibe-board-sand.vercel.app</span>
          <span style={{ color: 'rgba(191, 255, 60, 0.7)' }}>
            {creator ? `by ${creator}` : 'the curated feed'}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: serifFont
        ? [
            {
              name: 'Instrument Serif',
              data: serifFont,
              style: 'italic',
              weight: 400,
            },
          ]
        : [],
    }
  )
}
