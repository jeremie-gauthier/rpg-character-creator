

## RPG Actor Builder

A single-page client-side app to create, edit, export, and import RPG actor definitions as JSON.

### Layout
- Clean form-based UI with sections for actor properties and skills
- Top bar with app title, "Export JSON" and "Load JSON" buttons

### Actor Basic Info Section
- Text inputs for **Race**, **Job**, **Sprite Sheet** path
- Number inputs for **Health Points Max** (min 1) and **Action Points Max** (min 0)

### Skills Section
- List of collapsible skill cards, each showing skill name
- "Add Skill" button at the bottom
- Each skill card contains:
  - Text inputs for **ID**, **Name**, **Icon** path
  - **Requirements** sub-section with add/remove buttons. Dropdown to pick type:
    - `resource_cost`: dropdown for resource (ACTION_POINTS, HEALTH_POINTS, CORRUPTION_POINTS) + amount input
    - `sanity_form`: dropdown for expectedForm (PURE, CORRUPTED)
  - **Constraints** sub-section with add/remove buttons. Dropdown to pick type:
    - `range`: minRange + maxRange number inputs
    - `cast`: isInLine checkbox
    - `line_of_sight`: hasLineOfSight checkbox
  - **Side Effects** sub-section with add/remove buttons. Dropdown to pick type:
    - `damage-target`: damageMin, damageMax inputs, optional loop checkbox, optional animation frames list (each with columnIdx, frameDurationMs, optional frameEvents with audio dropdown)
    - `charge-target`: no extra fields
  - Delete skill button

### Export / Import
- **Export**: generates and downloads the actor as a `.json` file
- **Load**: file input that reads a `.json` file and populates all form fields
- Validation before export (required fields, min values)

### Tech
- All in React with existing shadcn/ui components (Card, Input, Select, Button, Accordion, Checkbox)
- State managed with React useState
- No backend needed

