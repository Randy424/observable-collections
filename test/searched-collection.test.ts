import { Collection, collectionChange, CollectionChange, SearchedCollection, SearchFn } from '../src'
import { TestItem, testItem1, testItem1a, testItem2 } from './test-item'

describe('searched collection', () => {
    test('searched', () => {
        const source = new Collection<TestItem>((item) => item.id)
        const searched = new SearchedCollection(source)

        source.insert([testItem1, testItem2])
        expect(searched.count).toEqual(2)
        expect(searched.items()).toEqual([testItem1, testItem2])

        const searchFn: SearchFn<TestItem> = (item, search) => {
            if (item.name === search) return 0
            if (item.name.startsWith(search)) return 0.5
            return 1
        }
        searched.setSearchFn(searchFn)
        searched.setSearchFn(searchFn)
        searched.setSearch(testItem1.name)
        searched.setSearch(testItem1.name)
        expect(searched.count).toEqual(2)
        expect(searched.items()).toEqual([testItem1, testItem2])

        const searchFnReverse: SearchFn<TestItem> = (item, search) => 1 - searchFn(item, search)
        searched.setSearchFn(searchFnReverse)
        expect(searched.items()).toEqual([testItem2, testItem1])

        source.insert(testItem1a)

        searched.setSearchFn(searchFn)
        searched.setSearch(testItem2.name)
        expect(searched.items()).toEqual([testItem2, testItem1a])

        searched.setSearchFn()
        expect(searched.items()).toEqual([testItem1a, testItem2])

        searched.dispose()
    })

    test('passthough', () => {
        const source = new Collection<TestItem>((item) => item.id)
        const searched = new SearchedCollection(source)
        expect(searched.count).toEqual(0)

        const changeFn = jest.fn<void, [CollectionChange<TestItem>]>()
        searched.on('change', changeFn)

        source.insert(testItem1)
        expect(changeFn).toBeCalledWith(collectionChange({ added: { [testItem1.id]: testItem1 }, ordered: true }))
        changeFn.mockReset()

        source.insert(testItem1a)
        expect(changeFn).toBeCalledWith(collectionChange({ updated: { [testItem1a.id]: testItem1a }, ordered: true }))
        changeFn.mockReset()

        source.removeKey(testItem1a.id)
        expect(changeFn).toBeCalledWith(collectionChange({ removed: { [testItem1a.id]: testItem1a }, ordered: true }))
        changeFn.mockReset()
    })
})
