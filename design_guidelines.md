# Design Guidelines: Multi-LLM Prompt Builder & Offer Creator

## Design Approach

**Selected Approach:** Design System-Inspired (Linear + Notion Hybrid)
**Justification:** This is a utility-focused, information-dense productivity tool requiring clarity, efficiency, and professional polish. The application prioritizes functionality over aesthetic flourish, with complex data comparison and form-heavy interactions.

**Key Design Principles:**
- Information clarity above visual decoration
- Scannable layouts with strong hierarchy
- Purposeful whitespace for cognitive breathing room
- Consistent patterns that aid muscle memory
- Progressive disclosure for complex features

---

## Typography System

**Font Families:**
- Primary: Inter (body text, forms, UI elements)
- Monospace: JetBrains Mono (code snippets, technical outputs, LLM responses)

**Type Scale:**
- Hero/Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Subsection Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Helper Text/Labels: text-sm (14px)
- Captions/Metadata: text-xs (12px)

**Line Height:**
- Headings: leading-tight
- Body: leading-relaxed
- Forms: leading-normal

---

## Layout System & Spacing

**Spacing Primitives:**
Consistent use of Tailwind units: **2, 4, 8, 12, 16, 24**
- Micro spacing (component internals): p-2, gap-2
- Standard spacing (between elements): p-4, gap-4, mb-4
- Section spacing: p-8, gap-8, mb-8
- Large separations: p-12, mb-12
- Page-level margins: p-16 or p-24

**Container Strategy:**
- Maximum content width: max-w-7xl (1280px)
- Form containers: max-w-4xl (896px)
- Comparison panels: Full width with internal max-w-7xl
- Sidebar navigation: Fixed w-64 (256px)

**Grid System:**
- Main layout: Two-column split for comparison views (grid-cols-2 gap-8)
- Three-column for multi-LLM output (grid-cols-3 gap-6)
- Forms: Single column max-w-2xl for optimal readability
- Template library: Grid of 2-3 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with height h-16
- Logo/brand left-aligned
- Primary navigation center-aligned (Prompt Builder | Offer Creator | Templates | History)
- User profile/settings right-aligned
- Bottom border separator
- Sticky positioning (sticky top-0)

**Secondary Navigation (Tabs):**
- Horizontal tabs for switching between LLM outputs
- Subtle bottom border on active tab
- Padding: px-4 py-3
- Text: text-sm font-medium

### Core Input Components

**Prompt Builder Form:**
- Vertical layout with generous spacing (space-y-6)
- Label above input pattern
- Team selector: Dropdown with badges (Finance, GTM, Marketing, Sales)
- Cognitive verb selector: Multi-select chips/tags
- Complexity level: Radio button group
- Context input: Expanding textarea (min-h-32)
- Action buttons: Right-aligned, primary button emphasized

**Offer Creator Form:**
- Wizard-style stepped form (5 steps)
- Progress indicator at top
- Each step: Single focus area with max-w-2xl
- Field groups with clear section headers (text-lg font-semibold mb-4)
- Help text below inputs (text-sm text-muted)

### Data Display Components

**LLM Output Comparison Panel:**
- Three-column grid layout
- Each column has header showing LLM name + logo
- Response in monospace font (font-mono text-sm)
- Scrollable containers with max-h-96
- Confidence score badge at bottom of each panel
- Border treatment to separate columns

**Consensus Analysis Card:**
- Elevated card with subtle border
- Icon + title header
- Agreement percentage: Large display text (text-3xl font-bold)
- Visual agreement indicators (checkmarks, highlights)
- Differences section with expandable details

**Cognitive Verb Library:**
- Organized accordion sections by category
- Each verb: Card with hover state
- Verb name (font-semibold) + description (text-sm)
- Complexity badge (Lower-order | Higher-order)
- Quick-add button on hover

**Template Cards:**
- Grid layout with 2-3 columns
- Card structure: Image/icon → Title → Description → Metadata → Action
- Metadata row: Team badge + Usage count
- Hover: Subtle elevation increase

### Interactive Elements

**Buttons:**
- Primary: Larger padding (px-6 py-3), font-medium
- Secondary: Standard padding (px-4 py-2)
- Icon buttons: Square (w-10 h-10) with centered icon
- Button groups: Segmented with no gap, shared borders

**Form Inputs:**
- Height: h-11 for text inputs
- Padding: px-4
- Border radius: rounded-lg
- Focus state: Ring treatment (focus:ring-2)
- Labels: text-sm font-medium mb-2

**Chips/Tags:**
- Small rounded pills (rounded-full px-3 py-1)
- Text: text-xs font-medium
- Removable tags: X icon on right
- Category-specific visual treatment

**Dropdowns/Selects:**
- Custom styled select menus
- Chevron icon indicator
- Menu dropdown: Elevated with shadow
- Options with hover states

### Overlays & Modals

**Comparison Modal:**
- Full-screen overlay for detailed side-by-side view
- Header with close button
- Scrollable content area
- Footer with export actions

**Export Dialog:**
- Center-aligned modal (max-w-lg)
- Format options: Radio buttons
- Preview section
- Copy/Download buttons

**Confirmation Dialogs:**
- Compact modals (max-w-md)
- Clear action buttons (destructive actions in red tone)

---

## Page Layouts

### Dashboard/Home
- Two-section layout: Recent Activity (left 2/3) + Quick Actions (right 1/3)
- Stats row at top: 4 stat cards in grid-cols-4
- Recent prompts/offers: List view with preview cards

### Prompt Builder
- Left panel: Form inputs (w-1/3)
- Right panel: LLM outputs comparison (w-2/3)
- Sticky form on scroll
- Generate button prominently placed

### Offer Creator
- Centered single-column layout (max-w-4xl)
- Step indicator breadcrumb at top
- Form sections with clear visual separation (space-y-12)
- Preview panel: Toggle-able sidebar

### Templates Library
- Grid layout: 3 columns on desktop, responsive stack
- Filter sidebar on left (w-64)
- Template cards with preview hover states

### History/Saved Items
- Table layout for compact view OR card grid for visual browsing
- Toggle between views
- Search and filter bar at top
- Bulk actions toolbar

---

## Animations

**Minimal, Purposeful Only:**
- Page transitions: None
- Modal open/close: Simple fade (duration-200)
- Dropdown menus: Slide down (duration-150)
- Hover states: No animation, instant state change
- Loading states: Simple spinner or skeleton screens (no complex animations)

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (stack all multi-column layouts)
- Tablet: 768px - 1024px (two-column max)
- Desktop: > 1024px (full multi-column layouts)

**Mobile Adaptations:**
- Top navigation: Hamburger menu
- Comparison view: Tabbed interface instead of side-by-side
- Forms: Full width with increased padding
- Grids: Single column stack

---

## Images

**No hero image required** - This is a productivity tool, not a marketing page.

**Icon Usage:**
- LLM Provider logos in comparison headers
- Cognitive verb category icons (brain, graph, lightbulb)
- Template preview thumbnails (auto-generated or placeholder)
- Status icons for consensus analysis (checkmark, warning, info)

Use **Heroicons** library via CDN for all interface icons.