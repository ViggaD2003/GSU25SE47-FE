import React from "react";
import { strengthLabels } from "./helpers";


export default function StrengthBar({ score }) {
    const pct = (score / 4) * 100;
    const label = strengthLabels[score];
    return (
        <div className="mt-2" aria-live="polite">
            <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 rounded transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{label}</p>
        </div>
    );
}