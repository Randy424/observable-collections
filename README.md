# Observable Collections

Collections of items that emit change events.

Collections can be hooked together to create a pipeline which efficiently filters, searches, sorts, and pages the source collection based on the emitted change events.

## Collection Types

### Collection(keyFn: KeyFn)

A writeable collection that is used as the source for other collections.

```typescript
const keyFn: KeyFn<T> = (item: T) => item.id
const source = new Collection<T>(keyFn)
source.insert(item)
source.remove(item)
source.clear()
```

### FilteredCollection(source: Collection, filterFn: FilterFn)

Collection that filters a source collection.

```typescript
const filterFn: FilterFn<T> = (item: T) => true
const filtered = new FilteredCollection<ItemT>(source, filterFn)
```

### SearchedCollection(source: Collection, searchFn: SearchFn, search: string)

Collection that searches a source collection.

```typescript
const searchFn: SearchFn<T> = (item: T) => 1
const searched = new SearchedCollection<ItemT>(source, searchFn, "search string")
searched.setSearchFn(searchFn)
searched.setSearch("some search string")
```

### SortedCollection(source: Collection, sortFn: SortFn)

Collection that sorts a source collection.

```typescript
const sortFn: SortFn<T> = (item: T) => 0
const sorted = new SortedCollection<ItemT>(source, sortFn)
sorted.setSortFn(sortFn)
```

### SelectedCollection(source: Collection)

Collection that keeps its items in sync with a source collection.

```typescript
const selected = new SelectedCollection<ItemT>(source, sortFn)
selected.insert(item)
```

### PagedCollection(source: Collection, page:number, pageSize: number)

Collection used to page a source collection.

```typescript
const page = 1
const pageSize = 10
const paged = new PagedCollection(source, page, pageSize)
paged.setPage(page, pageSize)
```

## Code Example

```typescript
interface ItemT {
    id: number
    name: string
}

const keyFn = (item: ItemT) => item.id.toString()
const source = new Collection<ItemT>(keyFn)

const filterFn = (_item: ItemT) => true
const filtered = new FilteredCollection(source, filterFn)

const sortFn = (lhs: ItemT, rhs: ItemT) => lhs.name.localeCompare(rhs.name)
const sorted = new SortedCollection(filtered, sortFn)

const page = 1
const pageSize = 10
const paged = new PagedCollection(sorted, page, pageSize)

const selected = new SelectedCollection(source)

source.insert({ id: 1, name: 'One' })

expect(paged.items()).toEqual([{ id: 1, name: 'One' }])
```

## Events

### Added Event

```js
{
    "addedCount": 1,
    "added": { 1: { "id": 1 }},
}
```

### Updated Event

```js
{
    "updatedCount": 1,
    "updated": { 1: { "id": 1 }},
}
```

### Removed Event

```js
{
    "revmovedCount": 1,
    "removed": { 1: { "id": 1 }},
}
```

### Ordered Event

```js
{
    "ordered": true
}
```
