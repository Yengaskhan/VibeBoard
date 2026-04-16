import Link from 'next/link'
import Image from 'next/image'

export const AppHeader = ({
  title,
  shortDescription,
  user,
  url,
}: {
  title: string
  shortDescription: string
  user: { display_name: string, username: string, avatar_url: string | null }
  url: string
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-lg text-zinc-400">{shortDescription}</p>
      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/user/${user.username}`}
          className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.display_name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-white">
              {user.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          {user.display_name}
        </Link>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Visit App &rarr;
        </a>
      </div>
    </div>
  )
}
