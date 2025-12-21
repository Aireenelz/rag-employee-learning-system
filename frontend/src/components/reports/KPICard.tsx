import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowTrendUp,
    faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";

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

    const textColor = 
        isPositive || isNegative
            ? positiveIsBad
                ? (isPositive ? "text-red-600" : "text-green-600")
                : (isPositive ? "text-green-600" : "text-red-600")
            : "text-gray-400";
    
    const bgColor = 
        isPositive || isNegative
            ? positiveIsBad
                ? (isPositive ? "bg-red-100" : "bg-green-100")
                : (isPositive ? "bg-green-100" : "bg-red-100")
            : "bg-gray-100";
    
    const trendIcon = isPositive
        ? faArrowTrendUp
        : isNegative
            ? faArrowTrendDown
            : null;
    
    // const displayChange = change.replace(/^[+-]\s?/, "");

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
                
                <div className="flex items-center mt-1 space-x-1.5">
                    {trendIcon && (
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${bgColor}`}>
                            <FontAwesomeIcon icon={trendIcon} className={`h-3 w-3 ${textColor}`} />
                        </div>
                    )}
                    <p className={`text-sm ${textColor}`}>{change}</p>
                </div>
            </div>
        </div>
    );
};

export default KPICard;