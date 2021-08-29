import EventEmitter from 'events'
import { CollectionChange } from './collection-change'
import { CollectionItemKey } from './collection-item-key'

export declare interface CollectionEmitter<T> {
    on(event: 'change', listener: (changeEvent: CollectionChange<T>) => void): this
}

export class CollectionEmitter<T> extends EventEmitter {
    private event: CollectionChange<T> | undefined
    private timeout: NodeJS.Timeout | undefined
    private _count = 0

    constructor(public debounce?: number) {
        super()
    }

    public dispose(): void {
        this.removeAllListeners()
    }

    public get count(): number {
        return this._count
    }

    protected addEvent(key: CollectionItemKey, item: T): void {
        this._count++

        /* istanbul ignore if */
        if (this.listenerCount('change') === 0) {
            this.event = undefined
            return
        }

        if (!this.event) {
            this.event = {
                addedCount: 0,
                updatedCount: 0,
                removedCount: 0,
            }
        }

        if (this.event.updated?.[key]) {
            throw new Error()
        }

        if (this.event.removed?.[key]) {
            delete this.event.removed[key]
            this.event.removedCount--

            if (!this.event.updated) {
                this.event.updated = {}
            }

            // NO LOGICAL WAY TO EVER GET HERE
            // if (this.event.updated[key]) {
            //     throw new Error()
            // }

            this.event.updatedCount++
            this.event.updated[key] = item
        } else {
            if (!this.event.added) {
                this.event.added = {}
            }

            if (this.event.added[key]) {
                throw new Error()
            }

            this.event.addedCount++

            this.event.added[key] = item
        }

        this.sendEvent()
    }

    protected updateEvent(key: CollectionItemKey, item: T): void {
        /* istanbul ignore if */
        if (this.listenerCount('change') === 0) {
            this.event = undefined
            return
        }

        if (!this.event) {
            this.event = {
                addedCount: 0,
                updatedCount: 0,
                removedCount: 0,
            }
        }

        if (this.event.added?.[key]) {
            this.event.added[key] = item
        } else {
            if (this.event.removed?.[key]) {
                throw new Error()
            }

            if (!this.event.updated) {
                this.event.updated = {}
            }

            if (!this.event.updated[key]) {
                this.event.updatedCount++
            }

            this.event.updated[key] = item
        }

        this.sendEvent()
    }

    protected removeEvent(key: CollectionItemKey, item: T): void {
        this._count--

        /* istanbul ignore if */
        if (this.listenerCount('change') === 0) {
            this.event = undefined
            return
        }

        if (!this.event) {
            this.event = {
                addedCount: 0,
                updatedCount: 0,
                removedCount: 0,
            }
        }

        if (this.event.added?.[key]) {
            delete this.event.added[key]
            this.event.addedCount--
        } else {
            if (this.event.updated?.[key]) {
                delete this.event.updated[key]
                this.event.updatedCount--
            }

            if (!this.event.removed) {
                this.event.removed = {}
            }

            if (this.event.removed[key]) {
                throw new Error()
            }

            this.event.removedCount++
            this.event.removed[key] = item
        }

        this.sendEvent()
    }

    protected orderedEvent(): void {
        /* istanbul ignore if */
        if (this.listenerCount('change') === 0) {
            this.event = undefined
            return
        }

        if (!this.event) {
            this.event = {
                addedCount: 0,
                updatedCount: 0,
                removedCount: 0,
            }
        }

        this.event.ordered = true

        this.sendEvent()
    }

    private eventsPaused = 0

    protected pauseEvents(): void {
        this.eventsPaused++
    }

    protected resumeEvents(): void {
        this.eventsPaused--
        if (this.eventsPaused === 0) {
            this.sendEvent()
        }
    }

    private sendEvent(immediate = false) {
        if (this.eventsPaused) return

        /* istanbul ignore if */
        if (!this.event) return

        if (!this.event.ordered && !this.event.addedCount && !this.event.updatedCount && !this.event.removedCount)
            return

        if (!this.event.addedCount && this.event.added) {
            delete this.event.added
        }

        if (!this.event.updatedCount && this.event.updated) {
            delete this.event.updated
        }

        if (!this.event.removedCount && this.event.removed) {
            delete this.event.removed
        }

        /* istanbul ignore next */
        const hasDebounce = this.debounce && this.debounce > 0

        /* istanbul ignore if */
        if (!immediate && hasDebounce) {
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    this.timeout = undefined
                    this.sendEvent(true)
                }, this.debounce)
            }
        } else {
            const event = this.event
            this.event = undefined
            try {
                this.emit('change', event)
            } catch {
                /* Do nothing */
            }
        }
    }
}
