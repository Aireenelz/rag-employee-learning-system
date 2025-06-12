{documents.map((doc, idx) => (
    <tr key={idx} className="border-b hover:bg-gray-50">
        {/* Checkbox */}
        <td className="py-2 pl-3"><input type="checkbox"/></td>

        {/* Document Name */}
        <td className="py-4 px-2 flex items-center gap-2 text-sm font-semibold">
            <FontAwesomeIcon icon={faFileAlt} className="text-blue-500"/>
            {doc.name}
        </td>

        {/* Tags */}
        <td className="py-4 px-2">
            <div className="flex gap-1 flex-wrap">
                {doc.tags.map((tag, i) => (
                    <span
                        key={i}
                        className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </td>
        
        {/* Upload date*/}
        <td className="py-4 px-2 text-sm font-semibold text-gray-400 flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendar}/>
            {doc.uploadDate}
        </td>

        {/* Size */}
        <td className="py-4 px-2 text-sm font-semibold text-gray-400">{doc.size}</td>

        {/* Actions */}
        <td className="py-4 px-2 text-sm font-semibold flex items-center justify-center">
            <button
                className="px-2 rounded-full hover:bg-els-secondarybuttonhover"
            >
                <FontAwesomeIcon icon={faEllipsisVertical}/>
            </button>
        </td>
    </tr>
))}