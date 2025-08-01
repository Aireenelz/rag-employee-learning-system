import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

const RobotAvatar: React.FC = () => {
  return (
    <div className="mt-1 h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-semibold text-white">
      <FontAwesomeIcon icon={faRobot} />
    </div>
  );
};

export default RobotAvatar;