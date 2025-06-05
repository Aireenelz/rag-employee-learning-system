import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

const RobotAvatar: React.FC = () => {
  return (
    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-sm font-semibold text-white">
      <FontAwesomeIcon icon={faRobot} />
    </div>
  );
};

export default RobotAvatar;