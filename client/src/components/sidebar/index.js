/**
 * Sidebar Components Index
 * 
 * Professional modular sidebar system with reusable filter components.
 * 
 * @module sidebar
 * 
 * Components:
 * - Sidebar: Main container with collapse/expand functionality
 * - SidebarSection: Section wrapper with optional dividers and titles
 * - SortFilter: Sorting options filter
 * - TechStackFilter: Technology stack multi-select filter
 * - CategoryFilter: Category single-select filter
 * - TagFilter: Tag multi-select filter
 * 
 * Usage Example:
 * ```jsx
 * import { Sidebar, SidebarSection, SortFilter, TechStackFilter } from './components/sidebar';
 * 
 * function MyPage() {
 *   return (
 *     <Sidebar isCollapsed={collapsed} onToggleCollapse={toggle} title="Filters">
 *       <SidebarSection title="Sort By">
 *         <SortFilter sortBy={sort} onSortChange={setSort} />
 *       </SidebarSection>
 *       
 *       <SidebarSection title="Tech Stack" showDivider>
 *         <TechStackFilter selectedTech={tech} onTechChange={setTech} />
 *       </SidebarSection>
 *     </Sidebar>
 *   );
 * }
 * ```
 */

export { default as Sidebar } from './Sidebar';
export { default as SidebarSection } from './SidebarSection';
export { default as SortFilter } from './SortFilter';
export { default as TechStackFilter } from './TechStackFilter';
export { default as CategoryFilter } from './CategoryFilter';
export { default as TagFilter } from './TagFilter';
