# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- Vue components: `PascalCase` - `LoginView/index.vue`, `TopBar/index.vue`
- JavaScript modules: `camelCase` - `downloadNode.js`, `fetchChildrenServer.js`
- Index files: `index.js` or `index.vue` for directory entry points
- Mixins: `mixin/index.js` pattern within component directories

**Functions:**
- `camelCase` for all functions: `insertTransformerEntity()`, `getVoltageLevelEntity()`
- Verb-noun pattern: `getXxx()`, `insertXxx()`, `deleteXxx()`, `updateXxx()`
- Async functions marked with `async` keyword

**Variables:**
- `camelCase`: `selectedLocation`, `active`, `customText`
- Boolean prefixes: `isXxx`, `hasXxx`, `canXxx` (e.g., `isActive`)
- Constants: `UPPER_SNAKE_CASE` in rare cases (e.g., `HEAVY_TASK_SAFETY_LIMIT`)

**Types:**
- Vue components: `PascalCase` in `name` property: `name: 'LoginView'`
- Vuex modules: same as file name, use `namespaced: true`

## Code Style

**Formatting:**
- Tool: **Prettier**
- Config file: `.prettierrc`
- Settings:
  ```json
  {
      "printWidth": 160,
      "trailingComma": "none",
      "tabWidth": 4,
      "semi": false,
      "singleQuote": true,
      "bracketSpacing": false,
      "bracketSameLine": true,
      "arrowParens": "always"
  }
  ```

**Linting:**
- Tool: **ESLint** with Vue CLI plugin
- Config file: `.eslintrc.js`
- Extends: `plugin:vue/essential`, `eslint:recommended`
- Key rules:
  - `no-console`: warn in production, off in dev
  - `no-debugger`: warn in production, off in dev
  - `vue/multi-word-component-names`: 0 (allows single-word component names)
- Run with: `npm run lint`

## Import Organization

**Order (typical):**
1. Vue core: `import Vue from 'vue'`, `import VueRouter from 'vue-router'`
2. Third-party: `import ElementUI from 'element-ui'`
3. Path aliases (`@/`): `import store from '@/store'`
4. Relative paths: `import db from '../../datacontext/index.js'`

**Path Aliases:**
- `@` = `src/` (provided by Vue CLI)
- Examples: `@/store`, `@/views/LoginView`, `@/utils/helper`

**Common imports:**
```javascript
import Vue from 'vue'
import { ipcMain } from 'electron'
import store from '@/store'
import router from '@/router'
import ElementUI from 'element-ui'
import client from '@/utils/client'
import { entityFunc } from "@/function"
```

## Error Handling

**IPC Handlers:**
```javascript
ipcMain.handle('channelName', async function (event, data) {
    try {
        const rs = await someAsyncOperation(data)
        if (rs.success == true) {
            return { success: true, message: "Success", data: rs.data }
        } else {
            return { success: false, message: "fail" }
        }
    } catch (error) {
        console.error("Error description:", error)
        return {
            error: error,
            success: false,
            message: (error && error.message) ? error.message : "Internal error"
        }
    }
})
```

**Business Logic Functions:**
```javascript
export const someFunction = async (params) => {
    try {
        // ... logic
        return { success: true, data: result, message: 'Success' }
    } catch (error) {
        console.error('Error description:', error)
        return { success: false, error, message: 'Error description' }
    }
}
```

**Vue Components:**
- Use `.catch()` on promises
- Use Element UI `$message` for user feedback
- Example: `this.$message.error('Login failed')`

## Logging

**Framework:** `console` (browser console)

**Patterns:**
- `console.log`: General info, flow markers
- `console.error`: Errors with context
- `console.warn`: Warnings (e.g., duplicate operations)
- Examples from codebase:
  ```javascript
  console.error('Error retrieving voltage entity:', error)
  console.log('Starting delete VoltageLevel:', data.mrid)
  console.warn('Loading already active, ignoring new start request')
  ```

**Production:** ESLint allows console in dev mode, warns in production

## Comments

**When to Comment:**
- JSDoc for exported functions with parameters/return description
- Inline comments for complex business logic
- Vietnamese comments present in some legacy code (e.g., "// Bước 1: Xóa các Bay con")

**JSDoc/TSDoc:**
- Usage: Present for key functions
- Example:
  ```javascript
  /**
   * Insert VoltageLevel Entity vào database
   */
  export const insertVoltageLevelEntity = async (entity) => { ... }
  ```

## Function Design

**Size:** No strict limit, but complex functions split into helpers

**Parameters:**
- Named parameters via destructuring in Vuex actions
- Multiple params handled with objects in IPC handlers

**Return Values:**
- Always return object: `{ success: boolean, message: string, data?: any, error?: Error }`
- Promise-wrapped for async operations

## Module Design

**Exports:**
- Named exports for most modules: `export const functionName = ...`
- Default export for Vue components and store modules

**Barrel Files:**
- `index.js` in directories serves as entry point
- Examples: `src/views/LoginView/index.vue`, `src/store/modules/loading.js`

## Vue Component Structure

**Template:**
- Root element with bindings
- Element UI components heavily used

**Script:**
- `data()` returns reactive state
- `methods`: async for API calls
- `computed`: for derived state
- `watch`: for route changes
- `components`: local component registration

**Style:**
- `lang="scss"` for scoped styles
- Element UI variables customization

---

*Convention analysis: 2026-03-07*
