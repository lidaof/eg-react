import parseColor from 'parse-color';
import React, { useCallback, useMemo, useState } from 'react';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import { Manager, Popper, Target } from 'react-popper';
import { getContrastingColor } from '../util';
import OutsideClickDetector from './OutsideClickDetector';

const PICKER_OPENER_STYLE = {
	border: '1px solid grey',
	borderRadius: '0.3em',
	margin: '0.25em',
	padding: '0 5px',
	minWidth: 50,
	minHeight: '1em'
};

interface ColorPickerProps {
	color: string;
	label?: string;
	onChange: ColorChangeHandler;
	disableAlpha?: boolean;
}

/**
 * A color picker.
 *
 * @author Silas Hsu
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ color, disableAlpha = true, onChange, label }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const parsedColor = useMemo(() => parseColor(color), [color]);
	const openerStyle = useMemo(() => {
		let os = {
			backgroundColor: color,
			color: getContrastingColor(color)
		};
		Object.assign(os, PICKER_OPENER_STYLE);

		return os;
	}, [color]);

	/**
	 * Opens the picker UI.
	 */
	const openPicker = useCallback(() => {
		setIsOpen(true);
	}, []);

	/**
	 * Closes the picker UI.
	 */
	const closePicker = useCallback(() => {
		setIsOpen(false);
	}, []);

	const pickerOpener = useMemo(
		() => (
			<span style={openerStyle} onClick={openPicker}>
				{label || parsedColor.hex}
			</span>
		),
		[openerStyle, openPicker, label, parsedColor]
	);

	let pickerElement;
	if (isOpen) {
		pickerElement = (
			<OutsideClickDetector onOutsideClick={closePicker}>
				<SketchPicker color={color} onChangeComplete={onChange} disableAlpha={disableAlpha} />
			</OutsideClickDetector>
		);
	} else {
		pickerElement = null;
	}

	return (
		<Manager>
			<Target>{pickerOpener}</Target>
			<Popper placement="bottom" style={{ zIndex: 2 }}>
				{pickerElement}
			</Popper>
		</Manager>
	);
};

export default ColorPicker;
