# Interface Contract: [Interface Name]

> Use one file per major interface (e.g. API surface, event, or file format) between modules.

## 1. Overview

- **Interface type**: (API / event / file / message queue / …)
- **Owner module**: (Module that provides this interface.)
- **Consumers**: (Modules or systems that use it.)

## 2. Contract

### Request / Input

| Field / parameter | Type | Required | Description |
|-------------------|------|----------|-------------|
| (name)            | (type)| yes/no  | (description) |
| …                 | …    | …        | … |

### Response / Output

| Field / outcome | Type | Description |
|-----------------|------|-------------|
| (success case)  | (type)| (description) |
| …               | …    | … |

### Errors

| Code / type | When | Consumer action |
|-------------|------|-----------------|
| (e.g. 404, ValidationError) | (condition) | (what consumer should do) |
| … | … | … |

## 3. Side effects

- (What happens when this interface is called: DB write, event publish, etc.)

## 4. Versioning / compatibility

- (How changes are introduced; backward compatibility expectations.)

---

*Keep contracts stable; change via versioning or new endpoints/events.*
