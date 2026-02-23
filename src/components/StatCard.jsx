const StatCard = ({ label, value }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Ici on met ta couleur jaune sur le chiffre */}
      <h2 className="text-4xl font-bold text-[#FEBD00]">{value}</h2>
      <p className="text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
};

export default StatCard;