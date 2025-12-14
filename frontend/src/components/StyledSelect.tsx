import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface SelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}

const StyledSelect: React.FC<SelectProps> = ({ value, onChange, children }) => {
    return (
        <div className="relative w-48">
            <select
                value={value}
                onChange={onChange}
                className="
                    w-full appearance-none
                    bg-els-secondarybackground
                    border border-gray-200
                    rounded-lg
                    px-4 py-2 pr-10
                    text-sm text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                "
            >
                {children}
            </select>

            {/* Custom arrow */}
            <FontAwesomeIcon
                icon={faChevronDown}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none"
            />
        </div>
    );
};

export default StyledSelect;