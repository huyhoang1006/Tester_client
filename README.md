# AT Project Phase 2

-   Nodejs [v16](https://nodejs.org/en/download/)
-   Frameword frontend: [Vue2](https://v2.vuejs.org/v2/guide/events.html), [Vue Router](https://router.vuejs.org/guide/essentials/dynamic-matching.html), [Vuex](https://vuex.vuejs.org/guide/state.html)
-   Thư viện UI: [element-ui](https://element.eleme.io/#/en-US/component/form)
-   Thư viện vẽ bảng: [ag-grid](https://www.ag-grid.com/vue-data-grid/data-update/)
-   Thư viện icon: [fontawesome](https://fontawesome.com/search?m=free)

## Cài đặt

```
npm install
npm run postinstall
```

```
#run
npm run electron:serve
```

```
#build
npm run electron:build
```

```
#Clear data db
1.PRAGMA foreign_keys = OFF;
2.SELECT 'DELETE FROM "' || name || '";' 
FROM sqlite_master 
WHERE type='table' 
AND name NOT LIKE 'sqlite_%';
3. PRAGMA foreign_keys = ON;
```
