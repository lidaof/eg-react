import React, { ChangeEventHandler } from "react";
import "./DarkMode.css";

export const setDark = () => {
    localStorage.setItem("theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
};

export const setLight = () => {
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
};

const storedTheme = localStorage.getItem("theme");

const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

const defaultDark =
    storedTheme === "dark" || (storedTheme === null && prefersDark);

if (defaultDark) {
    setDark();
}

export const toggleTheme: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.checked) {
        setDark();
    } else {
        setLight();
    }
};

const DarkMode = () => {
    return (
        <div className="toggle-theme-wrapper">
            <label className="toggle-theme" htmlFor="checkbox">
                <input
                    type="checkbox"
                    id="checkbox"
                    onChange={toggleTheme}
                    defaultChecked={defaultDark}
                />
                <div className="slider round"></div>
            </label>
        </div>
    );
};

export default DarkMode;
