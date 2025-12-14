import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface KPICardProps {
    title: string;
    value: string | number;
    change: string;
    icon?: IconDefinition;
    positiveIsBad?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, positiveIsBad }) => {
    const isPositive = change.startsWith("+");
    const isNegative = change.startsWith("-");

    const color = 
        isPositive || isNegative
            ? positiveIsBad
                ? (isPositive ? "text-red-600" : "text-green-600")
                : (isPositive ? "text-green-600" : "text-red-600")
            : "text-gray-400";

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            {/* Icon and title */}
            <div className="flex items-center justify-start mb-4 space-x-2">
                {icon && (
                    <div className="bg-gray-100 rounded-md flex items-center justify-center p-1.5">
                        <FontAwesomeIcon icon={icon} className="h-3 w-3 text-gray-400"/>
                    </div>
                )}
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>

            {/* Value and change */}
            <div>
                <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                <p className={`text-sm ${color}`}>{change}</p>
            </div>
        </div>
    );
};

export default KPICard;