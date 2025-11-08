<!--
═══════════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT
═══════════════════════════════════════════════════════════════════════════════

Version Change: 0.0.0 → 1.0.0
Bump Rationale: Initial constitution creation for NCN Books project (MAJOR version)

═══════════════════════════════════════════════════════════════════════════════
ADDED SECTIONS
═══════════════════════════════════════════════════════════════════════════════

Core Principles (5 principles):
  I.   User-Centered Design
  II.  Data Integrity First
  III. Incremental Progress
  IV.  Simplicity & Clarity
  V.   Quality Through Testing

Development Standards:
  - Code Quality Requirements
  - Architecture Guidelines
  - When Stuck (Maximum 3 Attempts Rule)

Quality & Delivery Standards:
  - Definition of Done
  - Pre-Commit Checklist
  - Prohibited Actions

Governance:
  - Amendment Process
  - Versioning Policy
  - Compliance & Review
  - Related Guidance

═══════════════════════════════════════════════════════════════════════════════
PRINCIPLE DETAILS
═══════════════════════════════════════════════════════════════════════════════

1. User-Centered Design
   Focus: Simplicity, accessibility, and user needs over technical cleverness
   Key Rule: WCAG 2.1 AA minimum for all user-facing features

2. Data Integrity First
   Focus: Ensure book data and user progress are reliable and consistent
   Key Rule: All data mutations must be validated; recovery mechanisms required

3. Incremental Progress
   Focus: Small, working increments over big-bang releases
   Key Rule: All commits must compile and pass tests; 1-2 day merge window

4. Simplicity & Clarity
   Focus: Choose boring, obvious solutions over clever complexity
   Key Rule: Complexity must be justified in Complexity Tracking table

5. Quality Through Testing
   Focus: Tests encouraged for critical paths and data operations
   Key Rule: Core data operations and critical user journeys SHOULD have tests

═══════════════════════════════════════════════════════════════════════════════
TEMPLATE CONSISTENCY VALIDATION
═══════════════════════════════════════════════════════════════════════════════

✅ .specify/templates/plan-template.md
   Status: UPDATED
   Changes: Added Constitution Check section with 5 principle checkboxes
   Reference: Lines 30-42

✅ .specify/templates/spec-template.md
   Status: CONSISTENT (no changes needed)
   Alignment: User scenarios and acceptance criteria structure naturally
              enforces User-Centered Design principle

✅ .specify/templates/tasks-template.md
   Status: CONSISTENT (no changes needed)
   Alignment: User story-based phases and incremental delivery enforce
              Incremental Progress principle; independent testing supports
              Quality Through Testing principle

