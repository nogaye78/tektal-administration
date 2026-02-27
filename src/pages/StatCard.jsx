const StatCard = ({ label, value, icon, bgColor, textColor }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </h2>
        </div>

        <div className={`${bgColor} ${textColor} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;