---
name: 'opsx-spec-patch'
description: 'OpenSpec Inline Spec Patch — apply ad-hoc fixes directly to main specs'
category: Workflow
tags: [workflow, openspec, spec-patch]
---

## Input Format

```
/opsx-spec-patch [component/spec-path]
```

- **component/spec-path**: if omitted, the relevant spec is inferred from conversation context

## Paths

`$OPENSPEC = ./openspec` (relative to project root)

## Eligibility Criteria (all 3 must be met)

1. **Already implemented** — code is written and tests pass
2. **Fits within existing spec scope or can be added** — a section addition to an existing component spec is sufficient, or if no related spec exists, add a new Requirement to the closest component. If an entirely new component is needed, create a new spec file.
3. **Single concern** — expressible as a single Requirement/Rule unit

> If a new component is needed, use a formal change workflow instead of this command.

## Workflow

### Step 1: Identify patch target

Identify what should be reflected in the spec from conversation context:

- What architectural rules/constraints were discovered?
- What behavior was added or changed?
- What scenarios are now newly covered?

### Step 2: Find related main spec

```
Examine the directory structure under $OPENSPEC/specs/
and find the component spec.md most relevant to the patch target.
```

- If a component is specified as an argument, read `$OPENSPEC/specs/{component}/spec.md` directly.
- If not specified, list the contents under `$OPENSPEC/specs/` and confirm with the user.
- **If no related spec exists**: ask the user whether to add a Requirement to the closest existing component or create a new component spec. If creating a new one, generate `$OPENSPEC/specs/{new-component}/spec.md` with a Purpose section.

### Step 3: Draft the patch

Write the content to add, following the existing spec format. Must include the following elements:

```markdown
### Requirement: {title}

{one-line description}

#### Scenario: {scenario name}

- **GIVEN** {precondition}
- **WHEN** {trigger}
- **THEN** {expected result}

#### Rule: {rule name} (optional)

- {rule content}
- **Rationale**: {why this rule is needed}
```

### Step 4: User confirmation

Present the patch draft to the user for approval:

- Insertion point (which spec file, where in the file)
- Patch content
- Incorporate any revision requests

### Step 5: Apply

Apply the approved content to the spec file.

## Guidelines

- **Rules must include a rationale** — especially when defining "must not" constraints, document why it's prohibited so future decisions have a basis.
- **Commit code and spec together** — committing specs separately breaks the code-spec linkage in history.
- **If it spans multiple components, open a formal change** — inline patches are limited to single spec file modifications only.