✅ .claude/commands/*.md
   Status: CONSISTENT (no changes needed)
   Verification: No outdated agent-specific references found

═══════════════════════════════════════════════════════════════════════════════
FOLLOW-UP ITEMS
═══════════════════════════════════════════════════════════════════════════════

None - All placeholders filled, all templates validated and updated.

Constitution is ready for use with /speckit.specify, /speckit.plan, and
/speckit.tasks commands.

═══════════════════════════════════════════════════════════════════════════════
-->

# NCN Books Constitution

## Core Principles

### I. User-Centered Design

Every feature starts with the user's needs. Design decisions prioritize simplicity, accessibility, and solving real user problems over technical cleverness.

**Non-negotiable rules**:
- User interfaces MUST be intuitive without requiring documentation for basic tasks
- Features MUST solve a clear user problem; "organizational convenience" is not sufficient justification
- User feedback and usability testing MUST inform design decisions
- Accessibility standards (WCAG 2.1 AA minimum) MUST be met for all user-facing features

**Rationale**: As a book tracking application competing with established platforms like GoodReads, user experience is our primary differentiator. Users will abandon the app if it's confusing or difficult to use.

### II. Data Integrity First

User data—especially reading progress, book collections, and personal notes—is sacred. The system MUST ensure data reliability, consistency, and recoverability.

**Non-negotiable rules**:
- All data mutations MUST be validated before persistence
- User data MUST be recoverable in case of system failure
- Data migrations MUST be tested and reversible
- Book metadata MUST maintain referential integrity
- User actions that could result in data loss MUST require explicit confirmation

**Rationale**: Users invest significant time building their reading lists, progress tracking, and reviews. Data loss or corruption would destroy user trust and make the application worthless.

### III. Incremental Progress

Development proceeds in small, working increments that compile, pass tests, and deliver value. Big-bang releases and long-lived feature branches are prohibited.

**Non-negotiable rules**:
- Every commit MUST compile successfully and pass all existing tests
- Features MUST be broken into stages with independent deliverables (see CLAUDE.md Implementation Plan guidelines)
- Changes MUST be mergeable within 1-2 days of starting work
- Feature flags MUST be used for incomplete features that would break user experience
- Work that cannot be completed in small increments MUST be rejected or redesigned

**Rationale**: Small increments reduce risk, enable faster feedback, and ensure the codebase is always in a releasable state. This aligns with the CLAUDE.md philosophy and enables rapid iteration based on user feedback.

### IV. Simplicity & Clarity

Code, architecture, and features MUST be obvious and boring. Clever solutions, premature abstractions, and over-engineering are code smells requiring justification.

**Non-negotiable rules**:
- Functions and classes MUST have single, clear responsibilities
- Code that requires explanation is too complex and MUST be simplified
- The boring solution MUST be chosen unless complexity is justified (see Complexity Tracking in plan template)
- Abstractions MUST solve proven, repeated problems—not anticipated future needs
- Code MUST be self-documenting through clear naming; comments explain "why" not "what"

**Rationale**: Simple code is maintainable code. As a small project, NCN Books cannot afford technical debt from clever solutions that future maintainers cannot understand or modify safely.

### V. Quality Through Testing

Testing is encouraged for critical user journeys and data operations. While not strictly mandatory, tests provide safety nets for refactoring and confidence in releases.

**Non-negotiable rules**:
- Core data operations (save, update, delete books/progress) SHOULD have tests
- Critical user journeys (add book, update reading progress, view library) SHOULD have integration tests
- Bug fixes SHOULD include regression tests to prevent recurrence
- All tests MUST pass before merging to main branch
- Tests MUST NOT be disabled or skipped to "fix" build failures; if tests fail, fix the code or fix the test

**Rationale**: While strict TDD is not required for this project (per user preference for "test-recommended"), testing critical paths ensures data integrity and user experience remain reliable as the codebase evolves.

## Development Standards

### Code Quality Requirements

- **Formatting & Linting**: All code MUST pass configured formatters and linters before commit
- **Commit Messages**: MUST explain "why" the change was made, not just "what" changed
- **Self-Review**: Developer MUST review their own changes before requesting review from others
- **No Silent Failures**: Errors MUST fail fast with descriptive messages including context for debugging
- **Error Handling**: Handle errors at the appropriate level; never silently swallow exceptions

### Architecture Guidelines

- **Composition over Inheritance**: Use dependency injection and composition patterns
- **Explicit Dependencies**: Data flow and dependencies MUST be clear and explicit
- **No Singletons**: Use interfaces and dependency injection to enable testing and flexibility
- **Study Before Building**: Learn from existing codebase patterns before implementing new features

### When Stuck (Maximum 3 Attempts Rule)

After 3 failed attempts at solving a problem, STOP and:

1. Document what failed (attempts, error messages, hypotheses)
2. Research 2-3 alternative approaches from similar implementations
3. Question fundamentals: Is this the right abstraction? Can this be simpler?
4. Try a different angle: Different library/pattern? Remove abstraction instead of adding?

**Rationale**: This prevents wasted time spinning on unsolvable approaches and encourages stepping back to find simpler solutions (per CLAUDE.md stuck protocol).

## Quality & Delivery Standards

### Definition of Done

Every task is considered complete when:

- [ ] Code compiles successfully
- [ ] All existing tests pass
- [ ] Tests added for new critical functionality (if applicable)
- [ ] Code follows project formatting/linting conventions
- [ ] Commit messages are clear and explain intent
- [ ] Implementation matches the plan (if formal plan exists)
- [ ] No TODOs without linked issue numbers

### Pre-Commit Checklist

Before every commit:

1. Run formatters/linters
2. Run tests (at minimum, affected tests)
3. Self-review changes in diff
4. Verify commit message clarity

### Prohibited Actions

**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable or skip tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions without verifying against existing code
- Use clever tricks when boring solutions exist

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you progress (when using SpecKit workflows)
- Learn from existing implementations before creating new patterns
- Stop after 3 failed attempts and reassess approach

## Governance

### Amendment Process

1. **Proposal**: Amendments MUST be documented with rationale and impact analysis
2. **Approval**: Changes require project owner approval (or team consensus if applicable)
3. **Migration Plan**: Breaking changes MUST include migration path for existing code
4. **Version Update**: Constitution version MUST be updated per semantic versioning rules

### Versioning Policy

- **MAJOR (X.0.0)**: Backward-incompatible governance changes, principle removals, or redefinitions
- **MINOR (0.X.0)**: New principles added or existing principles materially expanded
- **PATCH (0.0.X)**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance & Review

- All design documents (specs, plans, tasks) MUST include Constitution Check section referencing applicable principles
- Code reviews MUST verify compliance with principles, especially User-Centered Design, Data Integrity, and Simplicity
- Complexity MUST be justified in the Complexity Tracking table when principles are violated
- SpecKit templates and commands MUST remain consistent with this constitution

### Related Guidance

For detailed runtime development guidance, see `.claude/CLAUDE.md` (global development guidelines).

---

**Version**: 1.0.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-08
