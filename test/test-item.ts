export interface TestItem {
    id: number
    name: string
}

export const testItem1: TestItem = {
    id: 1,
    name: '1',
}

export const testItem1a: TestItem = {
    id: testItem1.id,
    name: testItem1.name + 'a',
}

export const testItem2: TestItem = {
    id: 2,
    name: '2',
}

export function getTestItemKey(item: TestItem): number {
    return item.id
}
