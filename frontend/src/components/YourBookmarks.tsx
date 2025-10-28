import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

interface YourBookmarksProps {
    searchQuery: string;
}

const YourBookmarks: React.FC<YourBookmarksProps> = ({ searchQuery }) => {
    const bookmarks = [
        { title: "Employee Handbook 2023", date: "5/20/2023" },
        { title: "Health Insurance Benefits Guide", date: "4/12/2023" },
        { title: "VPN Setup", date: "9/23/2023" },
        { title: "Intranet Access Guide", date: "3/21/2023" },
        { title: "Password Reset", date: "9/23/2023" },
    ];

    // Filter bookmarks based on search query
    const filteredBookmarks = bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-3">
            {filteredBookmarks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm font-semibold">No bookmarks found</p>
                    <p className="text-xs mt-1">Try adjusting your search query</p>
                </div>
            ) : (
                filteredBookmarks.map((bookmark, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-3 border rounded-lg p-3 hover:bg-els-secondarybuttonhover"
                    >
                        {/* Icon */}
                        <div className="py-2.5 px-4 rounded-lg bg-els-bookmarkeddocumentbackground text-xl">
                            <FontAwesomeIcon icon={faFileAlt} className="text-blue-400" />
                        </div>

                        {/* Bookmarked document details */}
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                                {bookmark.title}
                            </span>
                            <span className="font-semibold text-xs text-gray-500">
                                Document • {bookmark.date}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default YourBookmarks;