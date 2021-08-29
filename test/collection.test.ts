import { Collection, collectionChange, CollectionChange } from '../src'
import { testItem1, testItem1a, testItem2, TestItem } from './test-item'

describe('collection', () => {
    let collection: Collection<TestItem>
    const changeFn = jest.fn<void, [CollectionChange<TestItem>]>()

    beforeEach(() => {
        collection = new Collection<TestItem>((item) => item.id)
        collection.on('change', changeFn)
    })

    afterEach(() => {
        collection.dispose()
        changeFn.mockReset()
    })

    test('insert', () => {
        collection.insert(testItem1)
        expect(collection.count).toEqual(1)
        expect(collection.includesKey(testItem1.id)).toBeTruthy()
        expect(collection.includes(testItem1)).toBeTruthy()
        expect(collection.items()).toEqual([testItem1])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { '1': testItem1 } }))
    })

    test('insert + insert - same item', () => {
        collection.insert(testItem1)
        changeFn.mockReset()

        collection.insert(testItem1)
        expect(collection.count).toEqual(1)
        expect(collection.includes(testItem1)).toBeTruthy()
        expect(collection.items()).toEqual([testItem1])
        expect(changeFn).not.toHaveBeenCalled()
    })

    test('insert + insert - different item', () => {
        collection.insert(testItem1)
        changeFn.mockReset()

        collection.insert(testItem1a)
        expect(collection.count).toEqual(1)
        expect(collection.includes(testItem1a)).toBeTruthy()
        expect(collection.items()).toEqual([testItem1a])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ updated: { '1': testItem1a } }))
    })

    test('insertItems', () => {
        collection.insert([testItem1, testItem2])
        expect(collection.items()).toEqual([testItem1, testItem2])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ added: { '1': testItem1, '2': testItem2 } }))
    })

    test('removeKey', () => {
        collection.insert([testItem1, testItem2])
        changeFn.mockReset()

        collection.removeKey(testItem1.id)
        expect(collection.items()).toEqual([testItem2])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { '1': testItem1 } }))
    })

    test('removeKey - key does not exist', () => {
        collection.removeKey(testItem1.id)
        expect(changeFn).not.toHaveBeenCalled()
    })

    test('removeKeys', () => {
        collection.insert([testItem1, testItem2])
        changeFn.mockReset()

        collection.removeKeys([testItem1.id, testItem2.id])
        expect(collection.items()).toEqual([])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { '1': testItem1, '2': testItem2 } }))
    })

    test('clear', () => {
        collection.insert([testItem1, testItem2])
        changeFn.mockReset()

        collection.clear()
        expect(collection.items()).toEqual([])
        expect(changeFn).toHaveBeenCalledWith(collectionChange({ removed: { '1': testItem1, '2': testItem2 } }))
    })

    test('items slice', () => {
        collection.insert([testItem1, testItem2])
        expect(collection.items(0, 1)).toEqual([testItem1])
        expect(collection.items(1, 2)).toEqual([testItem2])
    })
})
