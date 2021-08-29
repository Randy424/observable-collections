import { collectionChange, CollectionChange, CollectionEmitter } from '../src'

class CollectionEmitterTester<T> extends CollectionEmitter<T> {
    public override dispose() {
        super.dispose()
    }

    public override addEvent(key: string, item: T) {
        super.addEvent(key, item)
    }

    public override updateEvent(key: string, item: T) {
        super.updateEvent(key, item)
    }

    public override removeEvent(key: string, item: T) {
        super.removeEvent(key, item)
    }

    public override orderedEvent() {
        super.orderedEvent()
    }

    public override pauseEvents() {
        super.pauseEvents()
    }

    public override resumeEvents() {
        super.resumeEvents()
    }
}

describe('collection-emitter', () => {
    let collectionEmitter: CollectionEmitterTester<number>
    const changeFn = jest.fn<void, [CollectionChange<number>]>()

    beforeEach(() => {
        collectionEmitter = new CollectionEmitterTester<number>()
        collectionEmitter.on('change', changeFn)
    })

    afterEach(() => {
        changeFn.mockReset()
        collectionEmitter.dispose()
    })

    test('add', () => {
        collectionEmitter.addEvent('1', 1)
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { '1': 1 } }))
    })

    test('add + add', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.addEvent('1', 1)
        collectionEmitter.addEvent('2', 2)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { '1': 1, '2': 2 } }))
    })

    test('add + update', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.addEvent('1', 1)
        collectionEmitter.updateEvent('1', 2)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { '1': 2 } }))
    })

    test('add + remove', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.addEvent('1', 1)
        collectionEmitter.removeEvent('1', 1)
        collectionEmitter.resumeEvents()
        expect(changeFn).not.toHaveBeenCalled()
    })

    test('add + update + remove', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.addEvent('1', 1)
        collectionEmitter.updateEvent('2', 2)
        collectionEmitter.removeEvent('1', 1)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { '2': 2 } }))
    })

    test('add + add error', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.addEvent('1', 1)
        expect(() => collectionEmitter.addEvent('1', 1)).toThrowError()
    })

    test('update', () => {
        collectionEmitter.updateEvent('1', 1)
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { '1': 1 } }))
    })

    test('update + update', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.updateEvent('1', 1)
        collectionEmitter.updateEvent('1', 2)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { '1': 2 } }))
    })

    test('update + add', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.updateEvent('1', 1)
        expect(() => collectionEmitter.addEvent('1', 1)).toThrowError()
    })

    test('update + remove', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.updateEvent('1', 1)
        collectionEmitter.removeEvent('1', 2)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { '1': 2 } }))
    })

    test('update + remove + add', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.updateEvent('2', 2)
        collectionEmitter.removeEvent('1', 1)
        collectionEmitter.addEvent('1', 1)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { '1': 1, '2': 2 } }))
    })

    test('remove', () => {
        collectionEmitter.removeEvent('1', 1)
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { '1': 1 } }))
    })

    test('remove + remove', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.removeEvent('1', 1)
        collectionEmitter.removeEvent('2', 2)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { '1': 1, '2': 2 } }))
    })

    test('remove + add', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.removeEvent('1', 1)
        collectionEmitter.addEvent('1', 1)
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { '1': 1 } }))
    })

    test('remove + update', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.removeEvent('1', 1)
        expect(() => collectionEmitter.updateEvent('1', 1)).toThrowError()
    })

    test('remove + remove error', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.removeEvent('1', 1)
        expect(() => collectionEmitter.removeEvent('1', 1)).toThrowError()
    })

    test('orderedEvent', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.orderedEvent()
        collectionEmitter.orderedEvent()
        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ ordered: true }))
    })

    test('pauseEvents', () => {
        collectionEmitter.pauseEvents()
        collectionEmitter.pauseEvents()

        collectionEmitter.orderedEvent()

        collectionEmitter.resumeEvents()
        expect(changeFn).not.toHaveBeenCalled()

        collectionEmitter.resumeEvents()
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ ordered: true }))
    })
})
