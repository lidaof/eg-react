/**
 * Gets the display name of a component.
 * 
 * @param {React.ComponentType | string} component - the component to get the name of
 * @return {string} the display name of the component
 */
export default function getComponentName(component: React.ComponentType | string): string {
    return typeof component === "string" ? component : component.displayName || component.name || 'Component';
}
