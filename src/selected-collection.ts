import { Collection, ICollection } from './collection'
import { CollectionChange } from './collection-change'

export class SelectedCollection<T> extends Collection<T> {
    constructor(private readonly source: ICollection<T>) {
        super(source.getKey)
        this.handleChange = this.handleChange.bind(this)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        source.addListener('change', this.handleChange)
    }

    public override dispose(): void {
        super.dispose()
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.source.removeListener('change', this.handleChange)
    }

    private handleChange(change: CollectionChange<T>) {
        this.pauseEvents()
        for (const key in change.updated) {
            if (this.includesKey(key)) {
                const item = change.updated[key]
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.insert(item!)
            }
        }
        if (change.removed) this.removeKeys(Object.keys(change.removed))
        this.resumeEvents()
    }

    public selectAll(): void {
        this.insert(this.source.items())
    }
}
