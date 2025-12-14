import './metaplex.css'; 

const MetaplexBackground = () => {
  return (
    <div className="metaplex-bg-container">
      {/* Фоновий колір і плями */}
      <div className="gradient-bg">
        <div className="gradients-container">
          <div className="g1"></div>
          {/* Додайте інші g2, g3 якщо потрібно */}
        </div>
      </div>
      
      {/* Шар шуму - тепер це просто div */}
      <div className="noise-overlay"></div>
    </div>
  );
};

export default MetaplexBackground;