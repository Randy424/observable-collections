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
source.removeKey(item.id)
source.clear()
```

### FilteredCollection(source: Collection, filterFn: FilterFn)

Collection that filters a source collection.

```typescript
const filtered = new FilteredCollection<ItemT>(source)
const filterFn: FilterFn<T> = (item: T) => true
filtered.setFilterFn(filterFn)
```

### SearchedCollection(source: Collection, searchFn: SearchFn, search: string)

Collection that searches a source collection.

```typescript
const searched = new SearchedCollection<ItemT>(source)
const searchFn: SearchFn<T> = (item: T) => 1
searched.setSearchFn(searchFn)
searched.setSearch("some search string")
```

### SortedCollection(source: Collection, sortFn: SortFn)

Collection that sorts a source collection.

```typescript
const sorted = new SortedCollection<ItemT>(source)
const sortFn: SortFn<T> = (item: T) => 0
sorted.setSortFn(sortFn)
```

### SelectedCollection(source: Collection)

Collection that keeps its items in sync with a source collection.

```typescript
const selected = new SelectedCollection<ItemT>(source)
selected.insert(item)
```

### PagedCollection(source: Collection, page:number, pageSize: number)

Collection used to page a source collection.

```typescript
const paged = new PagedCollection(source)
const page = 1
const pageSize = 10
paged.setPage(page, pageSize)
```

## Code Example

```typescript
interface ItemT {
    id: number
    name: string
}

const keyFn = (item: ItemT) => item.id
const source = new Collection<ItemT>(keyFn)

const filterFn = (_item: ItemT) => true
const filtered = new FilteredCollection(source)
filtered.setFilterFn(filterFn)

const sortFn = (lhs: ItemT, rhs: ItemT) => lhs.name.localeCompare(rhs.name)
const sorted = new SortedCollection(filtered)
sorted.setSortFn(sortFn)

const page = 1
const pageSize = 10
const paged = new PagedCollection(sorted, page, pageSize)

source.insert({ id: 1, name: 'One' })

expect(paged.items()).toEqual([{ id: 1, name: 'One' }])
```

## Events

All collections extend EventEmitter and emit a "change" event when the collection changes.

``` typescript
collection.on("change", (change: CollectionChange<T> => {
    // Handle change
}))
```

### Added Event

Emitted when items are added.

```js
{
    "addedCount": 1,
    "added": { 1: { "id": 1 }},
}
```

### Updated Event

Emitted when items are updated.

```js
{
    "updatedCount": 1,
    "updated": { 1: { "id": 1 }},
}
```

### Removed Event

Emitted when items are removed.

```js
{
    "revmovedCount": 1,
    "removed": { 1: { "id": 1 }},
}
```

### Ordered Event

Emitted when the order of the items has changed. (Only ordered collections like searched, sorted, and paged.)

```js
{
    "ordered": true
}
```
