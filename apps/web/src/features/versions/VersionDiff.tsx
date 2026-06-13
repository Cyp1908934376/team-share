import { cn } from '@/utils/cn'

interface Change {
  path: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
}

interface DiffSummary {
  added: number
  removed: number
  modified: number
  total: number
}

interface VersionDiffProps {
  from: { id: string; version: string; createdAt: Date }
  to: { id: string; version: string; createdAt: Date }
  changes: Change[]
  summary: DiffSummary
}

export function VersionDiff({ from, to, changes, summary }: VersionDiffProps) {
  if (changes.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-label-secondary text-callout">两个版本内容相同，无差异</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-fill-quaternary">
        <span className="text-footnote text-label-secondary">
          {from.version} → {to.version}
        </span>
        <span className="flex items-center gap-1 text-footnote text-system-green">
          +{summary.added}
        </span>
        <span className="flex items-center gap-1 text-footnote text-system-red">
          -{summary.removed}
        </span>
        <span className="flex items-center gap-1 text-footnote text-system-orange">
          ~{summary.modified}
        </span>
        <span className="ml-auto text-footnote text-label-tertiary">
          {summary.total} 处变更
        </span>
      </div>

      {/* Changes list */}
      <div className="space-y-1">
        {changes.map((change, index) => (
          <div
            key={index}
            className={cn(
              'p-3 rounded-lg border border-separator',
              change.type === 'added' && 'bg-system-green/5 border-system-green/20',
              change.type === 'removed' && 'bg-system-red/5 border-system-red/20',
              change.type === 'modified' && 'bg-system-orange/5 border-system-orange/20',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'text-caption-1 px-2 py-0.5 rounded font-medium',
                  change.type === 'added' && 'bg-system-green/10 text-system-green',
                  change.type === 'removed' && 'bg-system-red/10 text-system-red',
                  change.type === 'modified' && 'bg-system-orange/10 text-system-orange',
                )}
              >
                {change.type === 'added' ? '新增' : change.type === 'removed' ? '删除' : '修改'}
              </span>
              <span className="text-callout font-medium text-label-primary">{change.path}</span>
            </div>

            {change.type === 'modified' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-system-red/5 rounded p-2 border border-system-red/10">
                  <p className="text-caption-2 text-label-tertiary mb-1">旧值</p>
                  <pre className="text-footnote text-label-primary whitespace-pre-wrap break-all font-mono">
                    {typeof change.oldValue === 'string'
                      ? change.oldValue
                      : JSON.stringify(change.oldValue, null, 2)}
                  </pre>
                </div>
                <div className="bg-system-green/5 rounded p-2 border border-system-green/10">
                  <p className="text-caption-2 text-label-tertiary mb-1">新值</p>
                  <pre className="text-footnote text-label-primary whitespace-pre-wrap break-all font-mono">
                    {typeof change.newValue === 'string'
                      ? change.newValue
                      : JSON.stringify(change.newValue, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {change.type === 'added' && (
              <pre className="text-footnote text-label-primary whitespace-pre-wrap break-all font-mono bg-fill-quaternary rounded p-2">
                {typeof change.newValue === 'string'
                  ? change.newValue
                  : JSON.stringify(change.newValue, null, 2)}
              </pre>
            )}

            {change.type === 'removed' && (
              <pre className="text-footnote text-label-tertiary whitespace-pre-wrap break-all font-mono bg-fill-quaternary rounded p-2 line-through">
                {typeof change.oldValue === 'string'
                  ? change.oldValue
                  : JSON.stringify(change.oldValue, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
