declare module 'react-bootstrap-tabs' {
	declare const Tab: React.FC<{ label: string }>;
	declare const Tabs: React.FC<{
		onSelect: (index: number, label: string) => void;
		selected: number;
		headerStyle: React.CSSProperties;
		activeHeaderStyle: React.CSSProperties;
	}>;
}
